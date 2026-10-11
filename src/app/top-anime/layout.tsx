import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Top Anime of All Time — Ranked by Popularity & Rating | ZyniVerse",
  description:
    "The most popular and top-rated anime of all time, ranked. Browse top anime by score, popularity and trend — Naruto, One Piece, Attack on Titan, Jujutsu Kaisen and more.",
  alternates: { canonical: `${BASE_URL}/top-anime` },
  robots: { index: true, follow: true },
};

export default function TopAnimeLayout({ children }: { children: React.ReactNode }) {
  return children;
}