import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { PODCAST_EPISODES } from "@/lib/podcast-data";
import { getYouTubePodcasts } from "@/lib/youtube";
import { logError } from "@/lib/logger";

export const revalidate = 86400;

async function GET_inner() {
  try {
    const live = await getYouTubePodcasts();
    if (live.length > 0) {
      return NextResponse.json({ episodes: live, count: live.length, source: "youtube" });
    }
    return NextResponse.json({ episodes: PODCAST_EPISODES, count: PODCAST_EPISODES.length, source: "curated" });
  } catch (e) {
    logError(e, "podcast-api");
    return NextResponse.json({ episodes: PODCAST_EPISODES, count: PODCAST_EPISODES.length, source: "curated" });
  }
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
