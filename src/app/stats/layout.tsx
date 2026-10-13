import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Your Anime Stats — Watch Time, Streaks & Rankings",
  description:
    "See your anime watching statistics — total episodes, hours watched, genre breakdown, streaks and yearly activity. Track your anime journey with ZyniVerse.",
  alternates: { canonical: `${BASE_URL}/stats` },
  robots: { index: true, follow: true },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}