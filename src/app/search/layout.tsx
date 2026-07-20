import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Search Anime & Manga — Browse by Genre, Season, Rating | ZyniVerse",
  description:
    "Search thousands of anime and manga titles. Filter by genre, season, year, format, status, and more. Find your next favorite show from 10,000+ titles.",
  keywords: [
    "anime search", "search anime", "find anime", "anime database",
    "browse anime by genre", "anime by season", "manga search",
  ],
  openGraph: {
    title: "Search Anime & Manga — ZyniVerse",
    description: "Search and filter thousands of anime and manga titles by genre, season, and rating.",
    url: `${BASE_URL}/search`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Anime & Manga — ZyniVerse",
    description: "Search 10,000+ anime and manga titles with advanced filters.",
  },
  alternates: {
    canonical: `${BASE_URL}/search`,
  },
  robots: { index: true, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
