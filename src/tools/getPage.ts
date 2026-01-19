import { z } from "zod";
import type { DocPage } from "../types.js";
import { fetchDocPage, buildDocUrl } from "../utils/fetcher.js";
import { htmlToMarkdown, extractTitle } from "../utils/markdown.js";

export const getPageSchema = z.object({
  path: z
    .string()
    .describe(
      "The documentation page path (e.g., 'functions/query-functions') or full URL"
    ),
});

export type GetPageInput = z.infer<typeof getPageSchema>;

export async function getPage(input: GetPageInput): Promise<DocPage> {
  const { html, url, cached } = await fetchDocPage(input.path);

  const title = extractTitle(html);
  const content = htmlToMarkdown(html);

  // Log cache status to stderr for debugging
  if (cached) {
    console.error(`[cache hit] ${url}`);
  } else {
    console.error(`[fetched] ${url}`);
  }

  return {
    title,
    path: input.path,
    url,
    content,
  };
}
