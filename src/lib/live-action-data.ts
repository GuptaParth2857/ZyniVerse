import { LIVE_ACTION_ANIME, type LiveActionAnime } from "./live-action-anime";
import { getLiveActionUpdateCache, type LiveActionUpdate } from "./live-action-updater";
import { catalogToLiveAction, getLiveActionCatalogEntries, normalizeTitle } from "./live-action-catalog";
import { getPosterCache } from "./live-action-posters";

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

// `getAllLiveAction()` is called twice per rendered page (generateMetadata +
// the page component) and once per prerendered `/live-action/[id]` route
// during `next build`. Every call opened its own round of DB reads (update
// cache + poster cache + catalogue), so the build of N detail pages issued
// 2 x N of them and — together with the other prerendered routes — was one of
// the things that exhausted the database connection pool mid-build.
//
// The merged result is identical for the whole process, so it is now read
// once and shared for a short window. Five minutes is long enough to collapse
// a build storm into one read per worker and short enough that a running
// instance still picks up catalogue changes quickly.
const LIVE_ACTION_TTL_MS = 5 * 60 * 1000;

let cached: { at: number; data: LiveActionAnime[] } | null = null;
let inflight: Promise<LiveActionAnime[]> | null = null;

async function loadAllLiveAction(): Promise<LiveActionAnime[]> {
  const [cache, posterCache] = await Promise.all([
    getLiveActionUpdateCache(),
    getPosterCache(),
  ]);
  const data = mergeUpdates(LIVE_ACTION_ANIME, cache.updates).map((entry) => {
    if (entry.status !== "upcoming") return entry;
    const info = posterCache.posters[entry.id];
    return { ...entry, posterUrl: info?.url };
  });

  const catalog = await getLiveActionCatalogEntries();
  const staticNorms = new Set(LIVE_ACTION_ANIME.map((a) => normalizeTitle(a.title)));
  const discovered = catalog
    .filter((e) => !staticNorms.has(normalizeTitle(e.title)))
    .map(catalogToLiveAction);

  return [...data, ...discovered];
}

export async function getAllLiveAction(): Promise<LiveActionAnime[]> {
  if (cached && Date.now() - cached.at < LIVE_ACTION_TTL_MS) return cached.data;

  if (!inflight) {
    inflight = loadAllLiveAction()
      .then((data) => {
        cached = { at: Date.now(), data };
        return data;
      })
      .finally(() => {
        inflight = null;
      })
      .catch((err) => {
        // Never cache a failure: a transient database error must not poison
        // the process for the rest of its lifetime.
        cached = null;
        throw err;
      });
  }

  return inflight;
}
