/**
 * Script to fetch all page titles from Convex documentation
 * Run with: npx tsx scripts/fetch-titles.ts
 */

const SITEMAP_URL = "https://docs.convex.dev/sitemap.xml";
const DOCS_BASE_URL = "https://docs.convex.dev";
const OUTPUT_FILE = "./src/data/titles.json";
const CONCURRENCY = 10; // Number of concurrent requests
const DELAY_MS = 100; // Delay between batches to be respectful

interface TitleEntry {
  path: string;
  title: string;
  description?: string;
}

async function fetchSitemap(): Promise<string[]> {
  console.log("Fetching sitemap...");
  const response = await fetch(SITEMAP_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  const urls: string[] = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} URLs in sitemap`);
  return urls;
}

async function fetchPageTitle(url: string): Promise<{ title: string; description?: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract title from <title> tag (may have attributes like data-rh="true")
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : null;

    // Clean up title - remove " | Convex Developer Hub" suffix
    if (title) {
      title = title.replace(/\s*\|\s*Convex Developer Hub\s*$/i, "").trim();
    }

    // Extract meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
    const description = descMatch ? descMatch[1].trim() : undefined;

    return { title: title || "Untitled", description };
  } catch (error) {
    console.warn(`  Error fetching ${url}:`, error);
    return null;
  }
}

async function processBatch(urls: string[], startIndex: number): Promise<TitleEntry[]> {
  const results: TitleEntry[] = [];

  const promises = urls.map(async (url) => {
    const path = url.replace(DOCS_BASE_URL + "/", "").replace(/\/$/, "") || "index";
    const pageData = await fetchPageTitle(url);

    if (pageData) {
      return {
        path,
        title: pageData.title,
        description: pageData.description,
      };
    }
    return null;
  });

  const batchResults = await Promise.all(promises);
  for (const result of batchResults) {
    if (result) {
      results.push(result);
    }
  }

  return results;
}

async function main() {
  const urls = await fetchSitemap();

  // Filter to only doc pages (exclude anchors, etc.)
  const docUrls = urls.filter((url) => {
    return url.startsWith(DOCS_BASE_URL) && !url.includes("#");
  });

  console.log(`Processing ${docUrls.length} documentation pages...`);

  const allTitles: TitleEntry[] = [];
  let processed = 0;

  // Process in batches
  for (let i = 0; i < docUrls.length; i += CONCURRENCY) {
    const batch = docUrls.slice(i, i + CONCURRENCY);
    const batchResults = await processBatch(batch, i);
    allTitles.push(...batchResults);

    processed += batch.length;
    console.log(`Progress: ${processed}/${docUrls.length} (${Math.round((processed / docUrls.length) * 100)}%)`);

    // Small delay between batches
    if (i + CONCURRENCY < docUrls.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  // Sort by path for consistency
  allTitles.sort((a, b) => a.path.localeCompare(b.path));

  // Create output directory if it doesn't exist
  const fs = await import("fs");
  const path = await import("path");
  const outputDir = path.dirname(OUTPUT_FILE);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  const output = {
    generatedAt: new Date().toISOString(),
    baseUrl: DOCS_BASE_URL,
    totalPages: allTitles.length,
    titles: allTitles,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${allTitles.length} titles to ${OUTPUT_FILE}`);

  // Show some examples
  console.log("\nSample titles:");
  allTitles.slice(0, 10).forEach((entry) => {
    console.log(`  ${entry.path} -> "${entry.title}"`);
  });
}

main().catch(console.error);
