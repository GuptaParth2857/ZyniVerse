import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { detectBot } from "@/lib/bot-detect";

// ---------------------------------------------------------------------------
// Proxy runs on the Node.js runtime in Next.js 16 (middleware was renamed to
// Proxy and the Edge default was dropped in v16). `runtime` is not a valid
// option in Proxy files, so this can never become an Edge function.
//
// Proxy also runs *before* the CDN cache. Next.js' own CDN-caching guide is
// explicit about it: "proxy.js should run before the CDN cache so it remains
// the source of truth for auth, redirects, and rewrites." The practical
// consequence: every matched request costs one Proxy invocation, even when
// the page itself is served from the ISR cache and costs zero Function
// invocations. So the matcher below is deliberately narrow.
//
// This file therefore does exactly two things: crawler hit reporting and
// refusing crawlers at the analytics ingest endpoints.
//
// REMOVED — the old `PUBLIC_CDN_PATHS` + `Cache-Control` block:
// It never had any effect. Next.js owns the `Cache-Control` header of the
// response it renders, so whatever this proxy set was always replaced by the
// route's own header (verified in production: `/anime/1` still answered
// `public, max-age=0, must-revalidate`, never the `s-maxage` value that was
// being written here). The shared-cache TTL of a page is decided by its own
// `export const revalidate`, and its Data Cache lifetime by the
// `next.revalidate` of the fetches inside it — not by this file. Keeping the
// block only hid the real cache knobs.
//
// Bot blocking already lives in the WAF (see VERCEL_WAF_RULES.md) where it is
// evaluated at the CDN edge and costs nothing against Function Duration.
// ---------------------------------------------------------------------------

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const userAgent = request.headers.get("user-agent");
  const isBot = userAgent ? detectBot(userAgent) !== null : false;

  // -------------------------------------------------------------------------
  // Analytics ingest: refuse crawlers here.
  //
  // /api/analytics/session and /api/analytics/pageview are called by the
  // client-side tracker, so a crawler that executes JavaScript hits them once
  // per page. The 2026-10-11..20 crawl storm produced ~19.6k sessions/day
  // this way: one Vercel invocation plus one database row per call.
  //
  // Answering from the Proxy means the route handler never runs, so a bot
  // costs no function invocation at all. Search engines and AI crawlers do
  // not run JavaScript and never reach these endpoints, so nothing that we
  // want to be cited is affected.
  // -------------------------------------------------------------------------
  if (pathname.startsWith("/api/analytics/")) {
    const analyticsUa = request.headers.get("user-agent");
    if (!analyticsUa || !analyticsUa.trim() || detectBot(analyticsUa)) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.next();
  }

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
  if ((method === "GET" || method === "HEAD") && userAgent && isBot) {
    const report = new URL("/api/internal/bot-hit", request.url);
    event.waitUntil(
      fetch(report, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: pathname,
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

  // -------------------------------------------------------------------------
  // /forum/create — the most-crawled non-content path (1,869 page views
  // during the crawl storm). It is a "create post" form and robots.txt already
  // disallows /forum/ for every crawler, so a bot fetching it is pure waste:
  // a page render, its database queries and an analytics beacon.
  //
  // Answering 404 from the Proxy skips the render completely. Only bots are
  // affected — the path stays fully usable for people. The scope is kept to
  // the single form page on purpose: the rest of /forum/ has indexed threads
  // and must keep answering crawlers normally.
  // -------------------------------------------------------------------------
  if (pathname === "/forum/create" && (method === "GET" || method === "HEAD") && isBot) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  // Crawl observation only, so this is scoped to the pages crawlers actually
  // fetch and that we care about being cited: the evergreen content hubs
  // (anime / character / manga / wiki / blog / news / dubs / schedules) plus
  // the homepage and the two crawler plumbing files.
  //
  // `/sitemap.xml` and `/robots.txt` are the strongest early signal that a new
  // deploy is being picked up, so they are always observed.
  //
  // Deliberately NOT matched any more (they were pure cost): the UGC paths
  // (`/cosplay`, `/posts`, `/reels`) are excluded from the sitemap anyway,
  // and the long-tail utility pages (`/tools`, `/quiz`, `/challenges`,
  // `/community`, `/staff`, `/studio`, `/character-tournaments`,
  // `/top-characters`, `/manga-million`, `/filler`) are rarely crawled.
  //
  // `api/`, `_next/*` and static assets stay excluded: they set their own
  // Cache-Control in their handlers and must not pay a "proxy + route" double
  // invocation.
  //
  // The one exception is the analytics ingest pair: they are matched so a
  // crawler can be answered with a 204 from the Proxy, which saves the route
  // invocation entirely. Human traffic pays one extra (cheap) Proxy
  // invocation there; crawler traffic — which was ~99% of it — pays none.
  matcher: [
    "/",
    "/sitemap.xml",
    "/robots.txt",
    "/api/analytics/:path*",
    "/anime/:path*",
    "/character/:path*",
    "/manga/:path*",
    "/news/:path*",
    "/blog/:path*",
    "/wiki/:path*",
    "/forum/:path*",
    "/schedule/:path*",
    "/seasonal/:path*",
    "/top-anime/:path*",
    "/indian-dubs/:path*",
    "/dubbed/:path*",
    "/hindi-dub-schedule/:path*",
    "/manga-releases/:path*",
    "/watch-order/:path*",
    "/live-action/:path*",
    "/toons/:path*",
    "/wallpapers/:path*",
    "/voice-actors/:path*",
  ],
};
