import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "post";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const userId = searchParams.get("userId");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const sort = searchParams.get("sort") || "recent";

  const where: Record<string, unknown> = { isDraft: false, isDeleted: false };

  if (slug) where.slug = slug;
  if (userId) where.userId = userId;
  if (tag) where.tags = { contains: tag };
  if (search) where.OR = [
    { title: { contains: search } },
    { content: { contains: search } },
  ];

  const orderBy = sort === "popular" ? { viewCount: "desc" as const } : { publishedAt: "desc" as const };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: where as any,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.blogPost.count({ where: where as any }),
  ]);

  const items = posts.map((p) => ({
    ...p,
    commentCount: p._count.comments,
    likeCount: p._count.likes,
    _count: undefined,
  }));

  return NextResponse.json({ posts: items, total, hasMore: page * limit < total });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, excerpt, coverImage, tags, isDraft } = await req.json();
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "Missing title or content" }, { status: 400 });

  let slug = slugify(title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const post = await prisma.blogPost.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      slug,
      content: content.trim(),
      excerpt: excerpt?.trim() || null,
      coverImage: coverImage?.trim() || null,
      tags: tags?.trim() || "",
      isDraft: isDraft !== false,
      publishedAt: isDraft ? null : new Date(),
    },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json({ post }, { status: 201 });
}
