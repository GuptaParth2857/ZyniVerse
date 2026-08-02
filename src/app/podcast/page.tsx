import type { Metadata } from "next";
import PodcastSection from "@/components/PodcastSection";

export const metadata: Metadata = {
  title: "Anime Podcast — Hindi & English Anime Discussions | ZyniVerse",
  description:
    "Listen to anime podcasts covering Hindi voice actors, seasonal reviews, Trash Taste, and more.",
  openGraph: {
    title: "Anime Podcast — Hindi & English Anime Discussions | ZyniVerse",
    description: "Listen to anime podcasts covering Hindi voice actors, seasonal reviews, Trash Taste, and more.",
  },
};

export default function PodcastPage() {
  return <PodcastSection />;
}
