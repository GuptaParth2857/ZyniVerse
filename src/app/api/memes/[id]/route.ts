import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meme = await prisma.meme.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      votes: { select: { value: true } },
    },
  });

  if (!meme) {
    return NextResponse.json({ error: "Meme not found" }, { status: 404 });
  }

  return NextResponse.json({ meme });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meme = await prisma.meme.findUnique({ where: { id } });
  if (!meme) {
    return NextResponse.json({ error: "Meme not found" }, { status: 404 });
  }
  if (meme.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.memeVote.deleteMany({ where: { memeId: id } });
  await prisma.memeComment.deleteMany({ where: { memeId: id } });
  await prisma.meme.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
