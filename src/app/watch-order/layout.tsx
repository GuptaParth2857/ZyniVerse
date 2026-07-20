import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Watch Order — Complete Guide for Every Franchise (2026) | ZyniVerse",
  description:
    "Confused about anime watch order? Complete guides for Re:Zero, Sword Art Online, Fate, Monogatari, Naruto, Dragon Ball, JoJo, Attack on Titan, and 35+ more franchises. Release order, chronological order, and spoiler-free tips.",
  keywords: [
    "anime watch order", "re zero watch order", "sao watch order", "sword art online watch order",
    "fate watch order", "monogatari watch order", "naruto watch order", "dragon ball watch order",
    "jojo watch order", "attack on titan watch order", "anime viewing order", "correct order to watch anime",
    "anime franchise watch order 2026", "steins gate watch order", "evangelion watch order",
  ],
  openGraph: {
    title: "Anime Watch Order Guides — Every Franchise Explained | ZyniVerse",
    description: "Complete watch order guides for Re:Zero, SAO, Fate, Monogatari, Naruto, Dragon Ball, JoJo, and 35+ more anime franchises.",
    url: `${BASE_URL}/watch-order`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Watch Order Guides — ZyniVerse",
    description: "Never be confused about anime watch order. Release order, chronological order, and tips for 35+ franchises.",
  },
  alternates: {
    canonical: `${BASE_URL}/watch-order`,
  },
  robots: { index: true, follow: true },
};

export default function WatchOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
