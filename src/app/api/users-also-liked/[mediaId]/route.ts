import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMediaBatch } from "@/lib/anilist";
import { logError } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  try {
    const usersWithMedia = await prisma.listEntry.findMany({
      where: { mediaId: id, status: "COMPLETED" },
      select: { userId: true },
      take: 100,
    });

    if (usersWithMedia.length === 0) return NextResponse.json({ recommendations: [] });

    const userIds = usersWithMedia.map((u) => u.userId);

    const otherEntries = await prisma.listEntry.findMany({
      where: { userId: { in: userIds }, mediaId: { not: id }, status: "COMPLETED" },
      select: { mediaId: true, score: true },
      take: 500,
    });

    const freq: Record<number, { count: number; totalScore: number }> = {};
    for (const e of otherEntries) {
      if (!freq[e.mediaId]) freq[e.mediaId] = { count: 0, totalScore: 0 };
      freq[e.mediaId].count++;
      freq[e.mediaId].totalScore += e.score || 0;
    }

    const sorted = Object.entries(freq)
      .map(([mediaIdStr, v]) => ({ mediaId: parseInt(mediaIdStr), ...v, avgScore: v.count > 0 ? Math.round((v.totalScore / v.count) * 10) / 10 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const mediaIds = sorted.map((r) => r.mediaId);
    const anilistData: Record<number, { title: string; coverImage: string }> = {};
    try {
      const batch = await getMediaBatch(mediaIds);
      for (const m of batch) {
        const title = m.title?.romaji || m.title?.english || m.title?.native || "";
        const coverImage = m.coverImage?.large || m.coverImage?.medium || "";
        anilistData[m.id] = { title, coverImage };
      }
    } catch (e) { logError(e); }

    const enriched = sorted.map((r) => ({
      ...r,
      title: anilistData[r.mediaId]?.title || "",
      coverImage: anilistData[r.mediaId]?.coverImage || "",
    }));

    return NextResponse.json({ recommendations: enriched });
  } catch {
    return NextResponse.json({ recommendations: [] });
  }
}
