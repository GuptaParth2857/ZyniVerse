import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { THEME_SONGS } from "@/lib/data/themes";

const ANIMETHEMES_API = "https://api.animethemes.moe";

interface AnimeThemeEntry {
  type: "OP" | "ED";
  sequence: number;
  title: string;
  artist: string;
  youtubeId?: string;
}

async function fetchThemesFromApi(anilistId: number): Promise<AnimeThemeEntry[]> {
  try {
    const url = `${ANIMETHEMES_API}/anime?filter[has]&include=animethemes.animethemeentries.video&page[size]=1&filter[anilist_id]=${anilistId}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const anime = data?.anime?.[0];
    if (!anime?.animethemes) return [];

    const entries: AnimeThemeEntry[] = [];

    for (const theme of anime.animethemes) {
      const type = theme.type === "OP" ? "OP" : "ED";
      const sequence = theme.sequence || 1;
      const songTitle = theme.song?.title || "Unknown";
      const artist = theme.song?.artists?.[0]?.name || "Unknown";

      const video = theme.animethemeentries?.[0]?.videos?.[0];
      let youtubeId: string | undefined;
      if (video?.basename) {
        const link = video?.link || "";
        if (link.includes("youtube.com") || link.includes("youtu.be")) {
          const match = link.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
          if (match) youtubeId = match[1];
        }
      }

      entries.push({ type, sequence, title: songTitle, artist, youtubeId });
    }

    return entries;
  } catch { return []; }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const dbThemes = await prisma.themeSong.findMany({ where: { mediaId: id }, orderBy: [{ type: "asc" }, { sequence: "asc" }] });

  if (dbThemes.length > 0) {
    return NextResponse.json({ themes: dbThemes, source: "db" });
  }

  const seedThemes = THEME_SONGS.filter((t) => t.mediaId === id);
  if (seedThemes.length > 0) {
    for (const t of seedThemes) {
      try { await prisma.themeSong.create({ data: t }); } catch {}
    }
    const all = await prisma.themeSong.findMany({ where: { mediaId: id }, orderBy: [{ type: "asc" }, { sequence: "asc" }] });
    return NextResponse.json({ themes: all, source: "static" });
  }

  const apiThemes = await fetchThemesFromApi(id);
  if (apiThemes.length > 0) {
    for (const t of apiThemes) {
      try {
        await prisma.themeSong.create({ data: { mediaId: id, ...t } });
      } catch {}
    }
    const all = await prisma.themeSong.findMany({ where: { mediaId: id }, orderBy: [{ type: "asc" }, { sequence: "asc" }] });
    return NextResponse.json({ themes: all, source: "api" });
  }

  return NextResponse.json({ themes: [] });
}
