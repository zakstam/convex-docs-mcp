import type { DocTopic } from "../types.js";
import {
  getDynamicTopics,
  getFlatDynamicTopics,
  searchDynamicTopics,
  filterDynamicTopicsBySection,
  DOCS_BASE_URL as DYNAMIC_BASE_URL,
} from "./dynamicSitemap.js";

export const DOCS_BASE_URL = DYNAMIC_BASE_URL;

export const docsSitemap: DocTopic[] = [
  {
    title: "Get Started",
    path: "get-started",
    description: "Introduction and getting started with Convex",
    children: [
      { title: "Welcome", path: "get-started", description: "Introduction to Convex" },
      { title: "Tutorial", path: "tutorial", description: "Step-by-step Convex tutorial" },
      {
        title: "Quickstarts",
        path: "quickstarts",
        description: "Quick start guides for various frameworks",
        children: [
          { title: "React", path: "quickstarts/react", description: "Quickstart with React" },
          { title: "Next.js", path: "quickstarts/nextjs", description: "Quickstart with Next.js" },
          { title: "React Native", path: "quickstarts/react-native", description: "Quickstart with React Native" },
          { title: "Vue", path: "quickstarts/vue", description: "Quickstart with Vue" },
          { title: "Svelte", path: "quickstarts/svelte", description: "Quickstart with Svelte" },
          { title: "Python", path: "quickstarts/python", description: "Quickstart with Python" },
          { title: "Rust", path: "quickstarts/rust", description: "Quickstart with Rust" },
        ],
      },
    ],
  },
  {
    title: "Functions",
    path: "functions",
    description: "Convex serverless functions",
    children: [
      { title: "Overview", path: "functions", description: "Introduction to Convex functions" },
      { title: "Query Functions", path: "functions/query-functions", description: "Read data with query functions" },
      { title: "Mutation Functions", path: "functions/mutation-functions", description: "Write data with mutation functions" },
      { title: "Action Functions", path: "functions/actions", description: "Side effects with action functions" },
      { title: "Internal Functions", path: "functions/internal-functions", description: "Functions only callable from other functions" },
      { title: "HTTP Actions", path: "functions/http-actions", description: "HTTP endpoint handlers" },
      { title: "Bundling", path: "functions/bundling", description: "How function bundling works" },
      { title: "Error Handling", path: "functions/error-handling", description: "Handling errors in functions" },
    ],
  },
  {
    title: "Database",
    path: "database",
    description: "Convex database and data modeling",
    children: [
      { title: "Overview", path: "database", description: "Introduction to Convex database" },
      { title: "Reading Data", path: "database/reading-data", description: "Querying data from the database" },
      { title: "Writing Data", path: "database/writing-data", description: "Inserting and modifying data" },
      { title: "Document IDs", path: "database/document-ids", description: "Working with document IDs" },
      { title: "Tables", path: "database/tables", description: "Database tables and collections" },
      { title: "Schemas", path: "database/schemas", description: "Defining database schemas" },
      { title: "Indexes", path: "database/indexes", description: "Database indexes for efficient queries" },
      { title: "Pagination", path: "database/pagination", description: "Paginating query results" },
      { title: "TypeScript", path: "database/typescript", description: "TypeScript support for database" },
    ],
  },
  {
    title: "File Storage",
    path: "file-storage",
    description: "Storing and serving files",
    children: [
      { title: "Overview", path: "file-storage", description: "Introduction to file storage" },
      { title: "Upload Files", path: "file-storage/upload-files", description: "Uploading files to Convex" },
      { title: "Serve Files", path: "file-storage/serve-files", description: "Serving files from Convex" },
      { title: "Delete Files", path: "file-storage/delete-files", description: "Deleting stored files" },
    ],
  },
  {
    title: "Authentication",
    path: "auth",
    description: "User authentication and authorization",
    children: [
      { title: "Overview", path: "auth", description: "Introduction to authentication" },
      { title: "Clerk", path: "auth/clerk", description: "Authentication with Clerk" },
      { title: "Auth0", path: "auth/auth0", description: "Authentication with Auth0" },
      { title: "Custom Auth", path: "auth/custom-auth", description: "Custom authentication setup" },
      { title: "Functions Auth", path: "auth/functions-auth", description: "Authentication in functions" },
    ],
  },
  {
    title: "Scheduling",
    path: "scheduling",
    description: "Scheduled and cron jobs",
    children: [
      { title: "Overview", path: "scheduling", description: "Introduction to scheduling" },
      { title: "Scheduled Functions", path: "scheduling/scheduled-functions", description: "Running functions on a schedule" },
      { title: "Cron Jobs", path: "scheduling/cron-jobs", description: "Setting up cron jobs" },
    ],
  },
  {
    title: "Search",
    path: "search",
    description: "Full-text and vector search",
    children: [
      { title: "Overview", path: "search", description: "Introduction to search" },
      { title: "Full-Text Search", path: "search/full-text-search", description: "Full-text search implementation" },
      { title: "Vector Search", path: "search/vector-search", description: "Vector/semantic search implementation" },
    ],
  },
  {
    title: "AI",
    path: "ai",
    description: "AI and LLM integration",
    children: [
      { title: "Overview", path: "ai", description: "AI features in Convex" },
      { title: "Using Cursor", path: "ai/using-cursor", description: "Convex AI rules for Cursor IDE" },
      { title: "Using Windsurf", path: "ai/using-windsurf", description: "Convex AI rules for Windsurf IDE" },
      { title: "Using GitHub Copilot", path: "ai/using-github-copilot", description: "Convex instructions for GitHub Copilot" },
      { title: "Convex MCP Server", path: "ai/convex-mcp-server", description: "MCP server for AI coding agents" },
    ],
  },
  {
    title: "AI Agents",
    path: "agents",
    description: "Building AI agents with Convex",
    children: [
      { title: "Overview", path: "agents", description: "Building AI agents with Convex" },
      { title: "Getting Started", path: "agents/getting-started", description: "Build your first AI agent" },
      { title: "Tools", path: "agents/tools", description: "Agent tools and function calling" },
      { title: "Threads", path: "agents/threads", description: "Managing conversation threads" },
      { title: "Messages", path: "agents/messages", description: "Working with messages in threads" },
      { title: "Human Agents", path: "agents/human-agents", description: "Human-in-the-loop agents" },
      { title: "Context", path: "agents/context", description: "Conversation context management" },
      { title: "Workflows", path: "agents/workflows", description: "Multi-step agent workflows" },
      { title: "RAG", path: "agents/rag", description: "Retrieval-augmented generation" },
      { title: "Files", path: "agents/files", description: "File handling in agent conversations" },
      { title: "Debugging", path: "agents/debugging", description: "Debugging AI agents" },
      { title: "Playground", path: "agents/playground", description: "Agent playground for testing" },
      { title: "Usage Tracking", path: "agents/usage-tracking", description: "Track agent usage and billing" },
      { title: "Rate Limiting", path: "agents/rate-limiting", description: "Rate limiting agent interactions" },
    ],
  },
  {
    title: "Client Libraries",
    path: "client",
    description: "Client-side libraries and SDKs",
    children: [
      { title: "React", path: "client/react", description: "React client library" },
      { title: "React Native", path: "client/react-native", description: "React Native client" },
      { title: "JavaScript", path: "client/javascript", description: "Vanilla JavaScript client" },
      { title: "Python", path: "client/python", description: "Python client library" },
    ],
  },
  {
    title: "Production",
    path: "production",
    description: "Deployment and production considerations",
    children: [
      { title: "Overview", path: "production", description: "Production deployment" },
      { title: "Hosting", path: "production/hosting", description: "Hosting your Convex app" },
      { title: "Environment Variables", path: "production/environment-variables", description: "Managing environment variables" },
      { title: "Logging", path: "production/logging", description: "Application logging" },
      { title: "Error Handling", path: "production/error-handling", description: "Production error handling" },
      { title: "Debugging", path: "production/debugging", description: "Debugging production issues" },
      { title: "Best Practices", path: "production/best-practices", description: "Production best practices" },
    ],
  },
  {
    title: "CLI",
    path: "cli",
    description: "Convex CLI reference",
    children: [
      { title: "Overview", path: "cli", description: "Convex CLI introduction" },
      { title: "Agent Mode", path: "cli/agent-mode", description: "CLI agent mode for background AI agents" },
    ],
  },
  {
    title: "API Reference",
    path: "api",
    description: "Complete API reference",
    children: [
      { title: "Overview", path: "api", description: "API reference overview" },
    ],
  },
];

export function getAllTopics(): DocTopic[] {
  return docsSitemap;
}

export function getTopicByPath(path: string): DocTopic | undefined {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  function findTopic(topics: DocTopic[]): DocTopic | undefined {
    for (const topic of topics) {
      if (topic.path === normalizedPath) {
        return topic;
      }
      if (topic.children) {
        const found = findTopic(topic.children);
        if (found) return found;
      }
    }
    return undefined;
  }

  return findTopic(docsSitemap);
}

export function filterTopicsBySection(section: string): DocTopic[] {
  const normalizedSection = section.toLowerCase().replace(/[\s-]+/g, "-");

  return docsSitemap.filter(
    (topic) =>
      topic.path.toLowerCase().includes(normalizedSection) ||
      topic.title.toLowerCase().replace(/[\s]+/g, "-").includes(normalizedSection)
  );
}

export function flattenTopics(topics: DocTopic[] = docsSitemap): DocTopic[] {
  const result: DocTopic[] = [];

  function flatten(items: DocTopic[]) {
    for (const item of items) {
      result.push({ title: item.title, path: item.path, description: item.description });
      if (item.children) {
        flatten(item.children);
      }
    }
  }

  flatten(topics);
  return result;
}

export function searchTopics(query: string): DocTopic[] {
  const normalizedQuery = query.toLowerCase();
  const allTopics = flattenTopics();

  return allTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(normalizedQuery) ||
      topic.path.toLowerCase().includes(normalizedQuery) ||
      (topic.description && topic.description.toLowerCase().includes(normalizedQuery))
  );
}

// =============================================================================
// Async versions with dynamic sitemap (with static fallback)
// =============================================================================

/**
 * Get all topics - tries dynamic sitemap first, falls back to static
 */
export async function getAllTopicsAsync(): Promise<DocTopic[]> {
  try {
    return await getDynamicTopics();
  } catch (error) {
    console.error("Failed to fetch dynamic sitemap, using static fallback:", error);
    return docsSitemap;
  }
}

/**
 * Get flattened topics - tries dynamic sitemap first, falls back to static
 */
export async function flattenTopicsAsync(): Promise<DocTopic[]> {
  try {
    return await getFlatDynamicTopics();
  } catch (error) {
    console.error("Failed to fetch dynamic sitemap, using static fallback:", error);
    return flattenTopics();
  }
}

/**
 * Search topics - tries dynamic sitemap first, falls back to static
 */
export async function searchTopicsAsync(query: string): Promise<DocTopic[]> {
  try {
    return await searchDynamicTopics(query);
  } catch (error) {
    console.error("Failed to search dynamic sitemap, using static fallback:", error);
    return searchTopics(query);
  }
}

/**
 * Filter topics by section - tries dynamic sitemap first, falls back to static
 */
export async function filterTopicsBySectionAsync(section: string): Promise<DocTopic[]> {
  try {
    return await filterDynamicTopicsBySection(section);
  } catch (error) {
    console.error("Failed to filter dynamic sitemap, using static fallback:", error);
    return filterTopicsBySection(section);
  }
}
