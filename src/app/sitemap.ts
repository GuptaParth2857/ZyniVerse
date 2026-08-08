import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { getPopular, getMangaPopular, getPopularCharacters } from "@/lib/anilist";
import { getFillerData } from "@/lib/filler";
import { getAllRSSNews } from "@/lib/news";
import { SHUT_DOWN_SITES } from "@/lib/data/dead-site-alternatives";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/filler`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/characters`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/manga`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/seasonal`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/watch-order`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/indian-dubs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/conventions`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/voice-actors/indian`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/light-novels`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/dubbed`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/critiques`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/voice-actors`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/voice-lines`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/ost`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/themes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/wiki`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/forum`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/quiz`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/quiz/daily`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/schedule`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/community`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/awards`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/developer`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/recommendations`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/challenges`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/stats`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/manga-million`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/cosplay`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/doujinshi`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/clubs`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/tierlist`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/achievements`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/activity`, lastModified: now, changeFrequency: "daily", priority: 0.4 },
    { url: `${BASE_URL}/watch-party`, lastModified: now, changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE_URL}/premium`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/tv-schedule`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/live-action`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/polls`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/status`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE_URL}/best-anime-sites`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/top-anime`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
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

  // Dynamic: Cosplay entries
  let cosplayPages: MetadataRoute.Sitemap = [];
  try {
    const entries = await prisma.cosplay.findMany({
      where: {},
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    cosplayPages = entries.map((e) => ({
      url: `${BASE_URL}/cosplay/${e.id}`,
      lastModified: e.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Forum threads
  let forumPages: MetadataRoute.Sitemap = [];
  try {
    const threads = await prisma.forumThread.findMany({
      where: { isDeleted: false },
      select: { id: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    forumPages = threads.map((t) => ({
      url: `${BASE_URL}/forum/thread/${t.id}`,
      lastModified: t.updatedAt || t.createdAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Events
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const events = await prisma.animeEvent.findMany({
      where: {},
      select: { slug: true, updatedAt: true, startDate: true },
      orderBy: { startDate: "desc" },
      take: 100,
    });
    eventPages = events.map((e) => ({
      url: `${BASE_URL}/events/${e.slug}`,
      lastModified: e.updatedAt || now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Anime filler pages (high SEO value)
  const fillerAnimeIds = [
    20, 21, 30, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
    1100, 1200, 1300, 1400, 1500, 1535, 1544, 1575, 1600, 1649, 1700,
    1735, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2472, 2600, 2700,
    2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900,
    4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000,
  ];
  const fillerPages: MetadataRoute.Sitemap = fillerAnimeIds.map((id) => ({
    url: `${BASE_URL}/anime/${id}/filler`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Dynamic: Per-anime long-tail filler guide pages (static, high SEO value)
  let fillerSlugPages: MetadataRoute.Sitemap = [];
  try {
    const fillerShows = await getFillerData();
    fillerSlugPages = fillerShows.map((s) => ({
      url: `${BASE_URL}/filler/${s.slug}`,
      lastModified: now,
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
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Dynamic: Popular anime detail pages (high SEO value)
  let popularAnimePages: MetadataRoute.Sitemap = [];
  try {
    const popular = await getPopular(100);
    popularAnimePages = popular.map((m) => ({
      url: `${BASE_URL}/anime/${m.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Popular manga detail pages
  let popularMangaPages: MetadataRoute.Sitemap = [];
  try {
    const manga = await getMangaPopular(100);
    popularMangaPages = manga.map((m) => ({
      url: `${BASE_URL}/manga/${m.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Popular character pages
  let popularCharacterPages: MetadataRoute.Sitemap = [];
  try {
    const { characters } = await getPopularCharacters(1, 50);
    popularCharacterPages = characters.map((c) => ({
      url: `${BASE_URL}/character/${c.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (e) { logError(e); }

  // Dynamic: Shut-down anime site alternatives (high SEO value)
  const alternativePages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/alternatives`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    ...SHUT_DOWN_SITES.map((s) => ({
      url: `${BASE_URL}/alternatives/${s.slug}`,
      lastModified: now,
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
  ];
  const watchOrderPages: MetadataRoute.Sitemap = watchOrderSlugs.map((slug) => ({
    url: `${BASE_URL}/watch-order/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic: RSS news detail pages
  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const newsItems = await getAllRSSNews();
    newsPages = newsItems.slice(0, 30).map((n) => ({
      url: `${BASE_URL}/news/${encodeURIComponent(n.id)}`,
      lastModified: n.publishedAt ? new Date(n.publishedAt) : now,
      changeFrequency: "daily" as const,
      priority: 0.5,
    }));
  } catch (e) { logError(e); }

  return [
    ...staticPages,
    ...blogPages,
    ...wikiPages,
    ...wikiSeedPages,
    ...watchOrderPages,
    ...cosplayPages,
    ...forumPages,
    ...eventPages,
    ...fillerPages,
    ...fillerSlugPages,
    ...newsPages,
    ...alternativePages,
    ...popularAnimePages,
    ...popularMangaPages,
    ...popularCharacterPages,
  ];
}
