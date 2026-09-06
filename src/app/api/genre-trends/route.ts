import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMediaBatch } from "@/lib/anilist";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.listEntry.findMany({
    where: { userId: session.user.id },
    select: { mediaId: true, status: true, completedAt: true },
  });

  const completed = entries.filter((e) => e.status === "COMPLETED" && e.completedAt);
  if (completed.length === 0) return NextResponse.json({ trends: [], genres: [] });

  const mediaMap = new Map<number, string[]>();
  try {
    const batch = await getMediaBatch(completed.map((e) => e.mediaId));
    for (const m of batch) mediaMap.set(m.id, m.genres || []);
  } catch {
    // AniList unavailable — no genre data for now.
  }

  if (mediaMap.size === 0) return NextResponse.json({ trends: [], genres: [] });

  const yearCount = new Map<string, Map<string, number>>();
  for (const e of completed) {
    const genres = mediaMap.get(e.mediaId) || [];
    if (genres.length === 0) continue;
    const year = (e.completedAt as Date).getFullYear();
    if (!yearCount.has(year.toString())) yearCount.set(year.toString(), new Map());
    const inner = yearCount.get(year.toString())!;
    for (const g of genres) inner.set(g, (inner.get(g) || 0) + 1);
  }

  const years = [...yearCount.keys()].sort();
  const genreTotals = new Map<string, number>();
  for (const inner of yearCount.values()) {
    for (const [g, n] of inner) genreTotals.set(g, (genreTotals.get(g) || 0) + n);
  }
  const genres = [...genreTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([g]) => g);

  const trends = years.map((year) => {
    const row: Record<string, number> = {};
    const inner = yearCount.get(year)!;
    for (const g of genres) row[g] = inner.get(g) || 0;
    return { year: parseInt(year), ...row };
  });

  return NextResponse.json({ trends, genres });
}