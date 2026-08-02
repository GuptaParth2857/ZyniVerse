export const AMAZON_TAG = "parthgupta08-21";
export const AMAZON_BASE = "https://www.amazon.in";

export function amazonProductUrl(asin: string): string {
  return `${AMAZON_BASE}/dp/${asin}?tag=${AMAZON_TAG}`;
}

export function amazonSearchUrl(query: string): string {
  return `${AMAZON_BASE}/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;
}
