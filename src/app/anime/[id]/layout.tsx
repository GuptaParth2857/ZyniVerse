import type { Metadata } from "next";
import { getAnimeDetailFull, bestTitle } from "@/lib/anilist";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const anime = await getAnimeDetailFull(id);
    const title = bestTitle(anime.title);
    const desc = anime.description
      ? anime.description.replace(/<[^>]*>/g, "").slice(0, 200)
      : `Discover ${title} — anime details, characters, episodes, filler guide, and more on ZyniVerse.`;

    return {
      title: `${title} — Anime Details, Characters & Filler Guide | ZyniVerse`,
      description: desc,
      openGraph: {
        title: `${title} — Anime Details | ZyniVerse`,
        description: desc,
        url: `${BASE_URL}/anime/${id}`,
        images: anime.coverImage?.extraLarge ? [{ url: anime.coverImage.extraLarge }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} — ZyniVerse`,
        description: desc,
      },
      alternates: {
        canonical: `${BASE_URL}/anime/${id}`,
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Anime Details — ZyniVerse" };
  }
}

export default function AnimeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
