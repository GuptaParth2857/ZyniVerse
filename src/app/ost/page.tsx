import type { Metadata } from "next";
import OSTList from "@/components/OSTList";
import AffiliateLink from "@/components/AffiliateLink";
import NativeBannerAd from "@/components/NativeBannerAd";

export const metadata: Metadata = {
  title: "Anime OST Database — Soundtracks & Music | ZyniVerse",
  description: "Browse a curated database of anime opening themes, ending themes, and soundtracks. Find your favorite anime songs and artists.",
  openGraph: {
    title: "Anime OST Database — Soundtracks & Music | ZyniVerse",
    description: "Browse a curated database of anime opening themes, ending themes, and soundtracks.",
  },
};

export default function OSTPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="relative mb-10 overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/40 backdrop-blur-sm p-6 sm:p-10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[var(--color-magenta)] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--color-cyan)] rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--color-violet)] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-magenta)]/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-cyan)]/70">
              Music Database
            </p>
          </div>

          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold sm:text-5xl leading-tight">
              <span className="neon-text-gradient">Anime OST</span>{" "}
              <span className="text-[var(--color-ink)]">Database</span>
            </h1>
          </div>
          <p className="mt-3 text-sm sm:text-base text-[var(--color-mute)] max-w-2xl leading-relaxed">
            Discover opening themes, ending themes, insert songs, and soundtracks from your favorite anime. Stream, explore, and find new music.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <AffiliateLink partner="cdjapan" path="https://www.cdjapan.co.jp"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-magenta)]/20"
            > Buy OST CDs on CDJapan</AffiliateLink>
            <AffiliateLink partner="amazon" path="https://www.amazon.in/s?k=anime+soundtrack"
              className="inline-flex items-center gap-2 rounded-full neon-rgb-border bg-[var(--color-panel)]/50 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
            > Buy Soundtracks on Amazon</AffiliateLink>
          </div>
        </div>
      </div>

      <OSTList />

      <div className="mx-auto max-w-7xl pb-6 mt-10">
        <NativeBannerAd />
      </div>
    </div>
  );
}
