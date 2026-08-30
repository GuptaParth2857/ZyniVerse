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
  const artType = searchParams.get("artType");
  const anime = searchParams.get("anime");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "30");

  const where: Prisma.FanArtWhereInput = {};
  if (artType) where.artType = artType;
  if (anime) where.animeTitle = { contains: anime };

  const orderBy = sort === "popular" ? { likes: "desc" as const } : { createdAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.fanArt.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    }),
    prisma.fanArt.count({ where }),
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

  const { title, description, animeTitle, animeId, character, imageUrl, artType, tags } = await req.json();
  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields (title, imageUrl)" }, { status: 400 });
  }

  const fanArt = await prisma.fanArt.create({
    data: {
      userId: session.user.id,
      title,
      description,
      animeTitle: animeTitle || null,
      animeId: animeId ? parseInt(animeId) : null,
      character: character || null,
      imageUrl,
      artType: artType || "digital",
      tags: tags || "",
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ fanArt });
}
