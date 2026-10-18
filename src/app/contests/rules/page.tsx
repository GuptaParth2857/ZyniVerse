import type { Metadata } from "next";
import RulesClient from "./RulesClient";

export const metadata: Metadata = {
  title: "Contest Rules — How ZyniVerse Battles Work",
  description:
    "The rules for ZyniVerse weekly anime contests: one entry per battle, one vote each, weeks run Monday to Monday, and the most voted entry takes the badge, XP and coins.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "ZyniVerse Contest Rules",
    description: "One entry, one vote, weekly battles. Everything you need to win.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function ContestRulesPage() {
  return <RulesClient />;
}
