import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentContests } from "@/lib/contests";
import { finalizeContests } from "@/lib/contests-finalize";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  await finalizeContests();
  const contests = await getCurrentContests();

  if (!session?.user?.id) {
    return NextResponse.json({
      contests: contests.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        description: c.description,
        rewardXp: c.rewardXp,
        weekStart: c.weekStart.toISOString(),
        weekEnd: c.weekEnd.toISOString(),
        entries: c.entries.map((e) => ({ id: e.id, title: e.title, image: e.image, caption: e.caption, upvotes: e.upvotes, user: e.user })),
      })),
    });
  }

  const userId = session.user.id;
  const myVotes = await prisma.contentContestVote.findMany({
    where: { userId, contestId: { in: contests.map((c) => c.id) } },
    select: { entryId: true, contestId: true },
  });
  const votedContests = new Set(myVotes.map((v) => v.contestId));
  const votedEntry = new Map(myVotes.map((v) => [v.contestId, v.entryId]));
  const myEntries = await prisma.contentContestEntry.findMany({
    where: { userId, contestId: { in: contests.map((c) => c.id) } },
    select: { id: true, contestId: true },
  });
  const submittedContests = new Set(myEntries.map((e) => e.contestId));

  return NextResponse.json({
    contests: contests.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      description: c.description,
      rewardXp: c.rewardXp,
      weekStart: c.weekStart.toISOString(),
      weekEnd: c.weekEnd.toISOString(),
      hasVoted: votedContests.has(c.id),
      votedEntryId: votedEntry.get(c.id),
      hasSubmitted: submittedContests.has(c.id),
      entries: c.entries
        .sort((a, b) => b.upvotes - a.upvotes)
        .map((e) => ({ id: e.id, title: e.title, image: e.image, caption: e.caption, upvotes: e.upvotes, user: e.user })),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to join contests." }, { status: 401 });

  const { contestId, title, image, caption } = (await req.json()) as { contestId?: string; title?: string; image?: string; caption?: string };
  if (!contestId || !title || !image) return NextResponse.json({ error: "contestId, title and image are required" }, { status: 400 });

  const contest = await prisma.contentContest.findUnique({ where: { id: contestId } });
  if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  const now = new Date();
  if (now < contest.weekStart || now > contest.weekEnd) return NextResponse.json({ error: "This contest has ended." }, { status: 400 });

  try {
    const entry = await prisma.contentContestEntry.create({
      data: { contestId, userId: session.user.id, title: title.slice(0, 120), image, caption: caption?.slice(0, 300) || null },
    });
    return NextResponse.json({ entry: { id: entry.id } }, { status: 201 });
  } catch {
    // unique(contestId, userId) violation -> already submitted
    return NextResponse.json({ error: "You already submitted an entry to this contest." }, { status: 409 });
  }
}