import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getEpisodeProgress } from "@/lib/episode-tracking";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mediaId = parseInt(searchParams.get("mediaId") || "");
  if (!mediaId) return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });

  const progress = await getEpisodeProgress(session.user.id, mediaId);
  return NextResponse.json(progress);
}
