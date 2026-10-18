/**
 * Server-side crawler / bot classification.
 *
 * The visitor analytics pipeline is *client-side* (`AnalyticsTracker` → POST
 * /api/analytics/pageview), so crawlers never appear in it: bots do not run
 * JavaScript. To see Googlebot / AI answer crawlers at all, they have to be
 * classified from the `User-Agent` header on the server (see `src/proxy.ts`)
 * and counted there.
 *
 * This module is deliberately dependency-free (no prisma, no next/server) so it
 * can be unit tested and imported from the Proxy bundle without pulling the
 * database client in.
 *
 * Rule order matters: specific product tokens must be checked before their
 * generic vendor token (`Googlebot-Image` before `Googlebot`, `AdsBot-Google`
 * before `Googlebot`, …).
 */

export type BotKind =
  /** AI answer engines that cite the site and send real users (allowed in robots.ts). */
  | "ai-search"
  /** AI / dataset training crawlers (opted out in robots.ts). */
  | "ai-training"
  /** Classic search index crawlers. */
  | "search"
  /** Social / chat link unfurlers. */
  | "social"
  /** SEO audit tools. */
  | "seo"
  /** Uptime, monitoring and page-speed checkers. */
  | "monitor"
  /** Recognised as a bot, but unknown product. */
  | "other";

export interface BotInfo {
  /** Stable, sanitised display id — also the storage key suffix. */
  id: string;
  kind: BotKind;
  vendor: string;
}

interface Rule {
  pattern: RegExp;
  id: string;
  kind: BotKind;
  vendor: string;
}

const RULES: Rule[] = [
  // ---------------------------------------------------------------- AI answer
  // Same set robots.ts explicitly allows, so these hits are the "AI traffic
  // that is actually welcome" signal.
  { pattern: /OAI-SearchBot/i, id: "OAI-SearchBot", kind: "ai-search", vendor: "OpenAI" },
  { pattern: /ChatGPT-User/i, id: "ChatGPT-User", kind: "ai-search", vendor: "OpenAI" },
  { pattern: /PerplexityBot/i, id: "PerplexityBot", kind: "ai-search", vendor: "Perplexity" },
  { pattern: /Perplexity-User/i, id: "Perplexity-User", kind: "ai-search", vendor: "Perplexity" },
  { pattern: /Meta-ExternalFetcher/i, id: "Meta-ExternalFetcher", kind: "ai-search", vendor: "Meta" },
  { pattern: /Claude-SearchBot/i, id: "Claude-SearchBot", kind: "ai-search", vendor: "Anthropic" },
  { pattern: /Claude-User/i, id: "Claude-User", kind: "ai-search", vendor: "Anthropic" },
  { pattern: /DuckAssistBot/i, id: "DuckAssistBot", kind: "ai-search", vendor: "DuckDuckGo" },
  { pattern: /YouBot/i, id: "YouBot", kind: "ai-search", vendor: "You.com" },
  { pattern: /Amazonbot/i, id: "Amazonbot", kind: "ai-search", vendor: "Amazon" },

  // --------------------------------------------------------------- AI training
  // Blocked in robots.ts — hits here mean either a crawler ignoring robots.txt
  // or a fetch that happened before the rule shipped.
  { pattern: /GPTBot/i, id: "GPTBot", kind: "ai-training", vendor: "OpenAI" },
  { pattern: /ClaudeBot/i, id: "ClaudeBot", kind: "ai-training", vendor: "Anthropic" },
  { pattern: /Claude-Web|anthropic-ai|Claude-External/i, id: "AnthropicBot", kind: "ai-training", vendor: "Anthropic" },
  { pattern: /Google-Extended/i, id: "Google-Extended", kind: "ai-training", vendor: "Google" },
  { pattern: /Meta-ExternalAgent/i, id: "Meta-ExternalAgent", kind: "ai-training", vendor: "Meta" },
  { pattern: /Applebot-Extended/i, id: "Applebot-Extended", kind: "ai-training", vendor: "Apple" },
  { pattern: /CCBot/i, id: "CCBot", kind: "ai-training", vendor: "Common Crawl" },
  { pattern: /Bytespider|Bytedance-WebCrawler|TikTok-Web-Crawler/i, id: "Bytespider", kind: "ai-training", vendor: "ByteDance" },
  { pattern: /AI2Bot/i, id: "AI2Bot", kind: "ai-training", vendor: "Allen Institute" },
  { pattern: /cohere-ai/i, id: "cohere-ai", kind: "ai-training", vendor: "Cohere" },
  { pattern: /Diffbot/i, id: "Diffbot", kind: "ai-training", vendor: "Diffbot" },
  { pattern: /ImagesiftBot/i, id: "ImagesiftBot", kind: "ai-training", vendor: "Imagesift" },
  { pattern: /omgilibot|Webzio-Extractor|VelenPublicWebCrawler|ZumBot|magpie-crawler/i, id: "DatasetCrawler", kind: "ai-training", vendor: "Unknown" },

  // --------------------------------------------------------- search engines
  { pattern: /Google-InspectionTool/i, id: "Google-InspectionTool", kind: "monitor", vendor: "Google" },
  { pattern: /Googlebot-Image/i, id: "Googlebot-Image", kind: "search", vendor: "Google" },
  { pattern: /Googlebot-News/i, id: "Googlebot-News", kind: "search", vendor: "Google" },
  { pattern: /Googlebot-Video/i, id: "Googlebot-Video", kind: "search", vendor: "Google" },
  { pattern: /Googlebot/i, id: "Googlebot", kind: "search", vendor: "Google" },
  { pattern: /AdsBot-Google/i, id: "AdsBot-Google", kind: "monitor", vendor: "Google" },
  { pattern: /Mediapartners-Google/i, id: "Mediapartners-Google", kind: "monitor", vendor: "Google (AdSense)" },
  { pattern: /Storebot-Google/i, id: "Storebot-Google", kind: "search", vendor: "Google" },
  { pattern: /GoogleOther|Google-Read-Aloud|FeedFetcher-Google|Google-Site-Verification/i, id: "GoogleOther", kind: "search", vendor: "Google" },
  { pattern: /bingbot|BingPreview|AdIdxBot|MicrosoftPreview/i, id: "Bingbot", kind: "search", vendor: "Microsoft" },
  { pattern: /DuckDuckBot/i, id: "DuckDuckBot", kind: "search", vendor: "DuckDuckGo" },
  { pattern: /BraveBot|Brave Search/i, id: "BraveBot", kind: "search", vendor: "Brave" },
  { pattern: /YandexBot|YandexImages|YandexMobileBot|YandexMetrika/i, id: "YandexBot", kind: "search", vendor: "Yandex" },
  { pattern: /Baiduspider/i, id: "Baiduspider", kind: "search", vendor: "Baidu" },
  { pattern: /Sogou/i, id: "Sogou", kind: "search", vendor: "Sogou" },
  { pattern: /Exabot/i, id: "Exabot", kind: "search", vendor: "Exalead" },
  { pattern: /SeznamBot/i, id: "SeznamBot", kind: "search", vendor: "Seznam" },
  { pattern: /PetalBot/i, id: "PetalBot", kind: "search", vendor: "Huawei" },
  { pattern: /Applebot/i, id: "Applebot", kind: "search", vendor: "Apple" },
  { pattern: /Slurp/i, id: "Yahoo-Slurp", kind: "search", vendor: "Yahoo" },
  { pattern: /NaverBot|Yeti/i, id: "Naver-Yeti", kind: "search", vendor: "Naver" },
  { pattern: /MojeekBot/i, id: "MojeekBot", kind: "search", vendor: "Mojeek" },
  { pattern: /Qwantify/i, id: "Qwantify", kind: "search", vendor: "Qwant" },
  { pattern: /Gigabot/i, id: "Gigabot", kind: "search", vendor: "Gigablast" },
  { pattern: /Ecosia/i, id: "Ecosia", kind: "search", vendor: "Ecosia" },
  { pattern: /YepBot/i, id: "YepBot", kind: "search", vendor: "Ahrefs" },

  // ------------------------------------------------------- social / unfurls
  { pattern: /facebookexternalhit|Facebot/i, id: "facebookexternalhit", kind: "social", vendor: "Meta" },
  { pattern: /Twitterbot/i, id: "Twitterbot", kind: "social", vendor: "X" },
  { pattern: /LinkedInBot/i, id: "LinkedInBot", kind: "social", vendor: "LinkedIn" },
  { pattern: /Slackbot|Slack-ImgProxy/i, id: "Slackbot", kind: "social", vendor: "Slack" },
  { pattern: /Discordbot/i, id: "Discordbot", kind: "social", vendor: "Discord" },
  { pattern: /TelegramBot/i, id: "TelegramBot", kind: "social", vendor: "Telegram" },
  { pattern: /WhatsApp/i, id: "WhatsApp", kind: "social", vendor: "Meta" },
  { pattern: /Pinterest/i, id: "Pinterest", kind: "social", vendor: "Pinterest" },
  { pattern: /redditbot/i, id: "redditbot", kind: "social", vendor: "Reddit" },
  { pattern: /Embedly/i, id: "Embedly", kind: "social", vendor: "Embedly" },
  { pattern: /vkShare|W3C_Validator|Validator\.nu|Google-Structured-Data-Testing-Tool/i, id: "Validator", kind: "monitor", vendor: "Various" },

  // ------------------------------------------------------------- SEO tooling
  { pattern: /AhrefsBot/i, id: "AhrefsBot", kind: "seo", vendor: "Ahrefs" },
  { pattern: /SemrushBot/i, id: "SemrushBot", kind: "seo", vendor: "Semrush" },
  { pattern: /MJ12bot/i, id: "MJ12bot", kind: "seo", vendor: "Majestic" },
  { pattern: /DotBot/i, id: "DotBot", kind: "seo", vendor: "Moz" },
  { pattern: /DataForSeoBot|DataForSeekBot/i, id: "DataForSeoBot", kind: "seo", vendor: "DataForSEO" },
  { pattern: /Screaming ?Frog/i, id: "ScreamingFrog", kind: "seo", vendor: "Screaming Frog" },
  { pattern: /BLEXBot/i, id: "BLEXBot", kind: "seo", vendor: "WebMeUp" },
  { pattern: /SeekportBot/i, id: "SeekportBot", kind: "seo", vendor: "Seekport" },
  { pattern: /Rogerbot/i, id: "Rogerbot", kind: "seo", vendor: "Moz" },
  { pattern: /serpstatbot/i, id: "serpstatbot", kind: "seo", vendor: "Serpstat" },

  // -------------------------------------------------- uptime / monitoring
  { pattern: /UptimeRobot|Uptime-Kuma|Better ?Uptime/i, id: "UptimeRobot", kind: "monitor", vendor: "UptimeRobot" },
  { pattern: /Pingdom/i, id: "Pingdom", kind: "monitor", vendor: "Pingdom" },
  { pattern: /StatusCake/i, id: "StatusCake", kind: "monitor", vendor: "StatusCake" },
  { pattern: /Site24x7|Uptrends|NewRelicPinger|Datadog|Checkly/i, id: "Monitoring", kind: "monitor", vendor: "Various" },
];

/**
 * Fallback for anything that self-identifies as a bot/tool but is not in the
 * catalogue above. Kept narrow on purpose — a real browser UA matches none of
 * these tokens.
 */
const GENERIC_BOT =
  /(bot|crawler|spider|slurp|scrapy|headlesschrome|python-requests|python-urllib|aiohttp|go-http-client|curl\/|wget\/|libwww-perl|okhttp|java\/|http_request|facebookexternalhit)/i;

function sanitizeId(token: string): string {
  const clean = token.replace(/[^A-Za-z0-9._+-]/g, "").slice(0, 48);
  return clean || "UnknownBot";
}

/**
 * Classify a `User-Agent` string. Returns `null` for real browsers (and for a
 * missing header), so callers can treat "null" as "human or unknown".
 */
export function detectBot(userAgent: string | null | undefined): BotInfo | null {
  if (!userAgent) return null;
  const ua = userAgent.trim();
  if (!ua) return null;

  for (const rule of RULES) {
    if (rule.pattern.test(ua)) {
      return { id: rule.id, kind: rule.kind, vendor: rule.vendor };
    }
  }

  if (GENERIC_BOT.test(ua)) {
    // Strip the comment/URL tail ("Mozilla/5.0 (compatible; SomeBot/1.0; +http…)").
    const token = ua.split(/[\s/;(]+/).find((t) => /bot|crawler|spider/i.test(t)) ?? ua.split(/[\s/]+/)[0];
    return { id: sanitizeId(token), kind: "other", vendor: "Unknown" };
  }

  return null;
}

/** Kind + vendor for an id already stored in the counters (no UA needed). */
export function describeBot(botId: string): { kind: BotKind; vendor: string } {
  const rule = RULES.find((r) => r.id === botId);
  return rule ? { kind: rule.kind, vendor: rule.vendor } : { kind: "other", vendor: "Unknown" };
}

/** True for the AI answer/search crawlers that are deliberately allowed. */
export function isAiSearchBot(userAgent: string | null | undefined): boolean {
  return detectBot(userAgent)?.kind === "ai-search";
}
