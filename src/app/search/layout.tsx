import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Anime & Manga — Browse by Genre, Season, Rating | ZyniVerse",
  description:
    "Search thousands of anime and manga titles. Filter by genre, season, year, format, status, and more. Find your next favorite show.",
  openGraph: { title: "Search Anime & Manga — ZyniVerse", description: "Search and filter thousands of anime and manga titles." },
  robots: { index: true, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
