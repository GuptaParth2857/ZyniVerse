import type { Metadata } from "next";
import { getLightNovelTrending, bestTitle, type Media } from "@/lib/anilist";
import LightNovelBrowseClient from "./client";

// ISR: server-render the first Trending tab (covers land in the HTML, like
// /manga). An AniList hiccup degrades to an empty grid which the client
// immediately refetches.
export const revalidate = 21600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Light Novel Tracker — Track Your Reading",
  description:
    "Track your light novel reading progress, discover trending series, and manage your collection on ZyniVerse.",
  keywords: [
    "light novel",
    "light novel tracker",
    "read light novels",
    "light novel list",
    "web novel tracker",
    "isekai light novel",
    "ZyniVerse",
  ],
  alternates: { canonical: `${BASE_URL}/light-novels` },
  openGraph: {
    title: "Light Novel Tracker — Track Your Reading",
    description:
      "Track your light novel reading progress, discover trending series, and manage your collection on ZyniVerse.",
    url: `${BASE_URL}/light-novels`,
    siteName: "ZyniVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Light Novel Tracker — Track Your Reading",
    description: "Track your light novel reading progress and discover new series on ZyniVerse.",
  },
};

export default async function LightNovelsPage() {
  let trending: Media[] = [];
  let total = 0;
  let hasNext = false;
  try {
    const data = await getLightNovelTrending(24, 1, null);
    trending = data.media;
    total = data.pageInfo.total;
    hasNext = data.pageInfo.hasNextPage;
  } catch {
    trending = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending Light Novels",
    numberOfItems: trending.length,
    itemListElement: trending.slice(0, 24).map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Book",
        name: bestTitle(m.title),
        url: `${BASE_URL}/light-novels/${m.id}`,
        image: m.coverImage?.extraLarge || m.coverImage?.large || undefined,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LightNovelBrowseClient initialList={trending} initialTotal={total} initialHasNext={hasNext} />
    </>
  );
}
