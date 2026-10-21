import type { Metadata } from "next";
import Link from "next/link";
import { getLiveDubWeekly, getThisWeekRange, type LiveDubEntry } from "@/lib/dub-weekly";
import { ScheduleTable, ChannelNav } from "@/components/dub-weekly/ScheduleTable";
import NativeBannerAd from "@/components/NativeBannerAd";

export const revalidate = 21600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Hindi Dub Anime Schedule This Week (2026) — What Airing Now in India",
  description:
    "Live Hindi, Tamil and Telugu dub uploads from Muse India and Ani-One India, pulled straight from the official YouTube channels. See what's new in India right now.",
  keywords: [
    "hindi dub schedule", "hindi dub anime schedule", "anime hindi schedule", "this week hindi dub",
    "muse india schedule", "ani one india schedule", "crunchyroll hindi dub new episodes",
    "hindi dub release date", "dubbed anime schedule india", "indian anime schedule", "hindi anime this week",
  ],
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Hindi Dub Anime Schedule This Week",
    description: "Live Hindi, Tamil & Telugu dub uploads from the official Indian anime YouTube channels.",
    url: `${BASE_URL}/hindi-dub-schedule`,
    type: "website",
    siteName: "ZyniVerse",
  },
  alternates: { canonical: `${BASE_URL}/hindi-dub-schedule` },
  robots: { index: true, follow: true },
};

export default async function HindiDubSchedulePage() {
  const week = getThisWeekRange();
  let entries: LiveDubEntry[] = [];
  try {
    entries = await getLiveDubWeekly();
  } catch {
    // Feed outage — render the page honestly with an empty state instead of failing.
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Hindi Dub Anime Schedule This Week — What's Airing in India",
      description: `The latest Hindi, Tamil and Telugu anime dub uploads in India (week of ${week.label}), pulled live from the official Muse India and Ani-One India YouTube channels.`,
      url: `${BASE_URL}/hindi-dub-schedule`,
      dateModified: new Date().toISOString().slice(0, 10),
      author: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
      publisher: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
      mainEntityOfPage: `${BASE_URL}/hindi-dub-schedule`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Who airs new Hindi dub anime in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The main free destinations are the Muse India and Ani-One India YouTube channels, which upload Hindi, Tamil and Telugu dubs on a rolling schedule. Crunchyroll India also releases regional dubs, but does not publish a machine-readable schedule.",
          },
        },
        {
          "@type": "Question",
          name: "How up to date is this schedule?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "This page is built live from the official Muse India and Ani-One India YouTube feeds, so each row is a real upload with its actual publish time in IST.",
          },
        },
        {
          "@type": "Question",
          name: "Is Muse India's Hindi dub schedule free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Muse India streams its Hindi, Tamil and Telugu dubs free on YouTube, and every upload shows up in this schedule as it goes live.",
          },
        },
        {
          "@type": "Question",
          name: "What does 'batched release' mean for Hindi dubs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Some long-running shows release their Indian dubs in larger episode batches rather than one episode a week. The uploads still appear here as soon as they are published.",
          },
        },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd[0]) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd[1]) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/indian-dubs" className="hover:text-[var(--color-cyan)] transition-colors">Indian Dubs</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">Dub Schedule</span>
        </nav>

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            Live India Schedule · Week of {week.label}
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              Hindi Dub Schedule
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-[var(--color-mute)] leading-relaxed">
            The latest Hindi, Tamil and Telugu anime dub uploads in India{" "}
            <strong className="text-[var(--color-ink)]">({week.label})</strong> — pulled live from the
            official Muse India and Ani-One India YouTube channels.
          </p>
        </div>

        <ChannelNav active="all" />

        <div className="mb-10">
          <h2 className="font-display text-lg font-bold mb-4">Latest uploads — all channels</h2>
          <ScheduleTable entries={entries} />
        </div>

        <section className="mb-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center">
          <p className="font-display text-lg font-bold">Want the full picture?</p>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Browse every Hindi, Tamil &amp; Telugu dub with live countdowns and episode counts on the{" "}
            <Link href="/indian-dubs" className="text-[var(--color-cyan)] hover:underline">Indian Dub Meter</Link>.
          </p>
        </section>

        <div className="mt-10">
          <NativeBannerAd />
        </div>
      </div>
    </>
  );
}
