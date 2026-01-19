import { z } from "zod";
import type { SearchResult } from "../types.js";
import { searchTopics, DOCS_BASE_URL } from "../utils/sitemap.js";

export const searchSchema = z.object({
  query: z.string().describe("Search query to find relevant Convex documentation"),
});

export type SearchInput = z.infer<typeof searchSchema>;

export async function search(input: SearchInput): Promise<{
  results: SearchResult[];
  query: string;
}> {
  const { query } = input;

  // Search through the local topic index
  const matchingTopics = searchTopics(query);

  // Score and format results
  const results: SearchResult[] = matchingTopics.map((topic) => {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = topic.title.toLowerCase();
    const pathLower = topic.path.toLowerCase();
    const descLower = (topic.description || "").toLowerCase();

    // Higher score for title matches
    if (titleLower === queryLower) {
      score += 100;
    } else if (titleLower.includes(queryLower)) {
      score += 50;
    }

    // Score for path matches
    if (pathLower.includes(queryLower)) {
      score += 30;
    }

    // Score for description matches
    if (descLower.includes(queryLower)) {
      score += 20;
    }

    // Boost exact word matches
    const queryWords = queryLower.split(/\s+/);
    for (const word of queryWords) {
      if (word.length > 2) {
        if (titleLower.includes(word)) score += 10;
        if (pathLower.includes(word)) score += 5;
        if (descLower.includes(word)) score += 5;
      }
    }

    return {
      title: topic.title,
      path: topic.path,
      url: `${DOCS_BASE_URL}/${topic.path}`,
      snippet: topic.description || `Documentation page: ${topic.title}`,
      score,
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Limit to top 10 results
  const topResults = results.slice(0, 10);

  return {
    results: topResults,
    query,
  };
}
