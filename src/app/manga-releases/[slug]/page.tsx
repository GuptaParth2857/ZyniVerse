import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MANGA_RELEASES,
  getSeries,
  nextReleaseTimeISO,
  formatNextRelease,
  isReleasedToday,
} from "@/lib/manga-releases";
import { LiveCountdown } from "@/components/manga-release/LiveCountdown";
import NativeBannerAd from "@/components/NativeBannerAd";

export const revalidate = 3600;
export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export function generateStaticParams() {
  return MANGA_RELEASES.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSeries(slug);
  if (!s) return { title: "Manga Release Dates | ZyniVerse" };
  const next = formatNextRelease(s);
  return {
    title: `${s.title} — Next Manga Chapter Release Date (2026) | ZyniVerse`,
    description: next
      ? `${s.title} next chapter drops ${next} IST. Live countdown, magazine, and platform — ${s.summary}`
      : `${s.summary} Full ${s.title} manga release info and schedule on ZyniVerse.`,
    keywords: [
      `${s.title} release date`, `${s.title} next chapter`, `${s.title} new chapter`,
      `${s.title} chapter release ist`, "manga release schedule india",
    ],
    alternates: { canonical: `${BASE_URL}/manga-releases/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function MangaReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = getSeries(slug);
  if (!s) notFound();

  const iso = nextReleaseTimeISO(s);
  const released = isReleasedToday(s);
  const next = formatNextRelease(s);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${s.title} Next Chapter Release Date — IST Countdown`,
    description: next
      ? `The next chapter of ${s.title} is expected to drop ${next} IST, per the ${s.magazine} slot.`
      : `Release information for ${s.title} (${s.magazine}).`,
    url: `${BASE_URL}/manga-releases/${slug}`,
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
    publisher: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
    mainEntityOfPage: `${BASE_URL}/manga-releases/${slug}`,
  };

  const faqItems = s.cadence === "hiatus"
    ? [
        {
          "@type": "Question",
          name: `Is ${s.title} still releasing chapters?`,
          acceptedAnswer: { "@type": "Answer", text: s.chaptersNote || "No current fixed schedule." },
        },
      ]
    : [
        {
          "@type": "Question",
          name: `When does the next ${s.title} chapter come out?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Based on the ${s.magazine} slot, the next chapter drops ${
              next ? `around ${next} IST` : "when announced"
            }. Countdown above updates live.`,
          },
        },
        {
          "@type": "Question",
          name: `Where can I read ${s.title} new chapters?`,
          acceptedAnswer: { "@type": "Answer", text: `Officially via ${s.platform} and the ${s.magazine} app.` },
        },
        {
          "@type": "Question",
          name: `How often do ${s.title} chapters release?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              s.cadence === "monthly"
                ? "Monthly — around the 21st of each month."
                : s.cadence === "biweekly"
                  ? "About every two weeks."
                  : s.cadence === "weekly"
                    ? "Weekly, with occasional scheduled breaks."
                    : "On an irregular schedule announced by the publisher.",
          },
        },
      ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems }) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/manga-releases" className="hover:text-[var(--color-cyan)] transition-colors">Manga Releases</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">{s.title}</span>
        </nav>

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            {s.magazine} · {s.cadence}
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              {s.title} Next Chapter Release
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-[var(--color-mute)] leading-relaxed">{s.summary}</p>
        </div>

        {s.cadence !== "hiatus" && (
          <div className="mb-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
              Next release countdown
            </p>
            {iso ? (
              <>
                <LiveCountdown target={iso} />
                <p className="mt-3 text-xs text-[var(--color-mute)]">
                  {released ? "Released slot today" : "Expected"} —{" "}
                  {next ? `${next} IST` : "release time TBA"}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--color-mute)]">
                Release slot TBA — checking the {s.magazine} announcement shelf.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--color-mute)]">
              <span>Cadence: <strong className="text-[var(--color-ink)]">{s.cadence}</strong></span>
              {s.releaseDay && <span>Slot: <strong className="text-[var(--color-ink)]">{s.releaseDay}</strong></span>}
              <span>Read via: <strong className="text-[var(--color-ink)]">{s.platform}</strong></span>
            </div>
          </div>
        )}

        {s.cadence === "hiatus" && (
          <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <p className="text-sm text-[var(--color-mute)]">
              <strong className="text-amber-400">No active countdown.</strong>{" "}
              {s.chaptersNote || "The series is between release batches."} We add a live countdown the
              moment a resumption date is officially announced.
            </p>
          </div>
        )}

        <section className="mb-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h2 className="font-display text-lg font-bold mb-3">Other release countdowns</h2>
          <div className="flex flex-wrap gap-2">
            {MANGA_RELEASES.filter((x) => x.slug !== s.slug && x.cadence !== "hiatus").map((x) => (
              <Link
                key={x.slug}
                href={`/manga-releases/${x.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
              >
                {x.title}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <NativeBannerAd />
        </div>
      </div>
    </>
  );
}