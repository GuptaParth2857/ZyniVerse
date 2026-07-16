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
  const anime = searchParams.get("anime");
  const character = searchParams.get("character");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "30");

  const where: Prisma.CosplayWhereInput = {};
  if (anime) where.animeTitle = { contains: anime };
  if (character) where.character = { contains: character };

  const orderBy = sort === "popular" ? { likes: "desc" as const } : { createdAt: "desc" as const };

  const [cosplays, total] = await Promise.all([
    prisma.cosplay.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    }),
    prisma.cosplay.count({ where }),
  ]);

  return NextResponse.json(
    { cosplays, total, page, hasNextPage: page * perPage < total },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
  );
}

export async function POST(req: NextRequest) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, character, animeTitle, animeId, imageUrl, tags } = await req.json();
  if (!title || !character || !animeTitle || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields (title, character, animeTitle, imageUrl)" }, { status: 400 });
  }

  const cosplay = await prisma.cosplay.create({
    data: {
      userId: session.user.id,
      title,
      description,
      character,
      animeTitle,
      animeId: animeId ? parseInt(animeId) : null,
      imageUrl,
      tags: tags || "",
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ cosplay });
}
