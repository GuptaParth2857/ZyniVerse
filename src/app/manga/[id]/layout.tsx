import type { Metadata } from "next";
import { getMangaDetailFull, bestTitle } from "@/lib/anilist";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const manga = await getMangaDetailFull(id);
    const title = bestTitle(manga.title);
    const desc = manga.description
      ? manga.description.replace(/<[^>]*>/g, "").slice(0, 200)
      : `Read ${title} — manga details, chapters, recommendations, and more on ZyniVerse.`;

    return {
      title: `${title} — Read Manga, Chapters & Recommendations | ZyniVerse`,
      description: desc,
      openGraph: {
        title: `${title} — Manga | ZyniVerse`,
        description: desc,
        url: `${BASE_URL}/manga/${id}`,
        images: manga.coverImage?.extraLarge ? [{ url: manga.coverImage.extraLarge }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} — ZyniVerse`,
        description: desc,
      },
      alternates: {
        canonical: `${BASE_URL}/manga/${id}`,
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Manga Details — ZyniVerse" };
  }
}

export default function MangaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
