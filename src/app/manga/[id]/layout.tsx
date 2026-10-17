import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { getMangaDetailFull, bestTitle } from "@/lib/anilist";

const getMangaDetailCached = cache(getMangaDetailFull);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const manga = await getMangaDetailCached(id);
    const title = bestTitle(manga.title);
    const desc = manga.description
      ? manga.description.replace(/<[^>]*>/g, "").slice(0, 200)
      : `Read ${title} — manga details, chapters, recommendations, and more on ZyniVerse.`;

    return {
      title: `${title} — Read Manga, Chapters & Recommendations`,
      description: desc,
      openGraph: {
        title: `${title} — Manga`,
        description: desc,
        url: `${BASE_URL}/manga/${id}`,
        images: manga.coverImage?.extraLarge ? [{ url: manga.coverImage.extraLarge }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title}`,
        description: desc,
      },
      alternates: {
        canonical: `${BASE_URL}/manga/${id}`,
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: "Manga Details",
      description: "Browse detailed manga information including chapters, genres, characters, and recommendations. Read manga online for free.",
      alternates: { canonical: `${BASE_URL}/manga/${id}` },
      robots: { index: true, follow: true },
    };
  }
}

export default async function MangaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  let manga = null;
  try {
    const { id } = await params;
    manga = await getMangaDetailCached(id);
  } catch {
    /* invalid or missing mangaId */
  }

  const title = manga ? bestTitle(manga.title) : "";
  const desc = manga?.description
    ? manga.description.replace(/<[^>]*>/g, "").slice(0, 300)
    : "";

  const jsonLd = manga
    ? {
        "@context": "https://schema.org",
        "@type": "Book",
        name: title,
        alternateName: [manga.title?.native, manga.title?.romaji].filter(Boolean),
        description: desc || undefined,
        url: `${BASE_URL}/manga/${manga.id}`,
        image: manga.coverImage?.extraLarge || manga.coverImage?.large || undefined,
        bookFormat: "https://schema.org/GraphicNovel",
        numberOfPages: undefined,
        genre: manga.genres || undefined,
        inLanguage: ["ja"],
        aggregateRating: manga.averageScore
          ? {
              "@type": "AggregateRating",
              ratingValue: (manga.averageScore / 10).toFixed(1),
              bestRating: "10",
              worstRating: "0",
              ratingCount: manga.favourites || undefined,
            }
          : undefined,
        sameAs: [
          manga.idMal ? `https://myanimelist.net/manga/${manga.idMal}` : null,
          `https://anilist.co/manga/${manga.id}`,
        ].filter(Boolean),
        review: {
          "@type": "Review",
          reviewBody:
            desc ||
            `Read ${title} on ZyniVerse — chapters, characters, recommendations & more.`,
          author: { "@type": "Organization", name: "ZyniVerse" },
        },
      }
    : null;

  // Real AniList recommendations (sorted by rating) as internal links. Cross-type
  // entries (a manga recommending an anime, or vice versa) route to the right
  // section instead of emitting a broken /manga/<animeId> link.
  const similar = (manga?.recommendations?.edges || [])
    .map((e) => e.node?.mediaRecommendation)
    .filter((m): m is NonNullable<typeof m> => Boolean(m?.id && m?.title));

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
      {similar.length > 0 && (
        <nav
          className="mx-auto my-8 max-w-7xl px-4 sm:px-6"
          aria-label="Similar manga and anime"
        >
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-5">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--color-mute)]">
              Similar Titles
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {similar.slice(0, 6).map((m) => (
                <Link
                  key={`${m.type}-${m.id}`}
                  href={`/${m.type === "ANIME" ? "anime" : "manga"}/${m.id}`}
                  className="text-sm text-[var(--color-mute)] underline decoration-[var(--color-line)] underline-offset-4 transition-colors hover:text-[var(--color-cyan)]"
                >
                  {bestTitle(m.title)}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
