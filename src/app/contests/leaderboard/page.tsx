import type { Metadata } from "next";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Contest Leaderboard — Top Champions",
  description:
    "The most successful ZyniVerse contestants: weekly battle wins, total votes earned and entries submitted, ranked.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "ZyniVerse Contest Leaderboard",
    description: "The most successful contestants — wins, votes and entries, ranked.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function ContestLeaderboardPage() {
  return <LeaderboardClient />;
}
