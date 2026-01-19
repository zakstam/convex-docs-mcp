# Convex Documentation MCP Server

An MCP (Model Context Protocol) server that provides AI assistants with access to Convex documentation via on-demand web fetching.

## Features

- **search_convex_docs**: Search documentation by keyword/topic
- **get_convex_doc_page**: Fetch and return a specific documentation page as markdown
- **list_convex_topics**: List all available documentation sections and pages

## Installation

```bash
npm install
npm run build
```

## Usage

### With Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "convex-docs": {
      "command": "node",
      "args": ["./build/index.js"]
    }
  }
}
```

Or for global access, add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "convex-docs": {
      "command": "node",
      "args": ["/absolute/path/to/convex-documentation-mcp/build/index.js"]
    }
  }
}
```

### With Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the equivalent config location:

```json
{
  "mcpServers": {
    "convex-docs": {
      "command": "node",
      "args": ["/absolute/path/to/convex-documentation-mcp/build/index.js"]
    }
  }
}
```

## Tools

### search_convex_docs

Search Convex documentation by keyword or topic.

**Input:**
```json
{ "query": "query functions" }
```

**Output:** List of matching pages with titles, URLs, and descriptions.

### get_convex_doc_page

Fetch a specific documentation page and return it as markdown.

**Input:**
```json
{ "path": "functions/query-functions" }
```

**Output:** Page content converted to clean markdown with title and source URL.

### list_convex_topics

List all available documentation sections and pages.

**Input:**
```json
{ "section": "functions" }
```

**Output:** Hierarchical list of topics with paths and descriptions.

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

## Architecture

```
┌─────────────────────────────┐
│  Claude Code / Desktop /    │
│  Other MCP Clients          │
└─────────────┬───────────────┘
              │ MCP Protocol (stdio)
┌─────────────▼───────────────┐
│   convex-docs-mcp-server    │
│                             │
│  Tools:                     │
│  - search_convex_docs       │
│  - get_convex_doc_page      │
│  - list_convex_topics       │
└─────────────┬───────────────┘
              │ HTTPS fetch
┌─────────────▼───────────────┐
│   https://docs.convex.dev   │
└─────────────────────────────┘
```

## License

MIT
