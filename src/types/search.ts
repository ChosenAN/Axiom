export interface SearchResult {
  id: string
  query: string
  /** Claude's research summary (plain text/markdown). */
  content: string
  /** ISO 8601 timestamp of when the search ran. */
  fetchedAt: string
}
