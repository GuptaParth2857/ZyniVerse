import { prisma } from "./prisma";
import { simklFetchAllAnime, toZyniverseStatus, type SimklAnimeItem } from "./simkl-client";

export type SyncSummary = {
  imported: number;
  updated: number;
  episodes: number;
  skipped: number;
  totalFetched: number;
  activities?: Record<string, string> | null;
};

export async function runSimklSync(userId: string, accessToken: string): Promise<SyncSummary> {
  const { items, activities } = await simklFetchAllAnime(accessToken);

  const summary: SyncSummary = {
    imported: 0,
    updated: 0,
    episodes: 0,
    skipped: 0,
    totalFetched: items.length,
    activities,
  };

  const now = new Date();

  for (const item of items) {
    const anilistId = Number(item.ids?.anilist);
    if (!Number.isInteger(anilistId) || anilistId <= 0) {
      summary.skipped += 1;
      continue;
    }

    const mediaId = anilistId;
    const simklStatus = item.status || "plantowatch";
    const status = toZyniverseStatus(simklStatus);
    const total = item.total_episodes ?? 0;

    const watched = Array.isArray(item.watched_episodes)
      ? item.watched_episodes.map((e) => ({ episode: e.episode, watchedAt: e.watched_at ? new Date(e.watched_at) : now }))
      : [];
    let progress = watched.length;
    const lastWatched = Number(item.last_watched_episode);
    if (!progress && Number.isInteger(lastWatched) && lastWatched > 0) {
      progress = Math.min(lastWatched, total || lastWatched);
    }
    if (status === "COMPLETED" && total > 0 && progress < total) {
      progress = total;
      for (let ep = 1; ep <= total; ep += 1) {
        if (!watched.some((w) => w.episode === ep)) {
          watched.push({ episode: ep, watchedAt: new Date(item.last_watched || now) });
        }
      }
    }

    const { startedAt, completedAt } = deriveDates(item, status);

    const existing = await prisma.listEntry.findUnique({
      where: { userId_mediaId: { userId, mediaId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.listEntry.update({
        where: { id: existing.id },
        data: {
          status,
          progress,
          total,
          ...(startedAt ? { startedAt } : {}),
          ...(completedAt ? { completedAt } : {}),
        },
      });
      summary.updated += 1;
    } else {
      await prisma.listEntry.create({
        data: {
          userId,
          mediaId,
          type: "ANIME",
          status,
          progress,
          total,
          ...(startedAt ? { startedAt } : {}),
          ...(completedAt ? { completedAt } : {}),
        },
      });
      summary.imported += 1;
    }

    for (const w of watched) {
      if (!Number.isInteger(w.episode) || w.episode <= 0) continue;
      await prisma.episodeProgress.upsert({
        where: { userId_mediaId_episode: { userId, mediaId, episode: w.episode } },
        update: { watchedAt: w.watchedAt },
        create: { userId, mediaId, episode: w.episode, watchedAt: w.watchedAt },
      });
      summary.episodes += 1;
    }
  }

  return summary;
}

function deriveDates(item: SimklAnimeItem, status: string): { startedAt?: Date; completedAt?: Date } {
  const fallback = item.last_watched ? new Date(item.last_watched) : new Date();
  if (!item.last_watched) return {};
  const last = new Date(item.last_watched);
  if (status === "COMPLETED") return { completedAt: last };
  if (status === "CURRENT") return { startedAt: last };
  if (status !== "PLANNING") return { startedAt: fallback };
  return {};
}