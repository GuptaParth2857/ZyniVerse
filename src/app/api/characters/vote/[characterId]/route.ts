import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ characterId: string }> }) {
  const { characterId } = await params;
  const id = parseInt(characterId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid characterId" }, { status: 400 });

  const total = await prisma.characterVote.aggregate({ where: { characterId: id }, _sum: { vote: true } });
  const count = await prisma.characterVote.count({ where: { characterId: id } });
  const topVoters = await prisma.characterVote.findMany({
    where: { characterId: id },
    orderBy: { vote: "desc" },
    take: 5,
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ totalVotes: total._sum.vote || 0, voterCount: count, topVoters });
}
