import { auth } from "@/lib/auth";
import { getGenreBasedRecs, getSimilarAnime, getTrendingRecs, getPersonalizedRecs } from "@/lib/recommender";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "trending";
  const genres = url.searchParams.get("genre")?.split(",").filter(Boolean) || [];
  const id = url.searchParams.get("id") ? Number(url.searchParams.get("id")) : undefined;
  const exclude = url.searchParams.get("exclude")?.split(",").map(Number).filter(Boolean) || [];

  try {
    let recommendations;

    switch (type) {
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
