export interface DocTopic {
  title: string;
  path: string;
  description?: string;
  children?: DocTopic[];
}

export interface SearchResult {
  title: string;
  path: string;
  url: string;
  snippet: string;
  score: number;
}

export interface DocPage {
  title: string;
  path: string;
  url: string;
  content: string;
}

export interface FetchResult {
  html: string;
  url: string;
  cached: boolean;
}
