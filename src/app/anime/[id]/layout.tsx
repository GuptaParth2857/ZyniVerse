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

    const genres = anime.genres?.slice(0, 5).join(", ") || "";
    const fillerNote = "Skip filler episodes with our detailed guide.";

    return {
      title: `${title} — ${anime.episodes || "?"} Episodes, ${genres} | Free Filler Guide`,
      description: `${desc} ${fillerNote} Watch order, characters, reviews & where to watch on ZyniVerse.`,
      keywords: [
        title, `${title} filler list`, `${title} watch order`,
        `${title} episodes`, `${title} characters`, `${title} review`,
        "anime details", "anime filler guide", "anime watch order",
        ...(anime.genres || []).slice(0, 5),
      ],
      openGraph: {
        title: `${title} — Anime Details | ZyniVerse`,
        description: desc,
        url: `${BASE_URL}/anime/${id}`,
        images: anime.coverImage?.extraLarge ? [{ url: anime.coverImage.extraLarge, alt: title }] : [],
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

export default async function AnimeLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  let anime = null;
  try {
    const { id } = await params;
    anime = await getAnimeDetailFull(id);
  } catch {}

  const title = anime ? bestTitle(anime.title) : "";
  const desc = anime?.description
    ? anime.description.replace(/<[^>]*>/g, "").slice(0, 300)
    : "";

  const jsonLd = anime ? {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: title,
    alternateName: [anime.title?.native, anime.title?.romaji].filter(Boolean),
    description: desc || undefined,
    url: `${BASE_URL}/anime/${anime.id}`,
    image: anime.coverImage?.extraLarge || anime.coverImage?.large || undefined,
    datePublished: anime.startDate?.year ? `${anime.startDate.year}-${String(anime.startDate.month || 1).padStart(2, "0")}-${String(anime.startDate.day || 1).padStart(2, "0")}` : undefined,
    numberOfEpisodes: anime.episodes || undefined,
    numberOfSeasons: anime.season ? 1 : undefined,
    genre: anime.genres || undefined,
    inLanguage: ["ja"],
    aggregateRating: anime.averageScore ? {
      "@type": "AggregateRating",
      ratingValue: (anime.averageScore / 10).toFixed(1),
      bestRating: "10",
      worstRating: "0",
      ratingCount: anime.favourites || undefined,
    } : undefined,
    productionCompany: anime.studios?.nodes?.[0] ? {
      "@type": "Organization",
      name: anime.studios.nodes[0].name,
    } : undefined,
    sameAs: [
      anime.idMal ? `https://myanimelist.net/anime/${anime.idMal}` : null,
      anime.idMal ? `https://anilist.co/anime/${anime.id}` : null,
    ].filter(Boolean),
    review: {
      "@type": "Review",
      reviewBody: desc || `Watch ${title} on ZyniVerse — filler guide, episodes, characters & more.`,
      author: { "@type": "Organization", name: "ZyniVerse" },
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
