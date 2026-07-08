import type { Metadata } from "next";
import LightNovelBrowseClient from "./client";

export const metadata: Metadata = {
  title: "Light Novel Tracker — Track Your Reading | ZyniVerse",
  description: "Track your light novel reading progress. Discover new series, manage your collection.",
};

export default function LightNovelsPage() {
  return <LightNovelBrowseClient />;
}
