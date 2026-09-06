import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "recent";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = Math.min(parseInt(searchParams.get("perPage") || "20"), 50);

  const where: Prisma.SceneClipWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { mediaTitle: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy = sort === "popular" ? { likes: "desc" as const } : { createdAt: "desc" as const };

  const [clips, total] = await Promise.all([
    prisma.sceneClip.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    }),
    prisma.sceneClip.count({ where }),
  ]);

  const session = await auth();
  let likedIds = new Set<string>();
  if (session?.user?.id) {
    const likes = await prisma.sceneClipLike.findMany({
      where: { userId: session.user.id, clipId: { in: clips.map((c) => c.id) } },
      select: { clipId: true },
    });
    likedIds = new Set(likes.map((l) => l.clipId));
  }

  return NextResponse.json(
    {
      clips: clips.map((c) => ({ ...c, likedByMe: likedIds.has(c.id) })),
      total,
      page,
      hasNextPage: page * perPage < total,
    },
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

  const { title, description, imageUrl, videoUrl, mediaTitle, mediaId, timestamp, tags } = await req.json();
  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields (title, imageUrl)" }, { status: 400 });
  }

  const clip = await prisma.sceneClip.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      imageUrl,
      videoUrl: videoUrl || null,
      mediaTitle: mediaTitle || null,
      mediaId: mediaId ? parseInt(mediaId) : null,
      timestamp: timestamp || null,
      tags: tags || "",
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ clip });
}
