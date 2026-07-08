import { prisma } from "./prisma";
import { getMediaBatch } from "./anilist";

export interface UserStats {
  totalAnime: number;
  totalEpisodes: number;
  totalDaysWatched: number;
  meanScore: number;
  completedCount: number;
  droppedCount: number;
  planningCount: number;
  watchingCount: number;
  genreBreakdown: { genre: string; count: number; percentage: number }[];
  formatBreakdown: { format: string; count: number; percentage: number }[];
  yearlyActivity: { year: number; completed: number; episodes: number }[];
  topStudios: { name: string; count: number }[];
  dayOfWeek: { day: string; episodes: number }[];
  longestStreak: number;
  currentStreak: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export async function getUserStats(userId: string): Promise<UserStats> {
  const [entries, progress] = await Promise.all([
    prisma.listEntry.findMany({ where: { userId } }),
    prisma.episodeProgress.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalAnime = entries.length;
  const completedCount = entries.filter((e) => e.status === "COMPLETED").length;
  const droppedCount = entries.filter((e) => e.status === "DROPPED").length;
  const planningCount = entries.filter((e) => e.status === "PLANNING").length;
  const watchingCount = entries.filter((e) => e.status === "CURRENT").length;

  const scored = entries.filter((e) => e.score != null);
  const meanScore = scored.length > 0
    ? Math.round((scored.reduce((s, e) => s + (e.score ?? 0), 0) / scored.length) * 10) / 10
    : 0;

  const activeEntries = entries.filter(
    (e) => e.status === "COMPLETED" || e.status === "CURRENT"
  );
  const totalEpisodes = activeEntries.reduce((s, e) => s + e.progress, 0);
  const totalDaysWatched = Math.round((totalEpisodes * 24) / 60 / 24 * 10) / 10;

  const mediaIds = [...new Set(entries.map((e) => e.mediaId))];
  let mediaMeta: { id: number; genres?: string[]; format?: string; studios?: { nodes: { id: number; name: string; isAnimationStudio?: boolean }[] } }[] = [];
  try {
    mediaMeta = await getMediaBatch(mediaIds) as any;
  } catch {
    // proceed without AniList data
  }

  const metaMap = new Map(mediaMeta.map((m) => [m.id, m]));

  const genreCounts = new Map<string, number>();
  const formatCounts = new Map<string, number>();
  const studioCounts = new Map<string, number>();

  for (const entry of entries) {
    const meta = metaMap.get(entry.mediaId);
    if (meta) {
      for (const g of meta.genres ?? []) {
        genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
      }
      if (meta.format) {
        formatCounts.set(meta.format, (formatCounts.get(meta.format) ?? 0) + 1);
      }
      for (const s of meta.studios?.nodes ?? []) {
        if (s.isAnimationStudio !== false) {
          studioCounts.set(s.name, (studioCounts.get(s.name) ?? 0) + 1);
        }
      }
    }
  }

  const totalWithGenre = entries.length || 1;
  const genreBreakdown = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: Math.round((count / totalWithGenre) * 100),
    }));

  const totalWithFormat = entries.length || 1;
  const formatBreakdown = [...formatCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([format, count]) => ({
      format,
      count,
      percentage: Math.round((count / totalWithFormat) * 100),
    }));

  const completedByYear = new Map<number, { completed: number; episodes: number }>();
  for (const entry of entries) {
    if (entry.status === "COMPLETED" && entry.completedAt) {
      const year = entry.completedAt.getFullYear();
      const prev = completedByYear.get(year) ?? { completed: 0, episodes: 0 };
      prev.completed += 1;
      prev.episodes += entry.progress;
      completedByYear.set(year, prev);
    }
  }
  const yearlyActivity = [...completedByYear.entries()]
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year);

  const topStudios = [...studioCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const dayCounts = new Map<string, number>();
  for (const p of progress) {
    const day = DAYS[p.createdAt.getDay()];
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const dayOfWeek = DAYS.map((day) => ({
    day,
    episodes: dayCounts.get(day) ?? 0,
  }));

  let longestStreak = 0;
  let currentStreak = 0;
  if (progress.length > 0) {
    const uniqueDays = new Set<string>();
    for (const p of progress) {
      uniqueDays.add(p.createdAt.toISOString().slice(0, 10));
    }
    const sortedDays = [...uniqueDays].sort();
    let streak = 1;
    longestStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        if (streak > longestStreak) longestStreak = streak;
      } else {
        streak = 1;
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const lastDay = sortedDays[sortedDays.length - 1];
    if (lastDay === today || lastDay === yesterday) {
      currentStreak = 1;
      for (let i = sortedDays.length - 2; i >= 0; i--) {
        const curr = new Date(sortedDays[i + 1]);
        const prev = new Date(sortedDays[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    totalAnime,
    totalEpisodes,
    totalDaysWatched,
    meanScore,
    completedCount,
    droppedCount,
    planningCount,
    watchingCount,
    genreBreakdown,
    formatBreakdown,
    yearlyActivity,
    topStudios,
    dayOfWeek,
    longestStreak,
    currentStreak,
  };
}
