import type { Metadata } from "next";
import ExtensionLanding from "@/components/ExtensionLanding";

export const metadata: Metadata = {
  title: "Chrome Extension — Auto-Track Anime to ZyniVerse",
  description:
    "Install the free ZyniVerse Chrome extension to automatically track anime you watch on Crunchyroll and Netflix — episode progress syncs to your watchlist.",
  openGraph: {
    title: "ZyniVerse Chrome Extension — Auto-Tracking",
    description:
      "Watch on Crunchyroll or Netflix and ZyniVerse tracks it automatically — series, episodes and progress, all synced to your list.",
  },
};

export default function ExtensionPage() {
  return <ExtensionLanding />;
}
