import { NextRequest, NextResponse } from "next/server";
import { markEpisodeWatched, markEpisodeUnwatched, autoUpdateListEntry } from "@/lib/episode-tracking";
import { createActivity } from "@/lib/activity";
import { resolveUserId } from "@/lib/resolve-user";

export async function POST(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, episode, title, totalEpisodes } = await req.json();
  if (!mediaId || !episode) return NextResponse.json({ error: "Missing mediaId or episode" }, { status: 400 });

  await markEpisodeWatched(userId, mediaId, episode, title);

  if (totalEpisodes) {
    await autoUpdateListEntry(userId, mediaId, totalEpisodes);
  }

  await createActivity({
    userId,
    type: "WATCHED_EPISODE",
    mediaId,
    mediaTitle: title || `Episode ${episode}`,
    message: `Watched episode ${episode}${title ? ` — ${title}` : ""}`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, episode } = await req.json();
  if (!mediaId || !episode) return NextResponse.json({ error: "Missing mediaId or episode" }, { status: 400 });

  await markEpisodeUnwatched(userId, mediaId, episode);
  return NextResponse.json({ ok: true });
}
