import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; reelId: string }> }) {
  const { id: clubId, reelId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const reel = await prisma.clubReel.findUnique({ where: { id: reelId }, select: { clubId: true } });
  if (!reel || reel.clubId !== clubId) return NextResponse.json({ error: "Reel not found" }, { status: 404 });

  const existing = await prisma.clubReelLike.findUnique({
    where: { reelId_userId: { reelId, userId: session.user.id } },
  });
  if (existing) {
    await prisma.clubReelLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.clubReelLike.create({
    data: { reelId, userId: session.user.id },
  });

  await prisma.clubMember.update({
    where: { clubId_userId: { clubId, userId: session.user.id } },
    data: { points: { increment: 1 } },
  });

  return NextResponse.json({ liked: true });
}
