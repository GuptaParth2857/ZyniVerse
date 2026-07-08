import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { getChallenge, getLeaderboard } from "@/lib/challenges";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, avatar: true } },
      _count: { select: { participants: true, entries: true } },
    },
  });

  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const leaderboard = await getLeaderboard(id, 10);

  const session = await auth();
  let userParticipation = null;
  if (session?.user?.id) {
    userParticipation = await prisma.challengeParticipant.findUnique({
      where: { challengeId_userId: { challengeId: id, userId: session.user.id } },
    });
  }

  return NextResponse.json({ challenge, leaderboard, userParticipation });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  if (challenge.createdBy !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updateData: Record<string, unknown> = {};
  if (body.title) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.type) updateData.type = body.type;
  if (body.period) updateData.period = body.period;
  if (body.year !== undefined) updateData.year = body.year;
  if (body.season !== undefined) updateData.season = body.season;
  if (body.startDate) updateData.startDate = new Date(body.startDate);
  if (body.endDate) updateData.endDate = new Date(body.endDate);
  if (body.goalCount) updateData.goalCount = body.goalCount;
  if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;
  if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
  if (body.rules !== undefined) updateData.rules = body.rules;

  const updated = await prisma.challenge.update({ where: { id }, data: updateData });

  return NextResponse.json({ challenge: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  if (challenge.createdBy !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.challenge.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
