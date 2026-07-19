import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id: _clubId, postId } = await params;
  const comments = await prisma.clubPostComment.findMany({
    where: { clubPostId: postId },
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId, postId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const post = await prisma.clubPost.findUnique({ where: { id: postId }, select: { clubId: true } });
  if (!post || post.clubId !== clubId) {
    return NextResponse.json({ error: "Post not found in this club" }, { status: 404 });
  }

  const comment = await prisma.clubPostComment.create({
    data: { clubPostId: postId, userId: session.user.id, content },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
