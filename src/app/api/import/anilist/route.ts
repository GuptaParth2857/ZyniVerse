import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { getAnimeListFromAniList } from "@/lib/anilist";
const STATUS_MAP: Record<string, string> = {
  CURRENT: "CURRENT",
  COMPLETED: "COMPLETED",
  PLANNING: "PLANNING",
  DROPPED: "DROPPED",
  PAUSED: "PAUSED",
  REPEATING: "REWATCHING",
};

function toDate(date: { year?: number; month?: number; day?: number } | null): Date | undefined {
  if (!date?.year) return undefined;
  return new Date(date.year, (date.month || 1) - 1, date.day || 1);
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await req.json();
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  let entries;
  try {
    entries = await getAnimeListFromAniList(username);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch from AniList" }, { status: 502 });
  }

  if (entries.length === 0) {
    return NextResponse.json({ imported: 0, message: "No anime entries found for this user." });
  }

  const userId = session.user.id;
  let imported = 0;

  for (const entry of entries) {
    const mappedStatus = STATUS_MAP[entry.status];
    if (!mappedStatus) continue;

    const startedAt = toDate(entry.startedAt);
    const completedAt = toDate(entry.completedAt);

    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId, mediaId: entry.mediaId } },
      update: {
        status: mappedStatus,
        progress: entry.progress || 0,
        total: entry.media?.episodes || 0,
        score: entry.score > 0 ? entry.score : undefined,
        startedAt: startedAt ?? undefined,
        completedAt: completedAt ?? undefined,
        type: "ANIME",
      },
      create: {
        userId,
        mediaId: entry.mediaId,
        type: "ANIME",
        status: mappedStatus,
        progress: entry.progress || 0,
        total: entry.media?.episodes || 0,
        score: entry.score > 0 ? entry.score : undefined,
        startedAt: startedAt ?? undefined,
        completedAt: completedAt ?? undefined,
      },
    });
    imported++;
  }

  return NextResponse.json({ imported, total: entries.length });
}
