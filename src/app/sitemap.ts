import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

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
  } catch {}

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
  } catch {}

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
  } catch {}

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

  return [
    ...staticPages,
    ...blogPages,
    ...wikiPages,
    ...wikiSeedPages,
    ...cosplayPages,
  ];
}
