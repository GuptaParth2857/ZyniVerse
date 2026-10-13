import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CHANNEL_SLUGS,
  getLiveDubWeekly,
  getThisWeekRange,
  type DubChannel,
  type LiveDubEntry,
} from "@/lib/dub-weekly";
import { ScheduleTable, ChannelNav } from "@/components/dub-weekly/ScheduleTable";
import NativeBannerAd from "@/components/NativeBannerAd";

export const revalidate = 1800;
export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

const CHANNEL_ORDER: DubChannel[] = [
  "Muse India (YouTube)",
  "Ani-One India (YouTube)",
  "Crunchyroll",
];

export function generateStaticParams() {
  return CHANNEL_ORDER.map((c) => ({ channel: CHANNEL_SLUGS[c] }));
}

function channelFromSlug(slug: string): DubChannel | null {
  return CHANNEL_ORDER.find((c) => CHANNEL_SLUGS[c] === slug) || null;
}

type Props = { params: Promise<{ channel: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channel } = await params;
  const ch = channelFromSlug(channel);
  const week = getThisWeekRange();
  if (!ch) return { title: "Hindi Dub Schedule" };
  return {
    title: `${ch} Hindi Dub Schedule This Week — ${week.label}`,
    description:
      `${ch} new Hindi, Tamil & Telugu dub releases this week (${week.label}) with IST times. Every upload and schedule update for ${ch} in India.`,
    keywords: [
      `${ch.toLowerCase()} hindi dub schedule`,
      `${ch.toLowerCase()} schedule`,
      `${ch.toLowerCase()} new episodes this week`,
      "hindi dub schedule",
      `${ch.toLowerCase()} india schedule`,
    ],
    alternates: { canonical: `${BASE_URL}/hindi-dub-schedule/${channel}` },
    robots: { index: true, follow: true },
  };
}

export default async function HindiDubChannelPage({ params }: Props) {
  const { channel } = await params;
  const ch = channelFromSlug(channel);
  if (!ch) notFound();
  const week = getThisWeekRange();
  let entries: LiveDubEntry[] = [];
  try {
    entries = await getLiveDubWeekly(ch);
  } catch {
    // Feed outage — render the page honestly with an empty state instead of failing.
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${ch} — Hindi Dub Schedule This Week (${week.label})`,
    description: `${ch} Hindi, Tamil and Telugu release schedule for the week of ${week.label} with IST times.`,
    url: `${BASE_URL}/hindi-dub-schedule/${channel}`,
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
    publisher: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
    mainEntityOfPage: `${BASE_URL}/hindi-dub-schedule/${channel}`,
  };

  const chName = ch.replace(" (YouTube)", "");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/indian-dubs" className="hover:text-[var(--color-cyan)] transition-colors">Indian Dubs</Link>
          <span>/</span>
          <Link href="/hindi-dub-schedule" className="hover:text-[var(--color-cyan)] transition-colors">Dub Schedule</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">{chName}</span>
        </nav>

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            {chName} · Week of {week.label}
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              {chName} Hindi Dub Schedule
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-[var(--color-mute)] leading-relaxed">
            Every {chName} Hindi, Tamil &amp; Telugu dub upload this week{" "}
            <strong className="text-[var(--color-ink)]">({week.label})</strong> — real publish times,
            straight from the official channel feed.
          </p>
        </div>

        <ChannelNav active={ch} />

        <div className="mb-10">
          <h2 className="font-display text-lg font-bold mb-4">This week on {chName}</h2>
          {ch === "Crunchyroll" ? (
            <p className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 text-sm text-[var(--color-mute)]">
              Crunchyroll India does not publish a machine-readable dub schedule, so we don&apos;t show
              one here. Check{" "}
              <a
                href="https://www.crunchyroll.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-cyan)] hover:underline"
              >
                crunchyroll.com
              </a>{" "}
              for the latest regional-dub releases.
            </p>
          ) : (
            <ScheduleTable entries={entries} />
          )}
        </div>

        <section className="mb-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center">
          <p className="font-display text-lg font-bold">See the full India dub universe</p>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Every Hindi, Tamil &amp; Telugu dub with countdowns and episode counts —{" "}
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
