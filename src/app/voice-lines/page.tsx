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
      <section className="mb-10">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
          ✦ Voice Lines Library
        </p>
        <div className="neon-rgb-border inline-block rounded-2xl px-5 py-3">
          <h1 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-3xl font-bold text-transparent sm:text-5xl">
            Anime Quotes & Dialogues
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-mute)]">
          Search and browse the most iconic anime quotes. From Naruto&apos;s ninja way to
          Luffy&apos;s pirate dreams — including Hindi dub lines.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {["Naruto", "One Piece", "Attack on Titan", "Hindi Dub"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 text-xs text-[var(--color-mute)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
      <VoiceLineGallery />
    </main>
  );
}
