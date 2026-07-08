import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkAndAwardAchievement } from "@/lib/achievements";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const animeId = searchParams.get("animeId");
  const sort = searchParams.get("sort") || "recent";
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = { isDeleted: false };
  if (category) where.category = { slug: category };
  if (animeId) where.animeId = parseInt(animeId);
  if (search) where.title = { contains: search };

  const orderBy: any =
    sort === "popular" ? { viewCount: "desc" }
    : sort === "top" ? { postCount: "desc" }
    : { createdAt: "desc" };

  const [threads, total] = await Promise.all([
    prisma.forumThread.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, orderBy],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { posts: true } },
      },
    }),
    prisma.forumThread.count({ where }),
  ]);

  return NextResponse.json({ threads, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { categoryId, animeId, animeTitle, animeImage, title, content } = await req.json();

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

  const thread = await prisma.forumThread.create({
    data: {
      categoryId: categoryId || null,
      animeId: animeId ? parseInt(animeId) : null,
      animeTitle: animeTitle || null,
      animeImage: animeImage || null,
      title: title.trim(),
      slug,
      content: content.trim(),
      userId: session.user.id,
      postCount: 1,
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  await prisma.forumPost.create({
    data: {
      threadId: thread.id,
      userId: session.user.id,
      content: content.trim(),
    },
  });

  const threadCount = await prisma.forumThread.count({ where: { userId: session.user.id } });
  if (threadCount >= 10) checkAndAwardAchievement(session.user.id, "FORUM_POSTER").catch(() => {});

  return NextResponse.json({ thread }, { status: 201 });
}
