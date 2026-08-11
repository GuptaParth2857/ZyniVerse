import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ZyniVerse | Anime Filler Guides, Indian Dubs & Manga Tracker",
  description:
    "ZyniVerse (Zyniverse / Zyverse) is India's #1 free anime platform. Filler guides for 200+ anime, Indian dub tracking (Hindi, Tamil, Telugu), AI recommendations, manga reader, cosplay gallery, and an anime community. Visit zyverse.in.",
  alternates: {
    canonical: "/about",
  },
};

const FEATURES = [
  {
    title: "Filler Guides",
    desc: "Skip filler episodes across 200+ anime — Naruto, One Piece, Bleach, Boruto and more, with exact episode lists.",
    href: "/filler",
  },
  {
    title: "Watch Orders",
    desc: "Confused about Monogatari, Fate or Re:Zero? We show you the correct order to watch any franchise.",
    href: "/watch-order",
  },
  {
    title: "Indian Dub Tracking",
    desc: "The only platform tracking Hindi, Tamil and Telugu dubs with schedule updates for every channel.",
    href: "/indian-dubs",
  },
  {
    title: "AI Recommendations",
    desc: "Get personalised anime and manga picks powered by our recommendation engine.",
    href: "/recommendations",
  },
  {
    title: "Manga Reader",
    desc: "Browse thousands of manga titles with a clean, fast reading experience.",
    href: "/manga",
  },
  {
    title: "Community",
    desc: "Clubs, watch parties, cosplay gallery, polls and more — built for Indian anime fans.",
    href: "/community",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold tracking-tight">What is ZyniVerse?</h1>
      <p className="mt-2 text-sm text-[var(--color-mute)]">
        The all-in-one anime platform for Indian anime fans
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--color-mute)]">
        <section>
          <h2 className="font-display text-xl font-semibold text-white">The Story</h2>
          <p className="mt-2">
            ZyniVerse was founded in 2025 as a free, fan-first anime platform. What started as a
            simple filler-episode guide grew into the most complete anime companion for Indian
            fans — covering filler lists, watch orders, Indian dubs, AI recommendations, manga,
            cosplay and community.
          </p>
          <p className="mt-2">
            ZyniVerse (also written Zyniverse or Zyverse) is built for anime fans who speak Hindi,
            Tamil, Telugu and English. We track every Indian dub across every channel, so you never
            miss when your favourite show airs in your language.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-white">Why ZyniVerse?</h2>
          <p className="mt-2">
            Most anime tools ignore the Indian fan. ZyniVerse fixes that — we are India-first in
            everything we do, from dub schedules to community features. And it is 100% free, with no
            paywalls.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-white">What We Offer</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-cyan)]"
              >
                <h3 className="font-display font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-xs">{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-white">Free & Forever</h2>
          <p className="mt-2">
            ZyniVerse will always be free. No paywalls, no hidden fees — just anime tools and a
            community that actually cares about Indian fans. Join us at{" "}
            <a href="https://zyverse.in" className="text-[var(--color-cyan)] hover:underline">
              zyverse.in
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-[var(--color-line)]">
        <Link href="/" className="text-sm text-[var(--color-cyan)] hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
