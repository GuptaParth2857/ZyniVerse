import { NextResponse } from "next/server";
import { AniListUnavailableError } from "@/lib/anilist";

/**
 * Wraps an AniList-backed route handler so an upstream outage becomes an
 * explicit, cacheable-safe 503 with a JSON body.
 *
 * Previously these routes had no try/catch, so `AniListUnavailableError`
 * escaped and Next returned a 500. Clients that did `fetch().then(r => r.json())`
 * without checking `r.ok` then stored the `{ error: ... }` object where a list
 * was expected and crashed during render, blanking the page.
 *
 * 503 + `no-store` matters: a 5xx must never be written into the Vercel CDN
 * cache, otherwise one bad upstream response keeps being served for the whole
 * `stale-while-revalidate` window after AniList recovers.
 */
export function anilistRoute(
  handler: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof AniListUnavailableError) {
        return NextResponse.json(
          { error: "Anime data is temporarily unavailable. Please try again shortly." },
          { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
        );
      }
      console.error("[anilist-route] unhandled error:", err);
      return NextResponse.json(
        { error: "Failed to load anime data." },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
  };
}
