import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Games - Quizzes & Puzzles",
  description:
    "Play anime games: Guess the Plot, Guess the OST and Silhouette Quiz. Test your anime knowledge on ZyniVerse.",
  openGraph: {
    title: "Anime Games - Quizzes & Puzzles",
    description: "Play fun anime quizzes and games to test your knowledge.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/games" },
  robots: { index: true, follow: true },
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
