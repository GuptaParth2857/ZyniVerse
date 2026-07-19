import { NextResponse } from "next/server";
import { LIVE_ACTION_ANIME, type LiveActionAnime } from "@/lib/live-action-anime";
import { getLiveActionUpdateCache, type LiveActionUpdate } from "@/lib/live-action-updater";

export const revalidate = 3600;

function mergeUpdates(base: LiveActionAnime[], updates: Record<string, LiveActionUpdate>): LiveActionAnime[] {
  return base.map(entry => {
    const update = updates[entry.id];
    if (!update) return entry;

    let newStatus = entry.status;
    if (update.status === "RELEASING" || update.status === "FINISHED") {
      newStatus = "available";
    } else if (update.status === "CANCELLED") {
      newStatus = "cancelled";
    }

    return {
      ...entry,
      status: newStatus,
      episodes: update.episodes ?? entry.episodes,
      posterUrl: update.posterUrl ?? entry.posterUrl,
      rating: update.averageScore ? Math.round(update.averageScore / 10) : entry.rating,
    };
  });
}

export async function GET() {
  try {
    const cache = await getLiveActionUpdateCache();
    const data = mergeUpdates(LIVE_ACTION_ANIME, cache.updates);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/live-action] Error:", error);
    return NextResponse.json(LIVE_ACTION_ANIME);
  }
}
