import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId, postId, commentId } = await params;

  const post = await prisma.clubPost.findUnique({ where: { id: postId }, select: { clubId: true } });
  if (!post || post.clubId !== clubId) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const comment = await prisma.clubPostComment.findUnique({ where: { id: commentId }, select: { userId: true } });
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const isAuthor = comment.userId === session.user.id;
  const canManage = member.role === "owner" || member.role === "admin";
  if (!isAuthor && !canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.clubPostComment.delete({ where: { id: commentId } });

  return NextResponse.json({ success: true });
}
