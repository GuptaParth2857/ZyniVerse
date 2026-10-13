import type { Metadata } from "next";
import MyMangaListClient from "./client";

const SITE = "https://zyverse.in";

export const metadata: Metadata = {
  title: "My Manga List | Track Reading Progress",
  description:
    "Track your manga, light novels, manhwa and manhua in one place. Reading progress, chapters read, volumes, scores and status — all synced across devices on ZyniVerse.",
  keywords: [
    "my manga list",
    "manga tracker",
    "manga reading list",
    "manga progress tracker",
    "manhwa list",
    "light novel tracker",
    "manga library",
  ],
  openGraph: {
    title: "My Manga List | Track Reading Progress",
    description:
      "Track your manga, light novels, manhwa and manhua in one place. Progress, chapters, volumes and scores — synced across devices.",
    url: `${SITE}/manga-list`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "My Manga List | Track Reading Progress",
    description:
      "Track your manga, light novels, manhwa and manhua in one place across devices.",
  },
  alternates: {
    canonical: "/manga-list",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "My Manga List",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Web",
  url: `${SITE}/manga-list`,
  description:
    "Track manga, light novels, manhwa and manhua reading progress, chapters, volumes and scores in one synced library.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function MyMangaListPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MyMangaListClient />
    </>
  );
}
