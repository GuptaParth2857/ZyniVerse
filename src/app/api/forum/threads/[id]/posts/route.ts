import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkAndAwardAchievement } from "@/lib/achievements";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where: { threadId: id, isDeleted: false },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true, signature: true } },
      },
    }),
    prisma.forumPost.count({ where: { threadId: id, isDeleted: false } }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await prisma.forumThread.findUnique({ where: { id } });
  if (!thread || thread.isDeleted) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  if (thread.isLocked) return NextResponse.json({ error: "Thread is locked" }, { status: 403 });

  const { content } = await req.json();
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const post = await prisma.forumPost.create({
    data: {
      threadId: id,
      userId: session.user.id,
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  await prisma.forumThread.update({
    where: { id },
    data: { postCount: { increment: 1 }, updatedAt: new Date() },
  });

  const replyCount = await prisma.forumPost.count({
    where: { userId: session.user.id, isDeleted: false },
  });
  if (replyCount >= 50) checkAndAwardAchievement(session.user.id, "HELPER").catch(() => {});

  return NextResponse.json({ post }, { status: 201 });
}
