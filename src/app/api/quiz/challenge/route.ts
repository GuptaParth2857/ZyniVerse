import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeeId, category, difficulty } = await req.json();
  if (!challengeeId || !category || !difficulty) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (challengeeId === session.user.id) {
    return NextResponse.json({ error: "Cannot challenge yourself" }, { status: 400 });
  }

  const challenge = await prisma.quizChallenge.create({
    data: {
      challengerId: session.user.id,
      challengeeId,
      category,
      difficulty,
      status: "pending",
    },
    include: {
      challenger: { select: { id: true, username: true, avatar: true } },
      challengee: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ challenge });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challenges = await prisma.quizChallenge.findMany({
    where: {
      OR: [
        { challengerId: session.user.id },
        { challengeeId: session.user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      challenger: { select: { id: true, username: true, avatar: true } },
      challengee: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ challenges });
}
