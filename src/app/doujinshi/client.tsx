"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, animate, useInView, useMotionValue, useTransform, useScroll, useSpring } from "framer-motion";
import { DOUJINSHI_GENRE_TAGS, type DoujinshiEntry } from "@/lib/mangadex-api";
import DoujinshiCard from "@/components/DoujinshiCard";
import DoujinshiFlexCard from "@/components/DoujinshiFlexCard";
import RevealTitle from "@/components/RevealTitle";
import { logError } from "@/lib/logger";

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

/** Neon progress line pinned to the top; fills as the page is scrolled. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#ff00ff] via-[#8a2be2] to-[#00ffff] shadow-[0_0_12px_rgba(255,0,255,0.6)]"
    />
  );
}

/** Counts up from 0 the first time it scrolls into view. */
function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, value, mv]);
  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}

/** Card-grid skeleton shown while the featured rails load. */
function RailsSkeleton() {
  return (
    <div className="space-y-10" aria-hidden>
      {[8, 5].map((count, row) => (
        <div key={row}>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[var(--color-panel)] animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-[var(--color-panel)] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[var(--color-panel)] animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-[var(--color-void)]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[var(--color-void)]" />
                  <div className="h-3 w-1/2 rounded bg-[var(--color-void)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Only offer tags the API can filter server-side, so counts + pagination stay accurate.
const GENRE_TAGS = [
  { label: "All", value: "" },
  ...DOUJINSHI_GENRE_TAGS.map((g) => ({ label: g, value: g })),
];

const SORTS = [
  { value: "popular", label: "🔥 Popular" },
  { value: "latest", label: "🆕 Latest" },
  { value: "rating", label: "⭐ Rating" },
  { value: "title", label: "🔤 Title" },
] as const;
type SortKey = (typeof SORTS)[number]["value"];

// MangaDex translatedLanguage codes.
const LANGUAGES = [
  { value: "", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "pt-br", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ko", label: "Korean" },
  { value: "ru", label: "Russian" },
  { value: "id", label: "Indonesian" },
  { value: "vi", label: "Vietnamese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
];

export default function DoujinshiBrowseClient() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Initialize filters from the URL so links are shareable/bookmarkable.
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("q") ?? "");
  const [selectedTag, setSelectedTag] = useState(() => searchParams.get("tag") ?? "");
  const [sort, setSort] = useState<SortKey>(() => {
    const s = searchParams.get("sort");
    return SORTS.some((x) => x.value === s) ? (s as SortKey) : "popular";
  });
  const [language, setLanguage] = useState(() => searchParams.get("lang") ?? "");
  const [entries, setEntries] = useState<DoujinshiEntry[]>([]);
  const [trending, setTrending] = useState<DoujinshiEntry[]>([]);
  const [popular, setPopular] = useState<DoujinshiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackedMap, setTrackedMap] = useState<Record<string, string>>({});
  const [trackedCount, setTrackedCount] = useState(0);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [showBrowse, setShowBrowse] = useState(() =>
    Boolean(
      searchParams.get("q") ||
        searchParams.get("tag") ||
        searchParams.get("sort") ||
        searchParams.get("lang") ||
        searchParams.get("page"),
    ),
  );
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get("page")) || 1));
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const didMountRef = useRef(false);
  const prevNavRef = useRef({ sort, selectedTag, language, page });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch trending + popular on mount
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    Promise.all([
      fetch("/api/doujinshi?sort=latest&perPage=10").then((r) => r.json()),
      fetch("/api/doujinshi?sort=popular&perPage=10").then((r) => r.json()),
    ])
      .then(([t, p]) => {
        if (cancelled) return;
        setTrending(t.entries || []);
        setPopular(p.entries || []);
        setLibraryTotal(Math.max(t.total || 0, p.total || 0));
        if ((t.entries || []).length === 0 && (p.entries || []).length === 0) {
          setError("Could not load doujinshi from MangaDex. Please try again later.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load doujinshi. Check your connection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Fetch browse results
  useEffect(() => {
    if (!showBrowse) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrowseLoading(true);
    setError("");

    const sp = new URLSearchParams();
    if (debouncedSearch) sp.set("search", debouncedSearch);
    if (sort) sp.set("sort", sort);
    if (selectedTag) sp.set("genres", selectedTag);
    if (language) sp.set("lang", language);
    sp.set("perPage", "50");
    sp.set("page", String(page));

    fetch(`/api/doujinshi?${sp.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data.error) {
          setError(data.error);
          setEntries([]);
        } else {
          setEntries(data.entries || []);
          setTotal(data.total || 0);
          setHasMore(data.hasMore || false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to search. Please try again.");
          setEntries([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setBrowseLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, sort, selectedTag, language, showBrowse, page]);

  // Reset to page 1 when filters change (but not on the initial URL-driven render).
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setPage(1);
  }, [debouncedSearch, sort, selectedTag, language]);

  // Keep the URL in sync with the filters (shareable links + working back/forward).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams();
    if (debouncedSearch) sp.set("q", debouncedSearch);
    if (sort !== "popular") sp.set("sort", sort);
    if (selectedTag) sp.set("tag", selectedTag);
    if (language) sp.set("lang", language);
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    const target = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (target === current) return;
    const prev = prevNavRef.current;
    const discrete =
      prev.sort !== sort || prev.selectedTag !== selectedTag || prev.language !== language || prev.page !== page;
    prevNavRef.current = { sort, selectedTag, language, page };
    if (discrete) window.history.pushState(null, "", target);
    else window.history.replaceState(null, "", target);
  }, [debouncedSearch, sort, selectedTag, language, page]);

  // Restore filter state when the user navigates back/forward.
  useEffect(() => {
    const onPop = () => {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get("q") ?? "";
      const tag = sp.get("tag") ?? "";
      const lang = sp.get("lang") ?? "";
      const s = sp.get("sort");
      const nextSort: SortKey = SORTS.some((x) => x.value === s) ? (s as SortKey) : "popular";
      const nextPage = Math.max(1, Number(sp.get("page")) || 1);
      prevNavRef.current = { sort: nextSort, selectedTag: tag, language: lang, page: nextPage };
      setSearch(q);
      setDebouncedSearch(q);
      setSelectedTag(tag);
      setLanguage(lang);
      setSort(nextSort);
      setPage(nextPage);
      setShowBrowse(Boolean(sp.toString()));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Fetch tracked status
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/doujinshi/my")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        data.entries?.forEach((e: { doujinshi: { id: string }; entry: { status: string } }) => {
          map[e.doujinshi.id] = e.entry.status;
        });
        setTrackedMap(map);
        setTrackedCount(Object.keys(map).length);
      })
      .catch(() => {});
  }, [session]);

  // Tags for the hero ticker strip (derived from the featured sections).
  const marqueeTags = useMemo(() => {
    const tags = new Set<string>();
    [...trending, ...popular].forEach((d) => d.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).slice(0, 28);
  }, [trending, popular]);

  const handleTrack = useCallback(async (id: string, status: string) => {
    if (!session?.user?.id) return;
    try {
      // Empty status = untrack (DELETE), otherwise upsert the given status (POST).
      const res = status
        ? await fetch(`/api/doujinshi/${id}/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        : await fetch(`/api/doujinshi/${id}/track`, { method: "DELETE" });
      if (res.ok) {
        setTrackedMap((prev) => {
          const next = { ...prev };
          if (status) next[id] = status;
          else delete next[id];
          return next;
        });
      }
    } catch (e) { logError(e); }
  }, [session]);

  const startBrowse = () => {
    setShowBrowse(true);
    setPage(1);
  };

  // Featured rails are still loading (and we have nothing yet) → skeleton.
  const showRailsSkeleton = loading && trending.length === 0 && popular.length === 0;

  return (
    <div className="min-h-screen animate-page-in">
      <ScrollProgress />
      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[var(--color-void)]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#ff00ff]/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#8a2be2]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,0,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(138,43,226,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="neon-rgb-border rounded-xl h-12 w-12 mb-4 flex items-center justify-center bg-[var(--color-panel)]/60 backdrop-blur-sm">
              <span className="text-xl">📚</span>
            </div>

            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff00ff] mb-3" style={{ textShadow: "0 0 10px rgba(255,0,255,0.5)" }}>Doujinshi</span>

            <div className="neon-rgb-border rounded-xl px-4 py-2">
              <RevealTitle
                as="h1"
                delay={0.15}
                className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-ink)]"
                style={{ textShadow: "0 0 30px rgba(255,0,255,0.3), 0 0 60px rgba(138,43,226,0.2)" }}
              >
                Fan Works & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-[#8a2be2] to-[#00ffff]">Creations</span>
              </RevealTitle>
            </div>
            <p className="mt-3 text-base text-[var(--color-mute)] max-w-lg">
              Discover, track, and explore doujinshi from MangaDex. Fan-made masterpieces from your favorite series.
            </p>

            {/* Quick Stats */}
            <div className="flex gap-6 mt-6 items-center">
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-[#ff00ff]"><CountUp value={libraryTotal} /></div>
                <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">In Library</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-[#00ffff]"><CountUp value={session ? trackedCount : DOUJINSHI_GENRE_TAGS.length} /></div>
                <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">{session ? "Tracked" : "Genres"}</div>
              </div>
              {session ? (
                <Link href="/doujinshi/my" className="rounded-full neon-rgb-border px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-cyan)]/40 transition-colors">
                  My Doujinshi →
                </Link>
              ) : (
                <Link href="/login?next=%2Fdoujinshi" className="rounded-full neon-rgb-border px-3 py-1.5 text-xs font-semibold text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 transition-colors">
                  Sign in to track →
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
      </div>

      {/* ═══════════════ TAG TICKER ═══════════════ */}
      {marqueeTags.length > 0 && (
        <div className="ticker-window relative overflow-hidden border-b border-[var(--color-line)] bg-[var(--color-void)]/70">
          <div className="ticker-track flex w-max will-change-transform">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
                {[...marqueeTags, ...marqueeTags, ...marqueeTags].map((tag, i) => (
                  <button
                    key={`${tag}-${i}`}
                    type="button"
                    onClick={() => { setSelectedTag(tag); setShowBrowse(true); }}
                    className="flex items-center gap-2 whitespace-nowrap px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
                  >
                    <span className="text-[var(--color-cyan)]">#</span>
                    {tag}
                    <span className="text-[var(--color-magenta)]/50">◆</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-10">
        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {showRailsSkeleton ? (
          <RailsSkeleton />
        ) : (
        <>
        {/* ═══════════════ TRENDING ═══════════════ */}
        {trending.length > 0 && !showBrowse && (
          <motion.div {...FADE_UP}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                  <RevealTitle text="Trending Now" as="h2" className="font-display text-xl font-bold text-[#ff00ff]" />
                  <p className="text-xs text-[var(--color-mute)]">Latest uploads from MangaDex</p>
                </div>
              </div>
            </div>
            <DoujinshiFlexCard items={trending.slice(0, 8)} />
          </motion.div>
        )}

        {/* ═══════════════ POPULAR ═══════════════ */}
        {popular.length > 0 && !showBrowse && (
          <motion.div {...FADE_UP}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⭐</div>
                <div>
                  <RevealTitle text="Most Popular" as="h2" delay={0.05} className="font-display text-xl font-bold text-[#ffd700]" />
                  <p className="text-xs text-[var(--color-mute)]">Highest followed doujinshi</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {popular.slice(0, 5).map((entry, i) => (
                <DoujinshiCard key={entry.id} entry={entry} onTrack={handleTrack} trackedStatus={trackedMap[entry.id] || null} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ BROWSE TOGGLE ═══════════════ */}
        {!showBrowse && (
          <motion.div {...FADE_UP} className="text-center">
            <button
              onClick={startBrowse}
              className="neon-rgb-border rounded-xl px-8 py-3 text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ color: "#ff00ff" }}
            >
              Browse All Doujinshi →
            </button>
          </motion.div>
        )}

        {/* ═══════════════ BROWSE SECTION ═══════════════ */}
        {showBrowse && (
          <motion.div {...FADE_UP} className="space-y-6">
            {/* Back + Search + Sort */}
            <div className="space-y-3">
              <button
                onClick={() => setShowBrowse(false)}
                className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back to Overview
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)] pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search doujinshi by title..."
                    aria-label="Search doujinshi by title"
                    className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)]/90 backdrop-blur-sm py-3.5 pl-12 pr-10 text-sm text-[var(--color-ink)] placeholder-[var(--color-mute)]/50 outline-none transition-all duration-300 focus:border-[var(--color-magenta)]"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Sort results">
                  {SORTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSort(s.value)}
                      aria-pressed={sort === s.value}
                      className="neon-rgb-border rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
                      style={{
                        color: sort === s.value ? "#ff00ff" : "var(--color-mute)",
                        background: sort === s.value ? "rgba(255,0,255,0.08)" : undefined,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="doujinshi-lang" className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">
                  Language
                </label>
                <select
                  id="doujinshi-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="neon-rgb-border rounded-xl bg-[var(--color-void)]/90 px-3 py-2 text-xs font-bold text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-magenta)]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value} className="bg-[var(--color-void)] text-[var(--color-ink)]">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
              {GENRE_TAGS.map((tag) => {
                const isActive = selectedTag === tag.value;
                return (
                  <button
                    key={tag.value}
                    onClick={() => setSelectedTag(tag.value)}
                    aria-pressed={isActive}
                    className="neon-rgb-border rounded-xl px-3 py-1.5 text-[10px] font-bold transition-all"
                    style={{
                      color: isActive ? "#ff00ff" : "var(--color-mute)",
                      background: isActive ? "rgba(255,0,255,0.08)" : undefined,
                    }}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>

            {/* Results count */}
            {total > 0 && (
              <p className="text-xs text-[var(--color-mute)]">
                Showing <span className="text-[var(--color-cyan)] font-mono">{entries.length}</span> of <span className="text-[var(--color-cyan)] font-mono">{total}</span> results
                {debouncedSearch && <> for &quot;<span className="text-[var(--color-magenta)]">{debouncedSearch}</span>&quot;</>}
              </p>
            )}

            {/* Results */}
            {browseLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-[var(--color-void)]" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 w-3/4 bg-[var(--color-void)] rounded" />
                      <div className="h-3 w-1/2 bg-[var(--color-void)] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="text-sm text-[var(--color-mute)]">
                  {debouncedSearch
                    ? `No doujinshi found for "${debouncedSearch}"`
                    : "No doujinshi found matching your filters."
                  }
                </p>
                {debouncedSearch && (
                  <button
                    onClick={() => { setSearch(""); setSelectedTag(""); }}
                    className="mt-3 text-xs text-[var(--color-cyan)] hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {entries.map((entry, i) => (
                    <DoujinshiCard key={entry.id} entry={entry} onTrack={handleTrack} trackedStatus={trackedMap[entry.id] || null} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {(hasMore || page > 1) && (
                  <div className="flex justify-center gap-3 pt-4">
                    {page > 1 && (
                      <button
                        onClick={() => setPage((p) => p - 1)}
                        className="neon-rgb-border rounded-xl px-6 py-2.5 text-xs font-bold"
                        style={{ color: "var(--color-mute)" }}
                      >← Previous</button>
                    )}
                    {hasMore && (
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        className="neon-rgb-border rounded-xl px-6 py-2.5 text-xs font-bold"
                        style={{ color: "#ff00ff" }}
                      >Next →</button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
        </>
        )}
      </div>

      <div className="h-12" />
    </div>
  );
}
