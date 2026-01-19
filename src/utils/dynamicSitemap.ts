import type { DocTopic } from "../types.js";
import Fuse, { type IFuseOptions } from "fuse.js";
import titlesData from "../data/titles.json" with { type: "json" };

export const DOCS_BASE_URL = "https://docs.convex.dev";
const SITEMAP_URL = `${DOCS_BASE_URL}/sitemap.xml`;

// Cache configuration
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cachedTopics: DocTopic[] | null = null;
let cachedFlatTopics: DocTopic[] | null = null;
let cachedFuseIndex: Fuse<DocTopic> | null = null;
let lastFetchTime = 0;

// Fuse.js configuration for fuzzy search
const fuseOptions: IFuseOptions<DocTopic> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "description", weight: 0.3 },
    { name: "path", weight: 0.2 },
  ],
  threshold: 0.4, // 0 = exact match, 1 = match anything
  ignoreLocation: true, // Don't care where in the string the match is
  includeScore: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
};

// Pre-fetched titles lookup map
interface TitleEntry {
  path: string;
  title: string;
  description?: string;
}

const titlesMap = new Map<string, TitleEntry>(
  (titlesData.titles as TitleEntry[]).map((entry) => [entry.path, entry])
);

/**
 * Get title for a path from pre-fetched data, or generate from path
 */
function getTitleForPath(path: string): string {
  const entry = titlesMap.get(path);
  if (entry) {
    return entry.title;
  }
  // Fallback: convert path to title
  const lastSegment = path.split("/").pop() || path;
  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get description for a path from pre-fetched data, or generate from path
 */
function getDescriptionForPath(path: string): string {
  const entry = titlesMap.get(path);
  if (entry?.description) {
    return entry.description;
  }
  // Fallback: generate description from title and section
  const title = getTitleForPath(path);
  const parts = path.split("/");
  if (parts.length === 1) {
    return `Convex ${title} documentation`;
  }
  const section = getTitleForPath(parts[0]);
  return `${title} - ${section}`;
}

/**
 * Parse sitemap XML and extract URLs
 */
function parseSitemapXml(xml: string): string[] {
  const urls: string[] = [];
  // Simple regex-based XML parsing (no external dependencies)
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

/**
 * Convert URLs to flat DocTopic array
 */
function urlsToFlatTopics(urls: string[]): DocTopic[] {
  const topics: DocTopic[] = [];
  const seenPaths = new Set<string>();

  for (const url of urls) {
    // Extract path from URL
    const path = url.replace(DOCS_BASE_URL + "/", "").replace(/\/$/, "");

    // Skip empty paths, anchors, and duplicates
    if (!path || path.includes("#") || seenPaths.has(path)) {
      continue;
    }
    seenPaths.add(path);

    topics.push({
      title: getTitleForPath(path),
      path,
      description: getDescriptionForPath(path),
    });
  }

  return topics;
}

/**
 * Build hierarchical topic structure from flat topics
 */
function buildTopicHierarchy(flatTopics: DocTopic[]): DocTopic[] {
  const topLevelTopics: Map<string, DocTopic> = new Map();
  const childrenMap: Map<string, DocTopic[]> = new Map();

  // Sort topics by path depth (parents first)
  const sortedTopics = [...flatTopics].sort(
    (a, b) => a.path.split("/").length - b.path.split("/").length
  );

  for (const topic of sortedTopics) {
    const parts = topic.path.split("/");

    if (parts.length === 1) {
      // Top-level topic
      topLevelTopics.set(topic.path, { ...topic, children: [] });
    } else {
      // Child topic - find parent
      const parentPath = parts.slice(0, -1).join("/");

      if (!childrenMap.has(parentPath)) {
        childrenMap.set(parentPath, []);
      }
      childrenMap.get(parentPath)!.push(topic);
    }
  }

  // Attach children to parents
  for (const [parentPath, children] of childrenMap) {
    const parent = topLevelTopics.get(parentPath);
    if (parent) {
      parent.children = children;
    } else {
      // Parent doesn't exist as top-level, might be nested
      // For simplicity, add orphaned children as top-level with their parent path prefix
      for (const child of children) {
        const topLevel = child.path.split("/")[0];
        if (topLevelTopics.has(topLevel)) {
          const topParent = topLevelTopics.get(topLevel)!;
          if (!topParent.children) {
            topParent.children = [];
          }
          topParent.children.push(child);
        } else {
          // Create a top-level entry for orphaned topics
          topLevelTopics.set(child.path, child);
        }
      }
    }
  }

  // Sort topics alphabetically, but put common sections first
  const priorityOrder = [
    "get-started",
    "tutorial",
    "quickstarts",
    "functions",
    "database",
    "auth",
    "file-storage",
    "scheduling",
    "search",
    "ai",
    "agents",
    "client",
    "production",
    "cli",
    "api",
  ];

  const topicsArray = Array.from(topLevelTopics.values());
  topicsArray.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.path);
    const bIndex = priorityOrder.indexOf(b.path);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.title.localeCompare(b.title);
  });

  return topicsArray;
}

/**
 * Fetch and parse the sitemap from docs.convex.dev
 */
async function fetchSitemap(): Promise<DocTopic[]> {
  const response = await fetch(SITEMAP_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  const urls = parseSitemapXml(xml);
  const flatTopics = urlsToFlatTopics(urls);
  const hierarchicalTopics = buildTopicHierarchy(flatTopics);

  return hierarchicalTopics;
}

/**
 * Get all topics, using cache if available and not expired
 */
export async function getDynamicTopics(): Promise<DocTopic[]> {
  const now = Date.now();

  if (cachedTopics && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedTopics;
  }

  try {
    cachedTopics = await fetchSitemap();
    cachedFlatTopics = null; // Invalidate flat cache
    lastFetchTime = now;
    return cachedTopics;
  } catch (error) {
    // If we have cached data, return it even if expired
    if (cachedTopics) {
      console.error("Failed to refresh sitemap, using cached data:", error);
      return cachedTopics;
    }
    throw error;
  }
}

/**
 * Get flattened topics for search
 */
export async function getFlatDynamicTopics(): Promise<DocTopic[]> {
  if (cachedFlatTopics && cachedTopics && Date.now() - lastFetchTime < CACHE_TTL_MS) {
    return cachedFlatTopics;
  }

  const topics = await getDynamicTopics();

  function flatten(items: DocTopic[]): DocTopic[] {
    const result: DocTopic[] = [];
    for (const item of items) {
      result.push({ title: item.title, path: item.path, description: item.description });
      if (item.children) {
        result.push(...flatten(item.children));
      }
    }
    return result;
  }

  cachedFlatTopics = flatten(topics);
  return cachedFlatTopics;
}

/**
 * Get or create Fuse index for fuzzy search
 */
async function getFuseIndex(): Promise<Fuse<DocTopic>> {
  const allTopics = await getFlatDynamicTopics();

  // Rebuild index if topics changed
  if (!cachedFuseIndex || cachedFlatTopics !== allTopics) {
    cachedFuseIndex = new Fuse(allTopics, fuseOptions);
  }

  return cachedFuseIndex;
}

/**
 * Search topics by query using fuzzy matching
 */
export async function searchDynamicTopics(query: string): Promise<DocTopic[]> {
  const fuse = await getFuseIndex();

  // Perform fuzzy search
  const results = fuse.search(query);

  // Return topics sorted by relevance (best matches first)
  return results.map((result) => result.item);
}

/**
 * Filter topics by section
 */
export async function filterDynamicTopicsBySection(section: string): Promise<DocTopic[]> {
  const normalizedSection = section.toLowerCase().replace(/[\s-]+/g, "-");
  const topics = await getDynamicTopics();

  return topics.filter(
    (topic) =>
      topic.path.toLowerCase().includes(normalizedSection) ||
      topic.title.toLowerCase().replace(/[\s]+/g, "-").includes(normalizedSection)
  );
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  cachedTopics = null;
  cachedFlatTopics = null;
  cachedFuseIndex = null;
  lastFetchTime = 0;
}
