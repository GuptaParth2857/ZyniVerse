import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Character Tournaments - Community Voting",
  description:
    "Join anime character tournaments, vote in 1v1 battles and see bracket results. Participate in the community on ZyniVerse.",
  openGraph: {
    title: "Anime Character Tournaments - Community Voting",
    description: "Join anime character tournaments, vote in 1v1 battles and see bracket results.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/character-tournaments" },
  robots: { index: true, follow: true },
};

export default function CharacterTournamentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
