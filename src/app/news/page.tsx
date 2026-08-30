import type { Metadata } from "next";
import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";
import { NEWS_DESK } from "@/lib/news-desk";
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

const CATEGORY_STYLES: Record<string, string> = {
  "Dub Release": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Announcement: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Schedule: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Industry: "bg-white/10 text-[var(--color-mute)] border-white/20",
};

function NewsDeskSection() {
  if (NEWS_DESK.length === 0) return null;
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-cyan)]" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
          ZyniVerse News Desk
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">
          Verified by staff
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {NEWS_DESK.map((n) => (
          <Link key={n.slug} href={`/news/desk/${n.slug}`} className="glass-card group block rounded-xl p-4 transition-colors hover:bg-white/5">
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[n.category] || CATEGORY_STYLES.Industry}`}>
                {n.category}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--color-mute)]">
                {new Date(n.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <p className="mt-2.5 line-clamp-2 font-display text-sm font-bold leading-snug text-white group-hover:text-[var(--color-cyan)] transition-colors">
              {n.title}
            </p>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-mute)]">{n.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

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
        <NewsDeskSection />
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
