import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { getAnimeDetailFull, bestTitle } from "@/lib/anilist";
import { getFillerForAnime } from "@/lib/filler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyApiKey(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const anilistId = Number(id);
  if (isNaN(anilistId)) {
    return NextResponse.json({ error: "Invalid anime ID" }, { status: 400 });
  }

  try {
    const anime = await getAnimeDetailFull(anilistId);
    const title = bestTitle(anime.title);
    const filler = await getFillerForAnime(anilistId, title);

    return NextResponse.json({
      data: {
        id: anime.id,
        idMal: anime.idMal,
        title: anime.title,
        description: anime.description,
        coverImage: anime.coverImage,
        bannerImage: anime.bannerImage,
        format: anime.format,
        status: anime.status,
        episodes: anime.episodes,
        duration: anime.duration,
        season: anime.season,
        seasonYear: anime.seasonYear,
        genres: anime.genres,
        averageScore: anime.averageScore,
        meanScore: anime.meanScore,
        popularity: anime.popularity,
        trending: anime.trending,
        favourites: anime.favourites,
        studios: anime.studios?.nodes || [],
        nextAiringEpisode: anime.nextAiringEpisode,
        characters: anime.characters?.edges?.slice(0, 25).map((c) => ({
          id: c.node.id,
          name: c.node.name,
          role: c.role,
          image: c.node.image,
          voiceActor: c.voiceActors?.[0] ? { name: c.voiceActors[0].name, image: c.voiceActors[0].image } : null,
        })) || [],
        filler: filler ? {
          total: filler.total,
          filler: filler.filler,
          fillerPercent: filler.fillerPercent,
          quickList: filler.quickList,
        } : null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch anime details" }, { status: 500 });
  }
}
