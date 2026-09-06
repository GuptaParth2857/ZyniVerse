import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user";
import { getMediaBatch, bestTitle, type MediaBasic } from "@/lib/anilist";

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ cards: [] });

  const rows = await prisma.listEntry.findMany({
    where: { userId, type: { not: "MANGA" } },
    select: {
      mediaId: true, type: true, status: true, progress: true, total: true, score: true,
      dropReason: true, updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const mediaMap = new Map<number, MediaBasic>();
  try {
    const batch = await getMediaBatch(rows.map((r) => r.mediaId));
    for (const m of batch) mediaMap.set(m.id, m);
  } catch {
    // AniList unavailable — cards still render with fallback titles.
  }

  const cards = rows.map((r) => {
    const m = mediaMap.get(r.mediaId);
    return {
      mediaId: r.mediaId,
      title: m ? bestTitle(m.title) : `Anime #${r.mediaId}`,
      cover: m?.coverImage?.large || m?.coverImage?.extraLarge || null,
      coverColor: m?.coverImage?.color || null,
      genres: m?.genres || [],
      episodes: (m?.episodes ?? r.total) || 0,
      status: r.status,
      progress: r.progress,
      score: r.score,
      dropReason: r.dropReason,
      updatedAt: r.updatedAt,
    };
  });

  return NextResponse.json({ cards });
}