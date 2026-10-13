import type { Metadata } from "next";
import { Suspense } from "react";
import LightNovelBrowseClient from "./client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Light Novel Tracker — Track Your Reading",
  description:
    "Track your light novel reading progress, discover trending series, and manage your collection on ZyniVerse.",
  keywords: [
    "light novel",
    "light novel tracker",
    "read light novels",
    "light novel list",
    "web novel tracker",
    "isekai light novel",
    "ZyniVerse",
  ],
  alternates: { canonical: `${BASE_URL}/light-novels` },
  openGraph: {
    title: "Light Novel Tracker — Track Your Reading",
    description:
      "Track your light novel reading progress, discover trending series, and manage your collection on ZyniVerse.",
    url: `${BASE_URL}/light-novels`,
    siteName: "ZyniVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Light Novel Tracker — Track Your Reading",
    description: "Track your light novel reading progress and discover new series on ZyniVerse.",
  },
};

export default function LightNovelsPage() {
  return (
    <Suspense fallback={null}>
      <LightNovelBrowseClient />
    </Suspense>
  );
}
