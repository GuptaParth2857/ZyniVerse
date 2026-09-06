import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "recent";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "20");

  const where: Prisma.CommissionWhereInput = { isActive: true };
  if (category && category !== "all") where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy = sort === "popular"
    ? { requests: { _count: "desc" as const } }
    : { createdAt: "desc" as const };

  const [items, total, creators] = await Promise.all([
    prisma.commission.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { requests: true } },
      },
    }),
    prisma.commission.count({ where }),
    prisma.commission.groupBy({ by: ["userId"], where: { isActive: true } }),
  ]);

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      requestCount: item._count.requests,
      _count: undefined,
    })),
    total,
    creators: creators.length,
    page,
    hasNextPage: page * perPage < total,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, imageUrl, category, priceMin, priceMax, turnaround, portfolio } = await req.json();
  if (!title || !description || !category) {
    return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 });
  }

  const commission = await prisma.commission.create({
    data: {
      userId: session.user.id,
      title,
      description,
      imageUrl: imageUrl || null,
      category,
      priceMin: priceMin ? parseInt(priceMin) : null,
      priceMax: priceMax ? parseInt(priceMax) : null,
      turnaround: turnaround || null,
      portfolio: JSON.stringify(portfolio || []),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { requests: true } },
    },
  });

  return NextResponse.json({
    commission: {
      ...commission,
      requestCount: commission._count.requests,
      _count: undefined,
    },
  });
}
