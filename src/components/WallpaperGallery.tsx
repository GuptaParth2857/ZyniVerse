"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface WallpaperItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  animeTitle: string | null;
  resolution: string | null;
  category: string;
  tags: string;
  downloads: number;
  likes: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const CATEGORIES = [
  { value: "", label: "All", icon: "✨" },
  { value: "landscape", label: "Landscape", icon: "🖥️" },
  { value: "portrait", label: "Portrait", icon: "🖼️" },
  { value: "phone", label: "Phone", icon: "📱" },
  { value: "square", label: "Square", icon: "⬜" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recent", icon: "🕐" },
  { value: "popular", label: "Popular", icon: "🔥" },
  { value: "downloads", label: "Most Downloaded", icon: "⬇️" },
];

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    landscape: "#29f2e0",
    portrait: "#ff2d78",
    phone: "#8a5cff",
    square: "#ffb020",
  };
  const c = colors[category] || "#8a5cff";
  return (
    <span
      className="glass-badge !px-2 !py-0.5 !text-[10px]"
      style={{ color: c, borderColor: `color-mix(in srgb, ${c} 40%, transparent)` }}
    >
      {CATEGORIES.find((cat) => cat.value === category)?.icon} {category}
    </span>
  );
}

function WallpaperCard({
  item,
  index,
  onOpen,
}: {
  item: WallpaperItem;
  index: number;
  onOpen: (item: WallpaperItem) => void;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const [imgError, setImgError] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/wallpapers/${item.id}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.06, ease: CARD_EASE }}
      whileHover={{ y: -6 }}
      className="group cursor-pointer break-inside-avoid mb-4"
      onClick={() => onOpen(item)}
    >
      <div className="card-glow relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
        <div className="relative overflow-hidden bg-[#0a0a14]">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={600}
            height={400}
            onError={() => setImgError(true)}
            className={`w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 ${imgError ? "opacity-0" : ""}`}
          />
          {imgError && (
            <div className="flex items-center justify-center bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] py-20">
              <span className="text-5xl opacity-80">🖼️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
          <div className="award-sheen" />

          {item.resolution && (
            <span className="absolute left-2.5 top-2.5 glass-badge !px-2 !py-0.5 !text-[10px]">
              {item.resolution}
            </span>
          )}

          <button
            onClick={handleLike}
            aria-label="Like"
            className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-90 ${
              liked
                ? "bg-[var(--color-magenta)] text-white shadow-[0_0_16px_-2px_var(--color-magenta)]"
                : "bg-black/40 text-white/80 hover:bg-[var(--color-magenta)]/25 hover:text-[var(--color-magenta)]"
            }`}
          >
            <motion.svg
              key={liked ? "yes" : "no"}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="h-4 w-4"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </motion.svg>
          </button>
        </div>

        <div className="relative z-10 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-display text-sm font-bold text-[var(--color-ink)] transition-colors group-hover:text-white">
              {item.title}
            </h3>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[var(--color-magenta)]">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {formatNumber(likes)}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--color-mute)]">
            {item.animeTitle && <span className="line-clamp-1">{item.animeTitle}</span>}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <CategoryBadge category={item.category} />
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-mute)]">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {formatNumber(item.downloads)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WallpaperModal({
  wallpaper,
  onClose,
}: {
  wallpaper: WallpaperItem;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(wallpaper.likes);
  const [downloads, setDownloads] = useState(wallpaper.downloads);
  const [downloading, setDownloading] = useState(false);

  const handleLike = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/wallpapers/${wallpaper.id}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes);
    } catch {}
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/wallpapers/${wallpaper.id}/download`, { method: "POST" });
      const data = await res.json();
      setDownloads(data.downloads);
      const link = document.createElement("a");
      link.href = data.imageUrl;
      link.download = `${wallpaper.title.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
    setDownloading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative bg-[#0a0a14]">
          <Image
            src={wallpaper.imageUrl}
            alt={wallpaper.title}
            width={1200}
            height={800}
            className="w-full h-auto max-h-[60vh] object-contain"
          />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-white">{wallpaper.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--color-mute)]">
                {wallpaper.animeTitle && <span>{wallpaper.animeTitle}</span>}
                {wallpaper.resolution && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-xs">{wallpaper.resolution}</span>
                  </>
                )}
                <span>·</span>
                <CategoryBadge category={wallpaper.category} />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  liked
                    ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]"
                    : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                }`}
              >
                <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {formatNumber(likes)}
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-5 py-2 text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>

          {wallpaper.description && (
            <p className="mt-4 text-sm text-[var(--color-mute)] leading-relaxed">{wallpaper.description}</p>
          )}

          {wallpaper.tags && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {wallpaper.tags.split(",").filter(Boolean).map((tag) => (
                <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-[var(--color-mute)]">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-mute)]">
            <span className="flex items-center gap-1.5">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {formatNumber(downloads)} downloads
            </span>
            <span>by {wallpaper.user.username}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WallpaperGallery() {
  const { data: session } = useSession();
  const [items, setItems] = useState<WallpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [sort, setSort] = useState("recent");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperItem | null>(null);

  const mountedRef = useRef(true);
  const prevFiltersRef = useRef({ sort, categoryFilter, searchQuery });
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
    if (prev.sort !== sort || prev.categoryFilter !== categoryFilter || prev.searchQuery !== searchQuery) {
      prevFiltersRef.current = { sort, categoryFilter, searchQuery };
      pageRef.current = 1;
    }
    const currentPage = pageRef.current;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ sort, page: String(currentPage), perPage: "30" });
        if (categoryFilter) params.set("category", categoryFilter);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        const res = await fetch(`/api/wallpapers?${params}`);
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
  }, [sort, categoryFilter, searchQuery, fetchKey]);

  async function loadMore() {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    pageRef.current = pageRef.current + 1;
    setFetchKey((k) => k + 1);
  }

  const activeFilters = [categoryFilter, searchQuery.trim()].filter(Boolean).length;
  const isFiltered = activeFilters > 0 || sort !== "recent";

  return (
    <>
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
          }}
        />

        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 py-12 text-center backdrop-blur-sm sm:py-16">
          <div className="neon-banner-card pointer-events-none absolute inset-0" />
          <div className="relative z-10 mx-auto max-w-3xl px-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="console-label mb-4"
            >
              HD Wallpapers · Anime Backgrounds
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="neon-text-gradient font-display text-4xl font-black tracking-tight sm:text-6xl"
            >
              Anime Wallpapers
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-mute)] sm:text-base"
            >
              Download high-quality anime wallpapers for your desktop, phone, and tablet. Curated collection from your favorite series.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {session?.user?.id ? (
                <Link
                  href="/wallpapers/upload"
                  className="neon-banner-btn group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--color-void)]"
                >
                  <span className="transition-transform duration-300 group-hover:rotate-90">✧</span>
                  Upload Wallpaper
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="neon-banner-btn group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--color-void)]"
                >
                  <span className="transition-transform duration-300 group-hover:scale-125">✧</span>
                  Sign In to Upload
                </Link>
              )}
              {totalCount > 0 && (
                <span className="glass-badge !px-4 !py-2 !text-xs">
                  {totalCount.toLocaleString()} {totalCount === 1 ? "wallpaper" : "wallpapers"} available
                </span>
              )}
            </motion.div>
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel sticky top-20 z-30 mt-8 flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between lg:top-16"
        >
          <div className="flex flex-wrap items-center gap-2">
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

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    categoryFilter === cat.value
                      ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] border border-[var(--color-cyan)]/30"
                      : "bg-white/5 text-white/40 border border-white/[0.06] hover:border-white/[0.14]"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 md:max-w-xs">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search wallpapers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-[var(--color-mute)] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
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

        {isFiltered && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {categoryFilter && (
              <button onClick={() => setCategoryFilter("")} className="glass-tag">
                {CATEGORIES.find((c) => c.value === categoryFilter)?.icon} {CATEGORIES.find((c) => c.value === categoryFilter)?.label}
                <span className="ml-1 text-white">×</span>
              </button>
            )}
            {searchQuery.trim() && (
              <button onClick={() => setSearchQuery("")} className="glass-tag">
                🔍 {searchQuery.trim()}
                <span className="ml-1 text-white">×</span>
              </button>
            )}
            {sort !== "recent" && (
              <button onClick={() => setSort("recent")} className="glass-tag">
                {SORT_OPTIONS.find((o) => o.value === sort)?.icon} {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                <span className="ml-1 text-white">×</span>
              </button>
            )}
            <button onClick={() => { setSort("recent"); setCategoryFilter(""); setSearchQuery(""); }} className="text-[11px] font-medium text-[var(--color-cyan)] hover:underline">
              Clear all
            </button>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
                  <div className="shimmer aspect-video" />
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
              <p className="font-display text-xl font-bold text-white">No wallpapers found</p>
              <p className="mt-2 max-w-sm text-sm text-[var(--color-mute)]">
                {isFiltered
                  ? "Try adjusting your filters or search — there may be no wallpapers matching yet."
                  : "The collection is empty. Be the first to share a wallpaper with the community!"}
              </p>
              {session?.user?.id && (
                <Link
                  href="/wallpapers/upload"
                  className="neon-banner-btn mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-void)]"
                >
                  ✧ Upload Wallpaper
                </Link>
              )}
            </motion.div>
          ) : (
            <>
              <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                {items.map((item, i) => (
                  <WallpaperCard key={item.id} item={item} index={i} onOpen={setSelectedWallpaper} />
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
                      Loading wallpapers...
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

      <AnimatePresence>
        {selectedWallpaper && (
          <WallpaperModal wallpaper={selectedWallpaper} onClose={() => setSelectedWallpaper(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
