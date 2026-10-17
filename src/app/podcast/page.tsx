import type { Metadata } from "next";
import PodcastSection from "@/components/PodcastSection";

export const metadata: Metadata = {
  title: "Anime Podcast — Hindi & English Anime Discussions",
  description:
    "Listen to anime podcasts covering Hindi voice actors, seasonal reviews, Trash Taste, and more.",
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Anime Podcast — Hindi & English Anime Discussions",
    description: "Listen to anime podcasts covering Hindi voice actors, seasonal reviews, Trash Taste, and more.",
  },
};

export default function PodcastPage() {
  return <PodcastSection />;
}
