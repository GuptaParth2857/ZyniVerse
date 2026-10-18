"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import FanArtCard from "@/components/FanArtCard";

interface FanArtItem {
  id: string;
  title: string;
  description: string | null;
  animeTitle: string | null;
  character: string | null;
  imageUrl: string;
  artType: string;
  tags: string;
  likes: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const ART_TYPES = [
  { value: "", label: "All Types", emoji: "✨" },
  { value: "digital", label: "Digital", emoji: "🎨" },
  { value: "traditional", label: "Traditional", emoji: "🖌️" },
  { value: "sketch", label: "Sketch", emoji: "✏️" },
  { value: "manga", label: "Manga", emoji: "📖" },
  { value: "pixel", label: "Pixel Art", emoji: "👾" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recent", icon: "🕐" },
  { value: "popular", label: "Popular", icon: "🔥" },
];

const SORT_VALUES = SORT_OPTIONS.map((o) => o.value);

export default function FanArtGallery() {
  const { data: session } = useSession();
  const [items, setItems] = useState<FanArtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState("recent");
  const [artTypeFilter, setArtTypeFilter] = useState("");
  const [animeFilter, setAnimeFilter] = useState("");
  const [debouncedAnime, setDebouncedAnime] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeNudge, setLikeNudge] = useState(false);
  // URL filters are read after mount (rather than via `useSearchParams`) so the
  // component — hero and all — is server-rendered into the static HTML. Using
  // `useSearchParams` would make Next client-render this whole Suspense subtree.
  const [hydrated, setHydrated] = useState(false);

  const mountedRef = useRef(true);
  const likedFetchedRef = useRef<Set<string>>(new Set());
  const prevFiltersRef = useRef({ sort: "recent", artType: "", anime: "" });
  const prevNavRef = useRef({ sort: "recent", artType: "", anime: "" });
  const pageRef = useRef(1);
  const [totalCount, setTotalCount] = useState(0);
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
    const nextSort = SORT_VALUES.includes(s) ? s : "recent";
    const a = sp.get("artType") ?? "";
    const n = sp.get("anime") ?? "";
    prevFiltersRef.current = { sort: nextSort, artType: a, anime: n };
    prevNavRef.current = { sort: nextSort, artType: a, anime: n };
    /* eslint-disable react-hooks/set-state-in-effect */
    setSort(nextSort);
    setArtTypeFilter(a);
    setAnimeFilter(n);
    setDebouncedAnime(n);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Restore filter state when the user navigates back/forward.
  useEffect(() => {
    function onPop() {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("sort") ?? "";
      const nextSort = SORT_VALUES.includes(s) ? s : "recent";
      const a = sp.get("artType") ?? "";
      const n = sp.get("anime") ?? "";
      prevFiltersRef.current = { sort: nextSort, artType: a, anime: n };
      prevNavRef.current = { sort: nextSort, artType: a, anime: n };
      setSort(nextSort);
      setArtTypeFilter(a);
      setAnimeFilter(n);
      setDebouncedAnime(n);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Debounce the text filter so typing doesn't fire a request per keystroke
  // against the remote (Tokyo) database.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedAnime(animeFilter), 400);
    return () => clearTimeout(t);
  }, [animeFilter]);

  // Keep filters in the URL so links are shareable and Back/Forward works.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const sp = new URLSearchParams();
    if (sort !== "recent") sp.set("sort", sort);
    if (artTypeFilter) sp.set("artType", artTypeFilter);
    if (debouncedAnime.trim()) sp.set("anime", debouncedAnime.trim());
    const qs = sp.toString();
    const target = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (target === current) return;
    const prev = prevNavRef.current;
    const discrete = prev.sort !== sort || prev.artType !== artTypeFilter;
    prevNavRef.current = { sort, artType: artTypeFilter, anime: debouncedAnime };
    if (discrete) window.history.pushState(null, "", target);
    else window.history.replaceState(null, "", target);
  }, [hydrated, sort, artTypeFilter, debouncedAnime]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const prev = prevFiltersRef.current;
    if (prev.sort !== sort || prev.artType !== artTypeFilter || prev.anime !== debouncedAnime) {
      prevFiltersRef.current = { sort, artType: artTypeFilter, anime: debouncedAnime };
      pageRef.current = 1;
    }
    const currentPage = pageRef.current;

    async function load() {
      if (currentPage === 1) setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({ sort, page: String(currentPage), perPage: "30" });
        if (artTypeFilter) params.set("artType", artTypeFilter);
        if (debouncedAnime.trim()) params.set("anime", debouncedAnime.trim());
        const res = await fetch(`/api/fanart?${params}`);
        const data = await res.json();
        if (!cancelled && mountedRef.current) {
          setTotalCount(data.total || 0);
          setItems((prev) =>
            currentPage === 1 ? (data.items || []) : [...prev, ...(data.items || [])]
          );
          setHasNextPage(data.hasNextPage || false);
          setLoading(false);
          setLoadingMore(false);
        }
      } catch {
        if (!cancelled && mountedRef.current) {
          if (currentPage === 1) setItems([]);
          setError(true);
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [hydrated, sort, artTypeFilter, debouncedAnime, fetchKey]);

  // Seed per-user like state for the loaded cards. The gallery list is cached
  // and shared between visitors, so the flags come from a separate no-store
  // endpoint and are merged in once the signed-in user is known.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      likedFetchedRef.current = new Set();
      return;
    }
    const ids = items.map((c) => c.id).filter((id) => !likedFetchedRef.current.has(id));
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`/api/fanart/likes?ids=${ids.join(",")}`)
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
  }, [session?.user?.id, items]);

  async function handleLike(fanArtId: string) {
    if (!session?.user?.id) {
      setLikeNudge(true);
      setTimeout(() => setLikeNudge(false), 3000);
      return;
    }
    try {
      const res = await fetch(`/api/fanart/${fanArtId}/like`, { method: "POST" });
      const data = await res.json();
      setItems((prev) =>
        prev.map((c) => (c.id === fanArtId ? { ...c, likes: data.likes } : c))
      );
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(fanArtId);
        else next.delete(fanArtId);
        return next;
      });
    } catch {
      // Transient like failure — leave the current state untouched.
    }
  }

  function retry() {
    pageRef.current = 1;
    setError(false);
    setFetchKey((k) => k + 1);
  }

  async function loadMore() {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    pageRef.current = pageRef.current + 1;
    setFetchKey((k) => k + 1);
  }

  const activeFilters = [artTypeFilter, animeFilter.trim()].filter(Boolean).length;
  const isFiltered = activeFilters > 0 || sort !== "recent";

  return (
    <>
    <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 animate-page-in">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
        }}
      />

      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 py-12 text-center backdrop-blur-sm sm:py-16">
        <div className="neon-banner-card pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="console-label mb-4"
          >
            Community Art · Fan Creations
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="neon-text-gradient font-display text-4xl font-black tracking-tight sm:text-6xl"
          >
            Fan Art Gallery
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-mute)] sm:text-base"
          >
            Share your artwork and explore stunning fan creations from animators, illustrators
            and artists across the community.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {session?.user?.id ? (
              <Link
                href="/fanart/upload"
                className="neon-banner-btn group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--color-void)]"
              >
                <span className="transition-transform duration-300 group-hover:rotate-90">✧</span>
                Upload Your Art
              </Link>
            ) : (
              <Link
                href="/login"
                className="neon-banner-btn group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--color-void)]"
              >
                <span className="transition-transform duration-300 group-hover:scale-125">✧</span>
                Sign In to Share
              </Link>
            )}
            {totalCount > 0 && (
              <span className="glass-badge !px-4 !py-2 !text-xs">
                {totalCount.toLocaleString()} {totalCount === 1 ? "creation" : "creations"} shared
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─────────── FILTERS ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel sticky top-20 z-30 mt-8 flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between lg:top-16"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort */}
          <div className="flex overflow-hidden rounded-lg border border-[var(--color-line)] bg-black/30">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-all ${
                  sort === opt.value
                    ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]"
                    : "text-[var(--color-mute)] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Art Type */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              {ART_TYPES.find((t) => t.value === artTypeFilter)?.emoji || "✨"}
            </span>
            <select
              value={artTypeFilter}
              onChange={(e) => setArtTypeFilter(e.target.value)}
              className="glass-input appearance-none rounded-lg py-2 pl-9 pr-8 text-xs font-medium text-white focus:outline-none"
            >
              {ART_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[var(--color-panel)] text-white">
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--color-mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 md:max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by anime..."
            value={animeFilter}
            onChange={(e) => setAnimeFilter(e.target.value)}
            className="glass-input w-full rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-[var(--color-mute)] focus:outline-none"
          />
          {animeFilter && (
            <button
              onClick={() => setAnimeFilter("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-mute)] transition-colors hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>

      {/* Active filter chips */}
      {isFiltered && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {artTypeFilter && (
            <button onClick={() => setArtTypeFilter("")} className="glass-tag">
              {ART_TYPES.find((t) => t.value === artTypeFilter)?.emoji} {ART_TYPES.find((t) => t.value === artTypeFilter)?.label}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          {animeFilter.trim() && (
            <button onClick={() => setAnimeFilter("")} className="glass-tag">
              📺 {animeFilter.trim()}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          {sort !== "recent" && (
            <button onClick={() => setSort("recent")} className="glass-tag">
              🔥 {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          <button onClick={() => { setSort("recent"); setArtTypeFilter(""); setAnimeFilter(""); }} className="text-[11px] font-medium text-[var(--color-cyan)] hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* ─────────── GALLERY ─────────── */}
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
                <div className="shimmer aspect-[3/4]" />
                <div className="space-y-2 p-3.5">
                  <div className="shimmer h-3 w-2/3 rounded" />
                  <div className="shimmer h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-3xl border-2 border-dashed border-red-500/40" />
              <span className="text-5xl">😵</span>
            </div>
            <p className="font-display text-xl font-bold text-white">Couldn&apos;t load the gallery</p>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-mute)]">
              Something went wrong while fetching fan art. Check your connection and try again.
            </p>
            <button
              onClick={retry}
              className="neon-btn btn-magnetic mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
            >
              ↻ Retry
            </button>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-3xl border-2 border-dashed border-[var(--color-violet)]/40" />
              <span className="text-5xl">🖼️</span>
            </div>
            <p className="font-display text-xl font-bold text-white">No fan art found</p>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-mute)]">
              {isFiltered
                ? "Try adjusting your filters or search — there may be no art matching yet."
                : "The gallery is empty. Be the first to share your creation with the community!"}
            </p>
            {session?.user?.id && (
              <Link
                href="/fanart/upload"
                className="neon-banner-btn mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-void)]"
              >
                ✧ Upload Art
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item, i) => (
                <FanArtCard
                  key={item.id}
                  item={item}
                  index={i}
                  liked={likedIds.has(item.id)}
                  onLike={() => handleLike(item.id)}
                />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-10 flex justify-center">
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Loading art...
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="neon-btn btn-magnetic group relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-8 py-3 font-display text-xs font-bold uppercase tracking-widest text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
                  >
                    <span className="mr-1 inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                    Load More
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>

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
            className="flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-panel)]/95 px-5 py-2.5 text-sm font-semibold text-[var(--color-cyan)] shadow-lg backdrop-blur-md transition-colors hover:bg-[var(--color-cyan)]/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Sign in to like fan art
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
