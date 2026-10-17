import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Bingo Cards — Track Your Watching Habits",
  description: "Generate seasonal anime bingo cards and track your watching habits. Mark off squares as you complete anime challenges!",
  alternates: { canonical: "https://zyverse.in/bingo" },
  robots: { index: true, follow: true },
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Anime Bingo Cards",
    description: "Generate seasonal anime bingo cards and track your watching habits.",
    url: "https://zyverse.in/bingo",
  },
};

export default function BingoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
