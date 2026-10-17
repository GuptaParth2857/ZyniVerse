import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { getAnimeDetailFull, getPopular, bestTitle } from "@/lib/anilist";
import { getAnimeEditorial } from "@/lib/anime-editorials";

export const revalidate = 172800;

// No generateStaticParams on purpose: prerendering anime pages at build
// fires `getAnimeDetailFull` (an AniList Media query) per page — 60+ calls on
// top of every other route — which trips AniList's 30 req/min per-IP limit,
// then the 429 retry/backoff sleeps push builds from ~3 min to 8-12 min.
// Pages render on demand and ISR-cache for 48h (`revalidate` above), so SEO
// stays server-rendered and builds stay fast.
const getAnimeDetailCached = cache(getAnimeDetailFull);

type PopularMedia = Awaited<ReturnType<typeof getPopular>>[number];

// AniList date parts -> schema.org ISO date.
function isoDate(
  d?: { year?: number | null; month?: number | null; day?: number | null } | null,
): string | undefined {
  if (!d?.year) return undefined;
  return `${d.year}-${String(d.month || 1).padStart(2, "0")}-${String(d.day || 1).padStart(2, "0")}`;
}

async function PopularAnimeLinks() {
  const popular = await getPopular(60).catch(() => [] as PopularMedia[]);
  if (popular.length === 0) return null;
  return (
    <nav className="mx-auto my-8 max-w-7xl px-4 sm:px-6" aria-label="Popular anime guides">
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-5">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--color-mute)]">
          Popular Anime Guides
        </h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {popular.map((m) => (
            <Link
              key={m.id}
              href={`/anime/${m.id}`}
              className="text-sm text-[var(--color-mute)] underline decoration-[var(--color-line)] underline-offset-4 transition-colors hover:text-[var(--color-cyan)]"
            >
              {bestTitle(m.title)}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const anime = await getAnimeDetailCached(id);
    const title = bestTitle(anime.title);
    const editorial = getAnimeEditorial(anime.title);
    const desc = editorial
      ? editorial.verdict.slice(0, 150)
      : anime.description
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
        title: `${title} — Anime Details`,
        description: desc,
        url: `${BASE_URL}/anime/${id}`,
        images: anime.coverImage?.extraLarge ? [{ url: anime.coverImage.extraLarge, alt: title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title}`,
        description: desc,
      },
      alternates: {
        canonical: `${BASE_URL}/anime/${id}`,
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: "Anime Details",
      description: "Browse detailed anime information including episodes, genres, characters, filler guides, watch order, and where to stream. Free anime platform.",
      robots: { index: true, follow: true },
    };
  }
}

export default async function AnimeLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  let anime = null;
  try {
    const { id } = await params;
    // Cached wrapper: generateMetadata above also fetches this media, and
    // React's request-scoped cache makes both share one AniList call instead
    // of two (AniList allows 30 req/min per IP).
    anime = await getAnimeDetailCached(id);
  } catch { /* invalid or missing mediaId */ }

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
    datePublished: isoDate(anime.startDate),
    numberOfEpisodes: anime.episodes || undefined,
    numberOfSeasons: anime.season ? 1 : undefined,
    // Season-level detail AniList already gives us (no invented seasonNumber —
    // this Media entry may be season 4 of a franchise).
    containsSeason: anime.season
      ? {
          "@type": "TVSeason",
          name: `${anime.season.charAt(0)}${anime.season.slice(1).toLowerCase()}${
            anime.seasonYear ? ` ${anime.seasonYear}` : ""
          }`,
          numberOfEpisodes: anime.episodes || undefined,
          startDate: isoDate(anime.startDate),
          endDate: isoDate(anime.endDate),
        }
      : undefined,
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
      `https://anilist.co/anime/${anime.id}`,
    ].filter(Boolean),
    potentialAction: {
      "@type": "WatchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/anime/${anime.id}`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/IOSPlatform",
          "http://schema.org/AndroidPlatform",
        ],
      },
    },
    review: (() => {
      const ed = anime?.title ? getAnimeEditorial(anime.title) : null;
      return {
        "@type": "Review",
        reviewBody: ed
          ? ed.verdict
          : desc || `Watch ${title} on ZyniVerse — filler guide, episodes, characters & more.`,
        author: { "@type": "Organization", name: "ZyniVerse" },
      };
    })(),
  } : null;

  // Real AniList recommendations (sorted by rating) as internal links, so every
  // anime page links out to 6 related titles instead of being a dead end.
  // Cross-type entries route to the correct section.
  const related = (anime?.recommendations?.edges || [])
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
      {related.length > 0 && (
        <nav className="mx-auto my-8 max-w-7xl px-4 sm:px-6" aria-label="Related anime and manga">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-5">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--color-mute)]">
              Related Titles
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {related.slice(0, 6).map((m) => (
                <Link
                  key={`${m.type}-${m.id}`}
                  href={`/${m.type === "MANGA" ? "manga" : "anime"}/${m.id}`}
                  className="text-sm text-[var(--color-mute)] underline decoration-[var(--color-line)] underline-offset-4 transition-colors hover:text-[var(--color-cyan)]"
                >
                  {bestTitle(m.title)}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
      <PopularAnimeLinks />
    </>
  );
}
