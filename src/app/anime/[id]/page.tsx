import { getAnimeDetailFull, type MediaAnimeFull } from "@/lib/anilist";
import { notFound } from "next/navigation";
import AnimeDetailClient from "./detail-client";

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

function buildAnimeJsonLd(anime: MediaAnimeFull) {
  const id = String(anime.id);
  const title = anime.title?.english || anime.title?.romaji || "Anime";
  const desc = (anime.description || "").replace(/<[^>]*>/g, "").slice(0, 200);
  const image = anime.coverImage?.extraLarge || anime.coverImage?.large || `${BASE_URL}/logo.png`;
  const type = anime.format === "MOVIE" ? "Movie" : anime.format === "ONA" || anime.format === "OVA" ? "CreativeWork" : "TVSeries";
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    alternateName: [anime.title?.romaji, anime.title?.native].filter(Boolean),
    url: `${BASE_URL}/anime/${id}`,
    image,
    description: desc,
    datePublished: anime.startDate?.year ? `${anime.startDate.year}-${String(anime.startDate.month || 1).padStart(2, "0")}-${String(anime.startDate.day || 1).padStart(2, "0")}` : undefined,
    dateModified: undefined,
    inLanguage: anime.countryOfOrigin === "JP" ? "ja" : undefined,
    genre: (anime.genres || []).slice(0, 5),
    contentRating: anime.isAdult ? "Mature" : "Everyone",
    aggregateRating: anime.averageScore
      ? { "@type": "AggregateRating", ratingValue: (anime.averageScore / 10).toFixed(1), bestRating: "10", ratingCount: anime.favourites || 1 }
      : undefined,
    creator: anime.studios?.nodes?.length
      ? { "@type": "Organization", name: anime.studios.nodes[0].name }
      : undefined,
    numberOfEpisodes: anime.episodes || undefined,
    isPartOf: anime.season && anime.seasonYear
      ? { "@type": "CreativeWorkSeason", name: `${anime.season} ${anime.seasonYear}`, startDate: undefined }
      : undefined,
    publisher: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Anime", item: `${BASE_URL}/seasonal` },
      { "@type": "ListItem", position: 3, name: title, item: `${BASE_URL}/anime/${id}` },
    ],
  };
  return [JSON.stringify(schema), JSON.stringify(breadcrumb)];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const anime = await getAnimeDetailFull(id);
    const title = anime.title?.english || anime.title?.romaji || "Anime";
    return {
      title,
      description: (anime.description || "").replace(/<[^>]*>/g, "").slice(0, 160),
      openGraph: {
        title: `${title} — Anime Guide | ZyniVerse`,
        description: (anime.description || "").replace(/<[^>]*>/g, "").slice(0, 160),
        type: "website",
        url: `${BASE_URL}/anime/${id}`,
        images: [{ url: anime.coverImage?.extraLarge || anime.coverImage?.large || `${BASE_URL}/logo.png`, alt: title }],
      },
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
  const jsonLd = buildAnimeJsonLd(anime);
  return (
    <>
      {jsonLd.map((json, i) => (
        <script
          key={i}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}
      <AnimeDetailClient anime={anime} />
    </>
  );
}
