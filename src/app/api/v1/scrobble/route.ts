import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/api-key";
import { searchMedia, bestTitle } from "@/lib/anilist";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await verifyApiKey(req);
  if (auth.error) return auth.error;
  if (!auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const episode = Math.max(1, Number(body.episode) || 1);
  const status = typeof body.status === "string" && body.status ? body.status : "CURRENT";
  const mediaIdInput = Number(body.mediaId) || null;

  if (!title && !mediaIdInput) {
    return NextResponse.json({ error: "Missing title or mediaId" }, { status: 400 });
  }

  let mediaId = mediaIdInput;
  let matchedTitle = String(body.title || "");
  let coverImage: string | null = null;
  let totalEpisodes = 0;

  if (!mediaId) {
    try {
      const result = await searchMedia({ search: title, type: "ANIME", sort: "SEARCH_MATCH", perPage: 1 });
      const media = result.media[0];
      if (media) {
        mediaId = media.id;
        matchedTitle = bestTitle(media.title);
        coverImage = media.coverImage?.extraLarge || media.coverImage?.large || null;
        totalEpisodes = media.episodes || 0;
      }
    } catch (e) {
      logError(e);
      return NextResponse.json({ error: "Could not match the title to an anime. Try passing mediaId." }, { status: 422 });
    }
  } else {
    try {
      const result = await searchMedia({ search: matchedTitle || String(mediaId), type: "ANIME", perPage: 1 });
      totalEpisodes = result.media[0]?.episodes || 0;
    } catch { /* keep defaults */ }
  }

  if (!mediaId) {
    return NextResponse.json({ error: "No anime matched the title" }, { status: 422 });
  }

  const userId = auth.userId;

  const existing = await prisma.listEntry.findUnique({
    where: { userId_mediaId: { userId, mediaId } },
    select: { progress: true },
  });
  const newProgress = Math.max(existing?.progress || 0, episode);

  await prisma.listEntry.upsert({
    where: { userId_mediaId: { userId, mediaId } },
    update: { status, progress: newProgress, type: "ANIME" },
    create: {
      userId, mediaId, type: "ANIME", status,
      progress: newProgress,
      total: totalEpisodes,
      ...(status === "CURRENT" && { startedAt: new Date() }),
    },
  });

  await prisma.episodeProgress.upsert({
    where: { userId_mediaId_episode: { userId, mediaId, episode } },
    update: {},
    create: { userId, mediaId, episode, title: `Episode ${episode}` },
  });

  return NextResponse.json({
    ok: true,
    mediaId,
    title: matchedTitle,
    episode,
    coverImage,
    progress: newProgress,
    totalEpisodes,
  });
}
