import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// AI-training scrapers, SEO crawlers, and other high-volume non-human agents
// that burn compute/invocations/origin-transfer without sending any users.
// Googlebot and Bingbot are intentionally NOT blocked.
const BLOCKED_BOT_TOKENS = [
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "gpt-3.5-turbo",
  "perplexity",
  "pplx",
  "claudebot",
  "claude-web",
  "anthropic-ai",
  "claude-external",
  "amazonbot",
  "google-extended",
  "googleother",
  "bytespider",
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
  "imagesiftbot",
  "python-requests",
  "python-urllib",
  "scrapy",
  "yandexbot",
  "baiduspider",
  "sogou",
  "exabot",
];

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent");
  if (ua) {
    const lower = ua.toLowerCase();
    if (BLOCKED_BOT_TOKENS.some((token) => lower.includes(token))) {
      return new NextResponse("403 Forbidden", { status: 403 });
    }
  }

  const path = request.nextUrl.pathname;
  if (
    request.method === "GET" &&
    /^\/character-tournaments\/[^/]+$/.test(path) &&
    !request.cookies.has("__Secure-authjs.session-token") &&
    !request.cookies.has("authjs.session-token") &&
    !request.cookies.has("next-auth.session-token")
  ) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/og|api/v1|api/streaming|api/extension|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml|json|woff|woff2|map|webmanifest)$).*)",
  ],
};