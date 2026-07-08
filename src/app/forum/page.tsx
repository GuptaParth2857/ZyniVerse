import type { Metadata } from "next";
import Link from "next/link";
import ForumHomeClient from "./ForumHomeClient";

export const metadata: Metadata = {
  title: "Anime Forum — Discussions & Community | ZyniVerse",
  description: "Join the ZyniVerse community forum. Discuss anime, share recommendations, and connect with fellow fans.",
  robots: { index: true, follow: true },
};

export default function ForumPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Forum</h1>
          <p className="mt-1 text-sm text-[var(--color-mute)]">Discuss anime, share recommendations, and connect with fans.</p>
        </div>
        <Link href="/forum/create"
          className="rounded-xl bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition shrink-0"
        >+ New Thread</Link>
      </div>

      <ForumHomeClient />
    </div>
  );
}
