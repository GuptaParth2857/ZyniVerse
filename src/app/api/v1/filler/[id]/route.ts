import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { getFillerForAnime } from "@/lib/filler";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyApiKey(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const anilistId = Number(id);
  if (isNaN(anilistId)) {
    return NextResponse.json({ error: "Invalid anime ID" }, { status: 400 });
  }

  const title = req.nextUrl.searchParams.get("title") || undefined;

  const filler = await getFillerForAnime(anilistId, title);
  if (!filler) {
    return NextResponse.json({ found: false, message: "No filler data found for this anime" }, { status: 200 });
  }

  // Get community vote stats if available
  const voteStats = await prisma.fillerVote.groupBy({
    by: ["episode"],
    where: { mediaId: anilistId },
    _count: { vote: true },
  });

  const votesByEpisode: Record<number, Record<string, number>> = {};
  for (const v of voteStats) {
    const votes = await prisma.fillerVote.findMany({ where: { mediaId: anilistId, episode: v.episode } });
    const tally: Record<string, number> = {};
    for (const v2 of votes) {
      tally[v2.vote] = (tally[v2.vote] || 0) + 1;
    }
    votesByEpisode[v.episode] = tally;
  }

  return NextResponse.json({
    found: true,
    data: {
      title: filler.title,
      slug: filler.slug,
      total: filler.total,
      filler: filler.filler,
      mangaCanon: filler.mangaCanon,
      animeCanon: filler.animeCanon,
      mixed: filler.mixed,
      fillerPercent: filler.fillerPercent,
      quickList: filler.quickList,
      episodes: filler.episodes,
      communityVotes: votesByEpisode,
    },
  });
}
