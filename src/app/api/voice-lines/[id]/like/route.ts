import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const record = await prisma.voiceLine.upsert({
    where: { id },
    update: {},
    create: { id },
    select: { id: true, likesCount: true },
  });

  const liked = userId
    ? !!(await prisma.voiceLineLike.findUnique({
        where: { lineId_userId: { lineId: id, userId } },
        select: { id: true },
      }))
    : false;

  return NextResponse.json({ liked, likes: record.likesCount });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Please sign in to like" }, { status: 401 });
  }

  const existing = await prisma.voiceLineLike.findUnique({
    where: { lineId_userId: { lineId: id, userId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.voiceLineLike.delete({ where: { id: existing.id } }),
      prisma.voiceLine.update({
        where: { id },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ liked: false, likes: (await prisma.voiceLine.findUnique({ where: { id }, select: { likesCount: true } }))?.likesCount ?? 0 });
  }

  await prisma.voiceLine.upsert({
    where: { id },
    update: { likesCount: { increment: 1 } },
    create: { id, likesCount: 1 },
  });
  await prisma.voiceLineLike.create({
    data: { lineId: id, userId },
  });

  return NextResponse.json({
    liked: true,
    likes: (await prisma.voiceLine.findUnique({ where: { id }, select: { likesCount: true } }))?.likesCount ?? 0,
  });
}
