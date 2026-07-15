import { getAnimeDetailFull, getTrending, getPopular, getTopRated, getUpcoming, getMangaTrending, getMangaPopular, getMangaTopRated, searchMedia, searchAll, getCharacter, getStaffBasic, getStudio, getSeasonal, getAiringSchedule, getSchedulePaginated, getSpotlight, getGenres, bestTitle } from "@/lib/anilist";
import { getFillerForAnime } from "@/lib/filler";
import { getAllDubs } from "@/lib/dub-data";
import { prisma } from "@/lib/prisma";
import { getZyniScore, getBatchZyniScores } from "@/lib/zyniscore";
import { getCommunityTags, getTrendingTags } from "@/lib/community-tags";
import { getAwardsForYear } from "@/lib/zyni-awards";
import { getFigureCollection, getFigureStats } from "@/lib/figure-collection";

function mapAnime(anime: any) {
  if (!anime) return null;
  return {
    ...anime,
    characters: anime.characters?.edges?.slice(0, 25).map((c: any) => ({
      role: c.role,
      name: c.name,
      voiceActor: c.voiceActors?.[0] ? { id: c.voiceActors[0].id, name: c.voiceActors[0].name, languageV2: c.voiceActors[0].languageV2, image: c.voiceActors[0].image } : null,
      node: c.node,
    })),
    staff: anime.staff?.edges?.map((s: any) => ({ role: s.role, node: s.node })),
  };
}

function mapPageMedia(page: any) {
  if (!page) return { pageInfo: { hasNextPage: false, total: 0 }, media: [] };
  return {
    pageInfo: page.pageInfo || { hasNextPage: false, total: page.media?.length || 0 },
    media: (page.media || []).map(mapAnime),
  };
}

function formatScore(score: any, mediaId: string) {
  if (!score) return { mediaId, averageScore: null, bayesianScore: null, totalRatings: 0, distribution: [], verifiedWeight: 0 };
  const dist = score.distribution || [];
  const total = score.totalVotes || 0;
  const distribution = Array.from({ length: 10 }, (_, i) => {
    const count = dist[i] || 0;
    const pct = total > 0 ? (count / total) * 100 : 0;
    return { score: i + 1, count, percentage: Math.round(pct * 10) / 10 };
  });
  return {
    mediaId,
    averageScore: score.weightedScore || score.averageRating || null,
    bayesianScore: score.bayesianScore || null,
    totalRatings: total,
    distribution,
    verifiedWeight: 0,
  };
}

export const rootResolver = {
  anime: async ({ id }: { id: number }) => {
    const anime = await getAnimeDetailFull(id);
    if (!anime) return null;
    const title = bestTitle(anime.title);
    const filler = await getFillerForAnime(id, title);
    const [zyniScore, rawTags] = await Promise.all([
      getZyniScore(id).catch(() => null),
      prisma.communityTag.findMany({
        where: { mediaId: id, isApproved: true },
        include: { creator: { select: { username: true } } },
        orderBy: { score: "desc" },
      }).catch(() => []),
    ]);
    return {
      ...mapAnime(anime),
      filler: filler ? { total: filler.total, filler: filler.filler, fillerPercent: filler.fillerPercent, quickList: filler.quickList } : null,
      zyniScore: formatScore(zyniScore, String(id)),
      communityTags: rawTags.map((t) => ({
        id: t.id, tag: t.tag, category: null, upvotes: t.upvotes, downvotes: t.downvotes,
        score: t.score, userId: t.createdBy, username: t.creator?.username || null, createdAt: t.createdAt.toISOString(),
      })),
    };
  },

  animeTrending: async ({ page = 1, perPage = 18 }: { page?: number; perPage?: number }) => {
    const data = await getTrending(perPage);
    return mapPageMedia({ pageInfo: { hasNextPage: false, total: data.length }, media: data });
  },

  animePopular: async ({ page = 1, perPage = 18 }: { page?: number; perPage?: number }) => {
    const data = await getPopular(perPage);
    return mapPageMedia({ pageInfo: { hasNextPage: false, total: data.length }, media: data });
  },

  animeTopRated: async ({ page = 1, perPage = 12 }: { page?: number; perPage?: number }) => {
    const data = await getTopRated(perPage);
    return mapPageMedia({ pageInfo: { hasNextPage: false, total: data.length }, media: data });
  },

  animeUpcoming: async ({ page = 1, perPage = 12 }: { page?: number; perPage?: number }) => {
    const data = await getUpcoming(perPage);
    return mapPageMedia({ pageInfo: { hasNextPage: false, total: data.length }, media: data });
  },

  seasonalAnime: async ({ year, season, perPage = 30 }: { year?: number; season?: string; perPage?: number }) => {
    const data = await getSeasonal(year, season, perPage);
    return mapPageMedia(data);
  },

  mangaTrending: async ({ page = 1, perPage = 18 }: { page?: number; perPage?: number }) => {
    const data = await getMangaTrending(perPage);
    return mapPageMedia({ pageInfo: { hasNextPage: false, total: data.length }, media: data });
  },

  mangaPopular: async ({ page = 1, perPage = 18 }: { page?: number; perPage?: number }) => {
    const data = await getMangaPopular(perPage);
    return mapPageMedia({ pageInfo: { hasNextPage: false, total: data.length }, media: data });
  },

  mangaTopRated: async ({ page = 1, perPage = 12 }: { page?: number; perPage?: number }) => {
    const data = await getMangaTopRated(perPage);
    return mapPageMedia({ pageInfo: { hasNextPage: false, total: data.length }, media: data });
  },

  search: async ({ query, page = 1, perPage = 12 }: { query: string; page?: number; perPage?: number }) => {
    const data = await searchAll(query, page, perPage);
    return {
      pageInfo: { hasNextPage: false, total: (data.anime?.length || 0) + (data.manga?.length || 0) },
      anime: (data.anime || []).map(mapAnime),
      manga: (data.manga || []).map((m: any) => ({ ...m, characters: undefined, staff: undefined })),
    };
  },

  searchAnime: async ({ query, page = 1, perPage = 24 }: { query: string; page?: number; perPage?: number }) => {
    const data = await searchMedia({ search: query, type: "ANIME", page, perPage });
    return mapPageMedia(data);
  },

  searchManga: async ({ query, page = 1, perPage = 24 }: { query: string; page?: number; perPage?: number }) => {
    const data = await searchMedia({ search: query, type: "MANGA", page, perPage });
    return mapPageMedia(data);
  },

  character: async ({ id }: { id: number }) => getCharacter(id),
  staff: async ({ id }: { id: number }) => getStaffBasic(id),

  studio: async ({ id }: { id: number }) => {
    const data = await getStudio(id);
    return { ...data, media: (data.media?.nodes || []).map(mapAnime) };
  },

  schedule: async ({ hoursBack = 6, hoursAhead = 72 }: { hoursBack?: number; hoursAhead?: number }) => {
    const now = Math.floor(Date.now() / 1000);
    const data = await getAiringSchedule(now - hoursBack * 3600, now + hoursAhead * 3600);
    return data.map((s: any) => ({
      mediaId: s.media.id,
      title: s.media.title.english || s.media.title.romaji,
      episode: s.episode,
      airingAt: s.airingAt,
      timeUntilAiring: s.timeUntilAiring || null,
      coverImage: s.media.coverImage?.large || null,
      format: s.media.format,
      genres: s.media.genres,
    }));
  },

  schedulePaginated: async ({ page = 1, perPage = 20 }: { page?: number; perPage?: number }) => {
    const data = await getSchedulePaginated(page, perPage);
    return mapPageMedia({ pageInfo: { hasNextPage: data.hasNextPage, total: data.total }, media: data.results });
  },

  filler: async ({ anilistId, title }: { anilistId: number; title?: string }) => {
    const data = await getFillerForAnime(anilistId, title);
    if (!data) return null;
    return { total: data.total, filler: data.filler, fillerPercent: data.fillerPercent, quickList: data.quickList };
  },

  dubStatus: async ({ malId }: { malId: number }) => {
    const dubData = await prisma.dubRequest.findMany({
      where: { mediaId: malId },
      select: { language: true, createdAt: true },
      distinct: ["language"],
    });
    return {
      malId,
      available: dubData.map((d) => d.language),
      totalDubRequests: dubData.length,
      lastUpdated: dubData.length > 0 ? dubData[dubData.length - 1].createdAt.toISOString() : null,
    };
  },

  dubSchedule: () => getAllDubs(),
  genres: () => getGenres(),

  trendingNow: async () => {
    const data = await getTrending(10);
    return data.map(mapAnime);
  },

  spotlights: async () => {
    const data = await getSpotlight();
    return data.map(mapAnime);
  },

  zyniScore: async ({ mediaId }: { mediaId: string }) => {
    const id = parseInt(mediaId, 10);
    if (isNaN(id)) return { mediaId, averageScore: null, bayesianScore: null, totalRatings: 0, distribution: [], verifiedWeight: 0 };
    const score = await getZyniScore(id).catch(() => null);
    return formatScore(score, mediaId);
  },

  zyniScoreBatch: async ({ mediaIds }: { mediaIds: string[] }) => {
    const numIds = mediaIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
    const scores = await getBatchZyniScores(numIds).catch(() => new Map());
    return mediaIds.map((id) => {
      const numId = parseInt(id, 10);
      const score = scores.get(numId);
      return formatScore(score || null, id);
    });
  },

  communityTags: async ({ mediaId, sort }: { mediaId: string; sort?: string }) => {
    const id = parseInt(mediaId, 10);
    if (isNaN(id)) return { tags: [], total: 0 };
    const tags = await prisma.communityTag.findMany({
      where: { mediaId: id, isApproved: true },
      include: { creator: { select: { username: true } } },
      orderBy: sort === "recent" ? { createdAt: "desc" } : { score: "desc" },
    }).catch(() => []);
    return {
      tags: tags.map((t) => ({
        id: t.id, tag: t.tag, category: null, upvotes: t.upvotes, downvotes: t.downvotes,
        score: t.score, userId: t.createdBy, username: t.creator?.username || null, createdAt: t.createdAt.toISOString(),
      })),
      total: tags.length,
    };
  },

  trendingTags: async ({ limit = 20 }: { limit?: number }) => {
    const tags = await getTrendingTags(limit).catch(() => []);
    return tags.map((t) => ({
      tag: t.tag,
      count: t.mediaCount,
      avgScore: t.totalScore,
      mediaCount: t.mediaCount,
    }));
  },

  activityReactions: async ({ activityId }: { activityId: string }) => {
    const reactions = await prisma.activityReaction.findMany({
      where: { activityId },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
    return reactions.map((r) => ({
      id: r.id,
      type: r.type,
      userId: r.userId,
      username: r.user?.username || null,
      createdAt: r.createdAt.toISOString(),
    }));
  },

  clubEvents: async ({ clubId, upcoming = true }: { clubId: string; upcoming?: boolean }) => {
    const where: any = { clubId };
    if (upcoming) where.startTime = { gte: new Date() };
    const events = await prisma.clubEvent.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: { _count: { select: { members: true } } },
    });
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime?.toISOString() || null,
      location: e.streamUrl || null,
      clubId: e.clubId,
      createdAt: e.createdAt.toISOString(),
      rsvpCount: e._count?.members || 0,
    }));
  },

  zyniAwards: async ({ year }: { year: number }) => {
    const awards = await getAwardsForYear(year).catch(() => []);
    if (awards.length === 0) return { year, status: "NOT_STARTED", categories: [], votingOpen: false, bracket: null };
    const status = awards[0]?.status || "nominating";
    return {
      year,
      status: status.toUpperCase(),
      categories: awards.map((a) => ({ id: a.category, name: a.categoryName, emoji: a.emoji })),
      votingOpen: status === "voting",
      bracket: null,
    };
  },

  zyniAwardsList: async () => {
    const years = await prisma.zyniAward.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });
    return years.map((y) => ({ year: y.year, status: "UNKNOWN", categories: [], votingOpen: false, bracket: null }));
  },

  figureCollection: async ({ userId }: { userId: string }) => {
    const figures = await getFigureCollection(userId).catch(() => []);
    return figures.map((f) => ({
      id: f.id,
      name: f.name,
      anime: f.anime,
      manufacturer: f.manufacturer,
      scale: f.scale,
      price: f.price,
      currency: f.currency,
      purchaseDate: f.purchaseDate?.toISOString() || null,
      image: f.image,
      condition: f.condition,
      isForSale: f.isForSale,
      createdAt: f.createdAt.toISOString(),
    }));
  },

  figureStats: async ({ userId }: { userId: string }) => {
    return getFigureStats(userId).catch(() => ({
      totalFigures: 0, totalValue: 0, currency: "INR", recentAdditions: 0,
      byAnime: [], byCondition: [], byManufacturer: [],
    }));
  },

  userProfile: async ({ username }: { username: string }) => {
    const user = await prisma.user.findFirst({
      where: { username },
      select: { id: true, username: true, avatar: true, bio: true, createdAt: true },
    });
    if (!user) return null;
    const [figures, stats] = await Promise.all([
      getFigureCollection(user.id).catch(() => []),
      getFigureStats(user.id).catch(() => ({ totalFigures: 0, totalValue: 0, currency: "INR", recentAdditions: 0, byAnime: [], byCondition: [], byManufacturer: [] })),
    ]);
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      figureCollection: figures.map((f) => ({
        id: f.id, name: f.name, anime: f.anime, manufacturer: f.manufacturer, scale: f.scale,
        price: f.price, currency: f.currency, purchaseDate: f.purchaseDate?.toISOString() || null,
        image: f.image, condition: f.condition, isForSale: f.isForSale, createdAt: f.createdAt.toISOString(),
      })),
      figureStats: stats,
    };
  },
};
