import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cosplayId } = await params;
  const cosplay = await prisma.cosplay.findUnique({ where: { id: cosplayId } });
  if (!cosplay) {
    return NextResponse.json({ error: "Cosplay not found" }, { status: 404 });
  }

  const existing = await prisma.cosplayLike.findUnique({
    where: { cosplayId_userId: { cosplayId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.cosplayLike.delete({ where: { id: existing.id } });
    await prisma.cosplay.update({
      where: { id: cosplayId },
      data: { likes: { decrement: 1 } },
    });
    const updated = await prisma.cosplay.findUnique({ where: { id: cosplayId } });
    return NextResponse.json({ liked: false, likes: updated?.likes || 0 });
  } else {
    await prisma.cosplayLike.create({
      data: { cosplayId, userId: session.user.id },
    });
    await prisma.cosplay.update({
      where: { id: cosplayId },
      data: { likes: { increment: 1 } },
    });
    const updated = await prisma.cosplay.findUnique({ where: { id: cosplayId } });
    return NextResponse.json({ liked: true, likes: updated?.likes || 0 });
  }
}
