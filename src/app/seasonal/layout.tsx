import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seasonal Anime — Spring, Summer, Fall & Winter 2025-26 | ZyniVerse",
  description:
    "Browse anime by season. See what's airing this season, upcoming releases, and past seasonal lineups. TV, movies, OVAs, and more — all in one place.",
  openGraph: {
    title: "Seasonal Anime Guide — ZyniVerse",
    description: "Browse current and past seasonal anime lineups. See what's airing now and coming next.",
  },
  robots: { index: true, follow: true },
};

export default function SeasonalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
