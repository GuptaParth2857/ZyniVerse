import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const mediaId = Number(id);
  if (isNaN(mediaId)) return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });

  const { episode, vote } = await req.json();
  if (episode == null || !vote) {
    return NextResponse.json({ error: "Episode number and vote type required" }, { status: 400 });
  }

  const validVotes = ["canon", "filler", "mixed", "anime-canon"];
  if (!validVotes.includes(vote)) {
    return NextResponse.json({ error: `Vote must be one of: ${validVotes.join(", ")}` }, { status: 400 });
  }

  const existing = await prisma.fillerVote.findUnique({
    where: { userId_mediaId_episode: { userId: session.user.id, mediaId, episode } },
  });

  let result;
  if (existing) {
    result = await prisma.fillerVote.update({
      where: { id: existing.id },
      data: { vote },
    });
  } else {
    result = await prisma.fillerVote.create({
      data: { userId: session.user.id, mediaId, episode, vote },
    });
  }

  // Tally votes for this episode
  const votes = await prisma.fillerVote.findMany({ where: { mediaId, episode } });
  const tally: Record<string, number> = {};
  for (const v of votes) {
    tally[v.vote] = (tally[v.vote] || 0) + 1;
  }

  return NextResponse.json({
    success: true,
    yourVote: vote,
    episode,
    tally,
    totalVotes: votes.length,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mediaId = Number(id);
  if (isNaN(mediaId)) return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const episode = searchParams.get("episode") ? Number(searchParams.get("episode")) : null;
  const mine = searchParams.get("mine") === "true";

  if (mine) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const myVotes = await prisma.fillerVote.findMany({
      where: { mediaId, userId: session.user.id },
      select: { episode: true, vote: true },
    });
    return NextResponse.json({ votes: myVotes });
  }

  let votes;
  if (episode) {
    votes = await prisma.fillerVote.findMany({ where: { mediaId, episode } });
  } else {
    votes = await prisma.fillerVote.findMany({ where: { mediaId } });
  }

  const byEpisode: Record<number, { tally: Record<string, number>; total: number }> = {};
  for (const v of votes) {
    if (!byEpisode[v.episode]) byEpisode[v.episode] = { tally: {}, total: 0 };
    byEpisode[v.episode].tally[v.vote] = (byEpisode[v.episode].tally[v.vote] || 0) + 1;
    byEpisode[v.episode].total++;
  }

  return NextResponse.json({ mediaId, byEpisode, totalVotes: votes.length });
}
