import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "POST";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const session = await auth();
  const userId = session?.user?.id;

  const where = type === "ALL" ? {} : { type };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, savedBy: true } },
        ...(userId ? {
          savedBy: { where: { userId }, select: { id: true } },
        } : {}),
      },
    }),
    prisma.post.count({ where }),
  ]);

  const items = posts.map((p) => ({
    ...p,
    commentCount: p._count.comments,
    saveCount: p._count.savedBy,
    isSaved: userId ? (p as any).savedBy?.length > 0 : false,
    _count: undefined,
    savedBy: undefined,
  }));

  return NextResponse.json({ posts: items, total, hasMore: page * limit < total });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, type, mediaId, rating } = await req.json();
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "Missing title or content" }, { status: 400 });

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      content: content.trim(),
      type: type || "POST",
      mediaId: mediaId || null,
      rating: rating || null,
    },
    include: { author: { select: { id: true, username: true } } },
  });

  return NextResponse.json({ post }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
