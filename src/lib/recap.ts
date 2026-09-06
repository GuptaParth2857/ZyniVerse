import { prisma } from "@/lib/prisma";
import { getMediaBatch, bestTitle } from "@/lib/anilist";

export interface RecapMediaItem {
  mediaId: number;
  title: string;
  cover: string | null;
  count: number;
}

export interface YearRecap {
  year: number;
  totalAnimeWatched: number;
  totalEpisodes: number;
  hoursWatched: number;
  daysWatched: number;
  avgEpisodesPerDay: number;
  completions: number;
  mostWatched: RecapMediaItem[];
  favourites: RecapMediaItem[];
  monthlyEpisodes: { month: string; episodes: number }[];
  description: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getUserYearRecap(userId: string, year: number): Promise<YearRecap> {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const progress = await prisma.episodeProgress.findMany({
    where: { userId, watchedAt: { gte: start, lt: end } },
    select: { mediaId: true, watchedAt: true },
  });

  const completions = await prisma.listEntry.count({
    where: { userId, status: "COMPLETED", completedAt: { gte: start, lt: end } },
  });

  const totalEpisodes = progress.length;
  const totalAnimeWatched = new Set(progress.map((p) => p.mediaId)).size;
  const hoursWatched = Math.round((totalEpisodes * 24) / 60 * 10) / 10;
  const daysWatched = Math.round((totalEpisodes * 24) / 60 / 24 * 10) / 10;

  const perMedia = new Map<number, number>();
  const perMonth = new Map<number, number>();
  let distinctDays = 0;
  const daySet = new Set<string>();
  for (const p of progress) {
    perMedia.set(p.mediaId, (perMedia.get(p.mediaId) || 0) + 1);
    perMonth.set(p.watchedAt.getMonth(), (perMonth.get(p.watchedAt.getMonth()) || 0) + 1);
    daySet.add(p.watchedAt.toISOString().slice(0, 10));
  }
  distinctDays = daySet.size;

  const elapsedDays = year === new Date().getFullYear() ? Math.max(1, distinctDays) : 365;
  const avgEpisodesPerDay = Math.round(((totalEpisodes / elapsedDays) * 100)) / 100;

  const mostWatchedIds = [...perMedia.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const topEntries = await prisma.listEntry.findMany({
    where: { userId, status: "COMPLETED", completedAt: { gte: start, lt: end }, score: { not: null } },
    orderBy: { score: "desc" },
    take: 3,
    select: { mediaId: true, score: true },
  });

  const allIds = [...mostWatchedIds.map(([id]) => id), ...topEntries.map((e) => e.mediaId)];
  const uniqueIds = [...new Set(allIds)];

  let mediaMap = new Map<number, { title: string; cover: string | null }>();
  if (uniqueIds.length) {
    try {
      const batch = await getMediaBatch(uniqueIds);
      mediaMap = new Map(
        batch.map((m) => [
          m.id,
          {
            title: bestTitle(m.title),
            cover: m.coverImage?.large || m.coverImage?.medium || null,
          },
        ])
      );
    } catch { /* keep empty */ }
  }

  const mostWatched: RecapMediaItem[] = mostWatchedIds.map(([mediaId, count]) => ({
    mediaId,
    count,
    title: mediaMap.get(mediaId)?.title || `Anime #${mediaId}`,
    cover: mediaMap.get(mediaId)?.cover || null,
  }));

  const favourites: RecapMediaItem[] = topEntries.map((e) => ({
    mediaId: e.mediaId,
    count: e.score || 0,
    title: mediaMap.get(e.mediaId)?.title || `Anime #${e.mediaId}`,
    cover: mediaMap.get(e.mediaId)?.cover || null,
  }));

  const monthlyEpisodes = MONTHS.map((month, i) => ({ month, episodes: perMonth.get(i) || 0 }));

  const description = buildDescription({ year, totalAnimeWatched, totalEpisodes, hoursWatched, completions, favourite: favourites[0]?.title, watched: mostWatched[0]?.title });

  return {
    year,
    totalAnimeWatched,
    totalEpisodes,
    hoursWatched,
    daysWatched,
    avgEpisodesPerDay,
    completions,
    mostWatched,
    favourites,
    monthlyEpisodes,
    description,
  };
}

function buildDescription(args: {
  year: number; totalAnimeWatched: number; totalEpisodes: number; hoursWatched: number;
  completions: number; favourite?: string; watched?: string;
}): string {
  const { year, totalAnimeWatched, totalEpisodes, hoursWatched, completions, favourite, watched } = args;
  if (totalEpisodes === 0) {
    return `${year} mein abhi tak kuch nahi dekha — watchlist shuru karo aur apna bacchaa recap banao! 📺`;
  }
  return `${year} mein ${totalAnimeWatched} anime, ${totalEpisodes} episodes dekhe — approx ${hoursWatched} hours. ${completions} complete kiye. ${
    favourite ? `Sabse pasand was ${favourite}.` : ""
  }${watched ? ` Sabse zyada dekha ${watched}.` : ""} Next year bhi aise hi banger! 🔥`;
}
