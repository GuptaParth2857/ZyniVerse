"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMangaTrending, getMangaPopular, getMangaTopRated, getGenres } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";
import { CardSkeleton } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import type { Media } from "@/lib/anilist";

const TABS = [
  { key: "trending", label: "Trending", fetcher: () => getMangaTrending(24) },
  { key: "popular", label: "Popular", fetcher: () => getMangaPopular(24) },
  { key: "top", label: "Top Rated", fetcher: () => getMangaTopRated(24) },
];

export default function MangaBrowsePage() {
  const [tab, setTab] = useState("trending");
  const [list, setList] = useState<Media[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    const t = TABS.find((t) => t.key === tab);
    t?.fetcher()
      .then((d) => !cancelled && setList(d))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [tab]);

  return (
    <PageTransition><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">// Manga</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Browse Manga</h1>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-[var(--color-line)] pb-3">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              tab === t.key
                ? "text-[var(--color-magenta)] border-b-2 border-[var(--color-magenta)]"
                : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >{t.label}</button>
        ))}
        <Link href="/search?type=MANGA"
          className="ml-auto text-xs text-[var(--color-cyan)] hover:underline"
        >Search Manga →</Link>
      </div>

      {/* Genre Pills */}
      {genres.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {genres.map((g) => (
            <Link key={g} href={`/search?genre=${g}&type=MANGA`}
              className="rounded-full border border-[var(--color-line)] px-2.5 py-0.5 text-[10px] text-[var(--color-mute)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)] transition-colors"
            >{g}</Link>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="mt-8">
        {error ? (
          <p className="text-sm text-[var(--color-magenta)]">{error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {list.map((m) => <AnimeCard key={m.id} anime={m} />)}
            {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={`s${i}`} />)}
          </div>
        )}
        {!loading && list.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--color-mute)]">No manga found.</p>
        )}
      </div>
    </div></PageTransition>
  );
}
