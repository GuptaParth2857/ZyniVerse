import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMangaDetailFull, AniListUnavailableError } from "@/lib/anilist";
import MangaDetailClient from "./manga-client";
import AnimeUnavailableCard from "@/components/AnimeUnavailableCard";

export const revalidate = 86400;

// No generateStaticParams on purpose: prerendering manga pages at build
// fires one AniList Media query per page, contributing to the build-time
// rate-limit that ballooned builds from ~3 min to 8-12 min. Pages render on
// demand and ISR-cache for 24h (`revalidate` above).
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
      title: `${title} — Manga | ZyniVerse`,
      description,
      openGraph: {
        title: `${title} — Manga | ZyniVerse`,
        description,
        images: manga.coverImage?.extraLarge || manga.coverImage?.large
          ? [{ url: manga.coverImage.extraLarge || manga.coverImage.large!, alt: title }]
          : undefined,
      },
    };
  } catch {
    return { title: "Manga | ZyniVerse" };
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
