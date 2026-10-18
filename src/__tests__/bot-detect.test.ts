import { describe, it, expect } from "vitest";
import { detectBot, describeBot, isAiSearchBot } from "@/lib/bot-detect";

/**
 * Real-world User-Agent strings. Bot classification drives admin reporting, so
 * the two failure modes both matter:
 *   - a bot counted as human → AI/search crawl traffic stays invisible
 *   - a browser counted as a bot → "total views" is polluted by the proxy
 */
const CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0";
const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const FIREFOX = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

describe("detectBot — real browsers are never bots", () => {
  it.each([
    ["Chrome", CHROME],
    ["Edge", EDGE],
    ["iPhone Safari", IPHONE_SAFARI],
    ["Firefox", FIREFOX],
  ])("%s → null", (_label, ua) => {
    expect(detectBot(ua)).toBeNull();
  });

  it("handles missing / blank headers", () => {
    expect(detectBot(null)).toBeNull();
    expect(detectBot(undefined)).toBeNull();
    expect(detectBot("")).toBeNull();
    expect(detectBot("   ")).toBeNull();
  });
});

describe("detectBot — Google crawlers", () => {
  it("classifies plain Googlebot as search", () => {
    expect(detectBot(GOOGLEBOT)).toEqual({ id: "Googlebot", kind: "search", vendor: "Google" });
  });

  it("keeps the smartphone Googlebot UA on the Googlebot rule", () => {
    const smartphone =
      "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
    expect(detectBot(smartphone)?.id).toBe("Googlebot");
  });

  it("separates subtype + tool UAs from plain Googlebot", () => {
    expect(detectBot("Googlebot-Image/1.0")?.id).toBe("Googlebot-Image");
    expect(detectBot("Googlebot-News")?.id).toBe("Googlebot-News");
    expect(detectBot("Google-InspectionTool/1.0")?.kind).toBe("monitor");
    expect(detectBot("Google-Site-Verification/1.0")?.id).toBe("GoogleOther");
  });

  it("does not fold AdsBot/Mediapartners into Googlebot", () => {
    expect(detectBot("AdsBot-Google (+http://www.google.com/adsbot.html)")?.id).toBe("AdsBot-Google");
    expect(detectBot("Mediapartners-Google")?.id).toBe("Mediapartners-Google");
  });
});

describe("detectBot — AI crawlers", () => {
  it.each([
    ["OAI-SearchBot/1.0; +https://openai.com/searchbot", "OAI-SearchBot"],
    ["ChatGPT-User/1.0; +https://openai.com/bot", "ChatGPT-User"],
    ["PerplexityBot/1.0; +https://perplexity.ai/perplexitybot", "PerplexityBot"],
    ["Perplexity-User/1.0; +https://perplexity.ai/perplexity-user", "Perplexity-User"],
    ["Claude-SearchBot/1.0", "Claude-SearchBot"],
    ["Meta-ExternalFetcher/1.1", "Meta-ExternalFetcher"],
  ])("allowed AI answer crawler %s", (token, id) => {
    const info = detectBot(`Mozilla/5.0 (compatible; ${token})`);
    expect(info?.id).toBe(id);
    expect(info?.kind).toBe("ai-search");
  });

  it.each([
    ["GPTBot/1.2; +https://openai.com/gptbot", "GPTBot"],
    ["ClaudeBot/1.0", "ClaudeBot"],
    ["anthropic-ai", "AnthropicBot"],
    ["Google-Extended", "Google-Extended"],
    ["Meta-ExternalAgent/1.0", "Meta-ExternalAgent"],
    ["Applebot-Extended/1.0", "Applebot-Extended"],
    ["CCBot/2.0 (https://commoncrawl.org/faq/)", "CCBot"],
    ["Bytespider; spider-feedback@bytedance.com", "Bytespider"],
  ])("training crawler %s is flagged as opted-out", (token, id) => {
    const info = detectBot(`Mozilla/5.0 (compatible; ${token})`);
    expect(info?.id).toBe(id);
    expect(info?.kind).toBe("ai-training");
  });

  it("isAiSearchBot only matches the allowed set", () => {
    expect(isAiSearchBot("Mozilla/5.0 (compatible; PerplexityBot/1.0)")).toBe(true);
    expect(isAiSearchBot(GOOGLEBOT)).toBe(false);
    expect(isAiSearchBot("Mozilla/5.0 (compatible; GPTBot/1.2)")).toBe(false);
    expect(isAiSearchBot(CHROME)).toBe(false);
  });
});

describe("detectBot — social, SEO, monitoring, generic", () => {
  it("classifies social unfurlers", () => {
    expect(detectBot("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)")?.kind).toBe("social");
    expect(detectBot("Twitterbot/1.0")?.kind).toBe("social");
    expect(detectBot("WhatsApp/2.23.20.0")?.kind).toBe("social");
    expect(detectBot("Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)")?.kind).toBe("social");
  });

  it("classifies SEO crawlers", () => {
    expect(detectBot("Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)")).toEqual({
      id: "AhrefsBot",
      kind: "seo",
      vendor: "Ahrefs",
    });
    expect(detectBot("Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)")?.kind).toBe("seo");
  });

  it("classifies classic search engines that used to be blocked", () => {
    expect(detectBot("Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)")?.kind).toBe("search");
    expect(detectBot("Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)")?.kind).toBe("search");
    expect(detectBot("Mozilla/5.0 (compatible; PetalBot; +https://webmaster.petalsearch.com/site/petalbot)")?.kind).toBe("search");
    expect(detectBot("Mozilla/5.0 (compatible; SeznamBot/4.0; +http://fulltext.sblog.cz/)")?.kind).toBe("search");
  });

  it("falls back to a sanitised id for unknown bots (never null for bot-shaped UAs)", () => {
    const info = detectBot("Mozilla/5.0 (compatible; SomeNewBot/0.1; +http://example.com/bot)");
    expect(info?.id).toBe("SomeNewBot");
    expect(info?.kind).toBe("other");

    expect(detectBot("python-requests/2.31.0")?.id).toBe("python-requests");
    expect(detectBot("curl/8.4.0")?.id).toBe("curl");
    expect(detectBot("UptimeRobot/2.0")?.kind).toBe("monitor");
  });

  it("sanitises ids so they are safe as counter keys (no colons/slashes)", () => {
    const info = detectBot("Mozilla/5.0 (compatible; Evil:Bot/1.0)");
    expect(info?.id).not.toMatch(/[:/\\\s]/);
  });
});

describe("describeBot — lookup for already-stored ids", () => {
  it("resolves catalogue ids", () => {
    expect(describeBot("PerplexityBot")).toEqual({ kind: "ai-search", vendor: "Perplexity" });
    expect(describeBot("Googlebot")).toEqual({ kind: "search", vendor: "Google" });
  });

  it("falls back to 'other' for unknown / legacy ids", () => {
    expect(describeBot("SomeNewBot")).toEqual({ kind: "other", vendor: "Unknown" });
    expect(describeBot("")).toEqual({ kind: "other", vendor: "Unknown" });
  });
});
