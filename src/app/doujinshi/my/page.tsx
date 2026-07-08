import type { Metadata } from "next";
import DoujinshiMyClient from "./client";

export const metadata: Metadata = {
  title: "My Tracked Doujinshi | ZyniVerse",
  description: "View and manage your tracked doujinshi collection.",
};

export default function DoujinshiMyPage() {
  return <DoujinshiMyClient />;
}
