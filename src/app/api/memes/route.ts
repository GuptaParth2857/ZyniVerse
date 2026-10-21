import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiLimiter } from "@/lib/rate-limiter";
import { dedupedFetch, invalidateCached } from "@/lib/wiki-cache";
import { withPublicCache } from "@/lib/api-cache";
export const dynamic = "force-dynamic";

// See the cosplay route: the remote pooler makes an uncached page read
// expensive, and the feed is read far more often than it is written.
const FEED_TTL_MS = 30_000;

const memeInclude = {
  user: { select: { id: true, username: true, avatar: true } },
} satisfies Prisma.MemeInclude;

type MemeRow = Prisma.MemeGetPayload<{ include: typeof memeInclude }>;

export async function GET(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "hot";
  const tag = searchParams.get("tag");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = Math.min(parseInt(searchParams.get("perPage") || "15"), 50);

  const where: Prisma.MemeWhereInput = {};
  if (tag && tag !== "all") {
    where.tags = { contains: tag, mode: "insensitive" };
  }

  // Tag filter is part of every key so different tag tabs cache separately.
  const tagKey = tag && tag !== "all" ? tag.toLowerCase() : "all";

  let memes: MemeRow[];
  if (sort === "new" || sort === "top") {
    const orderBy: Prisma.MemeOrderByWithRelationInput | Prisma.MemeOrderByWithRelationInput[] =
      sort === "new"
        ? { createdAt: "desc" }
        : [{ upvotes: "desc" }, { downvotes: "asc" }];
    memes = await dedupedFetch(
      `memes:${sort}:${tagKey}:${page}:${perPage}`,
      () =>
        prisma.meme.findMany({
          where,
          orderBy,
          skip: (page - 1) * perPage,
          take: perPage,
          include: memeInclude,
        }),
      FEED_TTL_MS,
    );
  } else {
    // "hot" ranks the whole set once, then slices per page. Previously every
    // request pulled every meme plus all of its votes and sorted in JS.
    const ranked = await dedupedFetch(
      `memes:hot:${tagKey}`,
      async () => {
        const all = await prisma.meme.findMany({ where, include: memeInclude });
        const now = Date.now();
        return all
          .map((m) => {
            const hours = (now - m.createdAt.getTime()) / (1000 * 60 * 60);
            const score = m.upvotes - m.downvotes;
            const hotScore = score / Math.pow(hours + 2, 1.5);
            return { ...m, _hotScore: hotScore };
          })
          .sort((a, b) => b._hotScore - a._hotScore);
      },
      FEED_TTL_MS,
    );
    memes = ranked.slice((page - 1) * perPage, page * perPage);
  }

  const total = await dedupedFetch(
    `memes:count:${tagKey}`,
    () => prisma.meme.count({ where }),
    FEED_TTL_MS,
  );

  // The feed is public: the visitor's own vote is fetched separately from
  // /api/viewer-state so this response can be served from the CDN cache.
  const res = NextResponse.json({
    items: memes,
    total,
    page,
    hasNextPage: page * perPage < total,
  });
  return withPublicCache(res);
}
export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, imageUrl, mediaTitle, tags } = await req.json();
  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Title and image URL are required" }, { status: 400 });
  }

  const meme = await prisma.meme.create({
    data: {
      userId: session.user.id,
      title,
      imageUrl,
      mediaTitle: mediaTitle || null,
      tags: tags || "",
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  invalidateCached("memes:");

  return NextResponse.json({ meme });
}
