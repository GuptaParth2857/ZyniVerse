import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getContestById } from "@/lib/contests";
import { NextRequest, NextResponse } from "next/server";

// Public, non-personalised payload -> CDN cacheable. `Vary: Cookie` keeps the
// cached anonymous body from being served to a signed-in member (whose vote
// state is part of the payload), while the authed branch stays uncacheable.
const ANON_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=180",
  Vary: "Cookie",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contest = await getContestById(id);
  if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });

  const session = await auth();

  let hasVoted = false;
  let votedEntryId: string | null = null;
  let hasSubmitted = false;
  if (session?.user?.id) {
    const [vote, myEntry] = await Promise.all([
      prisma.contentContestVote.findFirst({
        where: { contestId: id, userId: session.user.id },
        select: { entryId: true },
      }),
      prisma.contentContestEntry.findFirst({
        where: { contestId: id, userId: session.user.id },
        select: { id: true },
      }),
    ]);
    hasVoted = Boolean(vote);
    votedEntryId = vote?.entryId ?? null;
    hasSubmitted = Boolean(myEntry);
  }

  const entries = contest.entries.map((e, index) => ({
    id: e.id,
    title: e.title,
    image: e.image,
    caption: e.caption,
    upvotes: e.upvotes,
    createdAt: e.createdAt.toISOString(),
    rank: index + 1,
    user: e.user,
    isMine: session?.user?.id === e.userId,
  }));

  return NextResponse.json(
    {
      contest: {
        id: contest.id,
        title: contest.title,
        type: contest.type,
        description: contest.description,
        rewardXp: contest.rewardXp,
        rewardBadge: contest.rewardBadge,
        weekStart: contest.weekStart.toISOString(),
        weekEnd: contest.weekEnd.toISOString(),
        status: contest.status,
        winner: contest.winner,
        entryCount: entries.length,
        totalVotes: entries.reduce((sum, e) => sum + e.upvotes, 0),
        hasVoted,
        votedEntryId,
        hasSubmitted,
        entries,
      },
    },
    {
      headers: session?.user?.id
        ? { "Cache-Control": "private, no-store" }
        : ANON_CACHE_HEADERS,
    },
  );
}
