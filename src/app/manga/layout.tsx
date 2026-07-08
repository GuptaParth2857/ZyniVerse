import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manga — Browse Popular, Trending & Top Rated Manga | ZyniVerse",
  description:
    "Discover manga across all genres. Browse trending, popular, and top-rated manga. Read descriptions, see characters, and track your reading list.",
  openGraph: { title: "Manga — ZyniVerse", description: "Browse trending, popular and top-rated manga." },
  robots: { index: true, follow: true },
};

export default function MangaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
