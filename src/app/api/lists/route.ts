import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { checkAndAwardAchievement } from "@/lib/achievements";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const sort = searchParams.get("sort") || "recent";
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const session = await auth().catch(() => null);
  const ownerId = session?.user?.id;

  const where: Record<string, unknown> = {};
  if (userId) {
    where.userId = userId;
    if (ownerId !== userId) where.isPublic = true;
  } else {
    where.isPublic = true;
  }
  if (search) where.title = { contains: search };

  const _orderBy =
    sort === "popular"
      ? { likes: "desc" as const }
      : sort === "trending"
        ? { likes: "desc" as const }
        : { createdAt: "desc" as const };

  const [lists, total] = await Promise.all([
    prisma.userList.findMany({
      where,
      orderBy: sort === "recent" ? { createdAt: "desc" } : { likes: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        items: { select: { mediaImage: true }, take: 4, orderBy: { order: "asc" } },
        _count: { select: { items: true } },
      },
    }),
    prisma.userList.count({ where }),
  ]);

  const result = lists.map((l) => ({
    ...l,
    itemCount: l._count.items,
    coverImages: l.items.map((i) => i.mediaImage).filter(Boolean) as string[],
    _count: undefined,
    items: undefined,
  }));

  return NextResponse.json({ lists: result, total });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, type, isPublic } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!type || !["anime", "manga", "mixed"].includes(type)) return NextResponse.json({ error: "Type must be anime, manga, or mixed" }, { status: 400 });

  const list = await prisma.userList.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      type,
      isPublic: isPublic !== false,
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { items: true } },
    },
  });

  const listCount = await prisma.userList.count({ where: { userId: session.user.id } });
  if (listCount >= 5) checkAndAwardAchievement(session.user.id, "LIST_MAKER").catch(() => {});

  return NextResponse.json({ list: { ...list, itemCount: list._count.items, _count: undefined } }, { status: 201 });
}
