"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { getLightNovelTrending, getLightNovelPopular, getLightNovelTopRated } from "@/lib/anilist";
import { CardSkeleton } from "@/components/Loader";
import MangaCard from "@/components/MangaCard";
import AffiliateLink from "@/components/AffiliateLink";
import type { Media } from "@/lib/anilist";

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

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const TABS = [
  { key: "trending", label: "🔥 Trending", fetcher: () => getLightNovelTrending(24) },
  { key: "popular", label: "⭐ Popular", fetcher: () => getLightNovelPopular(24) },
  { key: "top", label: "🏆 Top Rated", fetcher: () => getLightNovelTopRated(24) },
];

const STATUS_FILTERS = ["ALL", "READING", "COMPLETED", "PLANNING"];
const STATUS_LABELS: Record<string, string> = { READING: "Reading", COMPLETED: "Completed", PLANNING: "Plan to Read", DROPPED: "Dropped", PAUSED: "On Hold", REREADING: "Re-reading" };

const GENRE_FILTERS = [
  { label: "All", value: "" },
  { label: "Fantasy", value: "Fantasy" },
  { label: "Romance", value: "Romance" },
  { label: "Action", value: "Action" },
  { label: "Comedy", value: "Comedy" },
  { label: "Drama", value: "Drama" },
  { label: "Sci-Fi", value: "Sci-Fi" },
  { label: "Slice of Life", value: "Slice of Life" },
  { label: "Mystery", value: "Mystery" },
  { label: "Horror", value: "Horror" },
  { label: "Supernatural", value: "Supernatural" },
];

export default function LightNovelBrowseClient() {
  const { data: session } = useSession();
  const [tab, setTab] = useState("trending");
  const [list, setList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myEntries, setMyEntries] = useState<MangaEntryDB[]>([]);
  const [listTab, setListTab] = useState("ALL");
  const [showMyList, setShowMyList] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [myListTotal, setMyListTotal] = useState(0);
  const [myListStats, setMyListStats] = useState({ reading: 0, completed: 0, planning: 0 });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedQuery, selectedGenre, tab, showMyList, listTab]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    if (showMyList) {
      const params = new URLSearchParams();
      if (listTab !== "ALL") params.set("status", listTab);
      params.set("page", String(page));
      fetch(`/api/light-novels/list?${params}`)
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) {
            setMyEntries(d.entries || []);
            setMyListTotal(d.total || 0);
          }
        })
        .catch((e: Error) => !cancelled && setError(e.message))
        .finally(() => !cancelled && setLoading(false));
    } else if (debouncedQuery.trim()) {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      fetch(`/api/light-novels/search?q=${encodeURIComponent(debouncedQuery.trim())}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => {
          if (controller.signal.aborted) return;
          let items = d.media || [];
          if (selectedGenre) items = items.filter((m: Media) => m.genres?.includes(selectedGenre));
          setList(items);
          setHasMore(d.pageInfo?.hasNextPage || false);
        })
        .catch((e: Error) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
      return () => controller.abort();
    } else {
      const t = TABS.find((t) => t.key === tab);
      t?.fetcher()
        .then((d) => {
          if (!cancelled) {
            let items = Array.isArray(d) ? d : (d as any).media || [];
            if (selectedGenre) items = items.filter((m: Media) => m.genres?.includes(selectedGenre));
            setList(items);
          }
        })
        .catch((e: Error) => !cancelled && setError(e.message))
        .finally(() => !cancelled && setLoading(false));
    }
    return () => { cancelled = true; };
  }, [tab, showMyList, listTab, debouncedQuery, selectedGenre, page]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/light-novels/list?perPage=200")
      .then((r) => r.json())
      .then((d) => {
        const entries = d.entries || [];
        setMyListStats({
          reading: entries.filter((e: MangaEntryDB) => e.status === "READING").length,
          completed: entries.filter((e: MangaEntryDB) => e.status === "COMPLETED").length,
          planning: entries.filter((e: MangaEntryDB) => e.status === "PLANNING").length,
        });
      })
      .catch(() => {});
  }, [session]);

  return (
    <div className="min-h-screen animate-page-in">
      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#00ffff]/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#8a2be2]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(138,43,226,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="neon-premium rounded-xl h-12 w-12 mb-4">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="text-xl">📖</span>
              </div>
            </div>

            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ffff] mb-3" style={{ textShadow: "0 0 10px rgba(0,255,255,0.5)" }}>Light Novels</span>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white" style={{ textShadow: "0 0 30px rgba(0,255,255,0.3), 0 0 60px rgba(138,43,226,0.2)" }}>
              Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] via-[#8a2be2] to-[#ff00ff]">Reading Journey</span>
            </h1>
            <p className="mt-3 text-base text-gray-400 max-w-lg">
              Discover trending light novels, track your progress, and find your next favorite series.
            </p>

            {/* Quick Stats */}
            {session?.user?.id && (
              <div className="flex gap-6 mt-6">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-[#00ffff]">{myListStats.reading}</div>
                  <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">Reading</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-[#8a2be2]">{myListStats.completed}</div>
                  <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-[#ff00ff]">{myListStats.planning}</div>
                  <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">Planned</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffff] to-transparent shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        {/* Search */}
        <motion.div {...FADE_UP}>
          <div className="neon-premium rounded-xl">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content">
              <form onSubmit={(e) => { e.preventDefault(); setShowMyList(false); }} className="flex items-center gap-3 px-4 py-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search light novels by title..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[var(--color-mute)]/50"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(""); setDebouncedQuery(""); }} className="text-[var(--color-mute)] hover:text-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                )}
                <button type="submit" className="neon-premium rounded-xl">
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content px-6 py-2.5 text-sm font-bold" style={{ color: "#00ffff" }}>Search</div>
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Toggle: Browse / My List */}
        <motion.div {...FADE_UP}>
          <div className="flex items-center gap-3 border-b border-[var(--color-line)] pb-3">
            <button onClick={() => { setShowMyList(false); setTab("trending"); setQuery(""); setDebouncedQuery(""); }}
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${!showMyList ? "text-[#00ffff] border-b-2 border-[#00ffff] bg-[#00ffff]/5" : "text-[var(--color-mute)] hover:text-white"}`}
            >Browse</button>
            {session?.user?.id && (
              <button onClick={() => setShowMyList(true)}
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${showMyList ? "text-[#00ffff] border-b-2 border-[#00ffff] bg-[#00ffff]/5" : "text-[var(--color-mute)] hover:text-white"}`}
              >My List {myListTotal > 0 && <span className="ml-1 text-[10px] font-mono opacity-60">({myListTotal})</span>}</button>
            )}
            <Link href="/search?type=MANGA&format=NOVEL"
              className="ml-auto text-xs text-[var(--color-mute)] hover:text-[#00ffff] transition-colors"
            >Advanced Search →</Link>
          </div>
        </motion.div>

        {/* Browse Tabs + Genre Filters */}
        {!showMyList && !debouncedQuery.trim() && (
          <motion.div {...FADE_UP} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="neon-premium rounded-xl transition-all"
                >
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content px-6 py-3 text-sm font-bold" style={{
                    color: tab === t.key ? "#00ffff" : "var(--color-mute)",
                    background: tab === t.key ? "rgba(0,255,255,0.08)" : undefined,
                  }}>{t.label}</div>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRE_FILTERS.map((g) => {
                const isActive = selectedGenre === g.value;
                return (
                  <button key={g.value} onClick={() => setSelectedGenre(g.value)}
                    className="neon-premium rounded-xl transition-all"
                  >
                    <div className="neon-premium-track rounded-xl" />
                    <div className="neon-premium-overlay rounded-[10.5px]" />
                    <div className="neon-premium-content px-4 py-2 text-xs font-bold" style={{
                      color: isActive ? "#00ffff" : "var(--color-mute)",
                      background: isActive ? "rgba(0,255,255,0.08)" : undefined,
                    }}>{g.label}</div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* My List Status Tabs */}
        {showMyList && (
          <motion.div {...FADE_UP}>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <button key={s} onClick={() => setListTab(s)}
                  className="neon-premium rounded-xl transition-all"
                >
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content px-5 py-2.5 text-sm font-bold" style={{
                    color: listTab === s ? "#00ffff" : "var(--color-mute)",
                    background: listTab === s ? "rgba(0,255,255,0.08)" : undefined,
                  }}>{s === "ALL" ? "All" : STATUS_LABELS[s] || s}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Affiliate Links */}
        <motion.div {...FADE_UP} className="flex flex-wrap gap-3">
          <AffiliateLink partner="bookwalker" path="https://global.bookwalker.jp"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00ffff] to-[#8a2be2] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity"
          >📖 Buy on BookWalker</AffiliateLink>
          <AffiliateLink partner="amazon" path="https://www.amazon.com/s?k=light+novel&tag=zyniverse-21"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-mute)] hover:border-[#00ffff] hover:text-[#00ffff] transition-all"
          >📦 Buy on Amazon</AffiliateLink>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Grid */}
        <motion.div {...FADE_UP}>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-[var(--color-void)]" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 w-3/4 bg-[var(--color-void)] rounded" />
                    <div className="h-3 w-1/2 bg-[var(--color-void)] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : showMyList ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {myEntries.map((entry) => (
                <MangaCard key={entry.id} manga={entry} entry={entry} showProgress />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {list.map((m) => <MangaCard key={m.id} manga={m} />)}
            </div>
          )}

          {!loading && (showMyList ? myEntries.length === 0 : list.length === 0) && (
            <div className="text-center py-16">
              <span className="text-4xl block mb-3">{showMyList ? "📚" : "🔍"}</span>
              <p className="text-sm text-[var(--color-mute)]">
                {showMyList
                  ? "Your list is empty. Search and add light novels to start tracking!"
                  : debouncedQuery
                    ? `No light novels found for "${debouncedQuery}"`
                    : "No light novels found."
                }
              </p>
              {showMyList && (
                <button onClick={() => setShowMyList(false)} className="mt-3 text-xs text-[#00ffff] hover:underline">
                  Browse Light Novels →
                </button>
              )}
              {debouncedQuery && !showMyList && (
                <button onClick={() => { setQuery(""); setDebouncedQuery(""); }} className="mt-3 text-xs text-[#00ffff] hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <div className="h-12" />
    </div>
  );
}
