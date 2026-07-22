import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { THEME_SONGS } from "@/lib/data/themes";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const seedThemes = THEME_SONGS.filter((t) => t.mediaId === id);

  // Upsert all themes from static data (ensures youtubeIds are always fresh)
  if (seedThemes.length > 0) {
    for (const t of seedThemes) {
      try {
        const existing = await prisma.themeSong.findFirst({
          where: { mediaId: id, type: t.type, sequence: t.sequence },
        });
        if (existing) {
          // Update if DB entry is missing youtubeId but static has one
          if (!existing.youtubeId && t.youtubeId) {
            await prisma.themeSong.update({
              where: { id: existing.id },
              data: { youtubeId: t.youtubeId },
            });
          }
        } else {
          await prisma.themeSong.create({ data: t });
        }
      } catch {}
    }
  }

  const all = await prisma.themeSong.findMany({
    where: { mediaId: id },
    orderBy: [{ type: "asc" }, { sequence: "asc" }],
  });

  if (all.length > 0) {
    return NextResponse.json({ themes: all, source: "db" });
  }

  return NextResponse.json({ themes: [] });
}
