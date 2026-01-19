#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { listTopics, listTopicsSchema } from "./tools/listTopics.js";
import { getPage, getPageSchema } from "./tools/getPage.js";
import { search, searchSchema } from "./tools/search.js";

const server = new Server(
  {
    name: "convex-docs",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_convex_topics",
        description:
          "List all available Convex documentation sections and pages. Optionally filter by a specific section like 'functions', 'database', 'auth', etc.",
        inputSchema: {
          type: "object",
          properties: {
            section: {
              type: "string",
              description:
                "Optional section to filter by (e.g., 'functions', 'database', 'auth')",
            },
          },
        },
      },
      {
        name: "get_convex_doc_page",
        description:
          "Fetch and return a specific Convex documentation page as markdown. Provide either a path (e.g., 'functions/query-functions') or a full URL.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description:
                "The documentation page path (e.g., 'functions/query-functions') or full URL",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "search_convex_docs",
        description:
          "Search Convex documentation by keyword or topic. Returns matching pages with titles, URLs, and descriptions.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Search query to find relevant Convex documentation",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_convex_topics": {
        const input = listTopicsSchema.parse(args);
        const result = await listTopics(input);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_convex_doc_page": {
        const input = getPageSchema.parse(args);
        const result = await getPage(input);
        return {
          content: [
            {
              type: "text",
              text: `# ${result.title}\n\nSource: ${result.url}\n\n---\n\n${result.content}`,
            },
          ],
        };
      }

      case "search_convex_docs": {
        const input = searchSchema.parse(args);
        const result = await search(input);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Convex Docs MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
