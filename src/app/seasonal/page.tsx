"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getSeasonal, getMangaPopular, bestTitle } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";
import { CardSkeleton, ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import NativeBannerAd from "@/components/NativeBannerAd";
import type { Media } from "@/lib/anilist";

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;
const SEASON_NAMES: Record<string, string> = { WINTER: "Winter", SPRING: "Spring", SUMMER: "Summer", FALL: "Fall" };
const SEASON_EMOJIS: Record<string, string> = { WINTER: "❄️", SPRING: "🌸", SUMMER: "☀️", FALL: "🍁" };
const SEASON_COLORS: Record<string, string> = { WINTER: "var(--color-cyan)", SPRING: "var(--color-magenta)", SUMMER: "var(--color-amber)", FALL: "var(--color-violet)" };

export default function SeasonalPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const defaultSeason = currentMonth <= 3 ? "WINTER" : currentMonth <= 6 ? "SPRING" : currentMonth <= 9 ? "SUMMER" : "FALL";

  const [year, setYear] = useState(currentYear);
  const [season, setSeason] = useState<"WINTER" | "SPRING" | "SUMMER" | "FALL">(defaultSeason);
  const [type, setType] = useState<"ANIME" | "MANGA">("ANIME");
  const [list, setList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (type === "ANIME") {
      getSeasonal(year, season, 50)
        .then((d) => { if (!cancelled) { setList(d.media); setTotalCount(d.pageInfo?.total || d.media.length); } })
        .catch((e: Error) => { if (!cancelled) setError(e.message); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      getMangaPopular(50)
        .then((d) => { if (!cancelled) { setList(d); setTotalCount(d.length); } })
        .catch((e: Error) => { if (!cancelled) setError(e.message); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }
    return () => { cancelled = true; };
  }, [year, season, type]);

  function navigateSeason(delta: number) {
    const idx = SEASONS.indexOf(season);
    let newIdx = idx + delta;
    let newYear = year;
    if (newIdx < 0) { newIdx = 3; newYear -= 1; }
    if (newIdx > 3) { newIdx = 0; newYear += 1; }
    setSeason(SEASONS[newIdx] as "WINTER" | "SPRING" | "SUMMER" | "FALL");
    setYear(newYear);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const accentColor = SEASON_COLORS[season] || "var(--color-cyan)";
  const isManga = type === "MANGA";

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">// {isManga ? "Recent Releases" : "Seasonal"}</p>
          <div className="flex items-center gap-3 mt-1">
            {!isManga && <span className="text-3xl">{SEASON_EMOJIS[season]}</span>}
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              {isManga ? `Popular Manga ${year}` : `${SEASON_NAMES[season]} ${year} Anime`}
            </h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            {totalCount > 0
              ? `${totalCount} ${isManga ? "manga started in" : "titles releasing this"} ${isManga ? year : "season"}`
              : "Browse titles"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {!isManga && (
            <>
              <button onClick={() => navigateSeason(-1)}
                className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] hover:border-[var(--color-cyan)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Previous
              </button>

              <div className="flex rounded-xl border border-[var(--color-line)] overflow-x-auto">
                {SEASONS.map((s) => (
                  <button key={s} onClick={() => setSeason(s)}
                    className={`px-4 py-2 text-sm font-semibold transition-all ${
                      season === s
                        ? "text-black"
                        : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    }`}
                    style={season === s ? { background: accentColor } : {}}
                  >{SEASON_NAMES[s]}</button>
                ))}
              </div>

              <button onClick={() => navigateSeason(1)}
                className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] hover:border-[var(--color-cyan)] transition-all"
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <div className="h-6 w-px bg-[var(--color-line)]" />
            </>
          )}

          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
          >
            {Array.from({ length: 12 }, (_, i) => currentYear - i + 2).sort((a, b) => b - a).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <div className="flex rounded-xl border border-[var(--color-line)] overflow-x-auto">
            {(["ANIME", "MANGA"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  type === t
                    ? "bg-[var(--color-magenta)] text-black"
                    : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >{t.charAt(0) + t.slice(1).toLowerCase()}</button>
            ))}
          </div>

          {!isManga && season === defaultSeason && year === currentYear && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
              Current Season
            </span>
          )}
        </div>

        {/* Quick Stats */}
        {!loading && list.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-4 text-xs text-[var(--color-mute)]">
            {isManga ? (
              <>
                <span>Manga: {list.filter((m) => m.format === "MANGA").length}</span>
                <span>• Novel: {list.filter((m) => m.format === "NOVEL").length}</span>
                <span>• One-shot: {list.filter((m) => m.format === "ONE_SHOT").length}</span>
                <span>• Avg Score: {(list.reduce((s, m) => s + (m.averageScore || 0), 0) / Math.max(1, list.filter((m) => m.averageScore).length) / 10).toFixed(1)}</span>
              </>
            ) : (
              <>
                <span>TV: {list.filter((m) => m.format === "TV").length}</span>
                <span>• Movie: {list.filter((m) => m.format === "MOVIE").length}</span>
                <span>• OVA: {list.filter((m) => m.format === "OVA" || m.format === "ONA").length}</span>
                <span>• Special: {list.filter((m) => m.format === "SPECIAL").length}</span>
                <span>• Avg Score: {(list.reduce((s, m) => s + (m.averageScore || 0), 0) / Math.max(1, list.filter((m) => m.averageScore).length) / 10).toFixed(1)}</span>
              </>
            )}
          </div>
        )}

        {/* Grid */}
        <div ref={gridRef}>
          {error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${season}-${year}-${type}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              >
                {list.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.015, duration: 0.3 }}
                  >
                    <AnimeCard anime={m} />
                  </motion.div>
                ))}
                {loading && Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={`s${i}`} />)}
              </motion.div>
            </AnimatePresence>
          )}
          {!loading && list.length === 0 && (
            <EmptyState icon="calendar" title={`Nothing found for ${SEASON_NAMES[season]} ${year}`} description="Try a different season or year." actionLabel="Current Season" actionHref="/seasonal" />
          )}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
