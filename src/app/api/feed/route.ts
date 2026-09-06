import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllRSSNews } from "@/lib/news";
import type { FeedCard } from "@/lib/feed";

export const revalidate = 900;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(24, Math.max(6, parseInt(searchParams.get("perPage") || "12", 10) || 12));

  const take = 40;

  const [memes, reels, moments, fanArts, cosplays, blogPosts] = await Promise.all([
    prisma.meme.findMany({
      where: {},
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, title: true, imageUrl: true, mediaTitle: true, createdAt: true, user: { select: { username: true, avatar: true } } },
    }),
    prisma.reel.findMany({
      where: {},
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, caption: true, videoUrl: true, thumbnailUrl: true, createdAt: true, user: { select: { username: true, avatar: true } } },
    }),
    prisma.moment.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, quote: true, character: true, animeTitle: true, animeCover: true, createdAt: true, user: { select: { username: true, avatar: true } } },
    }),
    prisma.fanArt.findMany({
      where: {},
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, title: true, description: true, imageUrl: true, createdAt: true, user: { select: { username: true, avatar: true } } },
    }),
    prisma.cosplay.findMany({
      where: {},
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, title: true, description: true, imageUrl: true, createdAt: true, user: { select: { username: true, avatar: true } } },
    }),
    prisma.blogPost.findMany({
      where: { isDraft: false, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, title: true, excerpt: true, coverImage: true, slug: true, createdAt: true, user: { select: { username: true, avatar: true } } },
    }),
  ]);

  let news: Awaited<ReturnType<typeof getAllRSSNews>> = [];
  try {
    news = await getAllRSSNews();
  } catch { /* keep empty */ }

  const cards: FeedCard[] = [];
  for (const m of memes) {
    cards.push({
      id: `meme-${m.id}`, type: "MEME", title: m.title || m.mediaTitle || "Meme",
      image: m.imageUrl, href: "/memes",
      author: m.user ?? null, createdAt: m.createdAt.toISOString(),
    });
  }
  for (const r of reels) {
    cards.push({
      id: `reel-${r.id}`, type: "REEL", title: r.caption || "Reel",
      image: r.thumbnailUrl, video: r.videoUrl, href: `/reels/${r.id}`,
      author: r.user ?? null, createdAt: r.createdAt.toISOString(),
    });
  }
  for (const mt of moments) {
    cards.push({
      id: `moment-${mt.id}`, type: "MOMENT",
      title: mt.quote || "Moment",
      body: mt.character ? `${mt.character}${mt.animeTitle ? ` — ${mt.animeTitle}` : ""}` : null,
      image: mt.animeCover, href: `/moments/${mt.id}`,
      author: mt.user ?? null, createdAt: mt.createdAt.toISOString(),
    });
  }
  for (const fa of fanArts) {
    cards.push({
      id: `fanart-${fa.id}`, type: "FANART", title: fa.title || "Fan Art",
      body: fa.description, image: fa.imageUrl, href: `/fanart/${fa.id}`,
      author: fa.user ?? null, createdAt: fa.createdAt.toISOString(),
    });
  }
  for (const c of cosplays) {
    cards.push({
      id: `cosplay-${c.id}`, type: "COSPLAY", title: c.title || "Cosplay",
      body: c.description, image: c.imageUrl, href: `/cosplay/${c.id}`,
      author: c.user ?? null, createdAt: c.createdAt.toISOString(),
    });
  }
  for (const b of blogPosts) {
    cards.push({
      id: `blog-${b.id}`, type: "BLOG", title: b.title,
      body: b.excerpt, image: b.coverImage, href: `/blog/${b.slug}`,
      author: b.user ?? null, createdAt: b.createdAt.toISOString(),
    });
  }
  for (const n of news.slice(0, 40)) {
    cards.push({
      id: `news-${n.id}`, type: "NEWS", title: n.title,
      body: n.summary, image: n.image || null, href: `/news/${n.id}`,
      author: null, createdAt: new Date(n.publishedAt).toISOString(),
    });
  }

  cards.sort((a, b) => (b.createdAt < a.createdAt ? -1 : b.createdAt > a.createdAt ? 1 : 0));

  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const items = cards.slice(start, start + perPage);

  return NextResponse.json({
    items,
    page,
    perPage,
    total,
    hasNextPage: page < totalPages,
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
