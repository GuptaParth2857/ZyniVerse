import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comments = await prisma.feedbackComment.findMany({
    where: { feedbackId: id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Missing content" }, { status: 400 });

  const comment = await prisma.feedbackComment.create({
    data: { feedbackId: id, userId: session.user.id, content: content.trim() },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  await prisma.feedback.update({ where: { id }, data: { replyCount: { increment: 1 } } });

  return NextResponse.json({ comment }, { status: 201 });
}
