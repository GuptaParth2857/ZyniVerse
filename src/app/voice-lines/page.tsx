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
    <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
        }}
      />

      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 py-12 text-center backdrop-blur-sm sm:py-16">
        <div className="neon-banner-card pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <p className="console-label mb-4">Voice Lines Library · Iconic Dialogues</p>

          <h1 className="neon-text-gradient font-display text-4xl font-black tracking-tight sm:text-6xl">
            Anime Quotes & Dialogues
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-mute)] sm:text-base">
            Search and browse the most iconic anime quotes. From Naruto&apos;s ninja way to
            Luffy&apos;s pirate dreams — including Hindi dub lines.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {["Naruto", "One Piece", "Attack on Titan", "Hindi Dub"].map((tag) => (
              <span
                key={tag}
                className="glass-tag"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <VoiceLineGallery />
    </main>
  );
}
