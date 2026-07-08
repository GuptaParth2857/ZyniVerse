import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { markEpisodeWatched, markEpisodeUnwatched, autoUpdateListEntry } from "@/lib/episode-tracking";
import { createActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, episode, title, totalEpisodes } = await req.json();
  if (!mediaId || !episode) return NextResponse.json({ error: "Missing mediaId or episode" }, { status: 400 });

  await markEpisodeWatched(session.user.id, mediaId, episode, title);

  if (totalEpisodes) {
    await autoUpdateListEntry(session.user.id, mediaId, totalEpisodes);
  }

  await createActivity({
    userId: session.user.id,
    type: "WATCHED_EPISODE",
    mediaId,
    mediaTitle: title || `Episode ${episode}`,
    message: `Watched episode ${episode}${title ? ` — ${title}` : ""}`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, episode } = await req.json();
  if (!mediaId || !episode) return NextResponse.json({ error: "Missing mediaId or episode" }, { status: 400 });

  await markEpisodeUnwatched(session.user.id, mediaId, episode);
  return NextResponse.json({ ok: true });
}
