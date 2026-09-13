import { prisma } from "@/lib/prisma";
import { getMediaBatch, bestTitle } from "@/lib/anilist";
import { logError } from "@/lib/logger";

export interface TheoryLeaderboardEntry {
  mediaId: number;
  title: string;
  cover: string;
  agree: number;
  refute: number;
  total: number;
}

let leaderboardCache: { key: string; at: number; data: TheoryLeaderboardEntry[] } | null = null;
const LEADERBOARD_CACHE_TTL = 60 * 1000;

export async function getTheoryLeaderboard(period: "all" | "week" = "all", take = 25): Promise<TheoryLeaderboardEntry[]> {
  const key = `${period}-${take}`;
  if (leaderboardCache && leaderboardCache.key === key && Date.now() - leaderboardCache.at < LEADERBOARD_CACHE_TTL) {
    return leaderboardCache.data;
  }

  const where = period === "week" ? { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } : undefined;

  let rows: { mediaId: number; agree: boolean; _count: { mediaId: number } }[];
  try {
    rows = (await prisma.theoryVote.groupBy({
      by: ["mediaId", "agree"],
      where,
      _count: { mediaId: true },
      orderBy: { _count: { mediaId: "desc" } },
      take: 200,
    })) as unknown as { mediaId: number; agree: boolean; _count: { mediaId: number } }[];
  } catch (e) {
    logError(e);
    return [];
  }

  const perMedia = new Map<number, { agree: number; refute: number }>();
  for (const row of rows) {
    const entry = perMedia.get(row.mediaId) || { agree: 0, refute: 0 };
    if (row.agree) entry.agree += row._count.mediaId;
    else entry.refute += row._count.mediaId;
    perMedia.set(row.mediaId, entry);
  }

  const ranked = [...perMedia.entries()]
    .map(([mediaId, v]) => ({ mediaId, ...v, total: v.agree + v.refute }))
    .sort((a, b) => b.total - a.total || (b.agree - b.refute) - (a.agree - a.refute))
    .slice(0, take);

  const titles = new Map<number, { title: string; cover: string }>();
  const ids = ranked.map((r) => r.mediaId);
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    try {
      const media = await getMediaBatch(batch);
      for (const m of media) {
        titles.set(m.id, { title: bestTitle(m.title), cover: m.coverImage?.large || m.coverImage?.extraLarge || "" });
      }
    } catch (e) {
      logError(e);
    }
  }

  const data: TheoryLeaderboardEntry[] = ranked.map((r) => ({
    mediaId: r.mediaId,
    title: titles.get(r.mediaId)?.title || `Anime #${r.mediaId}`,
    cover: titles.get(r.mediaId)?.cover || "",
    agree: r.agree,
    refute: r.refute,
    total: r.total,
  }));

  leaderboardCache = { key, at: Date.now(), data };
  return data;
}