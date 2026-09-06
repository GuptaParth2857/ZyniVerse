import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";

const REACTIONS = ["wow", "hype", "cry", "lol", "sleep"] as const;

export async function GET(request: Request, { params }: { params: Promise<{ mediaId: string; ep: string }> }) {
  const { mediaId, ep } = await params;
  const mediaIdNum = Number(mediaId);
  const epNum = Number(ep);
  if (!mediaIdNum || !epNum) return NextResponse.json({ error: "Invalid params" }, { status: 400 });

  const reactions = await prisma.episodeReaction.findMany({
    where: { mediaId: mediaIdNum, episode: epNum },
    select: { reaction: true },
  });

  const counts: Record<string, number> = {};
  for (const r of reactions) counts[r.reaction] = (counts[r.reaction] || 0) + 1;

  let mine: string | null = null;
  const userId = await resolveUserId();
  if (userId) {
    const mineRow = await prisma.episodeReaction.findUnique({
      where: { mediaId_episode_userId: { mediaId: mediaIdNum, episode: epNum, userId } },
    });
    mine = mineRow?.reaction ?? null;
  }

  const total = reactions.length;
  return NextResponse.json({ counts, mine, total });
}

export async function POST(request: Request, { params }: { params: Promise<{ mediaId: string; ep: string }> }) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, ep } = await params;
  const mediaIdNum = Number(mediaId);
  const epNum = Number(ep);
  const body = await request.json();
  const reaction = String(body.reaction || "");

  if (!mediaIdNum || !epNum || !REACTIONS.includes(reaction as (typeof REACTIONS)[number])) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  const existing = await prisma.episodeReaction.findUnique({
    where: { mediaId_episode_userId: { mediaId: mediaIdNum, episode: epNum, userId } },
  });

  let mine: string | null = null;
  if (existing) {
    if (existing.reaction === reaction) {
      await prisma.episodeReaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.episodeReaction.update({ where: { id: existing.id }, data: { reaction } });
      mine = reaction;
    }
  } else {
    await prisma.episodeReaction.create({
      data: { mediaId: mediaIdNum, episode: epNum, userId, reaction },
    });
    mine = reaction;
  }

  const reactions = await prisma.episodeReaction.findMany({
    where: { mediaId: mediaIdNum, episode: epNum },
    select: { reaction: true },
  });
  const counts: Record<string, number> = {};
  for (const r of reactions) counts[r.reaction] = (counts[r.reaction] || 0) + 1;

  return NextResponse.json({ counts, mine, total: reactions.length });
}