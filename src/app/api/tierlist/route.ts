import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const sort = searchParams.get("sort") || "recent";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  else where.isPublic = true;

  const orderBy =
    sort === "popular"
      ? { votes: { _count: "desc" as const } }
      : sort === "top"
        ? { votes: { _count: "desc" as const } }
        : { createdAt: "desc" as const };

  const [tierLists, total] = await Promise.all([
    prisma.tierList.findMany({
      where,
      orderBy: sort === "recent" ? { createdAt: "desc" } : undefined,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { items: true, votes: true } },
      },
    }),
    prisma.tierList.count({ where }),
  ]);

  let result = tierLists;

  if (sort === "popular" || sort === "top") {
    result = tierLists.sort((a, b) => b._count.votes - a._count.votes);
  }

  const items = result.map((tl) => ({
    ...tl,
    itemCount: tl._count.items,
    voteCount: tl._count.votes,
    _count: undefined,
  }));

  return NextResponse.json({ tierLists: items, total, hasMore: page * limit < total });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, isPublic, items } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const tierList = await prisma.tierList.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      isPublic: isPublic !== false,
      items: {
        create: (items || []).map((item: { tier: string; mediaId: number; mediaTitle: string; mediaImage?: string }, i: number) => ({
          tier: item.tier,
          mediaId: item.mediaId,
          mediaTitle: item.mediaTitle,
          mediaImage: item.mediaImage || null,
          order: i,
        })),
      },
    },
    include: {
      items: { orderBy: { order: "asc" } },
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { votes: true } },
    },
  });

  return NextResponse.json({ tierList: { ...tierList, voteCount: tierList._count.votes, _count: undefined } }, { status: 201 });
}
