import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { getPopular, getTrending, type Media } from "@/lib/anilist";
import { getFillerData } from "@/lib/filler";
import { SHUT_DOWN_SITES } from "@/lib/data/dead-site-alternatives";
import { POPULAR_ANIME_FALLBACK_IDS } from "@/lib/data/popular-anime-ids";
import { INDIAN_DUB_GUIDES } from "@/lib/indian-dub-guides";
import { TOONS_DATABASE } from "@/lib/toons-data";
import { NEWS_DESK } from "@/lib/news-desk";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

// Stable freshness anchor for template/detail pages: page content tracks the
// show's release date, not the sitemap regen cycle. Reporting `now` for every
// entry made Google treat everything as constantly-updated, triggering endless
// re-crawls ("crawled — currently not indexed") instead of indexation.
function stableLastModified(
  d: { year?: number | null; month?: number | null; day?: number | null } | undefined | null,
): Date | undefined {
  if (!d?.year) return undefined;
  return new Date(d.year, (d.month || 1) - 1, d.day || 1);
}

// Cache the sitemap so crawler fetches are served fast instead of repeatedly
// hitting the DB, AniList, RSS, and Wikipedia. 24-hour refresh keeps it fresh
// enough while making Bing's discovery reliable (a slow/timing-out sitemap is
// the #1 reason Bing under-indexes a site).
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,  changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`,  changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/filler`,  changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/characters`,  changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/manga`,  changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/seasonal`,  changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/watch-order`,  changeFrequency: "weekly", priority: 0.8 },
    // Content hubs + tools that were indexable and internally linked but missing
    // from the sitemap. UGC hubs (posts, memes, fanart, clips, lists, community)
    // are deliberately left out — see the UGC note near the bottom of this file.
    { url: `${BASE_URL}/guides`,  changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/compare-anime`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/popular-characters`,  changeFrequency: "weekly", priority: 0.6 },
    // NOTE: no /calendar entry — next.config.ts 308-redirects it to /schedule.
    { url: `${BASE_URL}/streaming-calendar`,  changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/seasonal-tracker`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/tools/filler-time`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/tools/binge-calculator`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/figures`,  changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/podcast`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/events`,  changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/indian-dubs`,  changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/conventions`,  changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/toons`,  changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/voice-actors/indian`,  changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/light-novels`,  changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/dubbed`,  changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/hindi-dub-schedule`,  changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/hindi-dub-schedule/muse-india`,  changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/hindi-dub-schedule/ani-one-india`,  changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/hindi-dub-schedule/crunchyroll`,  changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/manga-releases`,  changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/anime-birthdays`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/critiques`,  changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/voice-actors`,  changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/voice-lines`,  changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/ost`,  changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/blog`,  changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/themes`,  changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/wiki`,  changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/forum`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/leaderboard`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/quiz`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/quiz/daily`,  changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/schedule`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/reels`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/creators`,  changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/discover`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/feed`,  changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/posts`,  changeFrequency: "daily", priority: 0.4 },
    { url: `${BASE_URL}/awards`,  changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/developer`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/recommendations`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/challenges`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/stats`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/news`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/manga-million`,  changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/cosplay`,  changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/doujinshi`,  changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/clubs`,  changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/tierlist`,  changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/theories`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/achievements`,  changeFrequency: "weekly", priority: 0.5 },
    // NOTE: /activity is intentionally absent — robots.ts PRIVATE_PATHS
    // disallows it (personalised feed), and a sitemap entry would surface as
    // "Submitted URL blocked by robots.txt" in Search Console.
    { url: `${BASE_URL}/watch-party`,  changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE_URL}/manga-list`,  changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/premium`,  changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/tv-schedule`,  changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/live-action`,  changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/polls`,  changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/docs`,  changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/extension`,  changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/status`,  changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`,  changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE_URL}/best-anime-sites`,  changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/top-anime`,  changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`,  changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic: Blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isDraft: false, isDeleted: false },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 200,
    });
    blogPages = posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Wiki pages
  let wikiPages: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.wikiPage.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    wikiPages = pages.map((p) => ({
      url: `${BASE_URL}/wiki/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Cosplay entries (UGC, low value — exclude from sitemap to focus crawl on SEO pages)

  // Dynamic: Forum threads (UGC, low value — exclude from sitemap to focus crawl on SEO pages)

  // Dynamic: Events (UGC, thin — excluded from sitemap so Google's crawl
  // budget stays on editorial/substantive pages; they're still discoverable
  // via internal links).

  // NOTE: the old hardcoded `fillerAnimeIds` array (/anime/{id}/filler for 57
  // arbitrary AniList ids) was removed. Most of those ids have no filler data,
  // so they returned 404 or a near-empty template — exactly the junk that feeds
  // Search Console's "Not found (404)" and "Discovered - currently not indexed".
  // Real filler guides are submitted by slug below from live filler data.

  // Dynamic: Per-anime long-tail filler guide pages (static, high SEO value).
  // Only the richest guides (most episodes) are submitted so the crawl budget
  // isn't flooded with 180 near-identical templates. No lastModified — these
  // don't change, and lying to Google with `now` forced constant re-crawls.
  let fillerSlugPages: MetadataRoute.Sitemap = [];
  try {
    const fillerShows = await getFillerData();
    const topFillerShows = [...fillerShows]
      .sort((a, b) => (b.episodes?.length || 0) - (a.episodes?.length || 0))
      .slice(0, 40);
    fillerSlugPages = topFillerShows.map((s) => ({
      url: `${BASE_URL}/filler/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Wiki seed data (from seed.ts)
  const wikiSeedSlugs = [
    "attack-on-titan", "demon-slayer", "naruto", "one-piece", "dragon-ball-z",
    "my-hero-academia", "death-note", "fullmetal-alchemist-brotherhood",
    "jujutsu-kaisen", "spy-x-family", "one-punch-man", "tokyo-ghoul",
    "solo-leveling", "chain-saw-man", "bleach", "hunter-x-hunter",
    "sword-art-online", "code-geass", "steins-gate", "cowboy-bebop",
  ];
  const wikiSeedPages: MetadataRoute.Sitemap = wikiSeedSlugs.map((slug) => ({
    url: `${BASE_URL}/wiki/${slug}`,
    
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Anime/manga detail pages are intentionally NOT submitted. They are thin
  // AniList/MAL mirrors (synopsis, cover, stats duplicated across the web) and
  // made up the biggest chunk of "Crawled/Discovered - currently not indexed".
  // They stay fully reachable via internal links, search and navigation — we
  // just stop spending crawl budget advertising them to Google. The
  // /watch/{id} guides below ARE unique (Indian streaming + Hindi dub info)
  // and worth submitting. This keeps the sitemap focused on pages that can
  // actually rank: filler guides, watch orders, dub guides, wiki and tools.

  // Dynamic: Popular anime "where to watch in India" guides (unique content)
  //
  // Two things silently emptied this section before:
  //   1. `getPopular(100)` — AniList caps `perPage` at 50 and clamps silently,
  //      so 100 was never actually 100.
  //   2. Any AniList hiccup (rate limits are common at build time) threw here,
  //      and the catch left the section empty for the whole 24h revalidate
  //      window. The live sitemap had zero `/watch/` URLs because of it.
  // Now: ask for 50 twice across two orderings (trending skews seasonal), and
  // fall back to a baked, verified id list if AniList is unavailable.
  let watchGuidePages: MetadataRoute.Sitemap = [];
  try {
    const [popular, trending] = await Promise.all([
      getPopular(50).catch((): Media[] => []),
      getTrending(50).catch((): Media[] => []),
    ]);

    const starts = new Map<number, Media["startDate"]>();
    for (const m of [...popular, ...trending]) {
      if (typeof m?.id === "number") starts.set(m.id, m.startDate);
    }
    if (starts.size === 0) {
      for (const id of POPULAR_ANIME_FALLBACK_IDS) starts.set(id, undefined);
    }

    watchGuidePages = [...starts.entries()].map(([id, startDate]) => ({
      url: `${BASE_URL}/watch/${id}`,
      lastModified: stableLastModified(startDate),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (e) { logError(e); }

  // Character pages are intentionally NOT submitted: their content is a thin
  // AniList mirror and their metadata is now `noindex` (see
  // src/app/character/[id]/layout.tsx). Submitting noindex URLs to Google
  // produces "Submitted URL marked noindex" noise in Search Console.

  // Dynamic: Shut-down anime site alternatives (high SEO value)
  const alternativePages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/alternatives`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...SHUT_DOWN_SITES.map((s) => ({
      url: `${BASE_URL}/alternatives/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  // Dynamic: Watch order detail pages (high SEO value)
  const watchOrderSlugs = [
    "rezero", "sao", "fate", "monogatari", "naruto", "dragon-ball",
    "jojo", "aot", "steins-gate", "evangelion", "demon-slayer",
    "bleach", "fma", "one-piece", "hunter-x-hunter", "mha",
    "code-geass", "made-in-abyss", "madoka", "gundam", "toaru",
    "psycho-pass", "haruhi", "durarara", "baccano", "higurashi",
    "ghost-in-the-shell", "gintama", "conan", "digimon", "pokemon",
    "initial-d", "symphogear", "macross", "yu-yu-hakusho", "slam-dunk",
    "precure", "katangatari", "tiger-and-bunny",
    "jujutsu-kaisen", "chainsaw-man", "spy-x-family", "mob-psycho-100",
    "tokyo-ghoul", "seven-deadly-sins", "overlord", "konosuba",
    "dr-stone", "one-punch-man", "kaguya-sama",
  ];
  const watchOrderPages: MetadataRoute.Sitemap = watchOrderSlugs.map((slug) => ({
    url: `${BASE_URL}/watch-order/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // RSS news detail pages (scraped headlines, near-duplicate of the source,
  // thin — excluded so they stop draining the crawl budget).
  const newsPages: MetadataRoute.Sitemap = [];

  // Indian dub guides (static, high SEO value — unique editorial content)
  const indianDubGuidePages: MetadataRoute.Sitemap = INDIAN_DUB_GUIDES.map((g) => ({
    url: `${BASE_URL}/indian-dubs/${g.slug}`,
    
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Toon detail pages (static, original India-focused content: Chhota Bheem,
  // Motu Patlu, Hindi-dubbed imports). These were indexable and linked from the
  // footer/nav but missing from the sitemap entirely. No `lastModified`: the
  // data is evergreen, and reporting `now` makes Google treat every entry as
  // constantly updated (see the freshness-anchor note at the top of this file).
  const toonPages: MetadataRoute.Sitemap = TOONS_DATABASE.map((t) => ({
    url: `${BASE_URL}/toons/${t.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Manga release countdowns (static, high SEO value — recurring weekly queries)
  const mangaReleasePages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/manga-releases`,  changeFrequency: "daily" as const, priority: 0.8 },
    ...["one-piece", "chainsaw-man", "solo-leveling-ragnarok", "boruto-two-blue-vortex", "spy-x-family", "frieren", "my-hero-academia", "jujutsu-kaisen", "hunter-x-hunter"].map((slug) => ({
      url: `${BASE_URL}/manga-releases/${slug}`,
      
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  // ZyniVerse News Desk (static, dated, high freshness value)
  const newsDeskPages: MetadataRoute.Sitemap = NEWS_DESK.map((n) => ({
    url: `${BASE_URL}/news/desk/${n.slug}`,
    lastModified: new Date(n.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // NOTE: UGC pages (user posts, reels, creator hubs, user list hubs, forum
  // threads) are intentionally EXCLUDED from the sitemap. They are thin,
  // template-driven pages with no SEO value and were inflating the crawl
  // budget, matching Google's "crawled/discovered - currently not indexed"
  // wave. Only curated, original-content pages belong here.

  const allPages: MetadataRoute.Sitemap = [
    ...staticPages,
    ...blogPages,
    ...wikiPages,
    ...wikiSeedPages,
    ...watchOrderPages,
    ...fillerSlugPages,
    ...newsPages,
    ...alternativePages,
    ...indianDubGuidePages,
    ...toonPages,
    ...mangaReleasePages,
    ...newsDeskPages,
    ...watchGuidePages,
  ];

  const seen = new Set<string>();
  return allPages.filter((p) => {
    const url = p.url.replace(/\/$/, "");
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}
