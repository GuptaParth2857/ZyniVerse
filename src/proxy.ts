import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
// ---------------------------------------------------------------------------

// Public, non-personalized content pages that crawlers + CDN hits hammer.
// Anonymous GET responses get a short shared-cache TTL so Vercel's CDN serves
// them cheaply instead of re-rendering. Never applied when auth cookies are
// present (logged-in users get whatever the page decides to render).
const PUBLIC_CDN_PATHS: Array<{ pattern: RegExp; sMaxAge: number }> = [
  { pattern: /^\/character-tournaments\/[^/]+$/, sMaxAge: 300 },
  { pattern: /^\/(?:anime|character|manga|staff|studio|watch-order|news|indian-dubs|live-action|toons|cosplay|posts|reels)\/[^/]+$/, sMaxAge: 600 },
  // Static list/knowledge pages — heavy anonymous traffic, no per-user SSR.
  // (proxy only applies this when there are no auth cookies, so logged-in
  // users still get fully personal/up-to-date markup.)
  { pattern: /^\/(?:schedule|seasonal|top-anime|top-characters|indian-dubs|dubbed|manga-million|filler|tools|manga|challenges|forum|quiz|community|news|blog|wiki|voice-actors|wallpapers|watch-order)$/, sMaxAge: 600 },
  { pattern: /^\/(?:schedule|seasonal|top-anime|dubbed|indian-dubs|filler|manga|news|blog|wiki|voice-actors|wallpapers|watch-order)\/(?:page\/)?\d*$/, sMaxAge: 300 },
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

export function proxy(request: NextRequest) {
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
  // `api/` is excluded on purpose: every API request (analytics beacons,
  // activity tracking, ad impressions, /api/anilist/* fan-out) previously ran
  // through Proxy first, doubling its function invocations for no benefit —
  // those routes set their own Cache-Control headers in their handlers.
  matcher: [
    "/((?!api/|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml|json|woff|woff2|map|webmanifest)$).*)",
  ],
};
