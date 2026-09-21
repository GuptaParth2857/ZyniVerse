import type { Metadata } from "next";
import Link from "next/link";
import { DUB_WEEKLY, getThisWeekRange } from "@/lib/dub-weekly";
import { ScheduleTable, ChannelNav } from "@/components/dub-weekly/ScheduleTable";
import NativeBannerAd from "@/components/NativeBannerAd";

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Hindi Dub Anime Schedule This Week (2026) — What Airing Now in India | ZyniVerse",
  description:
    "This week's Hindi dub schedule for India: Muse India, Ani-One, Crunchyroll, Anime Times and more. Daily IST release slots, latest batches and where to watch every Hindi, Tamil & Telugu dub.",
  keywords: [
    "hindi dub schedule", "hindi dub anime schedule", "anime hindi schedule", "this week hindi dub",
    "muse india schedule", "ani one india schedule", "crunchyroll hindi dub new episodes",
    "hindi dub release date", "dubbed anime schedule india", "indian anime schedule", "hindi anime this week",
  ],
  openGraph: {
    title: "Hindi Dub Anime Schedule This Week | ZyniVerse",
    description: "All new Hindi, Tamil & Telugu dubs airing this week in India — daily IST slots.",
    url: `${BASE_URL}/hindi-dub-schedule`,
    type: "website",
    siteName: "ZyniVerse",
  },
  alternates: { canonical: `${BASE_URL}/hindi-dub-schedule` },
  robots: { index: true, follow: true },
};

export default function HindiDubSchedulePage() {
  const week = getThisWeekRange();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Hindi Dub Anime Schedule This Week — What's Airing in India",
      description: `This week's Indian anime dub schedule (${week.label}): Muse India, Ani-One India, Crunchyroll, Anime Times and more, in IST release slots.`,
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
          name: "Who airs the best new Hindi dub anime this week in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The weekly broadcast is split between Muse India (YouTube), Ani-One India (YouTube), Crunchyroll and Anime Times. New simulcast dubs this season include Iruma-kun S3 (Muse, daily 8:30 PM IST), Mushoku Tensei S3 (Crunchyroll, Sundays 4:30 PM IST), and One Piece Egghead batches (Crunchyroll, Mondays).",
          },
        },
        {
          "@type": "Question",
          name: "When do new Hindi dubbed episodes come out?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most current Hindi dubs air on fixed weekly slots: Mushoku Tensei S3 on Sundays, One Piece batches on Mondays, with Muse India's Iruma-kun dropping daily at 8:30 PM IST. Movies and older batches release on demand.",
          },
        },
        {
          "@type": "Question",
          name: "Is Muse India's Hindi dub schedule free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Muse India streams its Hindi, Tamil and Telugu dubs free on YouTube, including the current Iruma-kun Season 3 rollout at 8:30 PM IST daily.",
          },
        },
        {
          "@type": "Question",
          name: "What does 'batched release' mean for Hindi dubs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Long-form shows like One Piece, Naruto: Shippuden and Fullmetal Alchemist: Brotherhood release their Indian dubs in large episode batches rather than one episode per week, often on Mondays or every few weeks.",
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
            Weekly India Schedule · Week of {week.label}
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              Hindi Dub Schedule This Week
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-[var(--color-mute)] leading-relaxed">
            What&apos;s airing in Hindi, Tamil and Telugu in India this week{" "}
            <strong className="text-[var(--color-ink)]">({week.label})</strong> — daily IST release
            slots from Muse India, Ani-One India, Crunchyroll, Anime Times and the TV broadcasters.
          </p>
        </div>

        <ChannelNav active="all" />

        <div className="mb-10">
          <h2 className="font-display text-lg font-bold mb-4">All channels — this week</h2>
          <ScheduleTable entries={DUB_WEEKLY} />
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