import { getAnimeDetailFull } from "@/lib/anilist";
import { notFound } from "next/navigation";
import AnimeDetailClient from "./detail-client";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const anime = await getAnimeDetailFull(id);
    const title = anime.title?.english || anime.title?.romaji || "Anime";
    return {
      title,
      description: (anime.description || "").replace(/<[^>]*>/g, "").slice(0, 160),
    };
  } catch {
    return { title: "Anime | ZyniVerse" };
  }
}

export default async function AnimeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let anime;
  try {
    anime = await getAnimeDetailFull(id);
  } catch {
    notFound();
  }
  return <AnimeDetailClient anime={anime} />;
}
