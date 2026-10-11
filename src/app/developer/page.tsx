import type { Metadata } from "next";
import DeveloperPageClient from "./DeveloperPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "ZyniVerse API — Anime Data for Developers | Free & Paid Tiers",
  description: "Build with the ZyniVerse API. Access anime filler guides, Indian dub data, airing schedules, and more. Free tier available with 100 requests/day.",
  alternates: { canonical: `${BASE_URL}/developer` },
  openGraph: {
    title: "ZyniVerse API — Anime Data for Developers",
    description: "Build with the ZyniVerse API. Filler guides, Indian dubs, schedules & more.",
  },
};

export default function DeveloperPage() {
  return <DeveloperPageClient />;
}
