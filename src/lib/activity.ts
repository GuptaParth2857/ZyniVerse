import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { logError } from "@/lib/logger";

const AL_ENDPOINT = "https://graphql.anilist.co";
const AL_CACHE = new Map<number, { title: string; image: string }>();
const AL_TITLE_CACHE = new Map<string, { id: number; title: string; image: string } | null>();
const AL_CACHE_TTL = 30 * 60 * 1000;
const AL_CACHE_TIME = new Map<number, number>();

function gql(query: string, vars: Record<string, unknown>) {
  return fetch(AL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ query, variables: vars }),
  }).then((r) => {
    if (r.status === 429) throw new Error("Rate limited by AniList");
    return r.json();
  }).then((d) => d.data);
}

const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MEDIA_COVER_QUERY = `
  query ($ids: [Int]) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME) {
        id
        title { romaji english userPreferred }
        coverImage { extraLarge large medium }
      }
    }
  }
`;

const MEDIA_SEARCH_QUERY = `
  query ($search: String) {
    Page(page: 1, perPage: 1) {
      media(search: $search, type: ANIME) {
        id
        title { romaji english userPreferred }
        coverImage { extraLarge large medium }
      }
    }
  }
`;

async function fetchMediaBatch(ids: number[]): Promise<void> {
  const now = Date.now();
  const uncached = ids.filter((id) => !AL_CACHE_TIME.has(id) || now - AL_CACHE_TIME.get(id)! > AL_CACHE_TTL);
  if (uncached.length === 0) return;

  try {
    const data = await gql(MEDIA_COVER_QUERY, { ids: uncached });
    const mediaList = data?.Page?.media as Array<{ id: number; title: { romaji?: string; english?: string; userPreferred?: string }; coverImage: { extraLarge?: string; large?: string; medium?: string } }> | undefined;
    if (mediaList) {
      for (const m of mediaList) {
        const title = m.title?.english || m.title?.romaji || m.title?.userPreferred || "Unknown";
        const image = m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || "";
        AL_CACHE.set(m.id, { title, image });
        AL_CACHE_TIME.set(m.id, now);
      }
    }
  } catch (e) { logError(e); }
}

export async function enrichActivities<T extends { mediaId: number | null; mediaTitle: string | null; mediaImage: string | null }>(activities: T[]): Promise<T[]> {
  const ids = activities.filter((a) => a.mediaId && !a.mediaImage).map((a) => a.mediaId!);
  if (ids.length > 0) await fetchMediaBatch(ids);

  const enriched = activities.map((a) => {
    if (!a.mediaImage && a.mediaId && AL_CACHE.has(a.mediaId)) {
      const resolved = AL_CACHE.get(a.mediaId)!;
      return { ...a, mediaImage: resolved.image, mediaTitle: a.mediaTitle || resolved.title };
    }
    return a;
  });

  const missing = enriched.filter((a) => !a.mediaImage && a.mediaTitle);
  if (missing.length === 0) return enriched;

  // For WATCH_PARTY activities, look up the party's cover image from DB
  const partyIds = missing
    .filter((a) => (a as Record<string, unknown>).type === "WATCH_PARTY")
    .map((a) => {
      const msg = (a as Record<string, unknown>).message as string | null;
      const match = msg?.match(/\[PARTY:([^\]]+)\]/);
      return match ? match[1] : null;
    })
    .filter(Boolean) as string[];

  if (partyIds.length > 0) {
    const parties = await prisma.watchParty.findMany({
      where: { id: { in: partyIds } },
      select: { id: true, coverImage: true, mediaImage: true },
    });
    const partyMap = new Map(parties.map((p) => [p.id, p.coverImage || p.mediaImage]));
    for (const a of missing) {
      const msg = (a as Record<string, unknown>).message as string | null;
      const match = msg?.match(/\[PARTY:([^\]]+)\]/);
      if (match) {
        const img = partyMap.get(match[1]);
        if (img) (a as Record<string, unknown>).mediaImage = img;
      }
    }
  }

  // Still missing? Try title search fallback on AniList
  const stillMissing = enriched.filter((a) => !a.mediaImage && a.mediaTitle);
  if (stillMissing.length === 0) return enriched;

  const seen = new Set<string>();
  for (const a of stillMissing) {
    const key = a.mediaTitle!.toLowerCase().trim();
    if (key.length < 2) continue;

    if (!seen.has(key)) {
      seen.add(key);

      const cached = AL_TITLE_CACHE.get(key);
      if (cached === undefined) {
        try {
          await SLEEP(350);
          const data = await gql(MEDIA_SEARCH_QUERY, { search: a.mediaTitle });
          const m = data?.Page?.media?.[0] as { id: number; title: { romaji?: string; english?: string; userPreferred?: string }; coverImage: { extraLarge?: string; large?: string; medium?: string } } | undefined;
          if (m) {
            const title = m.title?.english || m.title?.romaji || m.title?.userPreferred || "Unknown";
            const image = m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || "";
            AL_CACHE.set(m.id, { title, image });
            AL_CACHE_TIME.set(m.id, Date.now());
            AL_TITLE_CACHE.set(key, { id: m.id, title, image });
          } else {
            AL_TITLE_CACHE.set(key, null);
          }
        } catch (e) { logError(e); }
      }
    }

    const result = AL_TITLE_CACHE.get(key);
    if (result) {
      (a as Record<string, unknown>).mediaImage = result.image;
      (a as Record<string, unknown>).mediaTitle = result.title;
      (a as Record<string, unknown>).mediaId = result.id;
    }
  }

  return enriched;
}

export interface ActivityCreate {
  userId: string;
  type: string;
  mediaId?: number;
  mediaTitle?: string;
  mediaImage?: string;
  message?: string;
}

export async function createActivity(data: ActivityCreate) {
  const activity = await prisma.activity.create({ data });

  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: data.userId },
      select: { followerId: true },
    });

    for (const follower of followers) {
      await createNotification({
        userId: follower.followerId,
        type: "ACTIVITY",
        title: "New Activity",
        body: data.message || `${data.type} activity`,
        link: "/activity",
      });
    }
  } catch (e) { logError(e); }

  return activity;
}

export async function getActivityFeed(userId: string, limit = 20, offset = 0) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = follows.map((f) => f.followingId);
  if (followingIds.length === 0) return [];

  const rawActivities = await prisma.activity.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });
  return rawActivities.filter((a) => a.user !== null);
}

export async function getUserActivity(userId: string, limit = 20, offset = 0) {
  const rawActivities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });
  return rawActivities.filter((a) => a.user !== null);
}
