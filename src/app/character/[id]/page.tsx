import { cache } from "react";
import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/anilist";
import CharacterDetailClient from "./character-client";

export const revalidate = 3600;

const getCharacterCached = cache(getCharacter);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const char = await getCharacterCached(id);
    const name = char.name?.full || "Character";
    const description = (char.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
    return {
      title: `${name} — Character | ZyniVerse`,
      description: description || `Anime appearances, voice actors and details for ${name}.`,
      openGraph: {
        title: `${name} — Character | ZyniVerse`,
        description,
        images: char.image?.large ? [{ url: char.image.large, alt: name }] : undefined,
      },
    };
  } catch {
    return { title: "Character | ZyniVerse" };
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
  } catch {
    notFound();
  }
  return <CharacterDetailClient initialChar={char} />;
}
