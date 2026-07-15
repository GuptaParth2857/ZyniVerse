"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LIVE_ACTION_ANIME,
  LIVE_ACTION_PLATFORMS,
  getAvailableAnime,
  getUpcomingAnime,
  getMostPopular,
  getByPlatform,
  type LiveActionAnime,
} from "@/lib/live-action-anime";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

function NeonBorder({ children, glowColor }: { children: React.ReactNode; glowColor?: string }) {
  return (
    <div className="relative rounded-[24px]">
      <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: `conic-gradient(from 0deg, transparent, ${glowColor || "#00ffe0"}, transparent, #ff00e6, transparent, #7000ff, transparent, ${glowColor || "#00ffe0"})`, animation: "spin 6s linear infinite", willChange: "transform" }}
        />
        <div className="absolute inset-[1.5px] rounded-[22.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: LiveActionAnime["status"] }) {
  const config = {
    available: { label: "Available", color: "#48BB78" },
    upcoming: { label: "Coming Soon", color: "#ED8936" },
    cancelled: { label: "Cancelled", color: "#E53E3E" },
  };
  const c = config[status];
  return (
    <span className="absolute top-3 left-3 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
      style={{ background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}44` }}
    >
      {c.label}
    </span>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  if (rating === 0) return <span className="text-[10px] text-[var(--color-mute)] font-semibold">TBA</span>;
  return (
    <div className="flex items-center gap-1">
      <svg className="h-3 w-3 text-[var(--color-amber)]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-[11px] font-bold text-[var(--color-amber)]">{rating.toFixed(1)}</span>
    </div>
  );
}

function PosterCard({ anime, rank, compact }: { anime: LiveActionAnime; rank?: number; compact?: boolean }) {
  return (
    <Link
      href={`/live-action/${anime.id}`}
      className="snap-start shrink-0 group/card w-[150px] sm:w-[170px] md:w-[190px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-400 group-hover/card:border-[var(--color-magenta)] group-hover/card:shadow-[0_0_40px_-8px_var(--color-magenta)]">
        {/* Animated neon border glow on hover */}
        <div className="absolute -inset-[1px] rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent)", animation: "spin 4s linear infinite", filter: "blur(2px)" }} />
        <div className="absolute inset-0 rounded-xl bg-[var(--color-panel)] m-[1px]" />
        {anime.posterUrl ? (
          <img
            src={anime.posterUrl}
            alt={anime.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan)]/20 to-[var(--color-magenta)]/20 flex items-center justify-center">
            <span className="text-4xl opacity-30">🎬</span>
          </div>
        )}
        <StatusBadge status={anime.status} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 translate-y-2 group-hover/card:translate-y-0 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
          <p className="font-display text-xs sm:text-sm font-bold leading-tight line-clamp-2 drop-shadow-lg">
            {anime.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
            <RatingBadge rating={anime.rating} />
            {anime.episodes ? <span>{anime.episodes} ep</span> : null}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {anime.platforms.slice(0, 2).map((p) => (
              <span key={p.name} className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${p.logoColor}22`, color: p.available ? p.logoColor : "var(--color-mute)" }}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
        {anime.rating > 0 && (
          <span className="absolute right-1.5 top-12 z-10 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[var(--color-cyan)] backdrop-blur">
            ★ {(anime.rating).toFixed(1)}
          </span>
        )}
        {rank !== undefined && (
          <div className="absolute left-2 top-2 z-10">
            <span className="font-mono text-[10px] font-bold text-white/40 drop-shadow-lg">
              {rank.toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function HorizontalCarousel({ items, title }: { items: LiveActionAnime[]; title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 600);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/row">
      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((anime) => (
          <PosterCard key={anime.id} anime={anime} />
        ))}
      </div>
      <button onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white border border-[var(--color-line)] hover:border-[var(--color-magenta)] transition-all opacity-0 group-hover/row:opacity-100"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white border border-[var(--color-line)] hover:border-[var(--color-magenta)] transition-all opacity-0 group-hover/row:opacity-100"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

function MostPopularSection({ items }: { items?: LiveActionAnime[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const popular = items || getMostPopular();

  return (
    <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.08 }} className="mb-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            // Explore
          </p>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Most Popular</h2>
          <p className="text-sm text-[var(--color-mute)] mt-1">Discover what everyone is watching</p>
        </div>
      </div>
      {/* Desktop: expanding flex */}
      <div className="hidden md:flex h-[400px] gap-2 w-full">
        {popular.map((anime) => {
          const isHovered = hovered === anime.id;
          return (
            <motion.div
              key={anime.id}
              layout
              animate={{ flex: isHovered ? 3 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onMouseEnter={() => setHovered(anime.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] cursor-pointer group"
              style={{ minWidth: 0 }}
            >
              <Link href={`/live-action/${anime.id}`} className="block h-full w-full">
                {anime.posterUrl ? (
                  <img src={anime.posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan)]/20 to-[var(--color-magenta)]/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                {!isHovered && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <motion.p animate={{ opacity: isHovered ? 0 : 1 }}
                    className="font-display text-xs font-bold leading-tight [writing-mode:vertical-lr] rotate-180 truncate"
                  >
                    {anime.title}
                  </motion.p>
                </div>
                <motion.div initial={false} animate={{ opacity: isHovered ? 1 : 0 }} transition={{ duration: 0.2 }}
                  className="absolute inset-x-0 bottom-0 p-5"
                >
                  <p className="font-display text-lg font-bold leading-tight drop-shadow-lg">{anime.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-mute)]">
                    <RatingBadge rating={anime.rating} />
                    {anime.episodes ? <span>{anime.episodes} ep</span> : null}
                    <span className="text-[10px] uppercase">{anime.type}</span>
                    <span>{anime.releaseYear}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {anime.genres.slice(0, 3).map((g) => (
                      <span key={g} className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] backdrop-blur">{g}</span>
                    ))}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--color-mute)] leading-relaxed">{anime.description.slice(0, 150)}...</p>
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-magenta)]"
                  >
                    View Details →
                  </motion.span>
                </motion.div>
                <div className="absolute left-3 top-3">
                  <span className="font-mono text-[10px] font-bold text-white/40">
                    {(popular.indexOf(anime) + 1).toString().padStart(2, "0")}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      {/* Mobile: horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:hidden -mx-4 px-4">
        {popular.map((anime, idx) => (
          <PosterCard key={anime.id} anime={anime} rank={idx + 1} />
        ))}
      </div>
    </motion.div>
  );
}

function PlatformSection({ platform, color }: { platform: string; color: string }) {
  const items = getByPlatform(platform);
  if (items.length === 0) return null;

  return (
    <motion.div {...FADE_UP} className="mb-8">
      <div className="mb-5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded-full" style={{ background: color }} />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-mute)]">
              // Platform
            </p>
            <h2 className="font-display text-xl font-bold sm:text-2xl">{platform}</h2>
            <p className="text-xs text-[var(--color-mute)] mt-0.5">{items.length} title{items.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>
      <HorizontalCarousel items={items} title={platform} />
    </motion.div>
  );
}

function FilterableGrid() {
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "upcoming">("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | "series" | "movie">("all");

  const filtered = useMemo(() => {
    let result = [...LIVE_ACTION_ANIME];
    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);
    if (selectedType !== "all") result = result.filter((a) => a.type === selectedType);
    if (selectedPlatform) result = result.filter((a) => a.platforms.some((p) => p.name === selectedPlatform));
    return result.sort((a, b) => b.popularity - a.popularity);
  }, [statusFilter, selectedPlatform, selectedType]);

  return (
    <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.3 }} className="mb-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">// All Titles</p>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Full Catalog</h2>
          <p className="text-sm text-[var(--color-mute)] mt-1">{filtered.length} titles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "available", "upcoming"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              borderColor: statusFilter === s ? "var(--color-cyan)" : "var(--color-line)",
              background: statusFilter === s ? "rgba(0,188,212,0.13)" : "transparent",
              color: statusFilter === s ? "var(--color-cyan)" : "var(--color-mute)",
            }}
          >
            {s === "all" ? "All" : s === "available" ? "Available Now" : "Upcoming"}
          </button>
        ))}
        <span className="w-px h-6 bg-[var(--color-line)] self-center mx-1" />
        {(["all", "series", "movie"] as const).map((t) => (
          <button key={t} onClick={() => setSelectedType(t)}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              borderColor: selectedType === t ? "var(--color-amber)" : "var(--color-line)",
              background: selectedType === t ? "rgba(245,158,11,0.1)" : "transparent",
              color: selectedType === t ? "#f59e0b" : "var(--color-mute)",
            }}
          >
            {t === "all" ? "All Types" : t === "series" ? "Series" : "Movies"}
          </button>
        ))}
        <span className="w-px h-6 bg-[var(--color-line)] self-center mx-1" />
        {LIVE_ACTION_PLATFORMS.filter((p) => getByPlatform(p.name).length > 0).map((p) => (
          <button key={p.name} onClick={() => setSelectedPlatform(selectedPlatform === p.name ? null : p.name)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              borderColor: selectedPlatform === p.name ? p.logoColor : "var(--color-line)",
              background: selectedPlatform === p.name ? `${p.logoColor}22` : "transparent",
              color: selectedPlatform === p.name ? p.logoColor : "var(--color-mute)",
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: p.logoColor }} />
            {p.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((anime) => (
          <PosterCard key={anime.id} anime={anime} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm font-semibold text-[var(--color-mute)]">No titles match your filters</p>
          <p className="text-xs text-[var(--color-mute)]/60 mt-1">Try adjusting your search</p>
        </div>
      )}
    </motion.div>
  );
}

function LiveActionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const available = getAvailableAnime();
  const upcoming = getUpcomingAnime();
  const availableCount = available.length;
  const upcomingCount = upcoming.length;
  const platformCount = new Set(LIVE_ACTION_ANIME.flatMap((a) => a.platforms.map((p) => p.name))).size;

  const filterTitles = (titles: LiveActionAnime[]) => {
    if (!searchQuery) return titles;
    const q = searchQuery.toLowerCase();
    return titles.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      (a.japaneseTitle && a.japaneseTitle.toLowerCase().includes(q)) ||
      a.genres.some((g) => g.toLowerCase().includes(q)) ||
      a.languages.some((l) => l.toLowerCase().includes(q)) ||
      a.platforms.some((p) => p.name.toLowerCase().includes(q)) ||
      a.description.toLowerCase().includes(q) ||
      (a.basedOn && a.basedOn.toLowerCase().includes(q))
    );
  };

  const filteredAvailable = useMemo(() => filterTitles(available), [searchQuery, available]);
  const filteredUpcoming = useMemo(() => filterTitles(upcoming), [searchQuery, upcoming]);
  const filteredPopular = useMemo(() => filterTitles(getMostPopular()), [searchQuery]);

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />
        <motion.div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(229,9,20,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute top-[40%] right-[10%] w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Hero */}
          <motion.div {...FADE_UP} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-1 rounded-full bg-[var(--color-amber)]" />
                  <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-[var(--color-amber)] via-white to-[var(--color-magenta)] bg-clip-text text-transparent">
                    Live-Action Anime
                  </h1>
                </div>
                <p className="text-sm text-[var(--color-mute)] ml-4">
                  Every live-action adaptation — available now, coming soon, and where to watch
                </p>
              </div>
            </div>
          </motion.div>

          {/* Neon RGB Search Bar */}
          <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.05 }} className="mb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] opacity-30 group-focus-within:opacity-100 blur-sm transition-all duration-700 animate-neon-rgb" />
              <div className="relative flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 transition-colors group-focus-within:border-transparent">
                <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-mute)" }}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title, genre, language, platform..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-mute)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-mute)]">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {searchQuery && (
              <p className="text-xs text-[var(--color-mute)] mt-2 ml-1">
                {filteredAvailable.length + filteredUpcoming.length} results for &ldquo;<span className="text-[var(--color-cyan)]">{searchQuery}</span>&rdquo;
              </p>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total Titles", value: LIVE_ACTION_ANIME.length, color: "var(--color-cyan)" },
              { label: "Available Now", value: availableCount, color: "#48BB78" },
              { label: "Coming Soon", value: upcomingCount, color: "#ED8936" },
              { label: "Platforms", value: platformCount, color: "var(--color-amber)" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 text-center">
                <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Most Popular */}
          <MostPopularSection items={searchQuery ? filteredPopular : undefined} />

          {/* Available Now */}
          {filteredAvailable.length > 0 && (
            <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.12 }} className="mb-8">
              <div className="mb-5 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-1 rounded-full bg-[#48BB78]" />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-mute)]">// Available Now</p>
                    <h2 className="font-display text-2xl font-bold sm:text-3xl">Watch Today</h2>
                    <p className="text-xs text-[var(--color-mute)] mt-0.5">Stream these live-action adaptations right now</p>
                  </div>
                </div>
              </div>
              <HorizontalCarousel items={filteredAvailable} title="Available Now" />
            </motion.div>
          )}

          {/* Upcoming */}
          {filteredUpcoming.length > 0 && (
            <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.15 }} className="mb-8">
              <div className="mb-5 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-1 rounded-full bg-[#ED8936]" />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-mute)]">// Upcoming</p>
                    <h2 className="font-display text-2xl font-bold sm:text-3xl">Coming Soon</h2>
                    <p className="text-xs text-[var(--color-mute)] mt-0.5">Live-action adaptations in production</p>
                  </div>
                </div>
              </div>
              <HorizontalCarousel items={filteredUpcoming} title="Upcoming" />
            </motion.div>
          )}

          {/* By Platform */}
          {!searchQuery && LIVE_ACTION_PLATFORMS.filter((p) => getByPlatform(p.name).length > 0).map((platform) => (
            <PlatformSection key={platform.name} platform={platform.name} color={platform.logoColor} />
          ))}

          {/* Full Catalog */}
          <FilterableGrid />
        </div>
      </div>
    </PageTransition>
  );
}

export default function LiveActionPageWrapper() {
  return (
    <ErrorBoundary>
      <LiveActionPage />
    </ErrorBoundary>
  );
}
