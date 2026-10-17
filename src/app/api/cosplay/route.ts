import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
import { dedupedFetch, invalidateCached } from "@/lib/wiki-cache";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

// The Supabase pooler is remote (ap-northeast-1), so an uncached gallery read
// costs hundreds of ms to seconds. The gallery is read far more often than it
// is written, so page reads are cached briefly and POSTs invalidate them.
const FEED_TTL_MS = 30_000;

export async function GET(req: NextRequest) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "recent";
  const anime = searchParams.get("anime");
  const character = searchParams.get("character");
  const user = searchParams.get("user");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "30");

  const where: Prisma.CosplayWhereInput = {};
  if (anime) where.animeTitle = { contains: anime };
  if (character) where.character = { contains: character };
  if (user) where.userId = user;

  const orderBy = sort === "popular" ? { likes: "desc" as const } : { createdAt: "desc" as const };

  const { cosplays, total } = await dedupedFetch(
    `cosplay:${sort}:${anime ?? ""}:${character ?? ""}:${user ?? ""}:${page}:${perPage}`,
    async () => {
      const [rows, count] = await Promise.all([
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
      return { cosplays: rows, total: count };
    },
    FEED_TTL_MS,
  );

  return NextResponse.json(
    { cosplays, total, page, hasNextPage: page * perPage < total },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}

export async function POST(req: NextRequest) {
  const rateLimited = await apiLimiter.middleware(req);
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

  invalidateCached("cosplay:");

  return NextResponse.json({ cosplay });
}
