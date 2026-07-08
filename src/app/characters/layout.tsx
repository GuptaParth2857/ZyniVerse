import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Characters — Browse Popular Characters & Voice Actors | ZyniVerse",
  description:
    "Explore thousands of anime characters. Find details about your favorite characters, voice actors, appearances, and character rankings.",
  openGraph: { title: "Anime Characters — ZyniVerse", description: "Browse thousands of anime characters with voice actor details." },
  robots: { index: true, follow: true },
};

export default function CharactersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
