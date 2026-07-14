import Link from "next/link";
import type { Metadata } from "next";
import AffiliateLink from "@/components/AffiliateLink";
import FillerSearch from "@/components/FillerSearch";
import AdBanner from "@/components/AdBanner";
import NativeBannerAd from "@/components/NativeBannerAd";
import { getPopularFillerAnime } from "@/lib/filler";

export const metadata: Metadata = {
  title: "Anime Filler List — Complete Filler Guide for Every Anime | ZyniVerse",
  description:
    "The ultimate anime filler guide. Find out which episodes to skip for Naruto, One Piece, Bleach, Boruto, Dragon Ball, and hundreds more. Every episode marked as canon or filler.",
  openGraph: {
    title: "Anime Filler List — Complete Filler Guide | ZyniVerse",
    description: "Never watch filler again. Complete filler lists for Naruto, One Piece, Bleach, and 200+ anime.",
  },
  robots: { index: true, follow: true },
};

export default async function FillerListingPage() {
  const popular = await getPopularFillerAnime(20);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Filler Guides</span>
      </nav>

      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Filler Guides</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Anime Filler List</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Complete filler guides for popular anime. Search any anime below or browse the list to see exactly which episodes are canon and which are filler.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl">
        <FillerSearch />
      </div>

      {/* Affiliate CTA */}
      <div className="mb-8 flex flex-wrap gap-3">
        <AffiliateLink partner="crunchyroll" path="https://www.crunchyroll.com"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F47521] to-[#f59e0b] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity"
        >▶ Watch on Crunchyroll</AffiliateLink>
        <AffiliateLink partner="amazon" path="https://www.amazon.com/s?k=anime+blu+ray&tag=zyniverse-21"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
        >📦 Buy Anime on Amazon</AffiliateLink>
      </div>

      <div className="mb-6 max-w-[728px] mx-auto">
        <AdBanner placement="filler" type="banner" />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
        <h2 className="font-display text-lg font-bold">Popular Filler Guides</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {popular.map((anime) => (
          <Link
            key={anime.id}
            href={`/anime/${anime.id}/filler`}
            className="neon-premium rounded-xl no-underline group"
          >
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-magenta)]/10 text-sm font-bold font-mono text-[var(--color-magenta)] group-hover:bg-[var(--color-magenta)]/20 transition-colors">
                  {anime.fillerPct}%
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate group-hover:text-[var(--color-cyan)] transition-colors">{anime.title}</p>
                  <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{anime.episodes} episodes · {anime.fillerPct}% filler</p>
                </div>
              </div>
              <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-[var(--color-line)]">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${anime.canonPct}%` }} title={`${anime.canonPct}% canon`} />
                {anime.mixedPct > 0 && <div className="h-full rounded-full bg-amber-500" style={{ width: `${anime.mixedPct}%` }} />}
                <div className="h-full rounded-full bg-red-500" style={{ width: `${anime.fillerPct}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Native banner after filler list */}
      <NativeBannerAd className="mt-8" />
    </div>
  );
}
