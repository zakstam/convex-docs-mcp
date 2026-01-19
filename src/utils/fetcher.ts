import type { FetchResult } from "../types.js";
import { DOCS_BASE_URL } from "./sitemap.js";

const cache = new Map<string, { html: string; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function buildDocUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${DOCS_BASE_URL}/${normalizedPath}`;
}

export async function fetchDocPage(path: string): Promise<FetchResult> {
  const url = buildDocUrl(path);

  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { html: cached.html, url, cached: true };
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ConvexDocsMCPServer/1.0",
      "Accept": "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  cache.set(url, { html, timestamp: Date.now() });

  return { html, url, cached: false };
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheStats(): { size: number; urls: string[] } {
  return {
    size: cache.size,
    urls: Array.from(cache.keys()),
  };
}
