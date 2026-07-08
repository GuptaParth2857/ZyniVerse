import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const thread = await prisma.forumThread.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true, signature: true } },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { posts: true } },
    },
  });

  if (!thread || thread.isDeleted) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where: { threadId: id, isDeleted: false },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true, signature: true } },
        _count: { select: { votes: true } },
        votes: { select: { vote: true, userId: true } },
      },
    }),
    prisma.forumPost.count({ where: { threadId: id, isDeleted: false } }),
  ]);

  await prisma.forumThread.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ thread, posts, total, page, limit });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await prisma.forumThread.findUnique({ where: { id } });
  if (!thread || thread.isDeleted) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  if (thread.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, content, isPinned, isLocked } = await req.json();

  const updated = await prisma.forumThread.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(isPinned !== undefined ? { isPinned } : {}),
      ...(isLocked !== undefined ? { isLocked } : {}),
    },
  });

  return NextResponse.json({ thread: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await prisma.forumThread.findUnique({ where: { id } });
  if (!thread || thread.isDeleted) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  if (thread.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.forumThread.update({
    where: { id },
    data: { isDeleted: true },
  });

  return NextResponse.json({ success: true });
}
