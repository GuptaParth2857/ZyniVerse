import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mangaId: string }> }) {
  const { mangaId } = await params;
  const id = parseInt(mangaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mangaId" }, { status: 400 });

  const chapters = await prisma.mangaChapterData.findMany({
    where: { mangaId: id },
    orderBy: { chapterNumber: "asc" },
  });

  if (chapters.length > 0) return NextResponse.json({ chapters });

  const resp = await fetch(`https://api.mangadex.org/manga/${mangaId}/aggregate?translatedLanguage[]=en`);
  if (!resp.ok) return NextResponse.json({ chapters: [] });

  const data = await resp.json();
  const aggregated: { chapterNumber: number; title: string; pages: number }[] = [];
  if (data.volumes) {
    for (const vol of Object.values(data.volumes) as any[]) {
      for (const ch of Object.values(vol.chapters) as any[]) {
        aggregated.push({
          chapterNumber: parseFloat(ch.chapter),
          title: ch.title || `Chapter ${ch.chapter}`,
          pages: ch.count || 0,
        });
      }
    }
  }

  for (const ch of aggregated) {
    await prisma.mangaChapterData.upsert({
      where: { mangaId_chapterNumber: { mangaId: id, chapterNumber: ch.chapterNumber } },
      update: { title: ch.title, pages: ch.pages },
      create: { mangaId: id, chapterNumber: ch.chapterNumber, title: ch.title, pages: ch.pages },
    });
  }

  const saved = await prisma.mangaChapterData.findMany({
    where: { mangaId: id },
    orderBy: { chapterNumber: "asc" },
  });

  return NextResponse.json({ chapters: saved });
}
