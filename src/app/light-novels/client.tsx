"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import MangaCard from "@/components/MangaCard";
import AffiliateLink from "@/components/AffiliateLink";
import RevealTitle from "@/components/RevealTitle";
import RevealLabel from "@/components/RevealLabel";
import EmptyState from "@/components/EmptyState";
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

const EASE = [0.22, 1, 0.36, 1] as const;

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const TABS = [
  { key: "trending", label: "🔥 Trending" },
  { key: "popular", label: "⭐ Popular" },
  { key: "top", label: "🏆 Top Rated" },
];

const STATUS_FILTERS = ["ALL", "READING", "COMPLETED", "PLANNING", "PAUSED", "DROPPED"];
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

const PILL_SPRING = { type: "spring" as const, stiffness: 500, damping: 40 };

export default function LightNovelBrowseClient({
  initialList = [],
  initialTotal = 0,
  initialHasNext = false,
}: {
  initialList?: Media[];
  initialTotal?: number;
  initialHasNext?: boolean;
}) {
  const { data: session } = useSession();
  const [tab, setTab] = useState("trending");
  const [list, setList] = useState<Media[]>(initialList);
  const [loading, setLoading] = useState(initialList.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myEntries, setMyEntries] = useState<MangaEntryDB[]>([]);
  const [listTab, setListTab] = useState("ALL");
  const [showMyList, setShowMyList] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasNext);
  const [myListTotal, setMyListTotal] = useState(0);
  const [myListStats, setMyListStats] = useState({ reading: 0, completed: 0, planning: 0, paused: 0, dropped: 0 });
  const [continueReading, setContinueReading] = useState<MangaEntryDB[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to the first page and (re)load whenever a filter changes.
  useEffect(() => {
    // The server already rendered Trending page 1 — reuse it and skip the
    // first client request (avoids a redundant AniList fetch / rate-limit hit).
    if (
      !bootstrapped.current &&
      !showMyList &&
      !debouncedQuery.trim() &&
      !selectedGenre &&
      tab === "trending" &&
      initialList.length > 0
    ) {
      bootstrapped.current = true;
      return;
    }

    let cancelled = false;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setPage(1);

    async function run() {
      try {
        if (showMyList) {
          const params = new URLSearchParams();
          if (listTab !== "ALL") params.set("status", listTab);
          params.set("page", "1");
          const r = await fetch(`/api/light-novels/list?${params}`, { signal: controller.signal });
          const d = await r.json();
          if (cancelled) return;
          setMyEntries(d.entries || []);
          setMyListTotal(d.total || 0);
          setTotal(d.total || 0);
          setHasMore(Boolean(d.hasMore));
          return;
        }

        const params = debouncedQuery.trim()
          ? new URLSearchParams({ q: debouncedQuery.trim(), page: "1" })
          : new URLSearchParams({ tab, perPage: "24", page: "1" });
        if (selectedGenre) params.set("genre", selectedGenre);
        const url = debouncedQuery.trim()
          ? `/api/light-novels/search?${params}`
          : `/api/anilist/light-novels?${params}`;
        const r = await fetch(url, { signal: controller.signal });
        const d = await r.json();
        if (cancelled) return;
        setList(d.media || []);
        setTotal(d.pageInfo?.total ?? (d.media?.length ?? 0));
        setHasMore(Boolean(d.pageInfo?.hasNextPage));
      } catch (e) {
        if (!cancelled && (e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [tab, showMyList, listTab, debouncedQuery, selectedGenre, initialList]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      if (showMyList) {
        const params = new URLSearchParams();
        if (listTab !== "ALL") params.set("status", listTab);
        params.set("page", String(next));
        const r = await fetch(`/api/light-novels/list?${params}`);
        const d = await r.json();
        setMyEntries((prev) => [...prev, ...(d.entries || [])]);
        setHasMore(Boolean(d.hasMore));
      } else {
        const params = debouncedQuery.trim()
          ? new URLSearchParams({ q: debouncedQuery.trim(), page: String(next) })
          : new URLSearchParams({ tab, perPage: "24", page: String(next) });
        if (selectedGenre) params.set("genre", selectedGenre);
        const url = debouncedQuery.trim()
          ? `/api/light-novels/search?${params}`
          : `/api/anilist/light-novels?${params}`;
        const r = await fetch(url);
        const d = await r.json();
        setList((prev) => [...prev, ...(d.media || [])]);
        setHasMore(Boolean(d.pageInfo?.hasNextPage));
      }
      setPage(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, showMyList, listTab, debouncedQuery, selectedGenre, tab]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/light-novels/stats")
      .then((r) => r.json())
      .then((d) => {
        const c = d.counts || {};
        setMyListStats({
          reading: c.READING || 0,
          completed: c.COMPLETED || 0,
          planning: c.PLANNING || 0,
          paused: c.PAUSED || 0,
          dropped: c.DROPPED || 0,
        });
        setContinueReading(d.reading || []);
      })
      .catch(() => {});
  }, [session]);

  const loadedCount = showMyList ? myEntries.length : list.length;
  const isEmpty = !loading && loadedCount === 0;

  const HERO_STATS = [
    { label: "Reading", value: myListStats.reading, color: "#00ffff" },
    { label: "Completed", value: myListStats.completed, color: "#8a2be2" },
    { label: "Planned", value: myListStats.planning, color: "#ff00ff" },
    { label: "On Hold", value: myListStats.paused, color: "#ffaa00" },
    { label: "Dropped", value: myListStats.dropped, color: "#ff4d6d" },
  ];

  return (
    <div className="min-h-screen animate-page-in">
      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[var(--color-void)]" />
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
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -14 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="neon-rgb-border rounded-xl h-12 w-12 mb-4 flex items-center justify-center bg-[var(--color-panel)]/60 backdrop-blur-sm"
            >
              <span className="text-xl">📖</span>
            </motion.div>

            <RevealLabel
              as="span"
              spacing="0.2em"
              fromSpacing="0.4em"
              className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ffff] mb-3"
              style={{ textShadow: "0 0 10px rgba(0,255,255,0.5)" }}
            >
              Light Novels
            </RevealLabel>

            <motion.div
              className="neon-rgb-border rounded-xl px-4 py-2"
              initial={{ opacity: 0, scale: 0.94, y: 12, filter: "drop-shadow(0 0 0px rgba(0,255,255,0))" }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                filter: [
                  "drop-shadow(0 0 0px rgba(0,255,255,0))",
                  "drop-shadow(0 0 20px rgba(0,255,255,0.5))",
                  "drop-shadow(0 0 6px rgba(0,255,255,0.15))",
                ],
              }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            >
              <RevealTitle
                as="h1"
                className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-ink)]"
                style={{ textShadow: "0 0 30px rgba(0,255,255,0.3), 0 0 60px rgba(138,43,226,0.2)" }}
              >
                Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] via-[#8a2be2] to-[#ff00ff]">Reading Journey</span>
              </RevealTitle>
            </motion.div>
            <p className="mt-3 text-base text-[var(--color-mute)] max-w-lg">
              Discover trending light novels, track your progress, and find your next favorite series.
            </p>

            {/* Quick Stats */}
            {session?.user?.id && (
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6">
                {HERO_STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffff] to-transparent shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        {/* Search */}
        <motion.div {...FADE_UP}>
          <div className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm">
            <form onSubmit={(e) => { e.preventDefault(); setShowMyList(false); }} className="flex items-center gap-3 px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search light novels by title..."
                className="flex-1 bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-mute)]/50"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setDebouncedQuery(""); }} className="text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              )}
              <button type="submit" className="neon-rgb-border rounded-xl px-6 py-2.5 text-sm font-bold" style={{ color: "#00ffff" }}>Search</button>
            </form>
          </div>
        </motion.div>

        {/* Toggle: Browse / My List */}
        <motion.div {...FADE_UP}>
          <div className="flex items-center gap-3 border-b border-[var(--color-line)] pb-3">
            <button
              onClick={() => { setShowMyList(false); setTab("trending"); setQuery(""); setDebouncedQuery(""); }}
              className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${!showMyList ? "text-[#00ffff] bg-[#00ffff]/5" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}
            >
              Browse
              {!showMyList && (
                <motion.span layoutId="ln-toggle-underline" className="absolute -bottom-3 left-0 right-0 h-0.5 rounded-full bg-[#00ffff] shadow-[0_0_10px_rgba(0,255,255,0.7)]" />
              )}
            </button>
            {session?.user?.id && (
              <button
                onClick={() => setShowMyList(true)}
                className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${showMyList ? "text-[#00ffff] bg-[#00ffff]/5" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}
              >
                My List {myListTotal > 0 && <span className="ml-1 text-[10px] font-mono opacity-60">({myListTotal})</span>}
                {showMyList && (
                  <motion.span layoutId="ln-toggle-underline" className="absolute -bottom-3 left-0 right-0 h-0.5 rounded-full bg-[#00ffff] shadow-[0_0_10px_rgba(0,255,255,0.7)]" />
                )}
              </button>
            )}
            <Link href="/search?type=MANGA&format=NOVEL"
              className="ml-auto text-xs text-[var(--color-mute)] hover:text-[#00ffff] transition-colors"
            >Advanced Search →</Link>
          </div>
        </motion.div>

        {/* Continue Reading */}
        {!showMyList && !debouncedQuery.trim() && continueReading.length > 0 && (
          <motion.div {...FADE_UP}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <span className="h-4 w-1 rounded-full bg-[#00ffff]" />
                Continue Reading
              </h2>
              <button onClick={() => setShowMyList(true)} className="text-xs text-[var(--color-mute)] transition-colors hover:text-[#00ffff]">
                View list →
              </button>
            </div>
            <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
              {continueReading.map((entry, i) => (
                <div key={entry.id} className="w-32 shrink-0 snap-start">
                  <MangaCard manga={entry} entry={entry} showProgress index={i} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Browse Tabs + Genre Filters */}
        {!showMyList && !debouncedQuery.trim() && (
          <motion.div {...FADE_UP} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className="neon-rgb-border relative rounded-xl px-6 py-3 text-sm font-bold transition-colors"
                    style={{ color: active ? "#00ffff" : "var(--color-mute)" }}
                  >
                    {active && <motion.span layoutId="ln-tab-bg" className="absolute inset-0 rounded-xl bg-[#00ffff]/10" transition={PILL_SPRING} />}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRE_FILTERS.map((g) => {
                const isActive = selectedGenre === g.value;
                return (
                  <button key={g.value || "all"} onClick={() => setSelectedGenre(g.value)}
                    className="neon-rgb-border relative rounded-xl px-4 py-2 text-xs font-bold transition-colors"
                    style={{ color: isActive ? "#00ffff" : "var(--color-mute)" }}
                  >
                    {isActive && <motion.span layoutId="ln-genre-bg" className="absolute inset-0 rounded-xl bg-[#00ffff]/10" transition={PILL_SPRING} />}
                    <span className="relative z-10">{g.label}</span>
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
                  className="neon-rgb-border relative rounded-xl px-5 py-2.5 text-sm font-bold transition-colors"
                  style={{ color: listTab === s ? "#00ffff" : "var(--color-mute)" }}
                >
                  {listTab === s && <motion.span layoutId="ln-status-bg" className="absolute inset-0 rounded-xl bg-[#00ffff]/10" transition={PILL_SPRING} />}
                  <span className="relative z-10">{s === "ALL" ? "All" : STATUS_LABELS[s] || s}</span>
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
          <AffiliateLink partner="amazon" path="https://www.amazon.in/s?k=light+novel"
            className="inline-flex items-center gap-2 rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold text-[var(--color-mute)] hover:border-[#00ffff] hover:text-[#00ffff] transition-all"
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
          {!loading && total > 0 && (
            <p className="mb-3 text-xs font-mono uppercase tracking-widest text-[var(--color-mute)]">
              {total.toLocaleString()} light novel{total === 1 ? "" : "s"}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm overflow-hidden animate-pulse">
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
              {myEntries.map((entry, i) => (
                <MangaCard key={entry.id} manga={entry} entry={entry} showProgress index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {list.map((m, i) => <MangaCard key={m.id} manga={m} index={i} href={`/light-novels/${m.id}`} />)}
            </div>
          )}

          {isEmpty && (
            showMyList ? (
              <EmptyState
                icon="bookmark"
                title="Your list is empty"
                description="Search and add light novels to start tracking your reading."
                actionLabel="Browse Light Novels"
                onAction={() => setShowMyList(false)}
              />
            ) : debouncedQuery ? (
              <EmptyState
                icon="search"
                title="No light novels found"
                description={`Nothing matched "${debouncedQuery}".`}
                actionLabel="Clear search"
                onAction={() => { setQuery(""); setDebouncedQuery(""); }}
              />
            ) : (
              <EmptyState
                icon="search"
                title="No light novels found"
                description="Try a different genre or tab."
              />
            )
          )}

          {!loading && hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="neon-rgb-border rounded-full px-8 py-3 text-sm font-bold text-[#00ffff] transition-all hover:bg-[#00ffff]/10 disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="h-12" />
    </div>
  );
}
