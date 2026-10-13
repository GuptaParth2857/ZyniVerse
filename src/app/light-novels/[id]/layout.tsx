import type { Metadata } from "next";
import { cache } from "react";
import { getLightNovelDetail, bestTitle } from "@/lib/anilist";

const getLightNovelCached = cache(getLightNovelDetail);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ id: string }>;
}

function stripHtml(str?: string | null) {
  return str ? str.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const ln = await getLightNovelCached(id);
    const title = bestTitle(ln.title);
    const desc = ln.description
      ? stripHtml(ln.description).slice(0, 200)
      : `Read ${title} — light novel details, volumes, chapters, characters, and recommendations on ZyniVerse.`;

    return {
      title: `${title} — Light Novel Details, Volumes & Chapters`,
      description: desc,
      keywords: [
        title,
        `${title} light novel`,
        `${title} volumes`,
        `${title} chapters`,
        `${title} read online`,
        "light novel",
        "light novel tracker",
        ...(ln.genres || []).slice(0, 5),
      ],
      openGraph: {
        title: `${title} — Light Novel`,
        description: desc,
        url: `${BASE_URL}/light-novels/${id}`,
        type: "book",
        images: ln.coverImage?.extraLarge ? [{ url: ln.coverImage.extraLarge, alt: title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: desc,
      },
      alternates: { canonical: `${BASE_URL}/light-novels/${id}` },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: "Light Novel Details — Volumes & Chapters",
      description: "Browse light novel details, volumes, and reading progress on ZyniVerse.",
      alternates: { canonical: `${BASE_URL}/light-novels/${id}` },
      robots: { index: true, follow: true },
    };
  }
}

export default async function LightNovelLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  let ln = null;
  try {
    const { id } = await params;
    ln = await getLightNovelCached(id);
  } catch {
    /* invalid or missing mediaId */
  }

  const title = ln ? bestTitle(ln.title) : "";
  const desc = stripHtml(ln?.description).slice(0, 300);

  const authors = (ln?.staff?.edges || [])
    .filter((e) => (e.role || "").toLowerCase().includes("story"))
    .map((e) => ({ "@type": "Person", name: e.node?.name?.full }))
    .filter((a) => a.name);

  const jsonLd = ln
    ? {
        "@context": "https://schema.org",
        "@type": "Book",
        name: title,
        alternateName: [ln.title?.native, ln.title?.romaji].filter(Boolean),
        description: desc || undefined,
        url: `${BASE_URL}/light-novels/${ln.id}`,
        image: ln.coverImage?.extraLarge || ln.coverImage?.large || undefined,
        inLanguage: "ja",
        genre: ln.genres || undefined,
        author: authors.length ? authors : undefined,
        datePublished: ln.startDate?.year
          ? `${ln.startDate.year}-${String(ln.startDate.month || 1).padStart(2, "0")}-${String(ln.startDate.day || 1).padStart(2, "0")}`
          : undefined,
        aggregateRating: ln.averageScore
          ? {
              "@type": "AggregateRating",
              ratingValue: (ln.averageScore / 10).toFixed(1),
              bestRating: "10",
              worstRating: "0",
              ratingCount: ln.favourites || undefined,
            }
          : undefined,
      }
    : null;

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
