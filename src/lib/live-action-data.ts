import { LIVE_ACTION_ANIME, type LiveActionAnime } from "./live-action-anime";
import { getLiveActionUpdateCache, type LiveActionUpdate } from "./live-action-updater";
import { catalogToLiveAction, getLiveActionCatalogEntries, normalizeTitle } from "./live-action-catalog";

function mergeUpdates(base: LiveActionAnime[], updates: Record<string, LiveActionUpdate>): LiveActionAnime[] {
  return base.map((entry) => {
    const update = updates[entry.id];
    if (!update) return entry;

    let newStatus = entry.status;
    if (update.status === "CANCELLED") {
      newStatus = "cancelled";
    }

    return {
      ...entry,
      status: newStatus,
      episodes: update.episodes ?? entry.episodes,
      posterUrl: update.posterUrl ?? entry.posterUrl,
      rating: entry.status !== "upcoming" && update.averageScore ? Math.round(update.averageScore / 10) : entry.rating,
    };
  });
}

export async function getAllLiveAction(): Promise<LiveActionAnime[]> {
  const cache = await getLiveActionUpdateCache();
  const data = mergeUpdates(LIVE_ACTION_ANIME, cache.updates);

  const catalog = await getLiveActionCatalogEntries();
  const staticNorms = new Set(LIVE_ACTION_ANIME.map((a) => normalizeTitle(a.title)));
  const discovered = catalog
    .filter((e) => !staticNorms.has(normalizeTitle(e.title)))
    .map(catalogToLiveAction);

  return [...data, ...discovered];
}
