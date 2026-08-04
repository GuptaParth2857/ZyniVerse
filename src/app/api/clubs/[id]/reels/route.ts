import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { videoUrl, thumbnailUrl, caption } = await req.json();
  if (!videoUrl) return NextResponse.json({ error: "Video URL required" }, { status: 400 });

  const reel = await prisma.clubReel.create({
    data: {
      clubId: id,
      userId: session.user.id,
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
      caption: caption?.trim() || null,
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { likes: true } },
    },
  });

  await prisma.clubMember.update({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
    data: { points: { increment: 10 } },
  });

  return NextResponse.json({ reel }, { status: 201 });
}
