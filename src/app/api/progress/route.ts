import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ episodes: [] });

  const { searchParams } = new URL(req.url);
  const mediaId = Number(searchParams.get("mediaId"));
  if (!mediaId) return NextResponse.json({ episodes: [] });

  const episodes = await prisma.episodeProgress.findMany({
    where: { userId: session.user.id, mediaId },
    select: { episode: true },
    orderBy: { episode: "asc" },
  });
  return NextResponse.json({ episodes: episodes.map((e) => e.episode) });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, episode, type, total, action } = await req.json();
  if (!mediaId || episode == null) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  if (action === "add") {
    const existing = await prisma.episodeProgress.findUnique({
      where: { userId_mediaId_episode: { userId: session.user.id, mediaId, episode } },
    });
    if (!existing) {
      await prisma.episodeProgress.create({
        data: { userId: session.user.id, mediaId, episode },
      });
      await prisma.listEntry.upsert({
        where: { userId_mediaId: { userId: session.user.id, mediaId } },
        update: { progress: { increment: 1 }, total, status: "CURRENT" },
        create: { userId: session.user.id, mediaId, type: type || "ANIME", status: "CURRENT", progress: 1, total: total || 0 },
      });
    }
  } else if (action === "remove") {
    await prisma.episodeProgress.deleteMany({
      where: { userId: session.user.id, mediaId, episode },
    });
    const watched = await prisma.episodeProgress.count({ where: { userId: session.user.id, mediaId } });
    await prisma.listEntry.updateMany({
      where: { userId: session.user.id, mediaId },
      data: { progress: watched },
    });
  }
  return NextResponse.json({ ok: true });
}
