import { getTrending, getAiringAnime, bestTitle, getSeasonal } from "@/lib/anilist";
import { prisma } from "@/lib/prisma";
import { dedupedFetch } from "@/lib/wiki-cache";
import RssParser from "rss-parser";
import type { Media } from "@/lib/anilist";

const rssParser = new RssParser({
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent"],
    ],
  },
});

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
  content?: string;
  source: "Trending" | "Community" | "Seasonal" | "News";
  type: "announcement" | "airing" | "trending" | "seasonal" | "community" | "rss";
  publishedAt: string;
  tags: string[];
}

function _timeAgo(date: Date): string {
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

function extractImageFromHTML(html: string): string {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : "";
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function getAnimeNews(): Promise<NewsItem[]> {
  return dedupedFetch("news:anime", async () => {
    const items: NewsItem[] = [];

    const [trending, airing] = await Promise.all([
      getTrending(20).catch(() => [] as Media[]),
      getAiringAnime(50).catch(() => [] as Media[]),
    ]);

    const now = Date.now();

    trending.forEach((m, i) => {
      items.push({
        id: `trending-${m.id}`,
        title: `${mediaToTitle(m)} is trending #${i + 1} this week`,
        summary: `Trending with ${m.trending ?? 0} points • ${m.popularity?.toLocaleString() ?? 0} fans`,
        url: `/anime/${m.id}`,
        image: mediaToImage(m),
        source: "Trending",
        type: "trending",
        publishedAt: new Date(now + (i + 1) * 60_000).toISOString(),
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
        source: "Trending",
        type: "airing",
        publishedAt: ep
          ? new Date(ep.airingAt * 1000).toISOString()
          : new Date(now - Math.random() * 86400000).toISOString(),
        tags: m.genres?.slice(0, 3) || [],
      });
    });

    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return items;
  }, 10 * 60 * 1000);
}

export async function getSeasonalAnnouncements(season?: string, year?: number): Promise<NewsItem[]> {
  const cacheKey = `news:seasonal:${season || "auto"}:${year || "auto"}`;
  return dedupedFetch(cacheKey, async () => {
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
      source: "Seasonal" as const,
      type: "seasonal" as const,
      publishedAt: new Date(now.getTime() - Math.random() * 7 * 86400000).toISOString(),
      tags: media.genres?.slice(0, 3) || [],
    }));
  }, 10 * 60 * 1000);
}

export async function getRecentReviews(): Promise<NewsItem[]> {
  return dedupedFetch("news:reviews", async () => {
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
      source: "Community" as const,
      type: "community" as const,
      publishedAt: r.createdAt.toISOString(),
      tags: ["review"],
    }));
  }, 5 * 60 * 1000);
}

export async function getActivityFeed(userId?: string): Promise<NewsItem[]> {
  const cacheKey = userId ? `news:activity:${userId}` : "news:activity:all";
  return dedupedFetch(cacheKey, async () => {
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

    return activities.filter((a) => a.user !== null).map((a) => ({
      id: `activity-${a.id}`,
      title: `${a.user!.username} ${a.type.toLowerCase()}${a.mediaId ? ` anime #${a.mediaId}` : ""}`,
      summary: a.message || `${a.user!.username} performed an action`,
      url: a.mediaId ? `/anime/${a.mediaId}` : "#",
      image: "",
      source: "Community" as const,
      type: "community" as const,
      publishedAt: a.createdAt.toISOString(),
      tags: ["activity"],
    }));
  }, 5 * 60 * 1000);
}

export async function getANNNews(): Promise<NewsItem[]> {
  return dedupedFetch("news:ann", async () => {
    try {
      const feed = await rssParser.parseURL("https://www.animenewsnetwork.com/all/rss.xml?ann-hierarchical");
      return feed.items.slice(0, 20).map((item) => {
        const content = item.content || item.contentSnippet || "";
        const guid = item.guid || item.link || "";
        return {
          id: `ann-${simpleHash(guid)}`,
          title: item.title || "Anime News Network Update",
          summary: item.contentSnippet?.slice(0, 150) || content.slice(0, 150),
          url: item.link || "https://www.animenewsnetwork.com",
          image: extractImageFromHTML(content),
          content,
          source: "News" as const,
          type: "rss" as const,
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ["ANN", ...(item.categories || []).slice(0, 2)],
        };
      });
    } catch (e) {
      console.error("ANN RSS fetch failed:", e);
      return [];
    }
  }, 30 * 60 * 1000);
}

export async function getMALNews(): Promise<NewsItem[]> {
  return dedupedFetch("news:mal", async () => {
    try {
      const feed = await rssParser.parseURL("https://myanimelist.net/rss/news.xml");
      return feed.items.slice(0, 20).map((item) => {
        const content = item.content || item.contentSnippet || "";
        const thumb = (item as unknown as Record<string, string>).mediaThumbnail || "";
        const guid = item.guid || item.link || "";
        return {
          id: `mal-${simpleHash(guid)}`,
          title: item.title || "MyAnimeList Update",
          summary: item.contentSnippet?.slice(0, 150) || content.slice(0, 150),
          url: item.link || "https://myanimelist.net/news",
          image: thumb || extractImageFromHTML(content),
          content,
          source: "News" as const,
          type: "rss" as const,
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ["MAL", ...(item.categories || []).slice(0, 2)],
        };
      });
    } catch (e) {
      console.error("MAL RSS fetch failed:", e);
      return [];
    }
  }, 30 * 60 * 1000);
}

export async function getAllRSSNews(): Promise<NewsItem[]> {
  return dedupedFetch("news:rss-all", async () => {
    const [ann, mal] = await Promise.all([getANNNews(), getMALNews()]);
    const all = [...ann, ...mal];
    const seen = new Set<string>();
    const unique = all.filter((item) => {
      const key = item.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return unique;
  }, 30 * 60 * 1000);
}

export async function getRSSNewsById(id: string): Promise<NewsItem | null> {
  const allRSS = await getAllRSSNews();
  return allRSS.find((item) => item.id === id) || null;
}
