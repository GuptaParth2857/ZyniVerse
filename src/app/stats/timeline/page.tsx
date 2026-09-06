import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import WatchHistoryTimeline from "@/components/WatchHistoryTimeline";

export const metadata: Metadata = {
  title: "Watch History Timeline | ZyniVerse",
  description: "Visualize your anime journey with an interactive timeline of every episode you've watched.",
};

export default function TimelinePage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Timeline</p>
          <div className="neon-rgb-border rounded-xl px-5 py-3 inline-block mt-1">
            <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-violet)] bg-clip-text text-transparent">
              Your Anime Journey
            </h1>
          </div>
          <p className="mt-3 text-sm text-[var(--color-mute)] max-w-xl">
            Every episode, every month, every milestone — visualized.
          </p>
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
