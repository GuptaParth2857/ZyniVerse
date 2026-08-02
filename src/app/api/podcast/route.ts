import { NextResponse } from "next/server";
import { PODCAST_EPISODES } from "@/lib/podcast-data";
import { logError } from "@/lib/logger";

export const revalidate = 3600;

export async function GET() {
  try {
    return NextResponse.json({ episodes: PODCAST_EPISODES, count: PODCAST_EPISODES.length });
  } catch (e) {
    logError(e, "podcast-api");
    return NextResponse.json({ episodes: [], count: 0 });
  }
}
