import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMediaBatch, bestTitle } from "@/lib/anilist";
import { safeDecode } from "@/lib/url-params";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username: rawUsername } = await params;
  const username = safeDecode(rawUsername);

  const otherUser = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, avatar: true } });
  if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [myEntries, theirEntries] = await Promise.all([
    prisma.listEntry.findMany({ where: { userId: session.user.id }, select: { mediaId: true, status: true, score: true } }),
    prisma.listEntry.findMany({ where: { userId: otherUser.id }, select: { mediaId: true, status: true, score: true } }),
  ]);

  const myMap = new Map(myEntries.map((e) => [e.mediaId, e]));
  const theirMap = new Map(theirEntries.map((e) => [e.mediaId, e]));

  const shared = [...myMap.entries()].filter(([id]) => theirMap.has(id));
  const sharedData = shared.map(([id, my]) => ({ mediaId: id, myScore: my.score, theirScore: theirMap.get(id)!.score }));

  const onlyMe = myEntries.length - shared.length;
  const onlyThem = theirEntries.length - shared.length;

  const scored = sharedData.filter((d) => d.myScore && d.theirScore) as { mediaId: number; myScore: number; theirScore: number }[];

  let compatibility = 0;
  let averageDiff: number | null = null;
  if (scored.length > 0) {
    const avgDiff = scored.reduce((a, b) => a + Math.abs(b.myScore - b.theirScore), 0) / scored.length;
    averageDiff = Math.round(avgDiff * 10) / 10;
    compatibility = Math.round(Math.max(0, 100 - avgDiff * 2));
  }

  /* Taste insights + media resolution */
  let sharedMedia: Array<{
    mediaId: number; title: string; image: string | null; color: string | null;
    genres: string[]; format: string | null; status: string | null; episodes: number | null;
    myScore: number | null; theirScore: number | null; diff: number | null;
  }> = [];
  const insights: {
    whoRatesHigher: string | null;
    topGenres: { genre: string; count: number }[];
    highestShared: { title: string; myScore: number; theirScore: number } | null;
    lowestShared: { title: string; myScore: number; theirScore: number } | null;
    mostDivided: { title: string; diff: number } | null;
    averageDiff: number | null;
  } = {
    whoRatesHigher: null,
    topGenres: [],
    highestShared: null,
    lowestShared: null,
    mostDivided: null,
    averageDiff,
  };

  if (sharedData.length > 0) {
    try {
      const batch = await getMediaBatch(sharedData.map((d) => d.mediaId));
      const byId = new Map(batch.map((m) => [m.id, m]));
      sharedMedia = sharedData.map((d) => {
        const m = byId.get(d.mediaId);
        return {
          mediaId: d.mediaId,
          title: m ? bestTitle(m.title) : `Anime #${d.mediaId}`,
          image: m?.coverImage?.large || m?.coverImage?.medium || null,
          color: m?.coverImage?.color || null,
          genres: m?.genres || [],
          format: m?.format || null,
          status: m?.status || null,
          episodes: m?.episodes ?? null,
          myScore: d.myScore,
          theirScore: d.theirScore,
          diff: d.myScore && d.theirScore ? Math.abs(d.myScore - d.theirScore) : null,
        };
      });
    } catch {
      sharedMedia = sharedData.map((d) => ({
        mediaId: d.mediaId, title: `Anime #${d.mediaId}`, image: null, color: null,
        genres: [], format: null, status: null, episodes: null,
        myScore: d.myScore, theirScore: d.theirScore,
        diff: d.myScore && d.theirScore ? Math.abs(d.myScore - d.theirScore) : null,
      }));
    }

    if (scored.length > 0) {
      const myMean = scored.reduce((a, b) => a + b.myScore, 0) / scored.length;
      const theirMean = scored.reduce((a, b) => a + b.theirScore, 0) / scored.length;
      const gap = Math.round(Math.abs(myMean - theirMean) * 10) / 10;
      insights.whoRatesHigher =
        gap < 0.5
          ? "You rate shared anime almost identically"
          : myMean > theirMean
            ? `You rate ${gap} points higher on average`
            : `${otherUser.username} rates ${gap} points higher on average`;

      const combined = scored.map((d) => ({
        ...d,
        title: sharedMedia.find((s) => s.mediaId === d.mediaId)?.title || `Anime #${d.mediaId}`,
      }));
      insights.highestShared = combined.reduce((a, b) => (a.myScore + a.theirScore >= b.myScore + b.theirScore ? a : b));
      insights.lowestShared = combined.reduce((a, b) => (a.myScore + a.theirScore <= b.myScore + b.theirScore ? a : b));
      insights.mostDivided = combined
        .map((d) => ({ title: d.title, diff: Math.abs(d.myScore - d.theirScore) }))
        .reduce((a, b) => (a.diff >= b.diff ? a : b));
    }

    const genreTally = new Map<string, number>();
    for (const s of sharedMedia) for (const g of s.genres) genreTally.set(g, (genreTally.get(g) || 0) + 1);
    insights.topGenres = [...genreTally.entries()]
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  return NextResponse.json({
    user: otherUser,
    stats: {
      myTotal: myEntries.length,
      theirTotal: theirEntries.length,
      shared: shared.length,
      onlyMe, onlyThem,
      compatibility,
      genresInCommon: insights.topGenres.length,
    },
    insights,
    sharedMedia,
  });
}
