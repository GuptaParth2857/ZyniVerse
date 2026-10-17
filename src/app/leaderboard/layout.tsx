import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Leaderboard — Top Anime Rankings & Stats",
  description:
    "See the top-ranked anime across all categories. Trending, most popular, top-rated, most favorites — updated daily based on the AniList community.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }], title: "Anime Leaderboard — ZyniVerse", description: "Top anime rankings across trending, popular, and top-rated." },
  alternates: { canonical: `${BASE_URL}/leaderboard` },
  robots: { index: true, follow: true },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
