import type { Metadata } from "next";
import DoujinshiMyClient from "./client";

export const metadata: Metadata = {
  title: "My Tracked Doujinshi | ZyniVerse",
  description: "View and manage your tracked doujinshi collection on ZyniVerse. Keep tabs on what you've read, organize your to-read list, and discover new releases to pick up next.",
};

export default function DoujinshiMyPage() {
  return <DoujinshiMyClient />;
}
