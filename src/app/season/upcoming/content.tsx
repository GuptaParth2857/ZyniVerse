"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { bestTitle, type Media } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";

function stripHtml(str?: string | null): string {
  return str ? str.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'") : "";
}

function formatReleaseDate(item: Media): string | null {
  if (item.nextAiringEpisode?.airingAt) {
    return new Date(item.nextAiringEpisode.airingAt * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  const sd = item.startDate;
  if (sd?.year) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (sd.month) return `${months[sd.month - 1]} ${sd.year}`;
    return String(sd.year);
  }
  return null;
}

function daysUntil(item: Media): number | null {
  const ts = item.nextAiringEpisode?.airingAt;
  if (!ts) return null;
  return Math.max(0, Math.ceil((ts * 1000 - Date.now()) / 86400000));
}

function NeonCard({ item, index }: { item: Media; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) scale(1.03)`;
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="up-neon-card rounded-xl"
      style={{ ["--i" as string]: index, transition: "transform 0.2s ease-out" }}
    >
      <AnimeCard anime={item} no3D />
    </div>
  );
}

export default function UpcomingClient({ anime }: { anime: Media[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Media[]>(anime);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || query.trim()) return;
    setLoading(true);
    try {
      const d = await fetch(`/api/anilist/upcoming?page=${page + 1}&perPage=50`).then((r) => r.json());
      const next = (d.media || []) as Media[];
      setItems((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...next.filter((m) => !seen.has(m.id))];
      });
      setHasMore(!!d.pageInfo?.hasNextPage);
      setPage((p) => p + 1);
    } catch {
      // observer retries on next intersection
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, query, page]);

  const loadMoreRef = useRef(loadMore);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreRef.current();
      },
      { rootMargin: "600px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const d = await fetch(`/api/anilist/upcoming/search?q=${encodeURIComponent(q)}&perPage=50`).then((r) => r.json());
        if (!cancelled) setSearchResults((d.media || []) as Media[]);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query]);

  const displayItems = query.trim() ? searchResults : items;

  return (
    <>
      <style>{`
        @keyframes upNeonBorder {
          0%   { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
          20%  { border-color: #00ffff; box-shadow: 0 0 8px #00ffff55, inset 0 0 8px #00ffff11; }
          40%  { border-color: #ff3366; box-shadow: 0 0 8px #ff336655, inset 0 0 8px #ff336611; }
          60%  { border-color: #ffff00; box-shadow: 0 0 8px #ffff0055, inset 0 0 8px #ffff0011; }
          80%  { border-color: #ff0066; box-shadow: 0 0 8px #ff006655, inset 0 0 8px #ff006611; }
          100% { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
        }
        .up-neon-card {
          animation: upNeonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.4s);
          border-width: 1px;
          border-style: solid;
        }
        @keyframes upNeonBorderHover {
          0%   { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
          20%  { border-color: #00ffff; box-shadow: 0 0 14px #00ffff, 0 0 28px #00ffff88; }
          40%  { border-color: #ff3366; box-shadow: 0 0 14px #ff3366, 0 0 28px #ff336688; }
          60%  { border-color: #ffff00; box-shadow: 0 0 14px #ffff00, 0 0 28px #ffff0088; }
          80%  { border-color: #ff0066; box-shadow: 0 0 14px #ff0066, 0 0 28px #ff006688; }
          100% { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
        }
        .up-neon-card:hover {
          animation: upNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.03);
        }
        .up-neon-filter {
          animation: upNeonBorder 4s linear infinite;
          animation-delay: calc(var(--fd, 0) * -1s);
          border-width: 1px;
          border-style: solid;
        }
        .up-neon-filter:hover {
          animation: upNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.05);
        }
        .up-neon-search {
          animation: upNeonBorder 4s linear infinite;
          border-width: 1px;
          border-style: solid;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .up-neon-search:focus-within {
          animation: upNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.01);
        }
        .up-neon-search input:focus-visible,
        .up-neon-filter:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
        .up-list-card {
          animation: upNeonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.3s);
          border-width: 1px;
          border-style: solid;
        }
        .up-list-card:hover {
          animation: upNeonBorderHover 1.5s linear infinite !important;
          transform: translateY(-2px);
        }
        .up-neon-card {
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease-out;
        }
        .up-neon-card > .group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .up-neon-card .glass-card {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .up-neon-card .glass-content {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .up-neon-card .glass-content > div.border-t {
          margin-top: auto;
        }
        .up-neon-card .glass-card:hover {
          transform: none;
        }
      `}</style>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Coming soon</p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Upcoming Releases</h2>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <div className="up-neon-search rounded-xl bg-[var(--color-panel)] px-4 py-3">
          <div className="relative flex items-center gap-3">
            <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-mute)" }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, genre, format..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-mute)]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-mute)]">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {query && (
          <p className="text-xs text-[var(--color-mute)] mt-2 ml-1">
            {searchLoading ? "Searching..." : `${displayItems.length} result${displayItems.length !== 1 ? "s" : ""} for`} &ldquo;<span className="text-[var(--color-cyan)]">{query}</span>&rdquo;
          </p>
        )}
      </motion.div>

      {/* View Toggle + Count */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 flex items-center gap-3">
        <span className="text-xs text-[var(--color-mute)]">{displayItems.length} title{displayItems.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] p-0.5">
          <button onClick={() => setView("grid")}
            className={`up-neon-filter px-3 py-1.5 rounded-md text-xs font-semibold transition-all`}
            style={{
              ["--fd" as string]: 0,
              background: view === "grid" ? "rgba(0,188,212,0.13)" : "transparent",
              color: view === "grid" ? "var(--color-cyan)" : "var(--color-mute)",
            }}
          >
            Grid
          </button>
          <button onClick={() => setView("list")}
            className={`up-neon-filter px-3 py-1.5 rounded-md text-xs font-semibold transition-all`}
            style={{
              ["--fd" as string]: 1,
              background: view === "list" ? "rgba(0,188,212,0.13)" : "transparent",
              color: view === "list" ? "var(--color-cyan)" : "var(--color-mute)",
            }}
          >
            List
          </button>
        </div>
      </motion.div>

      {searchLoading ? (
        <div className="up-neon-card rounded-xl bg-[var(--color-panel)] py-20 text-center" style={{ ["--i" as string]: 0 }}>
          <motion.div className="mx-auto h-6 w-6 rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          <p className="text-sm font-semibold text-[var(--color-mute)] mt-3">Searching upcoming titles...</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="up-neon-card rounded-xl bg-[var(--color-panel)] py-20 text-center" style={{ ["--i" as string]: 0 }}>
          <p className="text-sm font-semibold text-[var(--color-mute)]">No upcoming anime match your search</p>
          <p className="text-xs text-[var(--color-mute)]/60 mt-1">Try a different keyword</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {displayItems.map((item, i) => (
            <NeonCard key={item.id} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map((item, i) => {
            const release = formatReleaseDate(item);
            const days = daysUntil(item);
            const studio = item.studios?.nodes?.find((s) => s.isAnimationStudio)?.name || item.studios?.nodes?.[0]?.name;
            const title = bestTitle(item.title);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link href={`/anime/${item.id}`}
                  className="up-list-card group relative flex items-stretch overflow-hidden rounded-xl bg-[var(--color-panel)]"
                  style={{ ["--i" as string]: i }}
                >
                  <div className="flex items-stretch w-full">
                    <div className="relative aspect-[2/3] w-[100px] sm:w-[130px] shrink-0 overflow-hidden rounded-l-xl bg-[var(--color-line)]/10">
                      {item.coverImage?.large || item.coverImage?.medium ? (
                        <Image src={item.coverImage.large || item.coverImage.medium || ""} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="130px" />
                      ) : (
                        <div className="w-full h-full bg-[var(--color-line)]/20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-panel)]/80" />
                      {item.averageScore != null && (
                        <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-mono font-bold z-10 text-[var(--color-amber)]">
                          ★ {(item.averageScore / 10).toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="relative flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center">
                      <div className="pointer-events-none absolute -right-2 -bottom-4 font-display text-5xl sm:text-6xl font-bold leading-none text-white/[0.04] select-none">
                        {i + 1}
                      </div>
                      <div className="flex items-start gap-2">
                        <h3 className="font-display text-sm sm:text-lg font-bold leading-snug line-clamp-2 group-hover:opacity-80 transition-opacity">
                          {title}
                        </h3>
                        {days != null && (
                          <span className="shrink-0 rounded-full border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/15 px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--color-magenta)]">
                            in {days}d
                          </span>
                        )}
                      </div>
                      {item.title?.romaji && item.title?.romaji !== title && (
                        <p className="text-[10px] text-[var(--color-mute)] truncate mt-0.5">{item.title.romaji}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                        {item.format && (
                          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-white/40">{item.format.replace(/_/g, " ")}</span>
                        )}
                        {item.season && item.seasonYear && (
                          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-white/40">{item.season} {item.seasonYear}</span>
                        )}
                        {studio && (
                          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-medium text-white/40 truncate max-w-[180px]">{studio}</span>
                        )}
                        {item.episodes != null && (
                          <span className="text-[9px] text-white/30">{item.episodes} ep</span>
                        )}
                      </div>
                      {release && (
                        <p className="text-[10px] font-medium text-[var(--color-cyan)] mt-1.5">
                          Releases {release}
                        </p>
                      )}
                      {item.genres && item.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.genres.slice(0, 3).map((g) => (
                            <span key={g} className="rounded-full border border-white/[0.08] px-2 py-px text-[9px] font-medium text-[var(--color-mute)]">{g}</span>
                          ))}
                        </div>
                      )}
                      {item.description && (
                        <p className="hidden sm:block mt-1.5 text-[11px] leading-snug text-[var(--color-mute)]/80 line-clamp-2">
                          {stripHtml(item.description)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center pr-3 sm:pr-4 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 transition-all duration-300 group-hover:text-[var(--color-magenta)] group-hover:translate-x-0.5">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!query.trim() && (
        <div ref={sentinelRef} className="flex items-center justify-center gap-3 py-10">
          {loading && (
            <motion.div className="h-6 w-6 rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          )}
          {!hasMore && (
            <p className="text-xs text-[var(--color-mute)]">
              {items.length} upcoming titles loaded — that&apos;s all of them.
            </p>
          )}
        </div>
      )}
    </>
  );
}
