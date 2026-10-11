import { prisma } from "./prisma";
import { getAllRSSNews } from "./news";
import type { Prisma } from "@prisma/client";

export type FeedItemType =
  | "POST"
  | "MOMENT"
  | "REEL"
  | "MEME"
  | "CLIP"
  | "FANART"
  | "COSPLAY"
  | "WALLPAPER"
  | "BLOG"
  | "NEWS";

export interface FeedAuthor {
  id?: string;
  username: string;
  avatar?: string | null;
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  body?: string | null;
  image?: string | null;
  video?: string | null;
  href: string;
  author?: FeedAuthor | null;
  createdAt: string;
  /** Rank score (higher = more relevant right now). */
  score: number;
  /** Composite engagement signal used for ranking. */
  engagement: number;
  likes?: number | null;
  views?: number | null;
  mediaId?: number | null;
}

/** Legacy alias kept for components that consume the previous shape. */
export type FeedCard = FeedItem;

export type FeedMode = "foryou" | "following";

export interface FeedQuery {
  userId?: string;
  mode?: FeedMode;
  /** ISO createdAt cursor — only include items published before this time. */
  cursor?: string;
  limit?: number;
}

export interface FeedResult {
  items: FeedItem[];
  nextCursor: string | null;
}

/**
 * Older content gets slightly less weight; 16h half-life keeps the feed fresh
 * without nuking a great binge-worthy clip just because it's a day old.
 */
const TYPE_WEIGHT: Record<FeedItemType, number> = {
  POST: 1.0,
  MOMENT: 1.0,
  REEL: 1.15,
  MEME: 0.95,
  CLIP: 1.0,
  FANART: 0.9,
  COSPLAY: 0.9,
  WALLPAPER: 0.7,
  BLOG: 1.2,
  NEWS: 1.35,
};

/** How many of the latest rows we pull per content type before ranking. */
const FETCH_LIMIT = 120;

/** Hard cap on the number of items returned in a single call. */
const LIMIT_CAP = 760;

interface RawItem {
  id: string;
  type: FeedItemType;
  title: string;
  body?: string | null;
  image?: string | null;
  video?: string | null;
  href: string;
  author?: FeedAuthor | null;
  createdAt: Date;
  engagement: number;
  likes?: number | null;
  views?: number | null;
  mediaId?: number | null;
}

interface RankContext {
  followed: Set<string>;
  mediaAffinity: Set<number>;
}

function rankItem(item: RawItem, ctx: RankContext): FeedItem {
  const ageHours = Math.max(0, (Date.now() - item.createdAt.getTime()) / 3_600_000);
  const recency = 1 / Math.pow(1 + ageHours / 16, 1.5);
  const engagementBoost = 1 + Math.log2(1 + item.engagement);
  let score = recency * engagementBoost * TYPE_WEIGHT[item.type];

  // Personalization: content from people you follow and titles you've
  // actually engaged with get a real boost in the "For You" feed.
  if (item.author?.id && ctx.followed.has(item.author.id)) score *= 3;
  if (item.mediaId && ctx.mediaAffinity.has(item.mediaId)) score *= 2.2;

  return {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    image: item.image,
    video: item.video,
    href: item.href,
    author: item.author ?? null,
    createdAt: item.createdAt.toISOString(),
    score,
    engagement: item.engagement,
    likes: item.likes ?? null,
    views: item.views ?? null,
    mediaId: item.mediaId ?? null,
  };
}

/**
 * Greedy type-interleaver. Keeps a single content type (memes, reels, ...)
 * from drowning the feed: after a type is picked it cools down, so the next
 * pick tends to come from a different type — while raw score still decides
 * the winner once the cooling wears off.
 */
function interleave(items: FeedItem[]): FeedItem[] {
  if (items.length < 2) return items;
  const groups = new Map<FeedItemType, FeedItem[]>();
  for (const item of items) {
    const arr = groups.get(item.type);
    if (arr) arr.push(item);
    else groups.set(item.type, [item]);
  }
  for (const arr of groups.values()) arr.sort((a, b) => b.score - a.score);

  const ptr = new Map<FeedItemType, number>();
  const lastPick = new Map<FeedItemType, number>();
  for (const t of groups.keys()) {
    ptr.set(t, 0);
    lastPick.set(t, -50);
  }

  const out: FeedItem[] = [];
  let round = 0;
  while (out.length < items.length) {
    let bestType: FeedItemType | null = null;
    let bestValue = -Infinity;
    for (const [t, arr] of groups) {
      const idx = ptr.get(t)!;
      if (idx >= arr.length) continue;
      const sincePick = round - lastPick.get(t)!;
      const value = arr[idx].score * Math.pow(1.7, sincePick);
      if (value > bestValue) {
        bestValue = value;
        bestType = t;
      }
    }
    if (bestType === null) break;
    const idx = ptr.get(bestType)!;
    out.push(groups.get(bestType)![idx]);
    ptr.set(bestType, idx + 1);
    lastPick.set(bestType, round);
    round += 1;
  }
  return out;
}

export function clampFeedLimit(limit: number): number {
  return Math.max(1, Math.min(LIMIT_CAP, Math.trunc(limit) || 20));
}

export function parseFeedCursor(cursor?: string): Date | undefined {
  if (!cursor) return undefined;
  const t = Date.parse(cursor);
  return Number.isNaN(t) ? undefined : new Date(t);
}

/**
 * Builds the unified, ranked feed.
 *
 * - `foryou`: everything ranked by recency × engagement, boosted for followed
 *   authors and titles the user engaged with.
 * - `following`: only content from people the user follows.
 *
 * Deterministic per (mode, cursor, corpus), so cursor pagination is safe.
 */
export async function getUnifiedFeed(q: FeedQuery = {}): Promise<FeedResult> {
  const limit = clampFeedLimit(q.limit ?? 20);
  const cursorDate = parseFeedCursor(q.cursor);
  const isFollowing = q.mode === "following";

  // ── Personalization context ──────────────────────────────────────────────
  let followedIds: string[] = [];
  let mediaAffinity = new Set<number>();
  if (q.userId) {
    const [follows, recent] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: q.userId },
        select: { followingId: true },
        take: 600,
      }),
      prisma.userActivity.findMany({
        where: { userId: q.userId, mediaId: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 300,
        select: { mediaId: true },
      }),
    ]);
    followedIds = follows.map((f) => f.followingId);
    mediaAffinity = new Set(recent.map((a) => a.mediaId as number));
  }
  const ctx: RankContext = { followed: new Set(followedIds), mediaAffinity };

  // `in: []` returns zero rows, so "following" with no follows = empty feed.
  // `lte` (not `lt`): Postgres stores microseconds but JS Dates truncate on
  // serialization, so an `lt` cursor would silently leak same-millisecond rows.
  // The client dedupes by id, making `lte` + dedupe gap-free.
  const timeFilter = cursorDate ? { createdAt: { lte: cursorDate } } : {};
  const authorFilter = isFollowing ? { userId: { in: followedIds } } : {};

  // ── Parallel corpus fetch ────────────────────────────────────────────────
  const [posts, moments, reels, memes, clips, fanarts, cosplays, wallpapers, blogs, news] =
    await Promise.all([
      prisma.post.findMany({
        where: { ...timeFilter, ...authorFilter } as Prisma.PostWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          mediaId: true,
          createdAt: true,
          author: { select: { id: true, username: true, avatar: true } },
          _count: { select: { comments: true, savedBy: true } },
        },
      }),
      prisma.moment.findMany({
        where: { isPublic: true, ...timeFilter, ...authorFilter } as Prisma.MomentWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          quote: true,
          character: true,
          animeTitle: true,
          animeCover: true,
          animeId: true,
          likesCount: true,
          viewsCount: true,
          createdAt: true,
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.reel.findMany({
        where: { ...timeFilter, ...authorFilter } as Prisma.ReelWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          caption: true,
          videoUrl: true,
          thumbnailUrl: true,
          views: true,
          createdAt: true,
          user: { select: { id: true, username: true, avatar: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.meme.findMany({
        where: { ...timeFilter, ...authorFilter } as Prisma.MemeWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          title: true,
          imageUrl: true,
          mediaTitle: true,
          upvotes: true,
          downvotes: true,
          commentCount: true,
          createdAt: true,
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.sceneClip.findMany({
        where: { ...timeFilter, ...authorFilter } as Prisma.SceneClipWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          videoUrl: true,
          mediaId: true,
          likes: true,
          views: true,
          createdAt: true,
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.fanArt.findMany({
        where: { ...timeFilter, ...authorFilter } as Prisma.FanArtWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          animeId: true,
          likes: true,
          createdAt: true,
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.cosplay.findMany({
        where: { ...timeFilter, ...authorFilter } as Prisma.CosplayWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          animeId: true,
          likes: true,
          createdAt: true,
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.wallpaper.findMany({
        where: { ...timeFilter, ...authorFilter } as Prisma.WallpaperWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          animeId: true,
          likes: true,
          downloads: true,
          createdAt: true,
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.blogPost.findMany({
        where: {
          isDraft: false,
          isDeleted: false,
          ...timeFilter,
          ...authorFilter,
        } as Prisma.BlogPostWhereInput,
        orderBy: { createdAt: "desc" },
        take: FETCH_LIMIT,
        select: {
          id: true,
          title: true,
          excerpt: true,
          coverImage: true,
          slug: true,
          viewCount: true,
          likeCount: true,
          createdAt: true,
          user: { select: { id: true, username: true, avatar: true } },
          _count: { select: { comments: true } },
        },
      }),
      isFollowing
        ? Promise.resolve([] as Awaited<ReturnType<typeof getAllRSSNews>>)
        : getAllRSSNews().catch(() => []),
    ]);

  // ── Normalize into scored feed items ─────────────────────────────────────
  const raw: RawItem[] = [];
  for (const p of posts)
    raw.push({
      id: `post-${p.id}`,
      type: "POST",
      title: p.title,
      body: p.content,
      image: p.image,
      href: `/posts/${p.id}`,
      author: p.author,
      createdAt: p.createdAt,
      engagement: p._count.comments + p._count.savedBy * 2,
      mediaId: p.mediaId,
    });
  for (const m of moments)
    raw.push({
      id: `moment-${m.id}`,
      type: "MOMENT",
      title: m.quote || "Moment",
      body: m.character ? `${m.character}${m.animeTitle ? ` — ${m.animeTitle}` : ""}` : null,
      image: m.animeCover,
      href: `/moments/${m.id}`,
      author: m.user,
      createdAt: m.createdAt,
      engagement: m.likesCount + Math.round(m.viewsCount * 0.1),
      likes: m.likesCount,
      views: m.viewsCount,
      mediaId: m.animeId,
    });
  for (const r of reels)
    raw.push({
      id: `reel-${r.id}`,
      type: "REEL",
      title: r.caption || "Reel",
      image: r.thumbnailUrl,
      video: r.videoUrl,
      href: `/reels/${r.id}`,
      author: r.user,
      createdAt: r.createdAt,
      engagement: r.views + r._count.likes * 2 + r._count.comments * 3,
      likes: r._count.likes,
      views: r.views,
    });
  for (const me of memes)
    raw.push({
      id: `meme-${me.id}`,
      type: "MEME",
      title: me.title || me.mediaTitle || "Meme",
      image: me.imageUrl,
      href: "/memes",
      author: me.user,
      createdAt: me.createdAt,
      engagement: Math.max(0, me.upvotes - me.downvotes) + me.commentCount * 1.5,
      likes: me.upvotes,
    });
  for (const c of clips)
    raw.push({
      id: `clip-${c.id}`,
      type: "CLIP",
      title: c.title || "Clip",
      body: c.description,
      image: c.imageUrl,
      video: c.videoUrl,
      href: "/clips",
      author: c.user,
      createdAt: c.createdAt,
      engagement: c.likes + Math.round(c.views * 0.1),
      likes: c.likes,
      views: c.views,
      mediaId: c.mediaId,
    });
  for (const f of fanarts)
    raw.push({
      id: `fanart-${f.id}`,
      type: "FANART",
      title: f.title || "Fan Art",
      body: f.description,
      image: f.imageUrl,
      href: `/fanart/${f.id}`,
      author: f.user,
      createdAt: f.createdAt,
      engagement: f.likes,
      likes: f.likes,
      mediaId: f.animeId,
    });
  for (const cp of cosplays)
    raw.push({
      id: `cosplay-${cp.id}`,
      type: "COSPLAY",
      title: cp.title || "Cosplay",
      body: cp.description,
      image: cp.imageUrl,
      href: `/cosplay/${cp.id}`,
      author: cp.user,
      createdAt: cp.createdAt,
      engagement: cp.likes,
      likes: cp.likes,
      mediaId: cp.animeId,
    });
  for (const w of wallpapers)
    raw.push({
      id: `wallpaper-${w.id}`,
      type: "WALLPAPER",
      title: w.title || "Wallpaper",
      body: w.description,
      image: w.imageUrl,
      href: "/wallpapers",
      author: w.user,
      createdAt: w.createdAt,
      engagement: w.likes + w.downloads,
      likes: w.likes,
      mediaId: w.animeId,
    });
  for (const b of blogs)
    raw.push({
      id: `blog-${b.id}`,
      type: "BLOG",
      title: b.title,
      body: b.excerpt,
      image: b.coverImage,
      href: `/blog/${b.slug}`,
      author: b.user,
      createdAt: b.createdAt,
      engagement: b.viewCount + b.likeCount * 2 + b._count.comments * 3,
      likes: b.likeCount,
      views: b.viewCount,
    });
  for (const n of news) {
    const publishedAt = new Date(n.publishedAt);
    if (cursorDate && publishedAt.getTime() > cursorDate.getTime()) continue;
    raw.push({
      id: `news-${n.id}`,
      type: "NEWS",
      title: n.title,
      body: n.summary,
      image: n.image || null,
      href: `/news/${n.id}`,
      author: null,
      createdAt: publishedAt,
      engagement: 0,
    });
  }

  // ── Rank, interleave for variety, then paginate ──────────────────────────
  const ranked = raw.map((item) => rankItem(item, ctx));
  const interleaved = interleave(ranked);
  const items = interleaved.slice(0, limit);

  return {
    items,
    nextCursor: items.length === limit ? items[items.length - 1].createdAt : null,
  };
}