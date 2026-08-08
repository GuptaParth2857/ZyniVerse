import { NextResponse } from "next/server";
import { PODCAST_EPISODES } from "@/lib/podcast-data";
import { getYouTubePodcasts } from "@/lib/youtube";
import { logError } from "@/lib/logger";

export const revalidate = 3600;

export async function GET() {
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
