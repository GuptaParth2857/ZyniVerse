import { getTrending, getAnimeDetailFull, searchMedia, bestTitle, getMediaBatch } from "@/lib/anilist";
import { prisma } from "./prisma";
import type { Media } from "@/lib/anilist";

export interface Recommendation {
  id: number;
  title: string;
  score: number;
  reason: string;
  image: string;
  format: string;
  episodes: number;
  genres: string[];
  matchTags: string[];
}

function mediaToRec(
  media: Media,
  score: number,
  reason: string,
  matchTags: string[] = [],
): Recommendation {
  return {
    id: media.id,
    title: bestTitle(media.title),
    score,
    reason,
    image: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || "",
    format: media.format || "",
    episodes: media.episodes || 0,
    genres: media.genres || [],
    matchTags,
  };
}

function calcScore(media: Media, targetGenres: string[], targetTags: string[] = []): number {
  const genreOverlap = media.genres?.filter((g) => targetGenres.includes(g)).length || 0;
  const pop = media.popularity || 0;
  const tr = media.trending || 0;
  let score = Math.min(40, (pop / 50000) * 40) + Math.min(20, tr) + genreOverlap * 10;
  if (targetTags.length > 0) {
    const tagOverlap = media.tags?.filter((t) => targetTags.includes(t.name)).length || 0;
    score += Math.min(20, tagOverlap * 5);
  }
  return Math.min(100, Math.round(score));
}

export async function getGenreBasedRecs(
  genres: string[],
  excludeIds: number[] = [],
): Promise<Recommendation[]> {
  if (genres.length === 0) return [];

  const excludeSet = new Set(excludeIds);
  const seen = new Set<number>();
  const results: Recommendation[] = [];

  for (const genre of genres) {
    try {
      const data = await searchMedia({ genre, sort: "TRENDING_DESC", perPage: 30 });
      for (const media of data.media) {
        if (seen.has(media.id) || excludeSet.has(media.id)) continue;
        seen.add(media.id);
        const overlap = media.genres?.filter((g) => genres.includes(g)) || [];
        const score = calcScore(media, genres, []);
        const reason = overlap.length > 1
          ? `Popular in ${overlap.slice(0, 3).join(", ")}`
          : `Popular in ${genre}`;
        results.push(mediaToRec(media, score, reason));
      }
    } catch {}
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 24);
}

export async function getSimilarAnime(anilistId: number): Promise<Recommendation[]> {
  let detail: Media;
  try {
    detail = (await getAnimeDetailFull(anilistId)) as unknown as Media;
  } catch {
    return [];
  }

  const mediaGenres = detail.genres || [];
  const mediaTags = (detail.tags || []).map((t) => t.name);
  const seen = new Set<number>([anilistId]);
  const results: Recommendation[] = [];

  for (const genre of mediaGenres.slice(0, 3)) {
    try {
      const data = await searchMedia({ genre, sort: "POPULARITY_DESC", perPage: 20 });
      for (const media of data.media) {
        if (seen.has(media.id)) continue;
        seen.add(media.id);
        const genreOverlap = media.genres?.filter((g) => mediaGenres.includes(g)).length || 0;
        const tagOverlap = media.tags?.filter((t) => mediaTags.includes(t.name)).length || 0;
        const score = Math.min(100,
          Math.round(genreOverlap * 15 + tagOverlap * 5 + ((media.popularity || 0) / 5000)));
        const sharedGenres = media.genres?.filter((g) => mediaGenres.includes(g)) || [];
        const sharedTags = media.tags?.filter((t) => mediaTags.includes(t.name)).map((t) => t.name) || [];
        const reason = sharedGenres.length > 0
          ? `Similar to ${bestTitle(detail.title)} — shares ${sharedGenres.slice(0, 3).join(", ")}`
          : `Related to ${bestTitle(detail.title)}`;
        results.push(mediaToRec(media, score, reason, sharedTags.slice(0, 5)));
      }
    } catch {}
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 12);
}

export async function getTrendingRecs(): Promise<Recommendation[]> {
  let data: Media[];
  try {
    data = await getTrending(24);
  } catch {
    return [];
  }

  return data.map((media) => {
    const score = Math.min(100,
      Math.round(((media.trending || 0) / 2) + ((media.popularity || 0) / 5000)));
    return mediaToRec(media, score, "Trending now");
  });
}

export async function getPersonalizedRecs(userId: string): Promise<Recommendation[]> {
  const entries = await prisma.listEntry.findMany({
    where: { userId, status: "COMPLETED" },
    take: 50,
    orderBy: { updatedAt: "desc" },
  });

  if (entries.length === 0) return getTrendingRecs();

  const mediaIds = entries.map((e) => e.mediaId);
  let mediaList: { id: number; genres?: string[] }[];
  try {
    mediaList = await getMediaBatch(mediaIds);
  } catch {
    return getTrendingRecs();
  }

  const genreCount = new Map<string, number>();
  for (const m of mediaList) {
    for (const g of m.genres || []) {
      genreCount.set(g, (genreCount.get(g) || 0) + 1);
    }
  }

  const topGenres = [...genreCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([g]) => g);

  if (topGenres.length === 0) return getTrendingRecs();

  return getGenreBasedRecs(topGenres, mediaIds);
}
