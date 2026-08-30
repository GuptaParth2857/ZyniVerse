import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Claude-External",
  "Amazonbot",
  "Google-Extended",
  "Bytespider",
  "CCBot",
  "DataForSeoBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "SeznamBot",
  "Barkrowler",
  "PetalBot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Diffbot",
  "YandexBot",
  "Baiduspider",
  "Sogou",
  "Exabot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: AI_BOTS,
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/embed/",
          "/messages",
          "/login",
          "/forgot-password",
          "/notifications",
          "/watchlist",
          "/saved",
          "/profile/edit",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
