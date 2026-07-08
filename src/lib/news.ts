import { getTrending, getAiringAnime, bestTitle, getSeasonal } from "@/lib/anilist";
import { prisma } from "@/lib/prisma";
import type { Media } from "@/lib/anilist";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
  source: "AniList" | "Community" | "Seasonal";
  type: "announcement" | "airing" | "trending" | "seasonal" | "community";
  publishedAt: string;
  tags: string[];
}

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function mediaToTitle(m: Media): string {
  return bestTitle(m.title);
}

function mediaToImage(m: Media): string {
  return m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || "";
}

export async function getAnimeNews(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];

  const [trending, airing] = await Promise.all([
    getTrending(20).catch(() => [] as Media[]),
    getAiringAnime(50).catch(() => [] as Media[]),
  ]);

  const now = new Date();

  trending.forEach((m, i) => {
    items.push({
      id: `trending-${m.id}`,
      title: `${mediaToTitle(m)} is trending #${i + 1} this week`,
      summary: `Trending with ${m.trending ?? 0} points • ${m.popularity?.toLocaleString() ?? 0} fans`,
      url: `/anime/${m.id}`,
      image: mediaToImage(m),
      source: "AniList",
      type: "trending",
      publishedAt: new Date(now.getTime() - i * 60_000).toISOString(),
      tags: m.genres?.slice(0, 3) || [],
    });
  });

  airing.forEach((m) => {
    const ep = m.nextAiringEpisode;
    items.push({
      id: `airing-${m.id}-${ep?.episode ?? "next"}`,
      title: ep
        ? `Episode ${ep.episode} of ${mediaToTitle(m)} just aired`
        : `${mediaToTitle(m)} is currently airing`,
      summary: `${mediaToTitle(m)} • ${m.episodes ? `${m.episodes} eps` : "Airing"} • Popularity: ${m.popularity?.toLocaleString() ?? "N/A"}`,
      url: `/anime/${m.id}`,
      image: mediaToImage(m),
      source: "AniList",
      type: "airing",
      publishedAt: ep
        ? new Date(ep.airingAt * 1000).toISOString()
        : new Date(now.getTime() - Math.random() * 86400000).toISOString(),
      tags: m.genres?.slice(0, 3) || [],
    });
  });

  items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return items.slice(0, 50);
}

export async function getSeasonalAnnouncements(season?: string, year?: number): Promise<NewsItem[]> {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = now.getMonth() + 1;
  const s = season || (m <= 3 ? "WINTER" : m <= 6 ? "SPRING" : m <= 9 ? "SUMMER" : "FALL");

  const page = await getSeasonal(y, s, 30).catch(() => null);
  if (!page) return [];

  return (page.media || []).map((media: Media) => ({
    id: `seasonal-${media.id}`,
    title: `New anime announced: ${mediaToTitle(media)}`,
    summary: `${media.format || "TV"} • ${media.episodes ? `${media.episodes} eps` : "TBA"} • ${media.genres?.slice(0, 3).join(", ") || "Various"}`,
    url: `/anime/${media.id}`,
    image: mediaToImage(media),
    source: "Seasonal",
    type: "seasonal",
    publishedAt: new Date(now.getTime() - Math.random() * 7 * 86400000).toISOString(),
    tags: media.genres?.slice(0, 3) || [],
  }));
}

export async function getRecentReviews(): Promise<NewsItem[]> {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: { select: { username: true } },
    },
  });

  return reviews.map((r) => ({
    id: `review-${r.id}`,
    title: `${r.user.username} reviewed anime #${r.mediaId}`,
    summary: `Rating: ${r.rating}/10${r.comment ? ` — ${r.comment.slice(0, 120)}` : ""}`,
    url: `/anime/${r.mediaId}`,
    image: "",
    source: "Community",
    type: "community",
    publishedAt: r.createdAt.toISOString(),
    tags: ["review"],
  }));
}

export async function getActivityFeed(userId?: string): Promise<NewsItem[]> {
  const where = userId
    ? {
        user: {
          followers: { some: { followerId: userId } },
        },
      }
    : {};

  const activities = await prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { username: true } },
    },
  });

  return activities.map((a) => ({
    id: `activity-${a.id}`,
    title: `${a.user.username} ${a.type.toLowerCase()}${a.mediaId ? ` anime #${a.mediaId}` : ""}`,
    summary: a.message || `${a.user.username} performed an action`,
    url: a.mediaId ? `/anime/${a.mediaId}` : "#",
    image: "",
    source: "Community",
    type: "community",
    publishedAt: a.createdAt.toISOString(),
    tags: ["activity"],
  }));
}
