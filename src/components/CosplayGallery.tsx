"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, animate, useInView, useMotionValue, useTransform } from "framer-motion";
import CosplayCard from "@/components/CosplayCard";
import AuroraParticles from "@/components/AuroraParticles";

interface CosplayItem {
  id: string;
  title: string;
  character: string;
  animeTitle: string;
  imageUrl: string;
  likes: number;
  createdAt: string;
  tags: string;
  user: { id: string; username: string; avatar: string | null };
}

/** Counts up from 0 the first time it scrolls into view. */
function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString());
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

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent", icon: "🕐" },
  { value: "popular", label: "Most Popular", icon: "🔥" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];
const SORT_VALUES: readonly string[] = SORT_OPTIONS.map((s) => s.value);

export default function CosplayGallery() {
  const { data: session } = useSession();

  const [cosplays, setCosplays] = useState<CosplayItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [animeFilter, setAnimeFilter] = useState("");
  const [charFilter, setCharFilter] = useState("");
  const [debouncedAnime, setDebouncedAnime] = useState("");
  const [debouncedChar, setDebouncedChar] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeNudge, setLikeNudge] = useState(false);
  // URL filters are read after mount (rather than via `useSearchParams`) so the
  // component — hero and all — is server-rendered into the static HTML. Using
  // `useSearchParams` would make Next client-render this whole Suspense subtree.
  const [hydrated, setHydrated] = useState(false);

  const mountedRef = useRef(true);
  const likedFetchedRef = useRef<Set<string>>(new Set());
  const prevFiltersRef = useRef({ sort: "recent", anime: "", char: "" });
  const prevNavRef = useRef({ sort: "recent", anime: "", char: "" });
  const pageRef = useRef(1);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Read filters from the URL once on mount (deep links, Back/Forward). This is
  // a one-time sync with the URL (an external store), not a render cascade.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get("sort") ?? "";
    const nextSort: SortKey = SORT_VALUES.includes(s) ? (s as SortKey) : "recent";
    const a = sp.get("anime") ?? "";
    const c = sp.get("character") ?? "";
    prevFiltersRef.current = { sort: nextSort, anime: a, char: c };
    prevNavRef.current = { sort: nextSort, anime: a, char: c };
    /* eslint-disable react-hooks/set-state-in-effect */
    setSort(nextSort);
    setAnimeFilter(a);
    setCharFilter(c);
    setDebouncedAnime(a);
    setDebouncedChar(c);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Debounce the text filters so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedAnime(animeFilter);
      setDebouncedChar(charFilter);
    }, 400);
    return () => clearTimeout(t);
  }, [animeFilter, charFilter]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const prev = prevFiltersRef.current;
    if (prev.sort !== sort || prev.anime !== debouncedAnime || prev.char !== debouncedChar) {
      prevFiltersRef.current = { sort, anime: debouncedAnime, char: debouncedChar };
      pageRef.current = 1;
    }
    const currentPage = pageRef.current;
    async function load() {
      if (currentPage === 1) setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({ sort, page: String(currentPage), perPage: "30" });
        if (debouncedAnime.trim()) params.set("anime", debouncedAnime.trim());
        if (debouncedChar.trim()) params.set("character", debouncedChar.trim());
        const res = await fetch(`/api/cosplay?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled && mountedRef.current) {
          setCosplays((prev) =>
            currentPage === 1 ? (data.cosplays || []) : [...prev, ...(data.cosplays || [])]
          );
          setTotal(data.total ?? 0);
          setHasNextPage(data.hasNextPage || false);
          setLoading(false);
          setLoadingMore(false);
        }
      } catch {
        if (!cancelled && mountedRef.current) {
          if (currentPage === 1) setCosplays([]);
          setError(true);
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [hydrated, sort, debouncedAnime, debouncedChar, fetchKey]);

  // Keep filters in the URL so links are shareable and Back/Forward works.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const sp = new URLSearchParams();
    if (sort !== "recent") sp.set("sort", sort);
    if (debouncedAnime.trim()) sp.set("anime", debouncedAnime.trim());
    if (debouncedChar.trim()) sp.set("character", debouncedChar.trim());
    const qs = sp.toString();
    const target = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (target === current) return;
    const prev = prevNavRef.current;
    const discrete = prev.sort !== sort;
    prevNavRef.current = { sort, anime: debouncedAnime, char: debouncedChar };
    if (discrete) window.history.pushState(null, "", target);
    else window.history.replaceState(null, "", target);
  }, [hydrated, sort, debouncedAnime, debouncedChar]);

  // Restore filter state when the user navigates back/forward.
  useEffect(() => {
    const onPop = () => {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("sort") ?? "";
      const nextSort: SortKey = SORT_VALUES.includes(s) ? (s as SortKey) : "recent";
      const a = sp.get("anime") ?? "";
      const c = sp.get("character") ?? "";
      prevNavRef.current = { sort: nextSort, anime: a, char: c };
      setSort(nextSort);
      setAnimeFilter(a);
      setDebouncedAnime(a);
      setCharFilter(c);
      setDebouncedChar(c);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Seed per-user like state for the loaded cards. The gallery list is cached
  // and shared between visitors, so the flags come from a separate no-store
  // endpoint and are merged in once the signed-in user is known.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      likedFetchedRef.current = new Set();
      return;
    }
    const ids = cosplays.map((c) => c.id).filter((id) => !likedFetchedRef.current.has(id));
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`/api/cosplay/likes?ids=${ids.join(",")}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        ids.forEach((id) => likedFetchedRef.current.add(id));
        const liked = new Set<string>(d.likedIds || []);
        if (liked.size === 0) return;
        setLikedIds((prev) => {
          const next = new Set(prev);
          liked.forEach((id) => next.add(id));
          return next;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [session?.user?.id, cosplays]);

  function loadMore() {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    pageRef.current = pageRef.current + 1;
    setFetchKey((k) => k + 1);
  }

  function retry() {
    pageRef.current = 1;
    setError(false);
    setFetchKey((k) => k + 1);
  }

  async function handleLike(cosplayId: string) {
    if (!session?.user?.id) {
      setLikeNudge(true);
      setTimeout(() => setLikeNudge(false), 3000);
      return;
    }
    try {
      const res = await fetch(`/api/cosplay/${cosplayId}/like`, { method: "POST" });
      const data = await res.json();
      setCosplays((prev) =>
        prev.map((c) => (c.id === cosplayId ? { ...c, likes: data.likes } : c))
      );
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(cosplayId);
        else next.delete(cosplayId);
        return next;
      });
    } catch {
      // Transient like failure — leave the current state untouched.
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-page-in">
      {/* Hero Header */}
      <div className="relative text-center mb-10 overflow-hidden">
        {/* Background glow */}
        <AuroraParticles className="opacity-60" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[var(--color-magenta)]/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-[var(--color-violet)]/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-1.5 glass-badge text-[var(--color-magenta)] mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)] animate-pulse" />
              COMMUNITY
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold">
              <span className="gradient-text">Cosplay Gallery</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-[var(--color-mute)] text-sm sm:text-base max-w-lg mx-auto"
          >
            Discover stunning anime cosplays. Share your costumes and get featured.
          </motion.p>

          {/* Stats bar */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center justify-center gap-6 mt-5"
            >
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-mute)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-cyan)]">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <CountUp value={total || cosplays.length} className="font-mono font-semibold text-[var(--color-ink)]" />
                <span>cosplays</span>
              </div>
              <div className="h-3 w-px bg-[var(--color-line)]" />
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-mute)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-magenta)]">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <CountUp
                  value={cosplays.reduce((sum, c) => sum + c.likes, 0)}
                  className="font-mono font-semibold text-[var(--color-ink)]"
                />
                <span>likes</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rgb-border rgb-border-always mb-8"
      >
        <div className="glass-panel p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Anime filter */}
          <div className="relative flex-1 rgb-border">
            <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="ml-3 shrink-0 text-[var(--color-mute)]">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={animeFilter}
                onChange={(e) => setAnimeFilter(e.target.value)}
                placeholder="Filter by anime..."
                aria-label="Filter cosplays by anime"
                className="cosplay-filter-input w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none"
              />
            </div>
          </div>

          {/* Character filter */}
          <div className="relative flex-1 rgb-border">
            <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="ml-3 shrink-0 text-[var(--color-mute)]">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <input
                value={charFilter}
                onChange={(e) => setCharFilter(e.target.value)}
                placeholder="Filter by character..."
                aria-label="Filter cosplays by character"
                className="cosplay-filter-input w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none"
              />
            </div>
          </div>

          {/* Sort + Upload */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[var(--color-line)] bg-[var(--color-void)]/50 p-0.5" role="group" aria-label="Sort cosplays">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  aria-pressed={sort === opt.value}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    sort === opt.value
                      ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] shadow-[0_0_12px_rgba(255,45,120,0.15)]"
                      : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              ))}
            </div>

            {session?.user?.id && (
              <Link href="/cosplay/upload"
                className="btn-magnetic flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-magenta)]/20 to-[var(--color-violet)]/20 border border-[var(--color-magenta)]/30 px-4 py-2.5 text-sm font-semibold text-[var(--color-magenta)] hover:from-[var(--color-magenta)]/30 hover:to-[var(--color-violet)]/30 transition-all whitespace-nowrap"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="hidden sm:inline">Upload</span>
              </Link>
            )}
          </div>
        </div>
        </div>
      </motion.div>

      {/* Gallery */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
                <div className="aspect-[3/4] shimmer" />
                <div className="p-3 space-y-2">
                  <div className="flex gap-1">
                    <div className="h-4 w-12 rounded-full bg-[var(--color-void)] shimmer" />
                    <div className="h-4 w-16 rounded-full bg-[var(--color-void)] shimmer" />
                  </div>
                  <div className="h-3 w-24 bg-[var(--color-void)] rounded shimmer" />
                  <div className="h-2 w-32 bg-[var(--color-void)] rounded shimmer" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-[var(--color-void)] shimmer" />
                      <div className="h-2 w-16 bg-[var(--color-void)] rounded shimmer" />
                    </div>
                    <div className="h-2 w-8 bg-[var(--color-void)] rounded shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : error && cosplays.length === 0 ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-magenta)]/20 to-[var(--color-violet)]/20 border border-[var(--color-magenta)]/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-magenta)]">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="absolute -inset-4 bg-[var(--color-magenta)]/5 rounded-3xl blur-xl" />
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--color-ink)] mb-2">Couldn&apos;t load the gallery</h3>
            <p className="text-sm text-[var(--color-mute)] max-w-sm mx-auto mb-6">
              Something went wrong while fetching cosplays. Please try again.
            </p>
            <button
              onClick={retry}
              className="btn-magnetic inline-flex items-center gap-2 rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-6 py-3 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Try again
            </button>
          </motion.div>
        ) : cosplays.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-magenta)]/20 to-[var(--color-violet)]/20 border border-[var(--color-magenta)]/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-magenta)]">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="absolute -inset-4 bg-[var(--color-magenta)]/5 rounded-3xl blur-xl" />
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--color-ink)] mb-2">No Cosplays Yet</h3>
            <p className="text-sm text-[var(--color-mute)] max-w-sm mx-auto mb-6">
              Be the first to share your amazing cosplay! Upload your costume and inspire the community.
            </p>
            {session?.user?.id ? (
              <Link href="/cosplay/upload"
                className="btn-magnetic inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(255,45,120,0.3)] hover:shadow-[0_0_40px_rgba(255,45,120,0.5)] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Upload Your Cosplay
              </Link>
            ) : (
              <Link href="/login"
                className="btn-magnetic inline-flex items-center gap-2 rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-6 py-3 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all"
              >
                Login to Upload
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-0">
              {cosplays.map((c, i) => (
                <CosplayCard
                  key={c.id}
                  cosplay={c}
                  onLike={() => handleLike(c.id)}
                  liked={likedIds.has(c.id)}
                  index={i}
                />
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-3 text-sm font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/30 transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-[var(--color-cyan)]/30 border-t-[var(--color-cyan)] animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest like nudge */}
      <AnimatePresence>
        {likeNudge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2"
          >
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-panel)]/95 px-5 py-2.5 text-sm font-semibold text-[var(--color-cyan)] shadow-lg backdrop-blur-md hover:bg-[var(--color-cyan)]/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Sign in to like cosplays
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
