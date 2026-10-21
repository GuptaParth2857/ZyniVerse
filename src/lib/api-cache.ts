/**
 * Shared-cache (CDN) headers for public, anonymous, read-only API responses.
 *
 * Every `/api/*` GET that reaches a route handler is a billed Node function
 * invocation on Vercel. A route whose response is identical for every visitor
 * should be answered by the CDN instead: `s-maxage` lets Vercel hold the
 * response for everyone, and `stale-while-revalidate` keeps serving it while a
 * single background request refreshes it. Repeat requests then never reach
 * the function at all.
 *
 * Rules:
 *   - Use it only when the response is the same for every visitor. If a
 *     route reads the session, cookies or an API key, its response varies per
 *     caller and must stay `private` / `no-store`.
 *   - Differences that come from the *query string* are fine: the CDN cache
 *     key includes the query, so `/api/search?q=a` and `/api/search?q=b` are
 *     cached separately.
 *   - Never cache a stateful response (a game round, a live position, a
 *     random draw) — those change per call by design.
 */
export const PUBLIC_API_S_MAXAGE = 300;
export const PUBLIC_API_STALE_SECONDS = 600;

export const PUBLIC_API_CACHE_CONTROL = `public, s-maxage=${PUBLIC_API_S_MAXAGE}, stale-while-revalidate=${PUBLIC_API_STALE_SECONDS}`;

/**
 * Marks a response as publicly cacheable by the CDN.
 *
 * Only successful responses are marked: a rate-limit (429) or a transient 5xx
 * must never be stored in the shared cache, or it would be replayed to every
 * visitor for the whole TTL.
 *
 * Safe to call on any response: responses with immutable headers (redirects
 * produced by `Response.redirect()`) simply keep their own caching.
 */
export function withPublicCache(res: Response): Response {
  if (res.status >= 400) return res;
  try {
    res.headers.set("Cache-Control", PUBLIC_API_CACHE_CONTROL);
  } catch {
    // Immutable headers — the route already decides its own caching.
  }
  return res;
}

/**
 * Marks a response as visitor-specific: it must never be stored in the shared
 * CDN cache.
 *
 * Needed by routes that answer with the same URL but a different body per
 * caller (a private list, `?mine=1` views). Vercel's CDN only skips the cache
 * for requests carrying an `Authorization` header — a session *cookie* does
 * not skip it — so a personalized response has to opt out explicitly.
 */
export function withPrivateCache(res: Response): Response {
  try {
    res.headers.set("Cache-Control", "private, no-store, max-age=0");
  } catch {
    // Immutable headers — the route already decides its own caching.
  }
  return res;
}
