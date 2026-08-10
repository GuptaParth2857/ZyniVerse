import type { Metadata } from "next";
import { Suspense } from "react";
import WikiPageClient from "./WikiPageClient";

export const metadata: Metadata = {
  title: "Anime Wiki — Community Knowledge Base | ZyniVerse",
  description: "Community-driven wiki for anime, manga, characters, studios, and more. Contribute your knowledge!",
  alternates: { canonical: "https://zyverse.in/wiki" },
  robots: { index: true, follow: true },
};

export default function WikiHomePage() {
  return (
    <Suspense fallback={null}>
      <WikiPageClient />
    </Suspense>
  );
}
