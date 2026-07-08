import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const entries = await prisma.listEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const progress = await prisma.episodeProgress.findMany({
    where: { userId },
    orderBy: { watchedAt: "desc" },
  });

  const totalAnime = entries.length;
  const completed = entries.filter((e) => e.status === "COMPLETED").length;
  const totalEpisodes = entries.reduce((s, e) => s + (e.progress || 0), 0);
  const totalDays = entries.reduce((s, e) => {
    if (!e.startedAt || !e.completedAt) return s;
    return s + Math.max(1, Math.ceil((e.completedAt.getTime() - e.startedAt.getTime()) / 86400000));
  }, 0);

  const hoursWatched = Math.round(totalEpisodes * 0.42 * 10) / 10;
  const avgEpisodesPerDay = totalDays > 0 ? Math.round((totalEpisodes / totalDays) * 10) / 10 : 0;

  const genreBreakdown: Record<string, number> = {};
  const formatBreakdown: Record<string, number> = {};
  const statusBreakdown: Record<string, number> = {};

  for (const e of entries) {
    statusBreakdown[e.status] = (statusBreakdown[e.status] || 0) + 1;
  }

  const scoreDist = Array.from({ length: 10 }, (_, i) => ({ score: (i + 1) * 10, count: 0 }));
  for (const e of entries) {
    if (e.score) {
      const bucket = Math.min(9, Math.floor(e.score / 10));
      scoreDist[bucket].count++;
    }
  }

  const yearlyActivity: Record<number, number> = {};
  for (const p of progress) {
    const year = new Date(p.watchedAt).getFullYear();
    yearlyActivity[year] = (yearlyActivity[year] || 0) + 1;
  }

  const now = new Date();
  const streakStart = new Date(now);
  streakStart.setDate(streakStart.getDate() - 90);
  const recentProgress = progress.filter((p) => new Date(p.watchedAt) >= streakStart);
  const dayMap: Record<string, number> = {};
  for (const p of recentProgress) {
    const d = new Date(p.watchedAt).toISOString().slice(0, 10);
    dayMap[d] = (dayMap[d] || 0) + 1;
  }
  let currentStreak = 0;
  const check = new Date(now);
  while (true) {
    const key = check.toISOString().slice(0, 10);
    if (dayMap[key]) { currentStreak++; check.setDate(check.getDate() - 1); }
    else break;
  }

  return NextResponse.json({
    totalAnime, completed, totalEpisodes, hoursWatched, avgEpisodesPerDay,
    currentStreak, totalDays,
    genreBreakdown, formatBreakdown, statusBreakdown,
    scoreDistribution: scoreDist,
    yearlyActivity: Object.entries(yearlyActivity).map(([year, count]) => ({ year: parseInt(year), count })),
  });
}
