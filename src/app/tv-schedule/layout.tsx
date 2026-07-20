import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime TV Schedule India — What's Airing Today on Indian TV Channels | ZyniVerse",
  description:
    "Check what anime is airing today on Indian TV channels like Cartoon Network, Sony YAY, Hungama, Nick, and more. Complete TV schedule with DTH channel numbers. Updated daily for 2026.",
  keywords: [
    "anime tv schedule india", "what anime is on tv today",
    "cartoon network india schedule", "sony yay schedule",
    "hungama tv anime", "indian tv anime today", "dth anime schedule",
  ],
  openGraph: {
    title: "Anime TV Schedule India — Indian TV Channels | ZyniVerse",
    description: "What anime is airing today on Indian TV? Complete schedule with DTH channel numbers.",
    url: `${BASE_URL}/tv-schedule`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime TV Schedule India — ZyniVerse",
    description: "See what anime is airing today on Indian TV channels.",
  },
  alternates: {
    canonical: `${BASE_URL}/tv-schedule`,
  },
  robots: { index: true, follow: true },
};

export default function TvScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
