import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Customize code block handling for better output
turndown.addRule("fencedCodeBlock", {
  filter: (node) => {
    return (
      node.nodeName === "PRE" &&
      node.firstChild !== null &&
      node.firstChild.nodeName === "CODE"
    );
  },
  replacement: (_content, node) => {
    const codeNode = node.firstChild as Element;
    const className = codeNode.getAttribute("class") || "";
    const langMatch = className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : "";
    const code = codeNode.textContent || "";
    return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
  },
});

// Remove certain elements that are not useful in markdown
turndown.remove(["script", "style", "nav", "footer", "header", "aside", "button", "noscript"]);

// Add rule to remove SVG elements
turndown.addRule("removeSvg", {
  filter: (node) => node.nodeName === "SVG",
  replacement: () => "",
});

export function extractMainContent(html: string): string {
  // Try to extract the main content area
  // Convex docs typically have content in <main> or an article element

  // Look for main content patterns
  const mainPatterns = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of mainPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no main content found, try to clean up the HTML
  // Remove obvious non-content elements
  let cleaned = html;

  // Remove head section
  cleaned = cleaned.replace(/<head[\s\S]*?<\/head>/gi, "");

  // Remove navigation
  cleaned = cleaned.replace(/<nav[\s\S]*?<\/nav>/gi, "");

  // Remove footer
  cleaned = cleaned.replace(/<footer[\s\S]*?<\/footer>/gi, "");

  // Remove header
  cleaned = cleaned.replace(/<header[\s\S]*?<\/header>/gi, "");

  // Remove aside elements (sidebars)
  cleaned = cleaned.replace(/<aside[\s\S]*?<\/aside>/gi, "");

  // Remove script tags
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Remove style tags
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");

  return cleaned;
}

export function extractTitle(html: string): string {
  // Try to extract the page title
  const titlePatterns = [
    /<title[^>]*>([^<]*)<\/title>/i,
    /<h1[^>]*>([^<]*)<\/h1>/i,
  ];

  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      // Clean up the title
      let title = match[1].trim();
      // Remove common suffixes like " | Convex Docs"
      title = title.replace(/\s*[|–-]\s*Convex.*$/i, "");
      return title;
    }
  }

  return "Untitled";
}

export function htmlToMarkdown(html: string): string {
  const mainContent = extractMainContent(html);
  const markdown = turndown.turndown(mainContent);

  // Clean up excessive whitespace
  let cleaned = markdown
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/g, "");

  return cleaned;
}

export function createSnippet(text: string, maxLength: number = 200): string {
  // Remove markdown formatting for snippet
  let snippet = text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, "") // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
    .replace(/#+\s*/g, "") // Remove heading markers
    .replace(/[*_~]+/g, "") // Remove emphasis markers
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();

  if (snippet.length > maxLength) {
    snippet = snippet.substring(0, maxLength - 3) + "...";
  }

  return snippet;
}
