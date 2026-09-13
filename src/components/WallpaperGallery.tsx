"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { NeonFilterShell } from "./NeonSelect";

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

const RESOLUTION_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  "4K": { bg: "rgba(255,45,120,0.15)", text: "#ff2d78", glow: "0 0 16px rgba(255,45,120,0.4)" },
  "2K": { bg: "rgba(41,242,224,0.15)", text: "#29f2e0", glow: "0 0 16px rgba(41,242,224,0.4)" },
  FHD: { bg: "rgba(138,92,255,0.15)", text: "#8a5cff", glow: "0 0 16px rgba(138,92,255,0.4)" },
};

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const HERO_TAGS = [
  { label: "4K", emoji: "✨", color: "#ff2d78" },
  { label: "2K", emoji: "🚀", color: "#29f2e0" },
  { label: "FHD", emoji: "💠", color: "#8a5cff" },
  { label: "Phone", emoji: "📱", color: "#ffb020" },
];

const HERO_STATS = [
  { icon: "🖥️", label: "Desktop Ready" },
  { icon: "🎨", label: "Curated Sets" },
  { icon: "💾", label: "Free Downloads" },
];

const TICKER_ITEMS = [
  { label: "4K", emoji: "✨", color: "#f87171" },
  { label: "2K", emoji: "🚀", color: "#22d3ee" },
  { label: "FHD", emoji: "💠", color: "#a78bfa" },
  { label: "Landscape", emoji: "🖥️", color: "#facc15" },
  { label: "Portrait", emoji: "🖼️", color: "#4ade80" },
  { label: "Phone", emoji: "📱", color: "#fb923c" },
  { label: "Square", emoji: "⬜", color: "#60a5fa" },
  { label: "Desktop", emoji: "🖥️", color: "#f472b6" },
  { label: "Tablet", emoji: "📟", color: "#34d399" },
  { label: "Fan Favorite", emoji: "💜", color: "#a78bfa" },
];

function getResBadge(resolution: string | null) {
  if (!resolution) return null;
  const upper = resolution.toUpperCase();
  if (upper.includes("4K")) return { label: "4K", ...RESOLUTION_COLORS["4K"] };
  if (upper.includes("2K")) return { label: "2K", ...RESOLUTION_COLORS["2K"] };
  const match = resolution.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (match) {
    const maxDim = Math.max(parseInt(match[1], 10), parseInt(match[2], 10));
    if (maxDim >= 3840) return { label: "4K", ...RESOLUTION_COLORS["4K"] };
    if (maxDim >= 2560) return { label: "2K", ...RESOLUTION_COLORS["2K"] };
    if (maxDim >= 1920) return { label: "FHD", ...RESOLUTION_COLORS.FHD };
  }
  if (upper.includes("1080") || upper.includes("FHD") || upper.includes("1920"))
    return { label: "FHD", ...RESOLUTION_COLORS.FHD };
  return { label: resolution, bg: "rgba(255,176,32,0.15)", text: "#ffb020", glow: "0 0 12px rgba(255,176,32,0.3)" };
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
      style={{
        color: c,
        borderColor: `color-mix(in srgb, ${c} 40%, transparent)`,
      }}
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
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/wallpapers/${item.id}/like`, {
        method: "POST",
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes);
    } catch {}
  };

  const resBadge = getResBadge(item.resolution);

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: Math.min((index % 8) * 0.055, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="group cursor-pointer break-inside-avoid mb-4"
      onClick={() => onOpen(item)}
    >
      <div className="meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/85 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />

        <div className="relative overflow-hidden meme-aurora">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 z-10">
              <div className="shimmer aspect-video h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#15121d] via-[#15121d]/40 to-transparent" />
            </div>
          )}
          <Image
            src={item.thumbnailUrl || item.imageUrl}
            alt={item.title}
            width={600}
            height={400}
            unoptimized
            loading="eager"
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-auto object-cover transition-all duration-500 group-hover:scale-110 ${
              imgError ? "opacity-0" : imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {imgError && (
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]">
              <span className="text-5xl opacity-80">🖼️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#15121d] via-[#15121d]/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="award-sheen" />

          <div className="absolute left-2.5 top-2.5 z-20 flex flex-col gap-1.5">
            {resBadge && (
              <span
                className="glass-badge !px-2 !py-0.5 !text-[10px] font-black tracking-wider"
                style={{
                  background: resBadge.bg,
                  color: resBadge.text,
                  boxShadow: resBadge.glow,
                  borderColor: `color-mix(in srgb, ${resBadge.text} 40%, transparent)`,
                }}
              >
                {resBadge.label}
              </span>
            )}
          </div>

          <button
            onClick={handleLike}
            aria-label="Like"
            className={`absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-90 ${
              liked
                ? "bg-[var(--color-magenta)] text-white shadow-[0_0_20px_-2px_var(--color-magenta)]"
                : "bg-black/40 text-white/80 hover:bg-[var(--color-magenta)]/25 hover:text-[var(--color-magenta)]"
            }`}
          >
            <motion.svg
              key={liked ? "yes" : "no"}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="h-4 w-4"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </motion.svg>
          </button>

          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 px-3 pb-3 pt-10">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-magenta)] p-[1px] shadow-[0_0_12px_rgba(0,255,224,0.15)] ring-2 ring-white/10">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[#12101c] text-[8px] font-black text-white">
                {item.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="truncate text-[11px] font-semibold text-white/70">
              {item.user.username}
            </span>
          </div>
        </div>

        <div className="relative z-10 p-3.5">
          <h3 className="line-clamp-1 font-display text-[13px] font-extrabold leading-snug text-[var(--color-ink)] transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[var(--color-cyan)] group-hover:via-[var(--color-magenta)] group-hover:to-[var(--color-violet)] group-hover:bg-clip-text group-hover:text-transparent">
            {item.title}
          </h3>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--color-mute)]">
            {item.animeTitle && (
              <span className="line-clamp-1">{item.animeTitle}</span>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <CategoryBadge category={item.category} />
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-[10px] text-[var(--color-mute)]">
                <motion.svg
                  className="h-3 w-3"
                  fill={liked ? "var(--color-magenta)" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </motion.svg>
                {formatNumber(likes)}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[var(--color-mute)]">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {formatNumber(item.downloads)}
              </span>
            </div>
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
      const res = await fetch(`/api/wallpapers/${wallpaper.id}/like`, {
        method: "POST",
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes);
    } catch {}
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/wallpapers/${wallpaper.id}/download`, {
        method: "POST",
      });
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

  const resBadge = getResBadge(wallpaper.resolution);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl meme-card-border bg-[#15121d]/95 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 z-50 h-px meme-hairline" />

        <div className="pointer-events-none absolute inset-x-0 z-40 flex justify-center mix-blend-screen opacity-50">
          <div className="h-40 w-2/3 bg-gradient-to-b from-[var(--color-magenta)]/20 to-transparent blur-2xl" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:border-[var(--color-magenta)]/70 hover:bg-[var(--color-magenta)]/20"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="relative meme-aurora">
          <Image
            src={wallpaper.imageUrl}
            alt={wallpaper.title}
            width={1200}
            height={800}
            unoptimized
            className="w-full h-auto max-h-[60vh] object-contain"
          />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg sm:text-xl font-black tracking-tight text-white">
                {wallpaper.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2.5 text-sm text-[var(--color-mute)]">
                {wallpaper.animeTitle && <span>{wallpaper.animeTitle}</span>}
                {resBadge && (
                  <span
                    className="glass-badge !px-2 !py-0.5 !text-[10px] font-black"
                    style={{
                      background: resBadge.bg,
                      color: resBadge.text,
                      boxShadow: resBadge.glow,
                    }}
                  >
                    {resBadge.label}
                  </span>
                )}
                <CategoryBadge category={wallpaper.category} />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.92 }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  liked
                    ? "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)] shadow-[0_0_25px_rgba(255,45,120,0.35)]"
                    : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                }`}
              >
                <motion.svg
                  key={liked ? "liked" : "unliked"}
                  initial={{ scale: 1.6, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="w-4 h-4"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </motion.svg>
                {formatNumber(likes)}
              </motion.button>

              <motion.button
                onClick={handleDownload}
                disabled={downloading}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(41,242,224,0.3)] disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {downloading ? "Downloading..." : "Download 4K"}
              </motion.button>
            </div>
          </div>

          {wallpaper.description && (
            <p className="mt-4 text-sm text-[var(--color-mute)] leading-relaxed">
              {wallpaper.description}
            </p>
          )}

          {wallpaper.tags && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[...new Set(wallpaper.tags.split(",").map((t) => t.trim()).filter(Boolean))]
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/20 px-2.5 py-1 text-[10px] font-medium text-[var(--color-cyan)]/80"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3.5 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-mute)]">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {formatNumber(downloads)} downloads
            </span>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-magenta)] p-[1px]">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[#12101c] text-[9px] font-black text-white">
                  {wallpaper.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-medium text-[var(--color-mute)]">
                {wallpaper.user.username}
              </span>
            </div>
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
  const [selectedWallpaper, setSelectedWallpaper] =
    useState<WallpaperItem | null>(null);

  const mountedRef = useRef(true);
  const prevFiltersRef = useRef({ sort, categoryFilter, searchQuery });
  const pageRef = useRef(1);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const prev = prevFiltersRef.current;
    if (
      prev.sort !== sort ||
      prev.categoryFilter !== categoryFilter ||
      prev.searchQuery !== searchQuery
    ) {
      prevFiltersRef.current = { sort, categoryFilter, searchQuery };
      pageRef.current = 1;
    }
    const currentPage = pageRef.current;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          sort,
          page: String(currentPage),
          perPage: "30",
        });
        if (categoryFilter) params.set("category", categoryFilter);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        const res = await fetch(`/api/wallpapers?${params}`);
        const data = await res.json();
        if (!cancelled && mountedRef.current) {
          setTotalCount(data.total || 0);
          setItems((prev) =>
            currentPage === 1
              ? data.items || []
              : [...prev, ...(data.items || [])]
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
    return () => {
      cancelled = true;
    };
  }, [sort, categoryFilter, searchQuery, fetchKey]);

  async function loadMore() {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    pageRef.current = pageRef.current + 1;
    setFetchKey((k) => k + 1);
  }

  const activeFilters = [categoryFilter, searchQuery.trim()].filter(
    Boolean
  ).length;
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

        <section className="neon-rgb-border relative overflow-hidden rounded-3xl bg-[var(--color-panel)]/60 py-14 text-center backdrop-blur-sm sm:py-20">
          <div className="neon-banner-card pointer-events-none absolute inset-0" />

          {/* Top shine line */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          {/* Scanline sweep */}
          <div aria-hidden className="scanline-sweep" />

          {/* HUD corner brackets */}
          <div aria-hidden className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[var(--color-cyan)]/50" />
          <div aria-hidden className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[var(--color-cyan)]/50" />
          <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[var(--color-magenta)]/50" />
          <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[var(--color-magenta)]/50" />

          {/* Floating emojis (desktop) */}
          <span aria-hidden className="pointer-events-none absolute left-10 top-10 hidden text-3xl opacity-40 float-anim md:block">🖥️</span>
          <span aria-hidden className="pointer-events-none absolute right-12 top-14 hidden text-3xl opacity-40 float-anim md:block" style={{ animationDelay: "0.9s" }}>📱</span>
          <span aria-hidden className="pointer-events-none absolute bottom-12 left-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "0.45s" }}>🖼️</span>
          <span aria-hidden className="pointer-events-none absolute bottom-14 right-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "1.3s" }}>✨</span>

          {/* Breathing orbs */}
          <div aria-hidden className="pointer-events-none absolute left-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-cyan)]/25 blur-[55px] float-anim md:block" />
          <div aria-hidden className="pointer-events-none absolute right-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-magenta)]/25 blur-[55px] float-anim md:block" style={{ animationDelay: "1.5s" }} />

          <div className="relative z-10 mx-auto max-w-3xl px-6">
            {/* Rotating conic halo behind title */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
              style={{
                background: "conic-gradient(from 0deg, var(--color-magenta), var(--color-cyan), var(--color-violet), var(--color-magenta))",
                animation: "spin 10s linear infinite",
              }}
            />

            <div className="relative">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="console-label mb-4 flex animate-hero-text items-center justify-center gap-2"
                style={{ animationDelay: "0.05s" }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                </span>
                HD Wallpapers · Anime Backgrounds
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="neon-text-gradient animate-hero-text font-display text-4xl font-black tracking-tight sm:text-6xl"
                style={{ filter: "drop-shadow(0 0 28px rgba(138,92,255,0.35))", animationDelay: "0.15s" }}
              >
                Anime Wallpapers
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="mx-auto mt-4 max-w-xl animate-hero-text text-sm text-[var(--color-mute)] sm:text-base"
                style={{ animationDelay: "0.25s" }}
              >
                Download high-quality anime wallpapers for your desktop, phone, and
                tablet. Curated collection from your favorite series.
              </motion.p>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {HERO_STATS.map((s) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] backdrop-blur-sm"
                  >
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>

              {/* Content type chips */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {HERO_TAGS.map((tag) => (
                  <span
                    key={tag.label}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:brightness-125"
                    style={{ color: tag.color, borderColor: `${tag.color}55`, background: `${tag.color}14` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: tag.color, boxShadow: `0 0 8px ${tag.color}` }} />
                    {tag.emoji} {tag.label}
                  </span>
                ))}
              </div>

              {/* Upload CTA */}
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
                    <span className="transition-transform duration-300 group-hover:rotate-90">
                      ✧
                    </span>
                    Upload Wallpaper
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="neon-banner-btn group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--color-void)]"
                  >
                    <span className="transition-transform duration-300 group-hover:scale-125">
                      ✧
                    </span>
                    Sign In to Upload
                  </Link>
                )}
                {totalCount > 0 && (
                  <span className="glass-badge !px-4 !py-2 !text-xs">
                    {totalCount.toLocaleString()}{" "}
                    {totalCount === 1 ? "wallpaper" : "wallpapers"} available
                  </span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Neon marquee ticker band */}
          <div aria-hidden className="ticker-window relative z-10 mt-8 border-t border-[var(--color-line)] bg-[var(--color-void)]/40 py-3">
            <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap px-8">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                <span key={i} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                  <span className="text-base leading-none" style={{ textShadow: `0 0 10px ${t.color}aa` }}>{t.emoji}</span>
                  <span className="text-[var(--color-mute)]">{t.label}</span>
                  <span className="ml-6 select-none text-[var(--color-magenta)]/40">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel sticky top-20 z-30 mt-8 flex flex-col gap-4 p-4 lg:top-16"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="console-label !text-[10px]">
                  Sort
                </span>
                <NeonFilterShell>
                  <div
                    className="flex items-center gap-1 rounded-xl p-1"
                    role="tablist"
                    aria-label="Sort wallpapers"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        role="tab"
                        aria-selected={sort === opt.value}
                        onClick={() => setSort(opt.value)}
                        className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                          sort === opt.value
                            ? "text-black"
                            : "text-[var(--color-mute)] hover:text-white"
                        }`}
                      >
                        {sort === opt.value && (
                          <motion.span
                            layoutId="wallpaper-sort-pill"
                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] shadow-[0_2px_12px_rgba(255,45,120,0.45)]"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10">{opt.icon}</span>
                        <span className="relative z-10">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </NeonFilterShell>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="console-label !text-[10px]">
                  Category
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const isActive = categoryFilter === cat.value;
                    const canClear = isActive && cat.value !== "";
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setCategoryFilter(cat.value)}
                        className={`group flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                          isActive
                            ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] shadow-[0_0_14px_rgba(41,242,224,0.18)]"
                            : "border-white/[0.07] bg-black/30 text-white/45 hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)] hover:shadow-[0_0_10px_rgba(41,242,224,0.12)]"
                        }`}
                      >
                        <span
                          className={`transition-transform duration-200 ${
                            isActive ? "scale-110" : "group-hover:scale-110"
                          }`}
                        >
                          {cat.icon}
                        </span>
                        {cat.label}
                        {canClear && (
                          <span
                            role="button"
                            tabIndex={-1}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategoryFilter("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                setCategoryFilter("");
                              }
                            }}
                            aria-label={`Clear ${cat.label}`}
                            className="ml-0.5 flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-[var(--color-cyan)]/25 text-[9px] text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)] hover:text-black"
                          >
                            ✕
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative w-full xl:max-w-xs">
              <NeonFilterShell>
                <div className="group flex items-center gap-2 px-3">
                  <svg
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      searchQuery
                        ? "text-[var(--color-violet)]"
                        : "text-[var(--color-mute)] group-focus-within:text-[var(--color-violet)]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search wallpapers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/70 transition-all hover:bg-white/20 hover:text-white"
                    >
                      ✕
                    </button>
                  ) : (
                    <span className="hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-mute)] sm:block">
                      /
                    </span>
                  )}
                </div>
              </NeonFilterShell>
            </div>
          </div>

          {isFiltered && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">
                Filters
              </span>
              {categoryFilter && (
                <button
                  onClick={() => setCategoryFilter("")}
                  className="glass-tag !flex !items-center gap-1.5 !py-1"
                >
                  {CATEGORIES.find((c) => c.value === categoryFilter)?.icon}{" "}
                  {CATEGORIES.find((c) => c.value === categoryFilter)?.label}
                  <span className="ml-0.5 font-bold text-[var(--color-cyan)]">
                    ✕
                  </span>
                </button>
              )}
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="glass-tag !flex !items-center gap-1.5 !py-1"
                >
                  <svg
                    className="h-3 w-3 text-[var(--color-violet)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                    />
                  </svg>
                  {searchQuery.trim()}
                  <span className="ml-0.5 font-bold text-[var(--color-violet)]">
                    ✕
                  </span>
                </button>
              )}
              {sort !== "recent" && (
                <button
                  onClick={() => setSort("recent")}
                  className="glass-tag !flex !items-center gap-1.5 !py-1"
                >
                  {SORT_OPTIONS.find((o) => o.value === sort)?.icon}{" "}
                  {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                  <span className="ml-0.5 font-bold text-[var(--color-magenta)]">
                    ✕
                  </span>
                </button>
              )}
              <button
                onClick={() => {
                  setSort("recent");
                  setCategoryFilter("");
                  setSearchQuery("");
                }}
                className="ml-auto text-[11px] font-semibold text-[var(--color-cyan)] underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        <div className="mt-8">
          {loading ? (
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="meme-card-border mb-4 break-inside-avoid overflow-hidden rounded-3xl bg-[#15121d]/85"
                >
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
              <p className="font-display text-xl font-bold text-white">
                No wallpapers found
              </p>
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
                  <WallpaperCard
                    key={item.id}
                    item={item}
                    index={i}
                    onOpen={setSelectedWallpaper}
                  />
                ))}
              </div>

              {hasNextPage && (
                <div className="mt-10 flex justify-center">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Loading wallpapers...
                    </div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="neon-btn btn-magnetic group relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-8 py-3 font-display text-xs font-bold uppercase tracking-widest text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
                    >
                      <span className="mr-1 inline-block transition-transform duration-300 group-hover:translate-y-0.5">
                        ↓
                      </span>
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
          <WallpaperModal
            wallpaper={selectedWallpaper}
            onClose={() => setSelectedWallpaper(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
