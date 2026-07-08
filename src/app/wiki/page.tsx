import type { Metadata } from "next";
import WikiPageClient from "./WikiPageClient";

export const metadata: Metadata = {
  title: "Anime Wiki — Community Knowledge Base | ZyniVerse",
  description: "Community-driven wiki for anime, manga, characters, studios, and more. Contribute your knowledge!",
};

export default function WikiHomePage() {
  return <WikiPageClient />;
}
