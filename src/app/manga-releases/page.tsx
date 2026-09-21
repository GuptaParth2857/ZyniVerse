import type { Metadata } from "next";
import Link from "next/link";
import {
  MANGA_RELEASES,
  nextReleaseTimeISO,
  formatNextRelease,
  isReleasedToday,
  type MangaReleaseSeries,
} from "@/lib/manga-releases";
import { LiveCountdown } from "@/components/manga-release/LiveCountdown";
import NativeBannerAd from "@/components/NativeBannerAd";

export const revalidate = 900;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Manga Chapter Release Dates & Countdown 2026 — One Piece, JJK & More | ZyniVerse",
  description:
    "When does the next manga chapter drop? Live release countdowns for One Piece, Chainsaw Man, Solo Leveling Ragnarok, Boruto, Spy x Family, Frieren and more — with IST release slots and exact dates.",
  keywords: [
    "manga release dates", "next manga chapter release date", "one piece new chapter release",
    "one piece chapter countdown", "chainsaw man release date", "solo leveling ragnarok chapter release",
    "boruto two blue vortex release", "manga chapter schedule", "when does one piece release",
    "new chapter ist",
  ],
  openGraph: {
    title: "Manga Release Dates & Countdowns | ZyniVerse",
    description: "Live countdowns for the next One Piece, Chainsaw Man, Solo Leveling and more manga chapters.",
    url: `${BASE_URL}/manga-releases`,
    type: "website",
    siteName: "ZyniVerse",
  },
  alternates: { canonical: `${BASE_URL}/manga-releases` },
  robots: { index: true, follow: true },
};

function Item({ s }: { s: MangaReleaseSeries }) {
  const released = isReleasedToday(s);
  const iso = nextReleaseTimeISO(s);
  const next = formatNextRelease(s);
  return (
    <Link
      href={`/manga-releases/${s.slug}`}
      className="flex flex-col gap-2 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 hover:opacity-90 transition-opacity"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">{s.title}</p>
          <p className="mt-0.5 text-xs text-[var(--color-mute)]">{s.magazine}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
            released
              ? "bg-green-500/20 text-green-400"
              : s.cadence === "hiatus"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-cyan-500/20 text-cyan-400"
          }`}
        >
          {released ? "Released" : s.cadence === "hiatus" ? "Hiatus" : s.cadence}
        </span>
      </div>
      {s.cadence !== "hiatus" ? (
        <>
          {iso && (
            <div className="mt-1">
              <LiveCountdown target={iso} />
            </div>
          )}
          <p className="text-xs text-[var(--color-mute)]">
            {next ? `Next: ${next} IST` : "Release time TBA"}
          </p>
        </>
      ) : (
        <p className="text-xs text-[var(--color-mute)]">{s.chaptersNote || "No fixed schedule"}</p>
      )}
    </Link>
  );
}

export default function MangaReleasesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Manga Chapter Release Dates & Countdowns",
    description:
      "Live countdowns and IST release dates for upcoming manga chapters: One Piece, Chainsaw Man, Solo Leveling: Ragnarok, Boruto: Two Blue Vortex, Spy x Family, Frieren and more.",
    url: `${BASE_URL}/manga-releases`,
    isPartOf: { "@type": "WebSite", name: "ZyniVerse", url: BASE_URL },
    mainEntity: MANGA_RELEASES.filter((s) => s.cadence !== "hiatus").map((s) => ({
      "@type": "CreativeWork",
      name: `${s.title} — next chapter release date`,
      url: `${BASE_URL}/manga-releases/${s.slug}`,
      isPartOf: { "@type": "Periodical", name: s.magazine },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">Manga Basics</span>
          <span>/</span>
          <span className="text-[var(--color-mute)]">Release Countdowns</span>
        </nav>

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            Manga Release Tracker · Updated continuously
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              When Does the Next Chapter Drop?
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-[var(--color-mute)] leading-relaxed">
            Live countdowns for the biggest ongoing manga. We work backward from the official release
            slot of each magazine (Weekly Shonen Jump, JUMP+, V Jump, Kakao Webtoon and Weekly Shonen
            Sunday) so you always know the exact IST moment a new chapter lands.
          </p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {MANGA_RELEASES.filter((s) => s.cadence !== "hiatus").map((s) => (
            <Item key={s.slug} s={s} />
          ))}
        </div>

        <section className="mb-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h2 className="font-display text-lg font-bold mb-3">Concluded / on hiatus chapters</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {MANGA_RELEASES.filter((s) => s.cadence === "hiatus").map((s) => (
              <Item key={s.slug} s={s} />
            ))}
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h2 className="font-display text-lg font-bold mb-3">Why we use magazine slots</h2>
          <p className="text-sm leading-relaxed text-[var(--color-mute)]">
            Manga chapters rarely have a fixed &quot;chapter 1142 release date&quot; published ahead of time —
            magazines announce the <em>known cadence</em> (weekly, every second week, monthly) and
            occasional breaks. We anchor our countdown to the confirmed slot and automatically slide to
            the next slot if a published break pushes the release. That gives you a countdown that is
            almost always right hours before the drop, without any guessing.
          </p>
        </section>

        <div className="mt-10">
          <NativeBannerAd />
        </div>
      </div>
    </>
  );
}