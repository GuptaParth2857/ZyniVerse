"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMangaTrending, getMangaPopular, getMangaTopRated, getGenres } from "@/lib/anilist";
import { CardSkeleton } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import MangaCard from "@/components/MangaCard";
import MangaSearch from "@/components/MangaSearch";
import AffiliateLink from "@/components/AffiliateLink";
import type { Media } from "@/lib/anilist";
import { STATUS_LABELS } from "@/lib/manga";

interface MangaEntryDB {
  id: string;
  mediaId: number;
  title: string;
  coverImage: string | null;
  status: string;
  chapters: number;
  volumes: number;
  totalChapters: number | null;
  totalVolumes: number | null;
  score: number | null;
}

const TABS = [
  { key: "trending", label: "Trending", fetcher: () => getMangaTrending(24) },
  { key: "popular", label: "Popular", fetcher: () => getMangaPopular(24) },
  { key: "top", label: "Top Rated", fetcher: () => getMangaTopRated(24) },
];

const LIST_TABS = ["ALL", "READING", "COMPLETED", "PLANNING"];

export default function MangaBrowseClient() {
  const [tab, setTab] = useState("trending");
  const [list, setList] = useState<Media[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myEntries, setMyEntries] = useState<MangaEntryDB[]>([]);
  const [listTab, setListTab] = useState("ALL");
  const [showMyList, setShowMyList] = useState(false);

  useEffect(() => {
    getGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);

    if (showMyList) {
      const params = new URLSearchParams();
      if (listTab !== "ALL") params.set("status", listTab);
      fetch(`/api/manga/list?${params}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setMyEntries(d.entries); })
        .catch((e: Error) => !cancelled && setError(e.message))
        .finally(() => !cancelled && setLoading(false));
    } else {
      const t = TABS.find((t) => t.key === tab);
      t?.fetcher()
        .then((d) => !cancelled && setList(d))
        .catch((e: Error) => !cancelled && setError(e.message))
        .finally(() => !cancelled && setLoading(false));
    }
    return () => { cancelled = true; };
  }, [tab, showMyList, listTab]);

  return (
    <PageTransition><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">// Manga</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Manga Tracker</h1>

      {/* Search */}
      <div className="mt-6">
        <MangaSearch onAdd={() => { setShowMyList(true); setListTab("READING"); }} />
      </div>

      {/* Toggle */}
      <div className="mt-4 flex items-center gap-2 border-b border-[var(--color-line)] pb-3">
        <button onClick={() => { setShowMyList(false); setTab("trending"); }}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            !showMyList ? "text-[var(--color-magenta)] border-b-2 border-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
          }`}
        >Browse</button>
        <button onClick={() => setShowMyList(true)}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            showMyList ? "text-[var(--color-magenta)] border-b-2 border-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
          }`}
        >My List</button>
        <Link href="/search?type=MANGA"
          className="ml-auto text-xs text-[var(--color-cyan)] hover:underline"
        >Advanced Search →</Link>
      </div>

      {/* Browse tabs */}
      {!showMyList && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                tab === t.key ? "bg-[var(--color-violet)]/10 text-[var(--color-violet)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              }`}
            >{t.label}</button>
          ))}
        </div>
      )}

      {/* My List tabs */}
      {showMyList && (
        <div className="mt-4 flex flex-wrap items-center gap-1">
          {LIST_TABS.map((t) => (
            <button key={t} onClick={() => setListTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                listTab === t ? "bg-[var(--color-violet)]/10 text-[var(--color-violet)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              }`}
            >{t === "ALL" ? "All" : STATUS_LABELS[t] || t}</button>
          ))}
        </div>
      )}

      {/* Genre Pills (browse only) */}
      {!showMyList && genres.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {genres.slice(0, 15).map((g) => (
            <Link key={g} href={`/search?genre=${g}&type=MANGA`}
              className="rounded-full border border-[var(--color-line)] px-2.5 py-0.5 text-[10px] text-[var(--color-mute)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)] transition-colors"
            >{g}</Link>
          ))}
        </div>
      )}

      {/* Affiliate Links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <AffiliateLink partner="bookwalker" path="https://global.bookwalker.jp"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity"
        >📖 Buy Manga on BookWalker</AffiliateLink>
        <AffiliateLink partner="amazon" path="https://www.amazon.com/s?k=manga&tag=zyniverse-21"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
        >📦 Buy Manga on Amazon</AffiliateLink>
      </div>

      {/* Grid */}
      <div className="mt-8">
        {error ? (
          <p className="text-sm text-[var(--color-magenta)]">{error}</p>
        ) : showMyList ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {myEntries.map((entry) => (
              <MangaCard key={entry.id} manga={entry} entry={entry} showProgress />
            ))}
            {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={`s${i}`} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {list.map((m) => <MangaCard key={m.id} manga={m} />)}
            {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={`s${i}`} />)}
          </div>
        )}
        {!loading && (showMyList ? myEntries.length === 0 : list.length === 0) && (
          <p className="py-10 text-center text-sm text-[var(--color-mute)]">
            {showMyList ? "Your list is empty. Search manga above to start tracking!" : "No manga found."}
          </p>
        )}
      </div>
    </div></PageTransition>
  );
}
