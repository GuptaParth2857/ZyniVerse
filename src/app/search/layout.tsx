import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Search 10,000+ Anime & Manga — Find Your Next Show Free",
  description:
    "Search thousands of anime and manga. Filter by genre, season, year, format & score. Find your next favorite show from 10,000+ titles — completely free.",
  keywords: [
    "anime search", "search anime", "find anime", "anime database",
    "browse anime by genre", "anime by season", "manga search",
    "best anime finder", "anime recommendation tool",
  ],
  openGraph: {
    title: "Search 10,000+ Anime & Manga — Find Your Next Show",
    description: "Filter by genre, season, year, format & score. 10,000+ titles — completely free.",
    url: `${BASE_URL}/search`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Search 10,000+ Anime & Manga — Find Your Next Show",
    description: "Filter by genre, season, year, format & score. 10,000+ titles — completely free.",
  },
  alternates: {
    canonical: `${BASE_URL}/search`,
  },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
