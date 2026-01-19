import { z } from "zod";
import type { DocTopic } from "../types.js";
import {
  getAllTopicsAsync,
  filterTopicsBySectionAsync,
  DOCS_BASE_URL,
} from "../utils/sitemap.js";

export const listTopicsSchema = z.object({
  section: z
    .string()
    .optional()
    .describe("Optional section to filter by (e.g., 'functions', 'database')"),
});

export type ListTopicsInput = z.infer<typeof listTopicsSchema>;

interface TopicListItem {
  title: string;
  path: string;
  url: string;
  description?: string;
  children?: TopicListItem[];
}

function formatTopic(topic: DocTopic): TopicListItem {
  const item: TopicListItem = {
    title: topic.title,
    path: topic.path,
    url: `${DOCS_BASE_URL}/${topic.path}`,
  };

  if (topic.description) {
    item.description = topic.description;
  }

  if (topic.children && topic.children.length > 0) {
    item.children = topic.children.map(formatTopic);
  }

  return item;
}

export async function listTopics(
  input: ListTopicsInput
): Promise<{ topics: TopicListItem[]; totalCount: number }> {
  let topics: DocTopic[];

  if (input.section) {
    topics = await filterTopicsBySectionAsync(input.section);
  } else {
    topics = await getAllTopicsAsync();
  }

  const formattedTopics = topics.map(formatTopic);

  // Count total topics including nested ones
  function countTopics(items: TopicListItem[]): number {
    let count = items.length;
    for (const item of items) {
      if (item.children) {
        count += countTopics(item.children);
      }
    }
    return count;
  }

  return {
    topics: formattedTopics,
    totalCount: countTopics(formattedTopics),
  };
}
