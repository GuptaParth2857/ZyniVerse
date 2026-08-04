import Link from "next/link";
import type { Metadata } from "next";
import { SHUT_DOWN_SITES } from "@/lib/data/dead-site-alternatives";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Shut Down Anime Sites & Best Alternatives (2026) — ZyniVerse",
  description:
    "AnimixPlay, HiAnime, AniWatch, 9anime, KissAnime, Zoro.to, GogoAnime, AnimeSuge and other anime sites are down or blocked in India. Here are the best free alternatives — ZyniVerse offers filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations and a watch tracker.",
  keywords: [
    "anitally alternative", "anitally down", "anitally not working",
    "anitusk alternative", "anitusk down",
    "filleranimelist alternative", "filleranimelist down",
    "animixplay alternative", "animixplay shut down",
    "hianime alternative", "hianime shut down", "hianime down",
    "aniwatch alternative", "aniwatch shut down",
    "9anime alternative", "9anime down", "9anime shut down",
    "kissanime alternative", "kissanime shut down",
    "zoro.to alternative", "zoro alternative",
    "gogoanime alternative", "gogoanime not working", "gogoanime blocked in india",
    "animesuge alternative", "animesuge shut down",
    "funimation alternative", "horriblesubs alternative",
    "anime sites shut down", "anime site alternatives", "best anime sites 2026",
  ],
  openGraph: {
    title: "Shut Down Anime Sites & Best Alternatives (2026)",
    description: "AnimixPlay, HiAnime, AniWatch, 9anime, KissAnime, Zoro.to, GogoAnime are down. Find the best free anime tracker and filler guide alternatives.",
    url: `${BASE_URL}/alternatives`,
    type: "website",
    siteName: "ZyniVerse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shut Down Anime Sites & Best Alternatives (2026)",
    description: "Find the best free anime tracker and filler guide alternatives to AnimixPlay, HiAnime, AniWatch, 9anime, KissAnime and GogoAnime.",
  },
  alternates: { canonical: `${BASE_URL}/alternatives` },
  robots: { index: true, follow: true },
};

export default function AlternativesHubPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Alternatives</span>
      </nav>

      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">2026 Guide</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            Shut Down Anime Sites & Alternatives
          </div>
        </h1>
        <p className="mt-4 max-w-3xl text-[var(--color-mute)] leading-relaxed">
          Popular anime sites — AnimixPlay, HiAnime, AniWatch, 9anime, KissAnime, Zoro.to,
          GogoAnime, AnimeSuge, AniTally, AniTusk and others — have shut down or been blocked
          in India. If you used any of these sites, don&apos;t worry: ZyniVerse is the free
          all-in-one replacement with filler guides, Indian dub tracking, a watch tracker,
          and a community. Here&apos;s what happened to each site and what to use instead.
        </p>
      </div>

      <div className="space-y-6">
        {SHUT_DOWN_SITES.map((site) => (
          <Link
            key={site.slug}
            href={`/alternatives/${site.slug}`}
            className="block rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8 transition-transform hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-xl font-bold">{site.siteName}</h2>
                <span className="font-mono text-xs text-[var(--color-mute)]">{site.domain}</span>
              </div>
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[10px] font-semibold text-red-300">
                SHUT DOWN
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--color-mute)] leading-relaxed">
              {site.currentStatus}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-cyan)]">
              Best {site.siteName} alternatives →
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-[var(--color-magenta)]/30 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8 sm:p-12">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">The all-in-one replacement: ZyniVerse</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--color-mute)] leading-relaxed">
          Instead of juggling a tracker, a filler list site, and a dub schedule, ZyniVerse puts
          everything in one free platform. Skip filler in 200+ anime, track Hindi/Tamil/Telugu
          dubs, get AI recommendations, keep a watchlist, read manga, and join India&apos;s anime
          community.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/search" className="inline-flex rounded-full bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
            Browse Anime Free →
          </Link>
          <Link href="/filler" className="inline-flex rounded-full border border-white/20 px-6 py-2.5 text-sm font-bold hover:bg-white/5 transition-colors">
            View Filler Guides
          </Link>
          <Link href="/best-anime-sites" className="inline-flex rounded-full border border-white/20 px-6 py-2.5 text-sm font-bold hover:bg-white/5 transition-colors">
            Best Anime Sites 2026
          </Link>
        </div>
      </section>
    </div>
  );
}
