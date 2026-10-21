import { prisma } from "@/lib/prisma";
import { withPublicCache } from "@/lib/api-cache";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function GET_inner(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comments = await prisma.blogComment.findMany({
    where: { postId: id, isDeleted: false },
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

  const comment = await prisma.blogComment.create({
    data: { postId: id, userId: session.user.id, content: content.trim() },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
