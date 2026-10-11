import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { resolveUserId } from "@/lib/resolve-user";
import { parseMALXml } from "@/lib/mal-xml";

export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
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

    await prisma.listImport.create({
      data: {
        userId,
        source: "mal",
        mediaType: "ANIME",
        fileName: file.name || null,
        totalEntries: entries.length,
        imported,
        skipped: entries.length - imported,
      },
    });

    return NextResponse.json({ imported, total: entries.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
