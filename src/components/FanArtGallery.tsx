"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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

export default function FanArtGallery() {
  const { data: session } = useSession();
  const [items, setItems] = useState<FanArtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [sort, setSort] = useState("recent");
  const [artTypeFilter, setArtTypeFilter] = useState("");
  const [animeFilter, setAnimeFilter] = useState("");

  const mountedRef = useRef(true);
  const prevFiltersRef = useRef({ sort, artTypeFilter, animeFilter });
  const pageRef = useRef(1);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const prev = prevFiltersRef.current;
    if (prev.sort !== sort || prev.artTypeFilter !== artTypeFilter || prev.animeFilter !== animeFilter) {
      prevFiltersRef.current = { sort, artTypeFilter, animeFilter };
      pageRef.current = 1;
    }
    const currentPage = pageRef.current;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ sort, page: String(currentPage), perPage: "30" });
        if (artTypeFilter) params.set("artType", artTypeFilter);
        if (animeFilter.trim()) params.set("anime", animeFilter.trim());
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
          setItems([]);
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [sort, artTypeFilter, animeFilter, fetchKey]);

  async function loadMore() {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    pageRef.current = pageRef.current + 1;
    setFetchKey((k) => k + 1);
  }

  const activeFilters = [artTypeFilter, animeFilter.trim()].filter(Boolean).length;
  const isFiltered = activeFilters > 0 || sort !== "recent";

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
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
                <FanArtCard key={item.id} item={item} index={i} />
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
  );
}
