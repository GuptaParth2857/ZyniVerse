import type { Metadata } from "next";
import ConventionCalendar from "@/components/ConventionCalendar";
import ConventionMap from "@/components/ConventionMap";

export const metadata: Metadata = {
  title: "Anime Conventions in India — Calendar & Events | ZyniVerse",
  description: "Find anime conventions, comic cons, and otaku events near you in India. Upcoming events, ticket info, and community meetups.",
  openGraph: {
    title: "Anime Conventions in India — Calendar & Events | ZyniVerse",
    description: "Find anime conventions, comic cons, and otaku events near you in India.",
  },
};

export default function ConventionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
          // Events
        </p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Anime Conventions in India</h1>
        <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
          Find anime conventions, comic cons, and otaku events near you. Upcoming events, ticket info, and community meetups across India.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-300">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          <span><strong>Community-sourced data.</strong> No public API exists for Indian convention data. Dates/venues are illustrative — verify with official event websites.</span>
        </div>
      </div>

      <div className="mb-10">
        <ConventionCalendar />
      </div>

      <hr className="border-[var(--color-line)] my-10" />

      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Conventions by Location</h2>
        <p className="text-sm text-[var(--color-mute)] mb-6">Browse conventions grouped by state and city</p>
        <ConventionMap />
      </div>
    </div>
  );
}
