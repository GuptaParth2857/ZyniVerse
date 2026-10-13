import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMangaDetailFull, AniListUnavailableError } from "@/lib/anilist";
import MangaDetailClient from "./manga-client";
import AnimeUnavailableCard from "@/components/AnimeUnavailableCard";

export const revalidate = 86400;

// Return an EMPTY array: no paths are prerendered at build time (so no
// build-time AniList queries), but Next.js only enables on-demand ISR for a
// dynamic segment when `generateStaticParams` exists. Without it the route is
// rendered dynamically on every request (billed Node render per hit).
export function generateStaticParams() {
  return [];
}

const getMangaCached = cache(getMangaDetailFull);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const manga = await getMangaCached(id);
    const title = manga.title?.english || manga.title?.romaji || "Manga";
    const description =
      (manga.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
      `${title} — chapters, ratings, characters and reading progress on ZyniVerse.`;
    return {
      title: `${title} — Manga`,
      description,
      openGraph: {
        title: `${title} — Manga`,
        description,
        images: manga.coverImage?.extraLarge || manga.coverImage?.large
          ? [{ url: manga.coverImage.extraLarge || manga.coverImage.large!, alt: title }]
          : undefined,
      },
    };
  } catch {
    return { title: "Manga" };
  }
}

export default async function MangaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let manga;
  try {
    manga = await getMangaCached(id);
  } catch (err) {
    if (err instanceof AniListUnavailableError) {
      return <AnimeUnavailableCard href={`/manga/${id}`} />;
    }
    notFound();
  }
  if (!manga) notFound();
  return <MangaDetailClient initialManga={manga} />;
}
