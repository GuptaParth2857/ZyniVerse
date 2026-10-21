import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { searchYouTubePodcasts } from "@/lib/youtube";
import { logError } from "@/lib/logger";
export const dynamic = "force-dynamic";

async function GET_inner(request: Request) {
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


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
