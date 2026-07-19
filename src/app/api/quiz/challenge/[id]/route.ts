import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { score, totalQuestions, _timeTaken } = await req.json();
  if (score === undefined || !totalQuestions) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const challenge = await prisma.quizChallenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  if (challenge.challengeeId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (challenge.status !== "pending") {
    return NextResponse.json({ error: "Challenge already completed" }, { status: 400 });
  }

  const updated = await prisma.quizChallenge.update({
    where: { id },
    data: {
      challengeeScore: score,
      status: "completed",
    },
    include: {
      challenger: { select: { id: true, username: true, avatar: true } },
      challengee: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ challenge: updated });
}
