import { prisma } from "@/lib/prisma";
import { withPublicCache } from "@/lib/api-cache";
import { NextResponse } from "next/server";
import { getMediaBatch } from "@/lib/anilist";
export const dynamic = "force-dynamic";


async function GET_inner(request: Request) {
  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 7, 1), 30);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 6, 1), 20);

  const since = new Date(Date.now() - days * 86400000);

  type Row = { mediaId: number; episode: number; reactionCount: number };

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT "mediaId" AS "mediaId", "episode" AS "episode", COUNT(*)::int AS "reactionCount"
    FROM "EpisodeReaction"
    WHERE "createdAt" >= ${since}
    GROUP BY "mediaId", "episode"
    ORDER BY "reactionCount" DESC
    LIMIT ${limit}
  `;

  const hot = rows.map((r) => ({
    mediaId: Number(r.mediaId),
    episode: Number(r.episode),
    reactionCount: Number(r.reactionCount),
  }));

  const titles: Record<number, { title: string; coverImage: string }> = {};
  if (hot.length > 0) {
    try {
      const media = await getMediaBatch(hot.map((h) => h.mediaId));
      for (const m of media) {
        titles[m.id] = {
          title: m.title?.romaji || m.title?.english || m.title?.native || `Anime #${m.id}`,
          coverImage: m.coverImage?.large || m.coverImage?.medium || "",
        };
      }
    } catch {
      // fall back to placeholder titles below
    }
  }

  return NextResponse.json({ hot, titles, since });
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
