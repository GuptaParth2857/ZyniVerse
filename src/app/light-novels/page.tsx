import type { Metadata } from "next";
import { Suspense } from "react";
import LightNovelBrowseClient from "./client";

export const metadata: Metadata = {
  title: "Light Novel Tracker — Track Your Reading | ZyniVerse",
  description: "Track your light novel reading progress. Discover new series, manage your collection.",
};

export default function LightNovelsPage() {
  return (
    <Suspense fallback={null}>
      <LightNovelBrowseClient />
    </Suspense>
  );
}
