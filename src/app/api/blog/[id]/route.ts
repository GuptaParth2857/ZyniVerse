import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { hasValidAnimeTag, getAnimeTagError } from "@/lib/blog-tags";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ id }, { slug: id }], isDeleted: false },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { comments: true, likes: true } },
      ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.isDraft && post.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwn = userId === post.userId;
  if (!isOwn) {
    await prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
  }

  return NextResponse.json({
    post: {
      ...post,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked: userId ? (post as any).likes?.length > 0 : false,
      _count: undefined,
      likes: undefined,
    },
    author: post.user,
    isLiked: userId ? (post as any).likes?.length > 0 : false,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, content, excerpt, coverImage, tags, isDraft } = await req.json();

  const publishing = isDraft === false || (isDraft === undefined && !post.isDraft);
  if (publishing && tags !== undefined && !hasValidAnimeTag(tags || "")) {
    return NextResponse.json({ error: getAnimeTagError() }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title.trim();
  if (content !== undefined) data.content = content.trim();
  if (excerpt !== undefined) data.excerpt = excerpt?.trim() || null;
  if (coverImage !== undefined) data.coverImage = coverImage?.trim() || null;
  if (tags !== undefined) data.tags = tags?.trim() || "";
  if (isDraft !== undefined) {
    data.isDraft = isDraft;
    if (!isDraft && !post.publishedAt) data.publishedAt = new Date();
  }

  const updated = await prisma.blogPost.update({
    where: { id },
    data,
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.blogPost.update({ where: { id }, data: { isDeleted: true } });
  return NextResponse.json({ ok: true });
}
