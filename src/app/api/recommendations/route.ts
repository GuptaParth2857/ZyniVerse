import { auth } from "@/lib/auth";
import { getGenreBasedRecs, getSimilarAnime, getTrendingRecs, getPersonalizedRecs } from "@/lib/recommender";
import { getAIRecommendations } from "@/lib/ai-recommender";
import { getTopRated, getUpcoming, bestTitle } from "@/lib/anilist";

function mediaToRec(media: { id: number; title: { english?: string | null; romaji?: string | null; native?: string | null; userPreferred?: string | null }; coverImage?: { extraLarge?: string | null; large?: string | null; medium?: string | null } | null; format?: string | null; episodes?: number | null; genres?: string[] | null; averageScore?: number | null; trending?: number | null; popularity?: number | null; status?: string | null; nextAiringEpisode?: { airingAt: number } | null }, reason: string) {
  const score = Math.min(100, Math.round(((media.averageScore || 0) * 0.6) + ((media.trending || 0) * 0.2) + ((media.popularity || 0) / 5000) * 20));
  return {
    id: media.id,
    title: bestTitle(media.title),
    score,
    reason,
    image: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || "",
    format: media.format || "",
    episodes: media.episodes || 0,
    genres: media.genres || [],
    matchTags: [],
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "trending";
  const genres = url.searchParams.get("genre")?.split(",").filter(Boolean) || [];
  const id = url.searchParams.get("id") ? Number(url.searchParams.get("id")) : undefined;
  const exclude = url.searchParams.get("exclude")?.split(",").map(Number).filter(Boolean) || [];

  try {
    let recommendations;

    switch (type) {
      case "ai": {
        const session = await auth();
        recommendations = await getAIRecommendations(session?.user?.id || undefined);
        break;
      }
      case "genre": {
        recommendations = await getGenreBasedRecs(genres, exclude);
        break;
      }
      case "similar": {
        if (!id) return Response.json({ recommendations: [], error: "id required" }, { status: 400 });
        recommendations = await getSimilarAnime(id);
        break;
      }
      case "personalized": {
        const session = await auth();
        if (session?.user?.id) {
          recommendations = await getPersonalizedRecs(session.user.id);
        } else {
          recommendations = await getTrendingRecs();
        }
        break;
      }
      case "top_rated": {
        const data = await getTopRated(18);
        recommendations = data.map((m) => mediaToRec(m, "Highest rated anime of all time"));
        break;
      }
      case "upcoming": {
        const data = await getUpcoming(18);
        recommendations = data.map((m) => mediaToRec(m, m.nextAiringEpisode ? "Airing soon" : "Upcoming release"));
        break;
      }
      default: {
        recommendations = await getTrendingRecs();
        break;
      }
    }

    return Response.json({ recommendations });
  } catch (e) {
    return Response.json({ recommendations: [], error: (e as Error).message }, { status: 500 });
  }
}
