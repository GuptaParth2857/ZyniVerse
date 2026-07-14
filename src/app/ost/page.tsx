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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
          // Music
        </p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Anime OST Database</h1>
        <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
          Browse a curated database of anime opening themes, ending themes, insert songs, and soundtracks. Find your favorite anime songs and artists.
        </p>
      </div>
      {/* Affiliate CTA */}
      <div className="mt-6 flex flex-wrap gap-3">
        <AffiliateLink partner="cdjapan" path="https://www.cdjapan.co.jp"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity"
        >💿 Buy OST CDs on CDJapan</AffiliateLink>
        <AffiliateLink partner="amazon" path="https://www.amazon.com/s?k=anime+soundtrack&tag=zyniverse-21"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
        >🎵 Buy Soundtracks on Amazon</AffiliateLink>
      </div>

      <OSTList />
      <div className="mx-auto max-w-7xl pb-6 mt-8">
        <NativeBannerAd />
      </div>
    </div>
  );
}
