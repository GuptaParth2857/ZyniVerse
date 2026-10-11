import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

const SUBS = ["animemes", "goodanimemes", "anime_memes", "animefunny"];
const CACHE_MS = 90_000;

const cache = new Map<string, { items: unknown[]; ts: number }>();

function jankyId(postLink: string) {
  const m = postLink.match(/(?:redd\.it|reddit\.com)\/([\w]+)/);
  return m ? m[1] : postLink.replace(/[^A-Za-z0-9]/g, "").slice(0, 24);
}

async function dbFallback(count: number): Promise<unknown[]> {
  try {
    const rows = await prisma.meme.findMany({
      orderBy: { upvotes: "desc" },
      take: count,
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
    return rows.map((m) => ({
      id: m.id,
      title: m.title,
      imageUrl: m.imageUrl,
      mediaTitle: m.mediaTitle,
      tags: m.tags,
      upvotes: m.upvotes,
      downvotes: m.downvotes,
      commentCount: m.commentCount,
      userVote: 0,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
      live: false,
    }));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { searchParams } = new URL(req.url);
  const count = Math.min(Math.max(parseInt(searchParams.get("count") || "10", 10), 1), 24);

  const cacheKey = `live:${count}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_MS) {
    return NextResponse.json({ items: hit.items, cached: true });
  }

  const items: unknown[] = [];
  const seen = new Set<string>();
  const targetSubs = [...SUBS].sort(() => Math.random() - 0.5);

  outer: for (let i = 0; i < targetSubs.length && items.length < count; i++) {
    for (let attempt = 0; attempt < 6 && items.length < count; attempt++) {
      try {
        const res = await fetch(`https://meme-api.com/gimme/${targetSubs[i]}`, {
          headers: { "User-Agent": "ZyniVerse/1.0 (https://zyverse.in)" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) break;
        const j = await res.json();
        const url: string = j?.url || "";
        if (!url.startsWith("https://i.") || seen.has(url)) continue;
        seen.add(url);
        items.push({
          id: `live_${jankyId(j.postLink || url)}_${Date.now()}`,
          title: (j.title || "Anime meme").slice(0, 140),
          imageUrl: url,
          mediaTitle: null,
          tags: "meme,funny",
          // Real Reddit upvote count from meme-api; downvotes/comments are not
          // exposed by the source, so report 0 rather than inventing numbers.
          upvotes: typeof j.ups === "number" ? j.ups : 0,
          downvotes: 0,
          commentCount: 0,
          userVote: 0,
          createdAt: new Date(Date.now() - items.length * 4 * 60_000).toISOString(),
          user: { id: "reddit-live", username: "sakuga.feed", avatar: null },
          live: true,
        });
      } catch {
        break;
      }
    }
  }

  if (items.length === 0) {
    const fallback = await dbFallback(count);
    if (fallback.length === 0) {
      return NextResponse.json({ items: [], error: "Could not reach meme feed right now" }, { status: 502 });
    }
    cache.set(cacheKey, { items: fallback, ts: Date.now() });
    return NextResponse.json({ items: fallback, cached: false, fallback: true });
  }

  cache.set(cacheKey, { items, ts: Date.now() });
  return NextResponse.json({ items, cached: false });
}