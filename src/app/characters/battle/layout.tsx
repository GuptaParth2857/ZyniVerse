import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Character Battles - 1v1 Tournament Brackets",
  description:
    "Create and join anime character 1v1 battles. Vote in tournaments, view brackets and see community results on ZyniVerse.",
  openGraph: {
    title: "Anime Character Battles - 1v1 Tournament Brackets",
    description: "Create and join anime character 1v1 battles. Vote in tournaments, view brackets and results.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/characters/battle" },
  robots: { index: true, follow: true },
};

export default function BattleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
