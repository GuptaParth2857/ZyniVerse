import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import StreamingCalendarGrid from "./StreamingCalendarGrid";
import { fetchStreamingCalendarWeek, type StreamingCalendarEntry } from "@/lib/anilist-schedule";

export const metadata: Metadata = {
  title: "Streaming Calendar - Where to Watch Anime This Week | ZyniVerse",
  description: "See what's new on Crunchyroll, Netflix, JioHotstar, Amazon Prime Video, Muse Asia and more in India. Weekly anime streaming schedule.",
};

// Re-render at most once an hour so the schedule always reflects the current week.
export const revalidate = 3600;

export default async function StreamingCalendarPage() {
  // Live AniList data only — no hardcoded fallback, so a stale week of
  // episodes is never shown as "this week". Empty state handled by the grid.
  let entries: StreamingCalendarEntry[] = [];
  try {
    entries = await fetchStreamingCalendarWeek();
  } catch {
    entries = [];
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Where to Watch</p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Streaming Calendar</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          New episodes this week on major Indian streaming platforms.
        </p>
        <StreamingCalendarGrid entries={entries} />
      </div>
    </PageTransition>
  );
}
