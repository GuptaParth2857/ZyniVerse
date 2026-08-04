import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; pollId: string }> }) {
  const { id: clubId, pollId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const poll = await prisma.clubPoll.findUnique({
    where: { id: pollId },
    select: { clubId: true, isActive: true, endsAt: true },
  });
  if (!poll || poll.clubId !== clubId) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  if (!poll.isActive || (poll.endsAt && poll.endsAt < new Date())) {
    return NextResponse.json({ error: "Poll is closed" }, { status: 400 });
  }

  const { optionId } = await req.json();
  const option = await prisma.clubPollOption.findUnique({ where: { id: optionId }, select: { pollId: true } });
  if (!option || option.pollId !== pollId) return NextResponse.json({ error: "Option not found" }, { status: 404 });

  const existing = await prisma.clubPollVote.findUnique({
    where: { pollId_userId: { pollId, userId: session.user.id } },
  });
  if (existing) {
    await prisma.clubPollVote.delete({ where: { id: existing.id } });
  }

  await prisma.clubPollVote.create({
    data: { pollId, optionId, userId: session.user.id },
  });

  await prisma.clubMember.update({
    where: { clubId_userId: { clubId, userId: session.user.id } },
    data: { points: { increment: 2 } },
  });

  return NextResponse.json({ voted: true });
}
