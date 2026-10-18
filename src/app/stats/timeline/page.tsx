import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import WatchHistoryTimeline from "@/components/WatchHistoryTimeline";

export const metadata: Metadata = {
  title: "Watch History Timeline",
  description: "Visualize your anime journey with an interactive timeline of every episode you've watched.",
  alternates: { canonical: "https://zyverse.in/stats/timeline" },
  robots: { index: true, follow: true },
};

export default function TimelinePage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_12px_var(--color-cyan)]" />
              Timeline
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold">
              <span className="neon-text-gradient">Your Anime Journey</span>
            </h1>
            <p className="mt-3 text-sm text-[var(--color-mute)] max-w-xl">
              Every episode, every month, every milestone — visualized.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/stats/wrapped"
              className="rounded-lg border border-[var(--color-magenta)]/25 bg-[var(--color-magenta)]/10 px-3.5 py-2 text-xs font-semibold text-[var(--color-magenta)] transition-colors hover:bg-[var(--color-magenta)]/20"
            >
              Wrapped
            </Link>
            <Link
              href="/stats"
              className="rounded-lg border border-white/[0.08] bg-black/30 px-3.5 py-2 text-xs font-semibold text-white/60 transition-colors hover:border-[var(--color-cyan)]/40 hover:text-white"
            >
              Stats
            </Link>
          </div>
        </div>

        <WatchHistoryTimeline />

        <div className="mt-8 text-center">
          <Link
            href="/stats"
            className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
          >
            ← Back to Stats
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}