import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.feedbackLike.findUnique({
    where: { feedbackId_userId: { feedbackId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.feedbackLike.delete({ where: { id: existing.id } });
    await prisma.feedback.update({ where: { id }, data: { likeCount: { decrement: 1 } } });
    const fb = await prisma.feedback.findUnique({ where: { id }, select: { likeCount: true } });
    return NextResponse.json({ liked: false, likes: fb?.likeCount || 0 });
  }

  await prisma.feedbackLike.create({ data: { feedbackId: id, userId: session.user.id } });
  await prisma.feedback.update({ where: { id }, data: { likeCount: { increment: 1 } } });
  const fb = await prisma.feedback.findUnique({ where: { id }, select: { likeCount: true } });
  return NextResponse.json({ liked: true, likes: fb?.likeCount || 0 });
}
