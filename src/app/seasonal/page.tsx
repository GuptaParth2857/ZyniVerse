"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSeasonal, getMangaPopular } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";
import { CardSkeleton, ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import NativeBannerAd from "@/components/NativeBannerAd";
import SeasonalFilters, { type SeasonalFiltersState } from "@/components/SeasonalFilters";
import type { Media } from "@/lib/anilist";

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

export default function SeasonalPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const defaultSeason = currentMonth <= 3 ? "WINTER" : currentMonth <= 6 ? "SPRING" : currentMonth <= 9 ? "SUMMER" : "FALL";

  const [year, setYear] = useState(currentYear);
  const [season, setSeason] = useState(defaultSeason as "WINTER" | "SPRING" | "SUMMER" | "FALL");
  const [type, setType] = useState("ANIME");
  const [list, setList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<SeasonalFiltersState>({
    format: [],
    genres: [],
    sort: "POPULARITY_DESC",
    minScore: 0,
  });
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!yearOpen) return;
    const handler = (e: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [yearOpen]);

  const filteredList = useMemo(() => {
    let r = [...list];
    if (filters.format.length) r = r.filter((m) => m.format && filters.format.includes(m.format));
    if (filters.genres.length) r = r.filter((m) => m.genres?.some((g) => filters.genres.includes(g)));
    if (filters.minScore > 0) r = r.filter((m) => (m.averageScore || 0) >= filters.minScore);
    if (filters.sort === "SCORE_DESC") r.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    else if (filters.sort === "TITLE_ROMAJI_ASC") r.sort((a, b) => (a.title?.userPreferred || "").localeCompare(b.title?.userPreferred || ""));
    else if (filters.sort === "START_DATE_DESC") {
      const toDate = (d?: { year?: number; month?: number; day?: number }) => d?.year ? d.year * 10000 + (d.month || 0) * 100 + (d.day || 0) : 0;
      r.sort((a, b) => toDate(b.startDate) - toDate(a.startDate));
    }
    return r;
  }, [list, filters]);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    const p = type === "ANIME"
      ? getSeasonal(year, season, 50).then((d) => { if (!cancelled) { setList(d.media); setTotalCount(d.pageInfo?.total || d.media.length); } })
      : getMangaPopular(50).then((d) => { if (!cancelled) { setList(d); setTotalCount(d.length); } });
    p.catch((e: Error) => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [year, season, type]);

  const navigateSeason = useCallback((delta: number) => {
    const idx = SEASONS.indexOf(season);
    let newIdx = idx + delta;
    let newYear = year;
    if (newIdx < 0) { newIdx = 3; newYear -= 1; }
    if (newIdx > 3) { newIdx = 0; newYear += 1; }
    setSeason(SEASONS[newIdx]);
    setYear(newYear);
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [season, year]);

  const isManga = type === "MANGA";
  const accentColor = { WINTER: "#22d3ee", SPRING: "#e879f9", SUMMER: "#fbbf24", FALL: "#a78bfa" }[season];
  const emoji = { WINTER: "❄️", SPRING: "🌸", SUMMER: "☀️", FALL: "🍁" }[season];
  const seasonName = { WINTER: "Winter", SPRING: "Spring", SUMMER: "Summer", FALL: "Fall" }[season];

  const formatBreakdown = useMemo(() => {
    if (!list.length) return "";
    const items = type === "ANIME"
      ? [
          { label: "TV", count: list.filter((m) => m.format === "TV").length },
          { label: "Movie", count: list.filter((m) => m.format === "MOVIE").length },
          { label: "OVA", count: list.filter((m) => m.format === "OVA" || m.format === "ONA").length },
          { label: "Special", count: list.filter((m) => m.format === "SPECIAL").length },
        ]
      : [
          { label: "Manga", count: list.filter((m) => m.format === "MANGA").length },
          { label: "Novel", count: list.filter((m) => m.format === "NOVEL").length },
          { label: "One-shot", count: list.filter((m) => m.format === "ONE_SHOT").length },
        ];
    const avg = list.filter((m) => m.averageScore).length
      ? (list.reduce((s, m) => s + (m.averageScore || 0), 0) / list.filter((m) => m.averageScore).length / 10).toFixed(1)
      : null;
    return items.filter((i) => i.count).map((i) => `${i.label} ${i.count}`).join(" · ") + (avg ? ` · Avg ${avg}` : "");
  }, [list, type]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* ── Header ── */}
        <div className="mb-8 text-center sm:text-left">
          <div className="neon-rgb-border inline-block rounded-xl px-5 py-3">
            <div className="flex items-center gap-3">
              {!isManga && <span className="text-3xl">{emoji}</span>}
              <h1 className="font-display text-3xl font-bold sm:text-4xl bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-violet)] bg-clip-text text-transparent">
                {isManga ? `Popular Manga ${year}` : `${seasonName} ${year} Anime`}
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--color-mute)]">
            {totalCount > 0 ? `${totalCount.toLocaleString()} ${isManga ? "manga" : "titles"} · ${formatBreakdown}` : "Browse the latest titles"}
          </p>
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Season nav */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigateSeason(-1)}
              className="neon-rgb-border flex items-center justify-center rounded-lg size-9 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-all"
              aria-label="Previous season"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={() => navigateSeason(1)}
              className="neon-rgb-border flex items-center justify-center rounded-lg size-9 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-all"
              aria-label="Next season"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          {/* Season pills */}
          <div className="flex rounded-xl neon-rgb-border overflow-x-auto">
            {SEASONS.map((s) => (
              <button key={s} onClick={() => setSeason(s)}
                className={`px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                  season === s ? "text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
                style={season === s ? { background: accentColor } : {}}
              >{{ WINTER: "Winter", SPRING: "Spring", SUMMER: "Summer", FALL: "Fall" }[s]}</button>
            ))}
          </div>

          {/* Year select */}
          <div ref={yearRef} className="relative">
            <div className="neon-rgb-border rounded-xl">
              <button onClick={() => setYearOpen(!yearOpen)}
                className="flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 text-sm outline-none whitespace-nowrap"
              >
                {year}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`transition-transform ${yearOpen ? "rotate-180" : ""}`}
                ><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>
            {yearOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 max-h-60 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] backdrop-blur-xl shadow-xl">
                {Array.from({ length: 15 }, (_, i) => currentYear - i + 2).sort((a, b) => b - a).map((y) => (
                  <button key={y} onClick={() => { setYear(y); setYearOpen(false); }}
                    className={`block w-full px-4 py-1.5 text-left text-sm transition-colors whitespace-nowrap ${
                      year === y ? "text-black bg-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:bg-[var(--color-hover)]"
                    }`}
                  >{y}</button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[var(--color-line)]" />

          {/* Type toggle */}
          <div className="flex rounded-xl neon-rgb-border overflow-x-auto">
            {(["ANIME", "MANGA"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                  type === t ? "bg-[var(--color-magenta)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >{t.charAt(0) + t.slice(1).toLowerCase()}</button>
            ))}
          </div>

          {/* Current season badge */}
          {!isManga && season === defaultSeason && year === currentYear && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
              Current Season
            </span>
          )}
        </div>

        {/* ── Filters ── */}
        {!isManga && !loading && list.length > 0 && (
          <SeasonalFilters filters={filters} onChange={setFilters} />
        )}

        {/* ── Grid ── */}
        <div ref={gridRef}>
          {error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : (
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {Array.from({ length: 18 }).map((_, i) => <CardSkeleton key={`s${i}`} />)}
                </div>
              ) : filteredList.length > 0 ? (
                <motion.div
                  key={`${season}-${year}-${type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                >
                  {filteredList.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.015, duration: 0.3 }}
                    >
                      <AnimeCard anime={m} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : list.length > 0 ? (
                <EmptyState icon="calendar" title="No anime match your filters" description="Try adjusting the format, genre, or score filters." />
              ) : (
                <EmptyState icon="calendar" title={`Nothing found for ${seasonName} ${year}`} description="Try a different season or year." actionLabel="Current Season" actionHref="/seasonal" />
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
