import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const JIKAN_BASE = "https://api.jikan.moe/v4";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const dbEpisodes = await prisma.animeEpisode.findMany({
    where: { mediaId: id }, orderBy: { episode: "asc" }, take: 200,
  });

  if (dbEpisodes.length === 0) {
    try {
      const malId = req.nextUrl.searchParams.get("malId");
      if (malId) {
        const res = await fetch(`${JIKAN_BASE}/anime/${malId}/episodes`);
        if (res.ok) {
          const data = await res.json();
          const episodeData = (data.data || []).map((ep: any) => ({
            mediaId: id,
            episode: ep.mal_id,
            title: ep.title || null,
            titleJp: ep.title_japanese || null,
            airdate: ep.aired || null,
            runtime: (() => { try { return parseInt(ep.duration); } catch { return null; } })(),
          })).filter((e: any) => e.episode > 0);

          if (episodeData.length > 0) {
            for (const ep of episodeData) {
              try {
                await prisma.animeEpisode.create({ data: ep });
              } catch {}
            }
            const all = await prisma.animeEpisode.findMany({ where: { mediaId: id }, orderBy: { episode: "asc" } });
            return NextResponse.json({ episodes: all });
          }
        }
      }
    } catch {}
    return NextResponse.json({ episodes: [] });
  }

  return NextResponse.json({ episodes: dbEpisodes });
}
