import type { Metadata } from "next";
import VoiceLineGallery from "@/components/VoiceLineGallery";

export const metadata: Metadata = {
  title: "Anime Quotes — Iconic Voice Lines & Dialogues | ZyniVerse",
  description:
    "Browse iconic anime quotes and voice lines. The best dialogues from Naruto, One Piece, Attack on Titan, and more — including Hindi dub lines.",
  openGraph: {
    title: "Anime Quotes — Voice Lines & Dialogues | ZyniVerse",
    description:
      "Browse iconic anime quotes and voice lines from Naruto, One Piece, Attack on Titan, and more.",
  },
  robots: { index: true, follow: true },
};

export default function VoiceLinesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
          Voice Lines
        </p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">
          Anime Quotes & Dialogues
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--color-mute)]">
          Search and browse the most iconic anime quotes. From Naruto&apos;s ninja way to
          Luffy&apos;s pirate dreams — including Hindi dub lines.
        </p>
      </div>
      <VoiceLineGallery />
    </main>
  );
}
