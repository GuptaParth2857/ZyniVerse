import { getAnimeDetailFull, getMangaDetailFull, getTrending, getPopular, getTopRated, getUpcoming, getMangaTrending, getMangaPopular, getMangaTopRated, searchMedia, searchAll, getCharacter, getStaffBasic, getStudio, getSeasonal, getAiringSchedule, getSchedulePaginated, getSpotlight, getGenres, bestTitle } from "@/lib/anilist";
import { getFillerForAnime } from "@/lib/filler";
import { getAllDubs } from "@/lib/dub-data";
import { prisma } from "@/lib/prisma";

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

export const rootResolver = {
  anime: async ({ id }: { id: number }) => {
    const anime = await getAnimeDetailFull(id);
    const title = bestTitle(anime.title);
    const filler = await getFillerForAnime(id, title);
    return { ...mapAnime(anime), filler: filler ? { total: filler.total, filler: filler.filler, fillerPercent: filler.fillerPercent, quickList: filler.quickList } : null };
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

  character: async ({ id }: { id: number }) => {
    const data = await getCharacter(id);
    return data;
  },

  staff: async ({ id }: { id: number }) => {
    const data = await getStaffBasic(id);
    return data;
  },

  studio: async ({ id }: { id: number }) => {
    const data = await getStudio(id);
    return {
      ...data,
      media: (data.media?.nodes || []).map(mapAnime),
    };
  },

  schedule: async ({ hoursBack = 6, hoursAhead = 72 }: { hoursBack?: number; hoursAhead?: number }) => {
    const now = Math.floor(Date.now() / 1000);
    const data = await getAiringSchedule(now - hoursBack * 3600, now + hoursAhead * 3600);
    return data.map((s: any) => ({
      mediaId: s.media.id,
      title: s.media.title.english || s.media.title.romaji,
      episode: s.episode,
      airingAt: s.airingAt,
      timeUntilAiring: s.timeUntilAiring || (s as any).timeUntilAiring,
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
      available: dubData.map((d: any) => d.language),
      totalDubRequests: dubData.length,
      lastUpdated: dubData.length > 0 ? dubData[dubData.length - 1].createdAt.toISOString() : null,
    };
  },

  dubSchedule: async () => {
    return getAllDubs();
  },

  genres: async () => {
    return getGenres();
  },

  trendingNow: async () => {
    const data = await getTrending(10);
    return data.map(mapAnime);
  },

  spotlights: async () => {
    const data = await getSpotlight();
    return data.map(mapAnime);
  },
};
