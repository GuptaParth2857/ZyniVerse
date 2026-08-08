import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMediaBatch, bestTitle } from "@/lib/anilist";

export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get("tag");
  if (!tag) {
    return NextResponse.json({ error: "tag query param required" }, { status: 400 });
  }

  const normalized = tag.trim().toLowerCase();
  if (normalized.length < 2 || normalized.length > 30) {
    return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
  }

  const rows = await prisma.communityTag.findMany({
    where: { tag: normalized, isApproved: true },
    orderBy: { score: "desc" },
    select: { mediaId: true, score: true, upvotes: true, downvotes: true },
  });

  const mediaIds = [...new Set(rows.map((r) => r.mediaId))];

  let media: { id: number; title: string; image: string | null; score: number }[] = [];
  if (mediaIds.length > 0) {
    const batch = await getMediaBatch(mediaIds);
    const scoreByMedia = new Map<number, number>();
    for (const r of rows) {
      scoreByMedia.set(r.mediaId, (scoreByMedia.get(r.mediaId) || 0) + r.score);
    }
    media = batch.map((m) => ({
      id: m.id,
      title: bestTitle(m.title),
      image: m.coverImage?.large || m.coverImage?.medium || null,
      score: scoreByMedia.get(m.id) || 0,
    }));
    media.sort((a, b) => b.score - a.score);
  }

  return NextResponse.json({ tag: normalized, count: media.length, media });
}
