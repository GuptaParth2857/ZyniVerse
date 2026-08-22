import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMangaDetailFull } from "@/lib/anilist";
import MangaDetailClient from "./manga-client";

export const revalidate = 3600;

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
  } catch {
    notFound();
  }
  return <MangaDetailClient initialManga={manga} />;
}
