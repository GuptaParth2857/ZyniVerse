import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { joinChallenge, leaveChallenge } from "@/lib/challenges";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challengeId = (await params).id;
  const body = await req.json().catch(() => ({}));
  const goalCount = body.goalCount ? Number(body.goalCount) : undefined;

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  if (new Date() > challenge.endDate) {
    return NextResponse.json({ error: "Challenge has already ended" }, { status: 400 });
  }

  await joinChallenge(challengeId, session.user.id, goalCount);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challengeId = (await params).id;
  await leaveChallenge(challengeId, session.user.id);

  return NextResponse.json({ ok: true });
}
