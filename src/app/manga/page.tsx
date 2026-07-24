import type { Metadata } from "next";
import MangaBrowseClient from "./client";

export const metadata: Metadata = {
  title: "Manga Tracker — Track Your Reading Progress Free | ZyniVerse",
  description: "Track your manga reading across 1000+ series. Never lose your place. Discover trending manga, manage your collection & get recommendations.",
  keywords: ["manga tracker", "manga reading list", "manga progress tracker", "read manga online", "manga recommendations", "manga list"],
  openGraph: {
    title: "Manga Tracker — Track Your Reading Progress Free",
    description: "Track your manga reading across 1000+ series. Never lose your place.",
    url: "https://zyverse.in/manga",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Manga Tracker — Track Your Reading Progress Free",
    description: "Track your manga reading across 1000+ series. Never lose your place.",
  },
  alternates: { canonical: "https://zyverse.in/manga" },
  robots: { index: true, follow: true },
};

export default function MangaPage() {
  return <MangaBrowseClient />;
}
