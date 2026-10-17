import type { Metadata } from "next";
import ExtensionLanding from "@/components/ExtensionLanding";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Chrome Extension — Auto-Track Anime to ZyniVerse",
  description:
    "Install the free ZyniVerse Chrome extension to automatically track anime you watch on Crunchyroll and Netflix — episode progress syncs to your watchlist.",
  alternates: { canonical: `${BASE_URL}/extension` },
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "ZyniVerse Chrome Extension — Auto-Tracking",
    description:
      "Watch on Crunchyroll or Netflix and ZyniVerse tracks it automatically — series, episodes and progress, all synced to your list.",
  },
};

export default function ExtensionPage() {
  return <ExtensionLanding />;
}
