import type { Metadata } from "next";
import MangaBrowseClient from "./client";

export const metadata: Metadata = {
  title: "Manga Tracker — Track Your Reading | ZyniVerse",
  description: "Track your manga reading progress. Discover new series, manage your collection, and never lose your place.",
};

export default function MangaPage() {
  return <MangaBrowseClient />;
}
