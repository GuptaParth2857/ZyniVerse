import { NextResponse } from "next/server";
import { searchYouTubePodcasts } from "@/lib/youtube";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const episodes = await searchYouTubePodcasts(q);
    return NextResponse.json({ episodes, count: episodes.length, source: "youtube" });
  } catch (e) {
    logError(e, "podcast-search");
    return NextResponse.json({ episodes: [], count: 0, source: "youtube" });
  }
}
