import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// AI-training scrapers, SEO crawlers, and other high-volume non-human agents
// that burn compute/invocations/origin-transfer without sending any users.
// Googlebot and Bingbot are intentionally NOT blocked — they drive real
// organic search traffic (including AI Overviews / AI Search answers).
const BLOCKED_BOT_TOKENS = [
  // AI-training + AI-search scrapers (no traffic return)
  "gptbot",
  "chatgpt-user",
  "chatgpt",
  "oai-searchbot",
  "gpt-3.5-turbo",
  "perplexity",
  "pplx",
  "claudebot",
  "claude-web",
  "claude-external",
  "anthropic-ai",
  "amazonbot",
  "google-extended",
  "googleother",
  "bytespider",
  "ai2bot",
  "ai2bot-dolma",
  "bytedance-webcrawler",
  "tiktok-webcrawler",
  "cohere-ai",
  "dataforseekbot",
  "youbot",
  "omgilibot",
  "omgili",
  "webzio-extractor",
  "velenpublicwebcrawler",
  "zumbot",
  "mia-research",
  "imagesiftbot",
  "brightbot",
  "checkthewebsite",
  "magpie-crawler",
  "komodia",
  "dupax-ai-crawler",
  "kangaroobot",
  "awarios",
  "zentcrawl",
  // SEO/analytics scrapers
  "ccbot",
  "dataforseobot",
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "seznambot",
  "barkrowler",
  "petalbot",
  "applebot-extended",
  "meta-externalagent",
  "meta-externalfetcher",
  "diffbot",
  "yandexbot",
  "baiduspider",
  "sogou",
  "exabot",
  "linkdexbot",
  "meanpathbot",
  // Generic non-browser clients (curl/wget/LIBS — never real users)
  "python-requests",
  "python-urllib",
  "python-httpx",
  "pantra",
  "scrapy",
  "node-fetch",
  "go-http-client",
  "curl/",
  "wget/",
  "java/",
  "http-client",
  "axios/",
  "okhttp-utils",
];

const AUTH_COOKIES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "next-auth.session-token",
];

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
  const ua = request.headers.get("user-agent");
  if (ua) {
    const lower = ua.toLowerCase();
    if (BLOCKED_BOT_TOKENS.some((token) => lower.includes(token))) {
      return new NextResponse("403 Forbidden", { status: 403 });
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
  matcher: [
    "/((?!api/og|api/v1|api/streaming|api/extension|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml|json|woff|woff2|map|webmanifest)$).*)",
  ],
};