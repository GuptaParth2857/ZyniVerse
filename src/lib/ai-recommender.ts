import { prisma } from "./prisma";
import { searchMedia, getTrending, getAnimeDetailFull, bestTitle } from "./anilist";
import type { Media } from "./anilist";

interface ActivityProfile {
  topGenres: { genre: string; weight: number }[];
  viewedMediaIds: number[];
  searchQueries: string[];
  favoriteActions: string[];
  recentActivityCount: number;
}

interface AIRecommendation {
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

async function buildActivityProfile(userId?: string): Promise<ActivityProfile> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let activities = userId
    ? await prisma.userActivity.findMany({
        where: { userId: userId!, createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 500,
      })
    : [];

  // Fallback to anonymous activity if user has none
  if (activities.length === 0) {
    activities = await prisma.userActivity.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }

  const genreWeights = new Map<string, number>();
  const mediaIds: number[] = [];
  const searchQueries: string[] = [];
  const actionCounts = new Map<string, number>();

  for (const a of activities) {
    const age = Date.now() - a.createdAt.getTime();
    const daysOld = age / (1000 * 60 * 60 * 24);
    const decay = Math.max(0.1, 1 - daysOld / 30);

    const actionWeight: Record<string, number> = {
      view_anime: 3,
      add_to_list: 5,
      click_recommendation: 4,
      search: 2,
      view_filler: 2,
      view_watch_order: 2,
      view_genre: 2,
      view_character: 1.5,
      view_seasonal: 1,
      view_schedule: 1,
      view_manga: 2,
      view_recommendations: 1,
    };

    const weight = (actionWeight[a.action] || 1) * decay;

    for (const g of a.genres) {
      genreWeights.set(g, (genreWeights.get(g) || 0) + weight);
    }

    if (a.mediaId && !mediaIds.includes(a.mediaId)) {
      mediaIds.push(a.mediaId);
    }

    if (a.query) {
      searchQueries.push(a.query);
    }

    actionCounts.set(a.action, (actionCounts.get(a.action) || 0) + 1);
  }

  const topGenres = [...genreWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre, weight]) => ({ genre, weight }));

  const favoriteActions = [...actionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([action]) => action);

  return {
    topGenres,
    viewedMediaIds: mediaIds.slice(0, 100),
    searchQueries,
    favoriteActions,
    recentActivityCount: activities.length,
  };
}

function mediaToAIRec(media: Media, score: number, reason: string): AIRecommendation {
  return {
    id: media.id,
    title: bestTitle(media.title),
    score,
    reason,
    image: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || "",
    format: media.format || "",
    episodes: media.episodes || 0,
    genres: media.genres || [],
    matchTags: [],
  };
}

async function getGenreBasedAIRecs(profile: ActivityProfile): Promise<AIRecommendation[]> {
  if (profile.topGenres.length === 0) return [];

  const excludeSet = new Set(profile.viewedMediaIds);
  const seen = new Set<number>();
  const results: AIRecommendation[] = [];

  for (const { genre, weight } of profile.topGenres.slice(0, 4)) {
    try {
      const data = await searchMedia({ genre, sort: "POPULARITY_DESC", perPage: 25 });
      for (const media of data.media) {
        if (seen.has(media.id) || excludeSet.has(media.id)) continue;
        seen.add(media.id);

        const genreOverlap = media.genres?.filter((g) => profile.topGenres.some((tg) => tg.genre === g)).length || 0;
        const pop = media.popularity || 0;
        const score = Math.min(100, Math.round(
          (genreOverlap * 12) + (weight * 5) + (pop / 5000) * 20
        ));

        const sharedGenres = media.genres?.filter((g) => profile.topGenres.some((tg) => tg.genre === g)) || [];
        const reason = `Based on your interest in ${sharedGenres.slice(0, 2).join(", ")}`;

        results.push(mediaToAIRec(media, score, reason));
      }
    } catch {}
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 16);
}

async function getSearchBasedRecs(profile: ActivityProfile): Promise<AIRecommendation[]> {
  if (profile.searchQueries.length === 0) return [];

  const excludeSet = new Set(profile.viewedMediaIds);
  const seen = new Set<number>();
  const results: AIRecommendation[] = [];

  const uniqueQueries = [...new Set(profile.searchQueries)].slice(0, 5);

  for (const query of uniqueQueries) {
    try {
      const data = await searchMedia({ search: query, sort: "SCORE_DESC", perPage: 10 });
      for (const media of data.media) {
        if (seen.has(media.id) || excludeSet.has(media.id)) continue;
        seen.add(media.id);

        const score = Math.min(100, Math.round(60 + ((media.averageScore || 0) / 10) * 4));
        results.push(mediaToAIRec(media, score, `Related to your search "${query}"`));
      }
    } catch {}
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 8);
}

async function getSimilarToViewedRecs(profile: ActivityProfile): Promise<AIRecommendation[]> {
  if (profile.viewedMediaIds.length === 0) return [];

  const excludeSet = new Set(profile.viewedMediaIds);
  const seen = new Set<number>();
  const results: AIRecommendation[] = [];

  const recentIds = profile.viewedMediaIds.slice(0, 5);

  for (const mediaId of recentIds) {
    try {
      const detail = await getAnimeDetailFull(mediaId) as unknown as Media;
      if (!detail) continue;

      const genres = detail.genres || [];
      for (const genre of genres.slice(0, 2)) {
        const similar = await searchMedia({ genre, sort: "POPULARITY_DESC", perPage: 10 });
        for (const media of similar.media) {
          if (seen.has(media.id) || excludeSet.has(media.id)) continue;
          seen.add(media.id);

          const genreOverlap = media.genres?.filter((g) => genres.includes(g)).length || 0;
          const score = Math.min(100, Math.round(50 + genreOverlap * 15 + ((media.popularity || 0) / 10000) * 20));

          results.push(mediaToAIRec(media, score, `Similar to ${bestTitle(detail.title)}`));
        }
      }
    } catch {}
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 12);
}

export async function getAIRecommendations(userId?: string): Promise<AIRecommendation[]> {
  const profile = await buildActivityProfile(userId);

  if (profile.recentActivityCount === 0) {
    const trending = await getTrending(20);
    return trending.map((m) =>
      mediaToAIRec(m, Math.min(100, Math.round(((m.trending || 0) / 2) + ((m.popularity || 0) / 5000))), "Trending now — start exploring!")
    );
  }

  const [genreRecs, searchRecs, similarRecs] = await Promise.all([
    getGenreBasedAIRecs(profile),
    getSearchBasedRecs(profile),
    getSimilarToViewedRecs(profile),
  ]);

  const allRecs = new Map<number, AIRecommendation>();

  for (const rec of genreRecs) {
    allRecs.set(rec.id, rec);
  }

  for (const rec of searchRecs) {
    const existing = allRecs.get(rec.id);
    if (existing) {
      existing.score = Math.min(100, existing.score + Math.round(rec.score * 0.3));
    } else {
      allRecs.set(rec.id, rec);
    }
  }

  for (const rec of similarRecs) {
    const existing = allRecs.get(rec.id);
    if (existing) {
      existing.score = Math.min(100, existing.score + Math.round(rec.score * 0.2));
    } else {
      allRecs.set(rec.id, rec);
    }
  }

  return [...allRecs.values()].sort((a, b) => b.score - a.score).slice(0, 24);
}

export async function getAIReasonForAnime(mediaId: number, userId?: string): Promise<string> {
  const profile = await buildActivityProfile(userId);

  if (profile.recentActivityCount === 0) return "Popular anime you might enjoy";

  const viewedGenres = new Map<string, number>();
  for (const { genre, weight } of profile.topGenres) {
    viewedGenres.set(genre, weight);
  }

  return profile.topGenres.length > 0
    ? `Recommended based on your interest in ${profile.topGenres.slice(0, 2).map((g) => g.genre).join(", ")}`
    : "Recommended based on your browsing activity";
}
