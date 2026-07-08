import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (category) where.category = category;
  if (search) where.name = { contains: search };

  const [clubs, total] = await Promise.all([
    prisma.club.findMany({
      where,
      orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        _count: { select: { members: true, posts: true } },
      },
    }),
    prisma.club.count({ where }),
  ]);

  return NextResponse.json({ clubs, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, category, isPrivate } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const validCategories = ["fan_club", "discussion", "watching", "reading", "region", "language", "other"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

  const club = await prisma.club.create({
    data: {
      name: name.trim(),
      slug,
      description: description || null,
      category,
      isPrivate: isPrivate || false,
      ownerId: session.user.id,
    },
    include: {
      owner: { select: { id: true, username: true, avatar: true } },
    },
  });

  await prisma.clubMember.create({
    data: {
      clubId: club.id,
      userId: session.user.id,
      role: "owner",
    },
  });

  return NextResponse.json({ club }, { status: 201 });
}
