import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { resolveUserId } from "@/lib/resolve-user";

const MAL_STATUS_MAP: Record<string, string> = {
  watching: "CURRENT",
  completed: "COMPLETED",
  "plan to watch": "PLANNING",
  dropped: "DROPPED",
  "on-hold": "PAUSED",
  "rewatching": "REWATCHING",
  "Plan to Watch": "PLANNING",
  "On-Hold": "PAUSED",
};

function parseMALXml(xmlText: string): Array<{ animeId: number; status: string; score: number; episodesWatched: number; totalEpisodes: number; startDate: string | null; endDate: string | null }> {
  const results: Array<{ animeId: number; status: string; score: number; episodesWatched: number; totalEpisodes: number; startDate: string | null; endDate: string | null }> = [];

  // MAL XML format: <anime> <series_animedb_id>12345</series_animedb_id> ...
  const animeBlocks = xmlText.split("<anime>");
  for (let i = 1; i < animeBlocks.length; i++) {
    const block = animeBlocks[i].split("</anime>")[0];
    const extract = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
      const match = block.match(regex);
      return match ? match[1].trim() : "";
    };

    const animeId = parseInt(extract("series_animedb_id"), 10);
    if (!animeId || isNaN(animeId)) continue;

    const statusRaw = extract("my_status");
    const status = MAL_STATUS_MAP[statusRaw] || "CURRENT";

    const score = parseInt(extract("my_score"), 10);
    const episodesWatched = parseInt(extract("my_watched_episodes"), 10) || 0;
    const totalEpisodes = parseInt(extract("series_episodes"), 10) || 0;
    const startDate = extract("my_start_date");
    const endDate = extract("my_finish_date");

    results.push({
      animeId,
      status,
      score: score > 0 ? score : 0,
      episodesWatched,
      totalEpisodes,
      startDate: startDate !== "0000-00-00" ? startDate : null,
      endDate: endDate !== "0000-00-00" ? endDate : null,
    });
  }
  return results;
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const xmlText = await file.text();
    if (!xmlText.includes("<anime>") || !xmlText.includes("</myanimelist>")) {
      return NextResponse.json({ error: "Invalid MAL XML format. Please upload your MyAnimeList XML export." }, { status: 400 });
    }

    const entries = parseMALXml(xmlText);
    if (entries.length === 0) {
      return NextResponse.json({ imported: 0, message: "No anime entries found in the XML file." });
    }

    let imported = 0;
    for (const entry of entries) {
      if (entry.animeId <= 0) continue;

      await prisma.listEntry.upsert({
        where: { userId_mediaId: { userId, mediaId: entry.animeId } },
        update: {
          status: entry.status,
          progress: entry.episodesWatched,
          total: entry.totalEpisodes,
          score: entry.score > 0 ? entry.score : undefined,
          startedAt: entry.startDate ? new Date(entry.startDate) : undefined,
          completedAt: entry.endDate ? new Date(entry.endDate) : undefined,
          type: "ANIME",
        },
        create: {
          userId,
          mediaId: entry.animeId,
          type: "ANIME",
          status: entry.status,
          progress: entry.episodesWatched,
          total: entry.totalEpisodes,
          score: entry.score > 0 ? entry.score : undefined,
          startedAt: entry.startDate ? new Date(entry.startDate) : undefined,
          completedAt: entry.endDate ? new Date(entry.endDate) : undefined,
        },
      });
      imported++;
    }

    return NextResponse.json({ imported, total: entries.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
