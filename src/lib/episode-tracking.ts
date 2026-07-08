import { prisma } from "./prisma";

export async function markEpisodeWatched(userId: string, mediaId: number, episode: number, title?: string): Promise<void> {
  await prisma.episodeProgress.upsert({
    where: { userId_mediaId_episode: { userId, mediaId, episode } },
    update: { watchedAt: new Date(), title: title || null },
    create: { userId, mediaId, episode, title: title || null, watchedAt: new Date() },
  });
}

export async function markEpisodeUnwatched(userId: string, mediaId: number, episode: number): Promise<void> {
  await prisma.episodeProgress.deleteMany({
    where: { userId, mediaId, episode },
  });
}

export async function getEpisodeProgress(userId: string, mediaId: number): Promise<{ watched: number[]; total: number }> {
  const [entries, listEntry] = await Promise.all([
    prisma.episodeProgress.findMany({
      where: { userId, mediaId },
      select: { episode: true },
      orderBy: { episode: "asc" },
    }),
    prisma.listEntry.findUnique({
      where: { userId_mediaId: { userId, mediaId } },
      select: { total: true },
    }),
  ]);

  return {
    watched: entries.map((e) => e.episode),
    total: listEntry?.total || 0,
  };
}

export async function getRecentlyWatched(
  userId: string,
  limit = 20
): Promise<{ mediaId: number; episode: number; mediaTitle?: string; title?: string; watchedAt: Date }[]> {
  const episodes = await prisma.episodeProgress.findMany({
    where: { userId },
    orderBy: { watchedAt: "desc" },
    take: limit,
  });

  const mediaIds = [...new Set(episodes.map((e) => e.mediaId))];
  const listEntries = await prisma.listEntry.findMany({
    where: { userId, mediaId: { in: mediaIds } },
    select: { mediaId: true },
  });
  const titleMap = new Map(listEntries.map((e) => [e.mediaId, ""]));

  return episodes.map((e) => ({
    mediaId: e.mediaId,
    episode: e.episode,
    mediaTitle: titleMap.get(e.mediaId) || undefined,
    title: e.title || undefined,
    watchedAt: e.watchedAt,
  }));
}

export async function getWatchStreak(userId: string): Promise<{ current: number; longest: number }> {
  const episodes = await prisma.episodeProgress.findMany({
    where: { userId },
    select: { watchedAt: true },
    orderBy: { watchedAt: "desc" },
  });

  if (episodes.length === 0) return { current: 0, longest: 0 };

  const dates = [...new Set(episodes.map((e) => e.watchedAt.toISOString().split("T")[0]))].sort().reverse();

  let current = 1;
  let longest = 1;
  let streak = 1;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dates[0] !== today && dates[0] !== yesterday) {
    current = 0;
  }

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;

    if (diffDays === 1) {
      streak++;
      longest = Math.max(longest, streak);
      if (i === 1) current = streak;
    } else {
      streak = 1;
    }
  }

  return { current, longest };
}

export async function autoUpdateListEntry(userId: string, mediaId: number, totalEpisodes: number): Promise<void> {
  const watchedCount = await prisma.episodeProgress.count({
    where: { userId, mediaId },
  });

  const existing = await prisma.listEntry.findUnique({
    where: { userId_mediaId: { userId, mediaId } },
  });

  if (watchedCount === 0 && !existing) return;

  if (totalEpisodes > 0 && watchedCount >= totalEpisodes) {
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: { status: "COMPLETED", progress: watchedCount, completedAt: new Date() },
      create: { userId, mediaId, type: "ANIME", status: "COMPLETED", progress: watchedCount, total: totalEpisodes, completedAt: new Date() },
    });
  } else if (watchedCount > 0) {
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: { status: existing?.status === "COMPLETED" ? "COMPLETED" : "CURRENT", progress: watchedCount },
      create: { userId, mediaId, type: "ANIME", status: "CURRENT", progress: watchedCount, total: totalEpisodes },
    });
  }
}
