import type { Metadata } from "next";
import AnimeNightClient from "@/components/AnimeNightClient";

export const metadata: Metadata = {
  title: "AI Anime Night Generator",
  description: "Let Zyni AI plan your perfect anime night — lineup, episode order, snacks and a quiz, all blended from your group's tastes.",
  openGraph: {
    title: "ZyniVerse AI Anime Night",
    description: "Plan your group's perfect anime night with AI.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function AnimeNightPage() {
  return <AnimeNightClient />;
}