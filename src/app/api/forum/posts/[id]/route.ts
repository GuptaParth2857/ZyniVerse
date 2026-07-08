import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post || post.isDeleted) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { content } = await req.json();
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const updated = await prisma.forumPost.update({
    where: { id },
    data: { content: content.trim() },
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post || post.isDeleted) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.forumPost.update({
    where: { id },
    data: { isDeleted: true },
  });

  return NextResponse.json({ success: true });
}
