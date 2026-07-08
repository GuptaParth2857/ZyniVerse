"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { searchLightNovels, getMangaTrending, getMangaPopular } from "@/lib/anilist";
import { CardSkeleton } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import MangaCard from "@/components/MangaCard";
import AffiliateLink from "@/components/AffiliateLink";
import type { Media } from "@/lib/anilist";
import { STATUS_LABELS } from "@/lib/manga";

interface MangaEntryDB {
  id: string;
  mediaId: number;
  title: string;
  coverImage: string | null;
  subType?: string;
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
];

const LIST_TABS = ["ALL", "READING", "COMPLETED", "PLANNING"];

export default function LightNovelBrowseClient() {
  const [tab, setTab] = useState("trending");
  const [list, setList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myEntries, setMyEntries] = useState<MangaEntryDB[]>([]);
  const [listTab, setListTab] = useState("ALL");
  const [showMyList, setShowMyList] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);

    if (showMyList) {
      const params = new URLSearchParams();
      if (listTab !== "ALL") params.set("status", listTab);
      fetch(`/api/light-novels/list?${params}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setMyEntries(d.entries); })
        .catch((e: Error) => !cancelled && setError(e.message))
        .finally(() => !cancelled && setLoading(false));
    } else if (query.trim()) {
      searchLightNovels(query.trim())
        .then((d) => !cancelled && setList(d.media))
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
  }, [tab, showMyList, listTab, query]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setShowMyList(false);
  }

  return (
    <PageTransition><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">// Light Novels</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Light Novel Tracker</h1>

      {/* Search */}
      <div className="mt-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 focus-within:border-[var(--color-cyan)] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search light novels to add to your list..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
          />
          {loading && <span className="text-xs text-[var(--color-mute)]">Searching...</span>}
        </form>
      </div>

      {/* Toggle */}
      <div className="mt-4 flex items-center gap-2 border-b border-[var(--color-line)] pb-3">
        <button onClick={() => { setShowMyList(false); setTab("trending"); setQuery(""); }}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            !showMyList ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
          }`}
        >Browse</button>
        <button onClick={() => setShowMyList(true)}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            showMyList ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
          }`}
        >My List</button>
        <Link href="/search?type=MANGA&format=NOVEL"
          className="ml-auto text-xs text-[var(--color-cyan)] hover:underline"
        >Advanced Search →</Link>
      </div>

      {/* Browse tabs */}
      {!showMyList && !query.trim() && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                tab === t.key ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
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
                listTab === t ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              }`}
            >{t === "ALL" ? "All" : STATUS_LABELS[t] || t}</button>
          ))}
        </div>
      )}

      {/* Affiliate Links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <AffiliateLink partner="bookwalker" path="https://global.bookwalker.jp"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity"
        >📖 Buy Light Novels on BookWalker</AffiliateLink>
        <AffiliateLink partner="amazon" path="https://www.amazon.com/s?k=light+novel&tag=zyniverse-21"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
        >📦 Buy Light Novels on Amazon</AffiliateLink>
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
            {showMyList ? "Your list is empty. Search light novels above to start tracking!" : "No light novels found."}
          </p>
        )}
      </div>
    </div></PageTransition>
  );
}
