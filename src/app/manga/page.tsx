import type { Metadata } from "next";
import { getMangaTrending, bestTitle, type Media } from "@/lib/anilist";
import MangaBrowseClient from "./client";

// ISR: refresh the server-rendered first tab every 10 minutes. An AniList
// hiccup degrades to an empty grid, which the client immediately refetches.
export const revalidate = 3600;

const SITE = "https://zyverse.in";

export const metadata: Metadata = {
  title: "Manga Tracker — Track Your Reading Progress Free",
  description:
    "Track your manga reading across 1000+ series. Never lose your place. Discover trending manga, manage your collection & get recommendations.",
  keywords: [
    "manga tracker",
    "manga reading list",
    "manga progress tracker",
    "read manga online",
    "manga recommendations",
    "manga list",
  ],
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Manga Tracker — Track Your Reading Progress Free",
    description:
      "Track your manga reading across 1000+ series. Never lose your place.",
    url: `${SITE}/manga`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Manga Tracker — Track Your Reading Progress Free",
    description:
      "Track your manga reading across 1000+ series. Never lose your place.",
  },
  alternates: { canonical: `${SITE}/manga` },
  robots: { index: true, follow: true },
};

export default async function MangaPage() {
  let trending: Media[] = [];
  try {
    trending = await getMangaTrending(24);
  } catch {
    trending = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending Manga",
    numberOfItems: trending.length,
    itemListElement: trending.slice(0, 24).map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Book",
        name: bestTitle(m.title),
        url: `${SITE}/manga/${m.id}`,
        image:
          m.coverImage?.extraLarge || m.coverImage?.large || undefined,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MangaBrowseClient initialManga={trending} />
    </>
  );
}
