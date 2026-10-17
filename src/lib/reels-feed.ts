import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Shared reels feed loader used by both `/api/reels` and the SSR `/reels`
 * page. The Supabase pooler is remote (ap-northeast-1), so every Prisma
 * round-trip costs hundreds of ms to seconds. This module:
 *
 *  - single-flights concurrent identical requests,
 *  - caches each result in-process for a short TTL (writers call
 *    {@link invalidateReelsFeed}),
 *  - keeps the query chain short (page content in 2 dependency steps).
 */

export interface ReelsFeedReel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  duration: number;
  views: number;
  animeId: number | null;
  animeTitle: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  likedBy: { id: string; username: string; avatar: string | null }[];
  user: {
    id: string;
    username: string;
    avatar: string | null;
    followedByMe: boolean;
  };
}

export interface ReelsFeedPayload {
  reels: ReelsFeedReel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReelsFeedParams {
  page: number;
  limit: number;
  userId?: string | null;
  username?: string | null;
  sort?: string | null;
  following?: boolean;
  viewerId?: string | null;
}

type LikerRow = {
  reelId: string;
  id: string;
  username: string;
  avatar: string | null;
};

// 30s: the remote pooler makes an uncached feed cost 2 sequential round-trips,
// and writers invalidate this cache explicitly (`invalidateReelsFeed`), so a
// longer window only risks a viewer seeing a slightly stale like/comment count.
const CACHE_TTL_MS = 30_000;

interface Slot {
  body: ReelsFeedPayload;
  expiresAt: number;
}

const slots = new Map<string, Slot>();
const inflight = new Map<string, Promise<ReelsFeedPayload>>();

export function invalidateReelsFeed(): void {
  slots.clear();
  inflight.clear();
}

export async function getReelsFeed(
  params: ReelsFeedParams,
): Promise<ReelsFeedPayload> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(30, Math.max(1, params.limit || 10));
  const sort = params.sort === "popular" ? "popular" : "newest";
  const key = JSON.stringify({
    page,
    limit,
    sort,
    userId: params.userId ?? null,
    username: params.username ?? null,
    following: params.following === true,
    viewerId: params.viewerId ?? null,
  });

  const now = Date.now();
  const slot = slots.get(key);
  if (slot && slot.expiresAt > now) return slot.body;

  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = loadReelsFeed({ ...params, page, limit, sort }).then(
    (body) => {
      slots.set(key, { body, expiresAt: Date.now() + CACHE_TTL_MS });
      return body;
    },
  );
  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

async function loadReelsFeed(
  params: ReelsFeedParams & { page: number; limit: number; sort: string },
): Promise<ReelsFeedPayload> {
  const { page, limit, sort, userId, username, following, viewerId } = params;

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (username) where.user = { username };
  if (!userId && !username && following && viewerId) {
    const followed = await prisma.follow.findMany({
      where: { followerId: viewerId },
      select: { followingId: true },
    });
    where.userId = { in: followed.map((f) => f.followingId) };
  }

  const orderBy =
    sort === "popular"
      ? { views: "desc" as const }
      : { createdAt: "desc" as const };

  const [reels, total] = await Promise.all([
    prisma.reel.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.reel.count({ where }),
  ]);

  const reelIds = reels.map((r) => r.id);
  const creatorIds = [...new Set(reels.map((r) => r.userId).filter(Boolean))];
  const reelsWithLikes = reels.filter((r) => r._count.likes > 0);

  // Instagram-style like preview: first few likers per reel, people the viewer
  // follows bubble to the front. One windowed query (no N+1).
  // Step 2 runs my-likes, liker previews and creator follow-status in parallel
  // so the remote DB is touched only once per dependency level.
  const [myLikeRows, likeRows, creatorFollowRows] = await Promise.all([
    viewerId && reelIds.length > 0
      ? prisma.reelLike.findMany({
          where: { userId: viewerId, reelId: { in: reelIds } },
          select: { reelId: true },
        })
      : Promise.resolve([] as { reelId: string }[]),
    reelsWithLikes.length > 0
      ? prisma.$queryRaw<LikerRow[]>`
          SELECT * FROM (
            SELECT
              rl."reelId",
              u.id,
              u.username,
              u.avatar,
              ROW_NUMBER() OVER (PARTITION BY rl."reelId" ORDER BY rl."createdAt" ASC) AS rn
            FROM "ReelLike" rl
            JOIN "User" u ON u.id = rl."userId"
            WHERE rl."reelId" IN (${Prisma.join(reelsWithLikes.map((r) => r.id))})
          ) t
          WHERE rn <= 3
        `
      : Promise.resolve([] as LikerRow[]),
    viewerId && creatorIds.length > 0
      ? prisma.follow.findMany({
          where: { followerId: viewerId, followingId: { in: creatorIds } },
          select: { followingId: true },
        })
      : Promise.resolve([] as { followingId: string }[]),
  ]);

  const likedReelIds = new Set(myLikeRows.map((l) => l.reelId));
  const followedByMeIds = new Set(creatorFollowRows.map((f) => f.followingId));

  const likePreviews = new Map<
    string,
    Array<{ id: string; username: string; avatar: string | null }>
  >();
  for (const row of likeRows) {
    const list = likePreviews.get(row.reelId);
    if (list) {
      list.push({ id: row.id, username: row.username, avatar: row.avatar });
    } else {
      likePreviews.set(row.reelId, [
        { id: row.id, username: row.username, avatar: row.avatar },
      ]);
    }
  }
  if (viewerId && likeRows.length > 0) {
    const allLikerIds = [...new Set(likeRows.map((r) => r.id))];
    const followedLikers = await prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: allLikerIds } },
      select: { followingId: true },
    });
    const followedSet = new Set(followedLikers.map((f) => f.followingId));
    for (const [reelId, list] of likePreviews) {
      likePreviews.set(reelId, [
        ...list.filter((u) => followedSet.has(u.id)),
        ...list.filter((u) => !followedSet.has(u.id)),
      ]);
    }
  }

  const reelsOut: ReelsFeedReel[] = reels.map((r) => ({
    id: r.id,
    videoUrl: r.videoUrl,
    thumbnailUrl: r.thumbnailUrl,
    caption: r.caption,
    duration: r.duration,
    views: r.views,
    animeId: r.animeId,
    animeTitle: r.animeTitle,
    createdAt: r.createdAt.toISOString(),
    likesCount: r._count.likes,
    commentsCount: r._count.comments,
    likedByMe: likedReelIds.has(r.id),
    likedBy: likePreviews.get(r.id) || [],
    user: { ...r.user, followedByMe: followedByMeIds.has(r.userId) },
  }));

  return {
    reels: reelsOut,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
