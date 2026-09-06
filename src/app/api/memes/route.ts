import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
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

  let memes;
  if (sort === "new") {
    memes = await prisma.meme.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        votes: { select: { value: true } },
      },
    });
  } else if (sort === "top") {
    memes = await prisma.meme.findMany({
      where,
      orderBy: [{ upvotes: "desc" }, { downvotes: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        votes: { select: { value: true } },
      },
    });
  } else {
    const all = await prisma.meme.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        votes: { select: { value: true } },
      },
    });
    const now = Date.now();
    memes = all
      .map((m) => {
        const hours = (now - m.createdAt.getTime()) / (1000 * 60 * 60);
        const score = m.upvotes - m.downvotes;
        const hotScore = score / Math.pow(hours + 2, 1.5);
        return { ...m, _hotScore: hotScore };
      })
      .sort((a, b) => b._hotScore - a._hotScore)
      .slice((page - 1) * perPage, page * perPage);
  }

  const total = await prisma.meme.count({ where });

  const session = await auth();
  const userId = session?.user?.id;
  let idToUserVote = new Map<string, number>();
  if (userId && memes.length > 0) {
    const mine = await prisma.memeVote.findMany({
      where: { userId, memeId: { in: memes.map((m) => m.id) } },
      select: { memeId: true, value: true },
    });
    idToUserVote = new Map(mine.map((v) => [v.memeId, v.value]));
  }

  const items = memes.map((m) => ({ ...m, userVote: idToUserVote.get(m.id) ?? 0 }));

  return NextResponse.json({
    items,
    total,
    page,
    hasNextPage: page * perPage < total,
  });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
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

  return NextResponse.json({ meme });
}
