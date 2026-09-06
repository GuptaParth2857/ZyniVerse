import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to vote." }, { status: 401 });
  const { entryId } = (await req.json()) as { entryId?: string };
  if (!entryId) return NextResponse.json({ error: "entryId required" }, { status: 400 });

  const entry = await prisma.contentContestEntry.findUnique({ where: { id: entryId }, select: { id: true, contestId: true, userId: true } });
  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  if (entry.userId === session.user.id) return NextResponse.json({ error: "You can't vote for your own entry." }, { status: 400 });

  const contest = await prisma.contentContest.findUnique({ where: { id: entry.contestId }, select: { weekEnd: true, weekStart: true } });
  if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  const now = new Date();
  if (now < contest.weekStart || now > contest.weekEnd) return NextResponse.json({ error: "Voting closed for this contest." }, { status: 400 });

  try {
    await prisma.contentContestVote.create({ data: { contestId: entry.contestId, entryId, userId: session.user.id } });
    await prisma.contentContestEntry.update({ where: { id: entryId }, data: { upvotes: { increment: 1 } } });
  } catch {
    return NextResponse.json({ error: "You already voted in this contest." }, { status: 409 });
  }

  const newCount = await prisma.contentContestEntry.findUnique({ where: { id: entryId }, select: { upvotes: true } });
  return NextResponse.json({ upvotes: newCount?.upvotes ?? 1 });
}