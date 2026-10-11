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
  "Bytedance-WebCrawler",
  "TikTok-Web-Crawler",
  "AI2Bot",
  "AI2Bot-Dolma",
  "cohere-ai",
  "DataForSeekBot",
  "YouBot",
  "omgilibot",
  "Webzio-Extractor",
  "VelenPublicWebCrawler",
  "ZumBot",
  "Mia-Research",
  "ImagesiftBot",
  "BrightBot",
  "Checkthewebsite",
  "magpie-crawler",
  "komodia",
  "KangarooBot",
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
  "Meta-ExternalFetcher",
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
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/embed/",
          "/api/",
          "/login",
          "/register",
          "/forgot-password",
          "/onboarding",
          "/messages",
          "/notifications",
          "/saved",
          "/watchlist",
          "/backlog",
          "/list-share/",
          "/profile/edit",
          "/u/",
          "/creators/",
          "/posts/",
          "/reels/",
          "/moments/",
          "/polls/",
          "/activity",
          "/moments",
          "/forum/",
          // Search results with query params (sort/status/season/genre) form
          // an unbounded URL space. Already noindexed; this stops Google from
          // crawling them at all and re-discovering the www/http variants.
          "/search",
        ],
      },
      // AI crawlers / training scrapers (the AI_BOTS list above): opted out of
      // scraping the whole site — including Google's AI-training pipeline via
      // Google-Extended — while the wildcard rule keeps the site fully
      // indexable for search engines.
      { userAgent: AI_BOTS, disallow: "/" },
    ],
    // Main sitemap covers all public pages, including /news, /blog and
    // /news/desk/*. The dedicated news-sitemap was removed: an empty news
    // sitemap only produced a Search Console error with no indexing benefit
    // for a non-news publisher.
    sitemap: [`${BASE_URL}/sitemap.xml`],
  };
}
