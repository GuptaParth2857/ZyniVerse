import { cache } from "react";
import { notFound } from "next/navigation";
import { getCharacter, AniListUnavailableError } from "@/lib/anilist";
import CharacterDetailClient from "./character-client";
import AnimeUnavailableCard from "@/components/AnimeUnavailableCard";

export const revalidate = 172800;

// Return an EMPTY array: no paths are prerendered at build time (so no
// build-time AniList queries), but Next.js only enables on-demand ISR for a
// dynamic segment when `generateStaticParams` exists. Without it the route is
// rendered dynamically on every request and every hit is a billed Node render
// (the real cause of the Function Duration overage).
export function generateStaticParams() {
  return [];
}

const getCharacterCached = cache(getCharacter);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const char = await getCharacterCached(id);
    const name = char.name?.full || "Character";
    const description = (char.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
    return {
      title: `${name} — Character`,
      description: description || `Anime appearances, voice actors and details for ${name}.`,
      openGraph: {
        title: `${name} — Character`,
        description,
        images: char.image?.large ? [{ url: char.image.large, alt: name }] : undefined,
      },
    };
  } catch {
    return { title: "Character" };
  }
}

export default async function CharacterDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let char;
  try {
    char = await getCharacterCached(id);
  } catch (err) {
    if (err instanceof AniListUnavailableError) {
      return <AnimeUnavailableCard href={`/character/${id}`} />;
    }
    notFound();
  }
  if (!char) notFound();
  return <CharacterDetailClient initialChar={char} />;
}
