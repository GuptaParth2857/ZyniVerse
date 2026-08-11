import type { Metadata } from "next";
import MyMangaListClient from "./client";

export const metadata: Metadata = {
  title: "My Manga List | Track Reading Progress | ZyniVerse",
  description:
    "Track your manga, light novels, manhwa and manhua in one place. Reading progress, chapters read, volumes, scores and status — all synced across devices on ZyniVerse.",
  alternates: {
    canonical: "/manga-list",
  },
};

export default function MyMangaListPage() {
  return <MyMangaListClient />;
}
