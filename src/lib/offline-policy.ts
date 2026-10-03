/**
 * Routing policy for the service worker.
 *
 * ## Why this lives in a module the service worker cannot import
 *
 * `public/sw.js` is served verbatim to the browser and cannot import from
 * `@/lib`. Without this module the caching rules would exist only inside the
 * worker, untested and unreviewable. Instead the policy is written here as pure
 * functions, unit-tested against a table of representative URLs, and emitted
 * into `sw.js` by `scripts/build-sw.ts`. A test asserts the committed worker is
 * byte-identical to what that generator produces, so the two cannot drift.
 *
 * ## The rule that matters most
 *
 * The previous worker ran *every* same-origin `/api/` GET through
 * network-first-with-cache. That includes `/api/watchlist`, `/api/notifications`
 * and `/api/messages`, so on a shared device the next person to open the site
 * could read the previous user's cached responses while offline. Those routes
 * are now `passthrough`: not cached, not stored, never touched. Offline
 * convenience for personal data is worth less than the previous user's
 * watchlist leaking.
 */

/** Fetch strategy the worker should apply. */
export type Strategy =
  /** Network, fall back to cache, then to the offline page. */
  | "network-first"
  /** Cache, fall back to network. Correct for content-hashed build assets. */
  | "cache-first"
  /** Do not intercept. The browser handles it and nothing is stored. */
  | "passthrough";

export type CacheName = "pages" | "assets" | "api" | "images";

export interface Decision {
  strategy: Strategy;
  cache: CacheName | null;
  /** Why this rule fired. Surfaced in the worker so a bad decision is debuggable. */
  reason: string;
}

export const PAGES = "pages";
export const ASSETS = "assets";
export const API = "api";
export const IMAGES = "images";

/**
 * The only same-origin API prefixes whose responses may be stored.
 *
 * Both are content-addressed public catalogue lookups. Everything else under
 * `/api/` is per-user (watchlist, notifications, messages, drafts, admin) or
 * write-shaped, and is deliberately excluded rather than excluded-by-omission.
 */
export const PUBLIC_API_PREFIXES = ["/api/anilist/", "/api/search/"] as const;

/** Third-party hosts worth keeping offline. */
export const CACHEABLE_IMAGE_HOSTS = [
  "s4.anilist.co",
  "img.anilist.co",
  "s1.anilist.co",
  "cdn.myanimelist.net",
] as const;

export const CACHEABLE_HOSTS = ["graphql.anilist.co"] as const;

/**
 * Per-cache entry caps.
 *
 * The Cache API has no size limit and never evicts, so without this an
 * offline-capable site grows until the browser starts refusing to store
 * anything. Eviction is oldest-first because `cache.keys()` preserves insertion
 * order, which makes it a usable approximation of LRU.
 */
export const MAX_ENTRIES: Record<CacheName, number> = {
  pages: 40,
  assets: 200,
  api: 120,
  images: 300,
};

/** How long a navigation may sit in the pages cache before activate evicts it. */
export const PAGE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const STATIC_PREFIXES = [
  "/_next/static/",
  "/icons/",
  "/_next/image",
  "/images/",
  "/fonts/",
];

const EXACT_STATIC = ["/manifest.json", "/offline", "/logo.png", "/favicon.ico"];

export interface DecideInput {
  url: URL;
  /** The worker's own origin. Pass the app origin so `decide` stays pure. */
  selfOrigin: string;
  method?: string;
  mode?: string;
  destination?: string;
  /** Request headers, when the caller has them. */
  headers?: { get(name: string): string | null };
}

/**
 * Pure routing decision for one request. Order matters: the most privacy
 * sensitive rule has to be reached before the broad ones.
 */
export function decide(input: DecideInput): Decision {
  const { url, method = "GET", mode = "no-cors", destination } = input;
  const sameOrigin = url.origin === input.selfOrigin;

  if (!sameOrigin) {
    if ((CACHEABLE_HOSTS as readonly string[]).includes(url.hostname)) {
      // Checked before the method rule: AniList's GraphQL endpoint is
      // queried with POST, so gating on GET first would silently drop the
      // catalogue's offline support. This host is a whitelisted public read
      // API and there is no per-user state on it.
      return { strategy: "network-first", cache: API, reason: `catalogue host ${url.hostname}` };
    }
  }

  if (method !== "GET") {
    // Writes must never be served from cache, and must never be cached - a
    // queued write replayed twice is a duplicated post, not an offline feature.
    return { strategy: "passthrough", cache: null, reason: "non-GET" };
  }

  if (!sameOrigin) {
    if ((CACHEABLE_IMAGE_HOSTS as readonly string[]).includes(url.hostname) || destination === "image") {
      return { strategy: "cache-first", cache: IMAGES, reason: `image host ${url.hostname}` };
    }
    return { strategy: "passthrough", cache: null, reason: `third party ${url.hostname}` };
  }

  if (url.pathname.startsWith("/api/")) {
    const ok = PUBLIC_API_PREFIXES.some((p) => url.pathname.startsWith(p));
    return ok
      ? { strategy: "network-first", cache: API, reason: "public api" }
      : { strategy: "passthrough", cache: null, reason: "private api - never cached" };
  }

  if (mode === "navigate") {
    return { strategy: "network-first", cache: PAGES, reason: "navigation" };
  }

  if (url.pathname.startsWith("/_next/static/")) {
    return { strategy: "cache-first", cache: ASSETS, reason: "hashed build asset" };
  }

  if (STATIC_PREFIXES.some((p) => url.pathname.startsWith(p)) || EXACT_STATIC.includes(url.pathname)) {
    return { strategy: "cache-first", cache: ASSETS, reason: "static asset" };
  }

  return { strategy: "network-first", cache: PAGES, reason: "same-origin page" };
}

/** Normalise a cache name into the versioned name actually used on disk. */
export function cacheNameFor(name: CacheName | null, version: string): string | null {
  return name ? `${name}-${version}` : null;
}

export function allCacheNames(version: string): string[] {
  return [PAGES, ASSETS, API, IMAGES].map((n) => `${n}-${version}`);
}

/**
 * Decide which cache keys to delete once the cap is exceeded.
 *
 * Pure so the eviction order can be tested without a real Cache API. Returns the
 * keys to delete, oldest first, given the current key list.
 */
export function overflowToDelete(keys: readonly string[], max: number): string[] {
  if (keys.length <= max) return [];
  return keys.slice(0, keys.length - max);
}