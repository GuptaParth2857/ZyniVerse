import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId, postId } = await params;
  const { title, content } = await req.json();

  const post = await prisma.clubPost.findUnique({ where: { id: postId }, select: { clubId: true, userId: true } });
  if (!post || post.clubId !== clubId) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const isAuthor = post.userId === session.user.id;
  const canManage = member.role === "owner" || member.role === "admin";
  if (!isAuthor && !canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.clubPost.update({
    where: { id: postId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content: content.trim() }),
    },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId, postId } = await params;

  const post = await prisma.clubPost.findUnique({ where: { id: postId }, select: { clubId: true, userId: true } });
  if (!post || post.clubId !== clubId) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const isAuthor = post.userId === session.user.id;
  const canManage = member.role === "owner" || member.role === "admin";
  if (!isAuthor && !canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.clubPostComment.deleteMany({ where: { clubPostId: postId } });
  await prisma.clubPost.delete({ where: { id: postId } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId, postId } = await params;
  const { isPinned } = await req.json();

  const post = await prisma.clubPost.findUnique({ where: { id: postId }, select: { clubId: true } });
  if (!post || post.clubId !== clubId) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const canManage = member.role === "owner" || member.role === "admin";
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.clubPost.update({
    where: { id: postId },
    data: { isPinned: !!isPinned },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ post: updated });
}
