import { searchMedia, getAnimeDetailFull, type Media } from "./anilist";
import { UPCOMING_TITLE_CONFIGS, type UpcomingTitleConfig } from "./live-action-config";
import { prisma } from "./prisma";

export interface LiveActionUpdate {
  id: string;
  anilistId: number;
  title: string;
  status: string;
  episodes?: number;
  startDate?: { year: number; month: number; day: number };
  endDate?: { year: number; month: number; day: number };
  posterUrl?: string;
  averageScore?: number;
  genres?: string[];
  updatedAt: string;
}

export interface LiveActionUpdateCache {
  version: number;
  lastUpdated: string;
  updates: Record<string, LiveActionUpdate>;
}

const CACHE_KEY = "live-action-updates";

const DEFAULT_CACHE: LiveActionUpdateCache = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  updates: {},
};

function scoreMatch(media: Media, config: UpcomingTitleConfig): number {
  let score = 0;
  const titles = [media.title.english, media.title.romaji, media.title.userPreferred, media.title.native].filter(Boolean).map(t => t!.toLowerCase());
  const queryLower = config.searchQuery.toLowerCase();

  for (const title of titles) {
    if (title === queryLower) score += 100;
    else if (title.includes(queryLower)) score += 50;
    else if (queryLower.includes(title)) score += 30;
  }

  if (config.format && media.format === config.format) score += 20;
  if (media.popularity) score += Math.min(media.popularity / 1000, 10);

  return score;
}

function findBestMatch(results: Media[], config: UpcomingTitleConfig): Media | null {
  if (results.length === 0) return null;

  const scored = results.map(m => ({ media: m, score: scoreMatch(m, config) }));
  scored.sort((a, b) => b.score - a.score);

  if (scored[0].score < 20) return null;
  return scored[0].media;
}

function mediaToUpdate(media: Media, id: string): LiveActionUpdate {
  return {
    id,
    anilistId: media.id,
    title: media.title.english || media.title.romaji || media.title.userPreferred || "Unknown",
    status: media.status || "NOT_YET_RELEASED",
    episodes: media.episodes || undefined,
    startDate: media.startDate?.year ? {
      year: media.startDate.year,
      month: media.startDate.month || 1,
      day: media.startDate.day || 1,
    } : undefined,
    endDate: media.endDate?.year ? {
      year: media.endDate.year,
      month: media.endDate.month || 1,
      day: media.endDate.day || 1,
    } : undefined,
    posterUrl: media.coverImage?.large || media.coverImage?.extraLarge || undefined,
    averageScore: media.averageScore || undefined,
    genres: media.genres || undefined,
    updatedAt: new Date().toISOString(),
  };
}

async function searchForTitle(config: UpcomingTitleConfig): Promise<Media | null> {
  try {
    const queries = [config.searchQuery, ...(config.alternativeQueries || [])];

    for (const query of queries) {
      const result = await searchMedia({
        search: query,
        type: "ANIME",
        perPage: 10,
        sort: "POPULARITY_DESC",
      });

      const match = findBestMatch(result.media, config);
      if (match) return match;

      if (config.format) {
        const filteredResult = await searchMedia({
          search: query,
          type: "ANIME",
          format: config.format,
          perPage: 10,
          sort: "POPULARITY_DESC",
        });
        const filteredMatch = findBestMatch(filteredResult.media, config);
        if (filteredMatch) return filteredMatch;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error searching for ${config.id}:`, error);
    return null;
  }
}

export async function fetchLiveActionUpdates(): Promise<LiveActionUpdateCache> {
  const existingCache = await getLiveActionUpdateCache();
  const updates: Record<string, LiveActionUpdate> = { ...existingCache.updates };

  console.log(`[live-action-updater] Starting update for ${UPCOMING_TITLE_CONFIGS.length} titles...`);

  for (const config of UPCOMING_TITLE_CONFIGS) {
    try {
      const existingUpdate = updates[config.id];

      if (existingUpdate?.anilistId) {
        try {
          const detail = await getAnimeDetailFull(existingUpdate.anilistId);
          updates[config.id] = mediaToUpdate(detail, config.id);
          console.log(`[live-action-updater] Updated ${config.id} via direct lookup (AniList ID: ${existingUpdate.anilistId})`);
          continue;
        } catch {
          console.log(`[live-action-updater] Direct lookup failed for ${config.id}, falling back to search`);
        }
      }

      const media = await searchForTitle(config);
      if (media) {
        updates[config.id] = mediaToUpdate(media, config.id);
        console.log(`[live-action-updater] Found ${config.id}: "${media.title.english || media.title.romaji}" (AniList ID: ${media.id})`);
      } else {
        console.log(`[live-action-updater] No match found for ${config.id}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`[live-action-updater] Error processing ${config.id}:`, error);
    }
  }

  const cache: LiveActionUpdateCache = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    updates,
  };

  await saveCache(cache);
  console.log(`[live-action-updater] Update complete. ${Object.keys(updates).length} titles in cache.`);

  return cache;
}

export async function getLiveActionUpdateCache(): Promise<LiveActionUpdateCache> {
  try {
    const row = await prisma.epgCache.findFirst({
      where: { channelId: CACHE_KEY },
    });

    if (!row) return DEFAULT_CACHE;

    const cache = row.data as unknown as LiveActionUpdateCache;

    if (cache.version !== 1) {
      console.warn("[live-action-updater] Cache version mismatch, resetting");
      return DEFAULT_CACHE;
    }

    return cache;
  } catch (error) {
    console.error("[live-action-updater] Error reading cache:", error);
    return DEFAULT_CACHE;
  }
}

async function saveCache(cache: LiveActionUpdateCache): Promise<void> {
  try {
    await prisma.epgCache.upsert({
      where: { channelId: CACHE_KEY },
      update: { data: JSON.parse(JSON.stringify(cache)) },
      create: { channelId: CACHE_KEY, data: JSON.parse(JSON.stringify(cache)) },
    });
  } catch (error) {
    console.error("[live-action-updater] Error saving cache:", error);
  }
}
