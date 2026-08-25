"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  { value: "", label: "All Types" },
  { value: "digital", label: "🎨 Digital" },
  { value: "traditional", label: "🖌️ Traditional" },
  { value: "sketch", label: "✏️ Sketch" },
  { value: "manga", label: "📖 Manga" },
  { value: "pixel", label: "👾 Pixel Art" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent", icon: "🕐" },
  { value: "popular", label: "Most Popular", icon: "🔥" },
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Community Art</p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Fan Art Gallery</h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Share your artwork and discover amazing fan creations
          </p>
        </div>
        {session?.user?.id && (
          <Link
            href="/fanart/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-magenta)]/20 px-5 py-2.5 text-sm font-bold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)] hover:text-black transition-all"
          >
            ✦ Upload Art
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {/* Sort */}
        <div className="flex rounded-lg bg-[var(--color-panel)] border border-white/[0.06] overflow-hidden">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                sort === opt.value
                  ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]"
                  : "text-[var(--color-mute)] hover:text-white"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* Art Type */}
        <select
          value={artTypeFilter}
          onChange={(e) => setArtTypeFilter(e.target.value)}
          className="rounded-lg bg-[var(--color-panel)] border border-white/[0.06] px-3 py-1.5 text-xs text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-magenta)]/50"
        >
          {ART_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Anime Search */}
        <input
          type="text"
          placeholder="Search by anime..."
          value={animeFilter}
          onChange={(e) => setAnimeFilter(e.target.value)}
          className="rounded-lg bg-[var(--color-panel)] border border-white/[0.06] px-3 py-1.5 text-xs text-white placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-magenta)]/50 w-48"
        />
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-4">🎨</p>
          <p className="text-[var(--color-mute)]">No fan art yet. Be the first to share!</p>
          {session?.user?.id && (
            <Link href="/fanart/upload" className="mt-4 inline-block text-sm text-[var(--color-cyan)] hover:underline">
              Upload your art →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item, i) => (
              <FanArtCard key={item.id} item={item} index={i} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-xl bg-white/5 px-6 py-2.5 text-sm text-[var(--color-mute)] hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
