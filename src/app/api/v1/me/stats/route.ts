import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/api-key";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyApiKey(req);
  if (auth.error) return auth.error;
  if (!auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = auth.userId;

  const [animeEntries, mangaEntries, episodeProgress, activityCount] = await Promise.all([
    prisma.listEntry.findMany({
      where: { userId, type: { not: "MANGA" } },
      select: { status: true, score: true },
    }),
    prisma.mangaEntry.findMany({
      where: { userId },
      select: { status: true, chapters: true, score: true },
    }),
    prisma.episodeProgress.count({ where: { userId } }),
    prisma.activity.count({ where: { userId } }),
  ]);

  const groupBy = (arr: { status: string }[]) =>
    arr.reduce<Record<string, number>>((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});

  const rated = animeEntries.filter((e) => e.score != null);
  const avgScore = rated.length
    ? Math.round((rated.reduce((s, e) => s + (e.score as number), 0) / rated.length) * 10) / 10
    : null;

  const totalChaptersRead = mangaEntries.reduce((s, e) => s + (e.chapters || 0), 0);

  return NextResponse.json({
    anime: groupBy(animeEntries),
    manga: groupBy(mangaEntries),
    episodesLogged: episodeProgress,
    activityCount,
    ratedAnime: rated.length,
    averageScore: avgScore,
    chaptersRead: totalChaptersRead,
  });
}
