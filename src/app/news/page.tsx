import type { Metadata } from "next";
import NewsFeed from "@/components/NewsFeed";
import { PageTransition } from "@/components/PageTransition";

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
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
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
        <NewsFeed />
      </div>
    </PageTransition>
  );
}
