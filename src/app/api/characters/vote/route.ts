import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { characterId, mediaId, vote } = await req.json();
  if (!characterId || !mediaId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await prisma.characterVote.findUnique({
    where: { userId_characterId: { userId: session.user.id, characterId } },
  });

  if (existing) {
    await prisma.characterVote.update({ where: { id: existing.id }, data: { vote: vote ?? 1 } });
  } else {
    await prisma.characterVote.create({
      data: { userId: session.user.id, characterId, mediaId, vote: vote ?? 1 },
    });
  }

  const total = await prisma.characterVote.aggregate({ where: { characterId }, _sum: { vote: true } });
  const count = await prisma.characterVote.count({ where: { characterId } });

  return NextResponse.json({ success: true, totalVotes: total._sum.vote || 0, voterCount: count });
}
