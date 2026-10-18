import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { detectBot } from "@/lib/bot-detect";

// ---------------------------------------------------------------------------
// Proxy runs on the Node.js runtime in Next.js 16 (middleware was renamed to
// Proxy and the Edge default was dropped in v16). That makes every matched
// request a *billed Node function invocation* against Function Duration, not
// a free Edge Request. `runtime` is not a valid option in Proxy files.
//
// So this file is kept deliberately cheap and narrow:
//   - Bot blocking moved to the WAF (see VERCEL_WAF_RULES.md) where it is
//     evaluated at the CDN edge and costs nothing.
//   - The matcher excludes /api/* entirely, so API beacons no longer pay
//     "proxy + route handler" = 2 invocations per browser request.
// Only the public page CDN cache rules remain here.
//
// The one addition is *crawler hit reporting*: bots do not run JavaScript, so
// the client-side analytics beacon can never see Googlebot / OAI-SearchBot /
// PerplexityBot traffic. A cheap User-Agent check + fire-and-forget
// `event.waitUntil()` POST is the only way to observe it (see the handler
// below). Humans pay nothing for it beyond the regex test.
// ---------------------------------------------------------------------------

// Public, non-personalized content pages that crawlers + CDN hits hammer.
// Anonymous GET responses get a short shared-cache TTL so Vercel's CDN serves
// them cheaply instead of re-rendering. Never applied when auth cookies are
// present (logged-in users get whatever the page decides to render).
const PUBLIC_CDN_PATHS: Array<{ pattern: RegExp; sMaxAge: number }> = [
  // Homepage. It renders per request (`force-dynamic`) because a build-time
  // AniList prerender gets rate-limited, and it is the single most-hit route.
  // Its HTML is identical for anonymous visitors (personalisation lives in
  // client components that hydrate after load), so a short shared-cache TTL
  // lets the CDN answer anonymous + crawler hits without a function invocation.
  { pattern: /^\/$/, sMaxAge: 600 },
  { pattern: /^\/character-tournaments\/[^/]+$/, sMaxAge: 900 },
  { pattern: /^\/(?:anime|character|manga|staff|studio|watch-order|news|indian-dubs|live-action|toons|cosplay|posts|reels)\/[^/]+$/, sMaxAge: 1800 },
  // Static list/knowledge pages — heavy anonymous traffic, no per-user SSR.
  // (proxy only applies this when there are no auth cookies, so logged-in
  // users still get fully personal/up-to-date markup.)
  { pattern: /^\/(?:schedule|seasonal|top-anime|top-characters|indian-dubs|dubbed|manga-million|filler|tools|manga|challenges|forum|quiz|community|news|blog|wiki|voice-actors|wallpapers|watch-order)$/, sMaxAge: 1800 },
  { pattern: /^\/(?:schedule|seasonal|top-anime|dubbed|indian-dubs|filler|manga|news|blog|wiki|voice-actors|wallpapers|watch-order)\/(?:page\/)?\d*$/, sMaxAge: 900 },
];

const AUTH_COOKIES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "next-auth.session-token",
];

function hasAuthCookie(request: NextRequest): boolean {
  return AUTH_COOKIES.some((name) => request.cookies.has(name));
}

function getPublicCacheSeconds(path: string): number | null {
  for (const { pattern, sMaxAge } of PUBLIC_CDN_PATHS) {
    if (pattern.test(path)) return sMaxAge;
  }
  return null;
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // -------------------------------------------------------------------------
  // Crawler / bot hit reporting (see /api/internal/bot-hit + src/lib/bot-stats).
  //
  // Only dispatched when the User-Agent matches a known crawler, so normal
  // visitors cost exactly one extra in-memory regex test. The DB write happens
  // in a route handler (inside `event.waitUntil`, after the response is sent)
  // to keep Prisma out of the Proxy bundle and off the critical path.
  //
  // The matcher never includes /api/*, so this cannot re-enter itself.
  // -------------------------------------------------------------------------
  if (request.method === "GET" || request.method === "HEAD") {
    const userAgent = request.headers.get("user-agent");
    if (userAgent && detectBot(userAgent)) {
      const report = new URL("/api/internal/bot-hit", request.url);
      event.waitUntil(
        fetch(report, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            path: request.nextUrl.pathname,
            userAgent,
            // The self-fetch is served from a datacenter IP, so the visitor's
            // country has to be copied from the original request headers.
            country: request.headers.get("x-vercel-ip-country"),
          }),
          cache: "no-store",
        }).then(
          () => undefined,
          () => undefined
        )
      );
    }
  }

  if (request.method === "GET") {
    const path = request.nextUrl.pathname;
    if (!hasAuthCookie(request)) {
      const sMaxAge = getPublicCacheSeconds(path);
      if (sMaxAge !== null) {
        const res = NextResponse.next();
        res.headers.set("Cache-Control", `public, s-maxage=${sMaxAge}, stale-while-revalidate=${sMaxAge * 2}`);
        return res;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Scoped to the only paths this handler can act on — the PUBLIC_CDN_PATHS
  // prefixes below. Previously the matcher caught *every* page route, so the
  // Node runtime spun up a billed function for e.g. /about, /profile and
  // /settings just to return NextResponse.next() without setting anything.
  // This is a deliberate superset of PUBLIC_CDN_PATHS (whole subtrees, not the
  // exact per-page regexes) so no page that used to get the shared-cache header
  // loses it — the handler still re-checks the precise shape + auth cookie.
  //
  // `api/`, `_next/*` and static assets stay excluded: they set their own
  // Cache-Control in their handlers and must not pay a "proxy + route" double
  // invocation.
  //
  // `/sitemap.xml` and `/robots.txt` are the only non-page entries: no human
  // traffic reaches them, and knowing when Googlebot / the AI crawlers fetch
  // them is the strongest early signal that a new deploy is being picked up.
  matcher: [
    "/",
    "/sitemap.xml",
    "/robots.txt",
    "/character-tournaments/:path*",
    "/anime/:path*",
    "/character/:path*",
    "/manga/:path*",
    "/staff/:path*",
    "/studio/:path*",
    "/watch-order/:path*",
    "/news/:path*",
    "/indian-dubs/:path*",
    "/live-action/:path*",
    "/toons/:path*",
    "/cosplay/:path*",
    "/posts/:path*",
    "/reels/:path*",
    "/schedule/:path*",
    "/seasonal/:path*",
    "/top-anime/:path*",
    "/top-characters/:path*",
    "/dubbed/:path*",
    "/manga-million/:path*",
    "/filler/:path*",
    "/tools/:path*",
    "/challenges/:path*",
    "/forum/:path*",
    "/quiz/:path*",
    "/community/:path*",
    "/blog/:path*",
    "/wiki/:path*",
    "/voice-actors/:path*",
    "/wallpapers/:path*",
  ],
};
