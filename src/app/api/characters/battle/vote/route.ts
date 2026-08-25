import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { battleId, choice } = await req.json();
  if (!battleId || !choice || !["A", "B"].includes(choice)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const battle = await prisma.characterBattle.findUnique({ where: { id: battleId } });
  if (!battle) return NextResponse.json({ error: "Battle not found" }, { status: 404 });

  const existing = await prisma.characterBattleVote.findUnique({
    where: { battleId_userId: { battleId, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  await prisma.characterBattleVote.create({
    data: { battleId, userId: session.user.id, choice },
  });

  const updated = await prisma.characterBattle.findUnique({
    where: { id: battleId },
    include: { votes: true },
  });

  const votesA = updated!.votes.filter((v) => v.choice === "A").length;
  const votesB = updated!.votes.filter((v) => v.choice === "B").length;

  return NextResponse.json({
    success: true,
    votesA,
    votesB,
    totalVotes: votesA + votesB,
    voted: choice,
  });
}
