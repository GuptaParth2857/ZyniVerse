import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.blogPostLike.findUnique({
    where: { postId_userId: { postId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.blogPostLike.delete({ where: { id: existing.id } });
    await prisma.blogPost.update({ where: { id }, data: { likeCount: { decrement: 1 } } });
    return NextResponse.json({ liked: false, likes: Math.max(0, (await prisma.blogPost.findUnique({ where: { id }, select: { likeCount: true } }))?.likeCount || 0) });
  }

  await prisma.blogPostLike.create({ data: { postId: id, userId: session.user.id } });
  await prisma.blogPost.update({ where: { id }, data: { likeCount: { increment: 1 } } });

  const likes = (await prisma.blogPost.findUnique({ where: { id }, select: { likeCount: true } }))?.likeCount || 0;
  return NextResponse.json({ liked: true, likes });
}
