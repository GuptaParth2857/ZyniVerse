import type { Metadata } from "next";
import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";

export const metadata: Metadata = {
  title: "Anime News & Updates — Stay Informed | ZyniVerse",
  description:
    "Latest anime news, seasonal announcements, trending shows, airing schedules, and community activity — all in one place.",
  openGraph: {
    title: "Anime News & Updates — Stay Informed | ZyniVerse",
    description:
      "Latest anime news, seasonal announcements, trending shows, airing schedules, and community activity — all in one place.",
  },
  twitter: {
    title: "Anime News & Updates — Stay Informed | ZyniVerse",
    description:
      "Latest anime news, seasonal announcements, trending shows, airing schedules, and community activity — all in one place.",
  },
};

export default function NewsPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            News & Updates
          </p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">
            Anime News Feed
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Trending shows, airing schedules, seasonal announcements, and community activity.
          </p>
        </div>
        <Link
          href="/manga-million"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl neon-rgb-border bg-[var(--color-panel)] px-5 py-4 transition-colors hover:bg-[var(--color-panel)]/80"
        >
          <span className="flex items-center gap-3">
            <span className="rounded-full bg-[var(--color-magenta)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black">
              Breaking
            </span>
            <span className="text-sm font-bold text-[var(--color-ink)]">
              MANGA MILLION: Shueisha&apos;s free manga platform — 1M pages in 100+ languages incl. Hindi
            </span>
          </span>
          <span className="shrink-0 text-xs font-bold text-[var(--color-cyan)]">
            Read the story →
          </span>
        </Link>
        <NewsFeed />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6 mt-8">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
