import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "recent";
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = Math.min(parseInt(searchParams.get("perPage") || "30"), 100);

  const where: Prisma.WallpaperWhereInput = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { animeTitle: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "popular"
      ? { likes: "desc" as const }
      : sort === "downloads"
        ? { downloads: "desc" as const }
        : { createdAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.wallpaper.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    }),
    prisma.wallpaper.count({ where }),
  ]);

  return NextResponse.json(
    { items, total, page, hasNextPage: page * perPage < total },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}

export async function POST(req: NextRequest) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, imageUrl, thumbnailUrl, animeTitle, animeId, resolution, category, tags } = await req.json();
  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields (title, imageUrl)" }, { status: 400 });
  }

  const wallpaper = await prisma.wallpaper.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      imageUrl,
      thumbnailUrl: thumbnailUrl || null,
      animeTitle: animeTitle || null,
      animeId: animeId ? parseInt(animeId) : null,
      resolution: resolution || null,
      category: category || "landscape",
      tags: tags || "",
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ wallpaper });
}
