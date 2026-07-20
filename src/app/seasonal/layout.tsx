import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Seasonal Anime — Summer 2026, Spring 2026 & Past Seasons | ZyniVerse",
  description:
    "Browse anime by season. See what's airing this season, upcoming releases, and past seasonal lineups. Summer 2026, Spring 2026, Winter 2026, and Fall 2025 charts. TV, movies, OVAs, and more.",
  keywords: [
    "seasonal anime", "summer 2026 anime", "spring 2026 anime",
    "anime this season", "anime chart 2026", "new anime 2026",
    "winter 2026 anime", "fall 2025 anime", "upcoming anime",
  ],
  openGraph: {
    title: "Seasonal Anime Charts — 2026 Seasons | ZyniVerse",
    description: "Browse current and past seasonal anime lineups. Summer 2026, Spring 2026, and more.",
    url: `${BASE_URL}/seasonal`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seasonal Anime — 2026 | ZyniVerse",
    description: "See what's airing every season. Complete seasonal anime charts.",
  },
  alternates: {
    canonical: `${BASE_URL}/seasonal`,
  },
  robots: { index: true, follow: true },
};

export default function SeasonalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
