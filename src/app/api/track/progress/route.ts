import { NextRequest, NextResponse } from "next/server";
import { getEpisodeProgress } from "@/lib/episode-tracking";
import { resolveUserId } from "@/lib/resolve-user";

export async function GET(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mediaId = parseInt(searchParams.get("mediaId") || "");
  if (!mediaId) return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });

  const progress = await getEpisodeProgress(userId, mediaId);
  return NextResponse.json(progress);
}
