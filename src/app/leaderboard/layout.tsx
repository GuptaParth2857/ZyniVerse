import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Leaderboard — Top Anime Rankings & Stats | ZyniVerse",
  description:
    "See the top-ranked anime across all categories. Trending, most popular, top-rated, most favorites — updated daily based on the AniList community.",
  openGraph: { title: "Anime Leaderboard — ZyniVerse", description: "Top anime rankings across trending, popular, and top-rated." },
  robots: { index: true, follow: true },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
