import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

// Private / non-indexable surfaces. Shared by the wildcard rule and the AI
// search-bot rule below so the intent holds under either robots.txt matching
// model (most-specific-group-only vs. merging every matching group).
const PRIVATE_PATHS = [
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
];

// AI *search / answer* crawlers: they surface the site in AI answers with a
// citation and send real users (ChatGPT search, Perplexity answers, Meta AI
// user prompts). Allowed explicitly — per each vendor's docs these bots are
// not training crawlers. Training scrapers stay opted out (below).
//
// Claude-SearchBot / Claude-User (Anthropic) are intentionally absent from
// every list: they were never blocked, so they already inherit the wildcard
// rule and reach the same public pages.
const AI_SEARCH_BOTS = [
  // OpenAI — ChatGPT search results
  "OAI-SearchBot",
  // OpenAI — fetches triggered by a ChatGPT user
  "ChatGPT-User",
  // Perplexity — search index (docs: "not used to crawl content to train AI
  // foundation models")
  "PerplexityBot",
  // Perplexity — fetches triggered by a Perplexity user
  "Perplexity-User",
  // Meta — fetches triggered by a Meta AI user (link *previews* use
  // facebookexternalhit, which is not blocked anywhere)
  "Meta-ExternalFetcher",
  // Standard search index crawlers (not AI training)
  "DuckDuckBot",
  "BraveBot",
];

// AI / bulk training crawlers: full site opt-out of model training. This does
// not affect search ranking — Googlebot, Bingbot, Applebot (search) and the
// rest of the open web still index the whole site via the wildcard rule.
const AI_TRAINING_BOTS = [
  // OpenAI — training
  "GPTBot",
  // Anthropic — training (+ legacy identifiers)
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Claude-External",
  // Google — Gemini training/grounding (AI Overviews follow Googlebot, so
  // blocking this does NOT reduce AI Overview visibility)
  "Google-Extended",
  // Meta — Meta AI / Llama training
  "Meta-ExternalAgent",
  // Apple — Apple model training (plain Applebot = Siri search, not blocked)
  "Applebot-Extended",
  // Common Crawl — the training dataset behind many open models
  "CCBot",
  // ByteDance
  "Bytespider",
  "Bytedance-WebCrawler",
  "TikTok-Web-Crawler",
  // Dataset / research scrapers
  "AI2Bot",
  "AI2Bot-Dolma",
  "cohere-ai",
  "Amazonbot",
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
  "Diffbot",
  "Barkrowler",
  // SEO tools — no traffic benefit, heavy crawl volume
  "DataForSeekBot",
  "DataForSeoBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
];

// Note: YandexBot, SeznamBot, PetalBot, Baiduspider, Sogou and Exabot were
// previously in the block list. They are ordinary *search engines*, so they
// now fall through to the wildcard rule like Googlebot/Bingbot — blocking
// them was hiding the site from Yandex/Czech/French/Huawei search.

// Self-identified catalog harvesters measured in the app's own bot counters
// (2026-10-09 → 2026-10-23). These three crawled ~51k distinct URLs between
// them — SERankingBacklinksBot 23.2k, Reflectionbot 17.9k, ExaSearchBot 10.0k —
// out of 61.9k total bot hits. On 2026-10-23 alone they accounted for 19,234
// of 20,632 hits. Every first fetch of a URL is a Node render plus an ISR
// write, which is what pushed the Hobby plan over its ISR/function quota.
//
// None of these is a search engine or an AI *answer* surface (the ones that
// send real users are in AI_SEARCH_BOTS above). The same identifiers are
// denied at the edge in `scripts/vercel-firewall-apply.mjs` rule 2 — this
// group only saves the well-behaved ones a full catalog crawl.
const CATALOG_HARVESTERS = [
  "SERankingBacklinksBot",
  "Reflectionbot",
  "ExaSearchBot",
  "TokenFoundryBot",
  "AionBot",
  "AstraciaBot",
  "AstraciaPreviewBot",
  "MybzzBot",
  "EteonBot",
  "TablifBot",
  "VexelSearchBot",
  "AgentTrustBot",
  "MochiImageCrawler",
  "YisouSpider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      // AI search/answer crawlers: public pages everywhere, private paths
      // still off-limits (the duplicated list keeps this correct even when a
      // parser ignores the wildcard group for these user agents).
      { userAgent: AI_SEARCH_BOTS, allow: "/", disallow: PRIVATE_PATHS },
      // AI training scrapers: opted out of the whole site — including
      // Google's Gemini training pipeline via Google-Extended — while the
      // wildcard rule keeps the site fully indexable for search engines.
      { userAgent: AI_TRAINING_BOTS, disallow: "/" },
      // Catalog harvesters: whole-site opt-out. They ignore it often enough
      // that the WAF rule is the actual enforcement; this just stops the
      // polite ones from downloading every dynamic route.
      { userAgent: CATALOG_HARVESTERS, disallow: "/" },
    ],
    // Main sitemap covers all public pages, including /news, /blog and
    // /news/desk/*. The dedicated news-sitemap was removed: an empty news
    // sitemap only produced a Search Console error with no indexing benefit
    // for a non-news publisher.
    sitemap: [`${BASE_URL}/sitemap.xml`],
  };
}
