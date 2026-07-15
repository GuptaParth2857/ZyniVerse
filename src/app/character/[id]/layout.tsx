import type { Metadata } from "next";
import { getCharacter, bestTitle } from "@/lib/anilist";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const char = await getCharacter(id);
    const name = char.name?.full || "Unknown Character";
    const animeNames = (char.media?.edges || [])
      .slice(0, 3)
      .map((e: any) => e.node ? bestTitle(e.node.title) : "")
      .filter(Boolean);
    const animeStr = animeNames.length > 0 ? ` from ${animeNames.join(", ")}` : "";

    return {
      title: `${name} — Anime Character Details | ZyniVerse`,
      description: char.description
        ? char.description.replace(/<[^>]*>/g, "").slice(0, 200)
        : `Learn about ${name}${animeStr}. Voice actors, appearances, favorites, and more on ZyniVerse.`,
      openGraph: {
        title: `${name} — Anime Character | ZyniVerse`,
        description: char.description
          ? char.description.replace(/<[^>]*>/g, "").slice(0, 200)
          : `Learn about ${name}${animeStr} on ZyniVerse.`,
        url: `${BASE_URL}/character/${id}`,
        images: char.image?.large ? [{ url: char.image.large }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} — ZyniVerse`,
        description: char.description
          ? char.description.replace(/<[^>]*>/g, "").slice(0, 200)
          : `Learn about ${name} on ZyniVerse.`,
      },
      alternates: {
        canonical: `${BASE_URL}/character/${id}`,
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Character Details — ZyniVerse" };
  }
}

export default function CharacterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
