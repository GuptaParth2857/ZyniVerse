"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LIVE_ACTION_ANIME,
  getAvailableAnime,
  getUpcomingAnime,
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

type StatusFilter = "all" | "available" | "upcoming" | "series" | "movie";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available Now" },
  { id: "upcoming", label: "Upcoming" },
  { id: "series", label: "Series" },
  { id: "movie", label: "Movies" },
];

const ALL_PLATFORMS = [
  { name: "Netflix", color: "#E50914" },
  { name: "Prime Video", color: "#00A8E1" },
  { name: "Crunchyroll", color: "#F47521" },
  { name: "JioCinema", color: "#E53E3E" },
  { name: "Hotstar", color: "#113CCF" },
];

const ALL_LANGUAGES = ["Hindi", "English", "Japanese", "Korean"];

const POSTER_GRADIENTS: Record<string, string> = {
  "one-piece-la-s1": "linear-gradient(135deg, #E53E3E 0%, #2B6CB0 50%, #F6E05E 100%)",
  "alice-in-borderland-la": "linear-gradient(135deg, #1A202C 0%, #E53E3E 50%, #2D3748 100%)",
  "yu-yu-hakusho-la": "linear-gradient(135deg, #553C9A 0%, #E53E3E 50%, #DD6B20 100%)",
  "rurouni-kenshin-films": "linear-gradient(135deg, #C53030 0%, #F7FAFC 50%, #2D3748 100%)",
  "death-note-la-film": "linear-gradient(135deg, #1A202C 0%, #718096 50%, #E53E3E 100%)",
  "cowboy-bebop-la": "linear-gradient(135deg, #DD6B20 0%, #2B6CB0 50%, #1A202C 100%)",
  "parasyte-the-grey": "linear-gradient(135deg, #276749 0%, #1A202C 50%, #E53E3E 100%)",
  "kakegurui-la-s1s2": "linear-gradient(135deg, #D53F8C 0%, #2D3748 50%, #F6E05E 100%)",
  "kimi-ni-todoke-la": "linear-gradient(135deg, #ED8936 0%, #F6E05E 50%, #48BB78 100%)",
  "golden-kamuy-film-series": "linear-gradient(135deg, #C6F6D5 0%, #2D3748 50%, #DD6B20 100%)",
  "bloodhounds-la-s1s2": "linear-gradient(135deg, #1A202C 0%, #E53E3E 50%, #F7FAFC 100%)",
  "viral-hit-la": "linear-gradient(135deg, #2B6CB0 0%, #1A202C 50%, #E53E3E 100%)",
  "avatar-last-airbender-la": "linear-gradient(135deg, #48BB78 0%, #4299E1 50%, #E53E3E 100%)",
  "naruto-live-action": "linear-gradient(135deg, #DD6B20 0%, #2B6CB0 50%, #F6E05E 100%)",
  "my-hero-academia-film": "linear-gradient(135deg, #48BB78 0%, #2B6CB0 50%, #E53E3E 100%)",
  "sakamoto-days-film": "linear-gradient(135deg, #1A202C 0%, #E53E3E 50%, #F6E05E 100%)",
  "kingdom-5th-film": "linear-gradient(135deg, #C53030 0%, #F7FAFC 50%, #1A202C 100%)",
  "bet-kakegurui-hollywood": "linear-gradient(135deg, #D53F8C 0%, #1A202C 50%, #F7FAFC 100%)",
  "dragon-ball-live-action": "linear-gradient(135deg, #F6E05E 0%, #48BB78 50%, #E53E3E 100%)",
  "one-piece-la-s3": "linear-gradient(135deg, #2B6CB0 0%, #E53E3E 50%, #F6E05E 100%)",
};

function StatusBadge({ status }: { status: LiveActionAnime["status"] }) {
  const config = {
    available: { label: "Available", bg: "rgba(72,187,120,0.15)", color: "#48BB78", border: "rgba(72,187,120,0.3)" },
    upcoming: { label: "Coming Soon", bg: "rgba(237,137,54,0.15)", color: "#ED8936", border: "rgba(237,137,54,0.3)" },
    cancelled: { label: "Cancelled", bg: "rgba(229,62,62,0.15)", color: "#E53E3E", border: "rgba(229,62,62,0.3)" },
  };
  const c = config[status];
  return (
    <span
      className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider z-10"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  );
}

function TypeBadge({ type }: { type: LiveActionAnime["type"] }) {
  const isMovie = type === "movie";
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        background: isMovie ? "rgba(237,137,54,0.12)" : "rgba(0,188,212,0.12)",
        color: isMovie ? "#ED8936" : "#00BCD4",
        border: `1px solid ${isMovie ? "rgba(237,137,54,0.25)" : "rgba(0,188,212,0.25)"}`,
      }}
    >
      {type === "series" ? "Series" : "Movie"}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  if (rating === 0) {
    return <span className="text-[11px] text-[var(--color-mute)] font-semibold">TBA</span>;
  }
  return (
    <div className="flex items-center gap-1">
      <svg className="h-3.5 w-3.5 text-[var(--color-amber)]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-[11px] font-bold text-[var(--color-amber)]">{rating.toFixed(1)}</span>
    </div>
  );
}

function AnimeCard({ anime }: { anime: LiveActionAnime }) {
  const [expanded, setExpanded] = useState(false);
  const gradient = POSTER_GRADIENTS[anime.id] || "linear-gradient(135deg, #2D3748, #1A202C)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/80 backdrop-blur-xl overflow-hidden hover:border-[var(--color-cyan)]/30 transition-all duration-300"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        <div className="relative w-full aspect-video overflow-hidden">
          <div className="absolute inset-0" style={{ background: gradient }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-display text-xl sm:text-2xl font-black text-white/90 text-center px-4 drop-shadow-lg">
              {anime.title}
            </p>
          </div>
          <StatusBadge status={anime.status} />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--color-ink)] truncate">
                {anime.title}
              </h3>
              {anime.japaneseTitle && (
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">
                  {anime.japaneseTitle}
                </p>
              )}
            </div>
            <TypeBadge type={anime.type} />
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={anime.rating} />
            {anime.releaseYear > 0 && (
              <span className="text-[10px] text-[var(--color-mute)]">
                {anime.releaseYear}{anime.endYear ? ` — ${anime.endYear}` : ""}
              </span>
            )}
            {anime.episodes && (
              <span className="text-[10px] text-[var(--color-mute)]">
                {anime.episodes} ep{anime.episodes !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {anime.platforms.map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: `${p.logoColor}18`,
                  color: p.available ? p.logoColor : "var(--color-mute)",
                  border: `1px solid ${p.logoColor}33`,
                  opacity: p.available ? 1 : 0.5,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.available ? p.logoColor : "var(--color-mute)" }} />
                {p.name}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {anime.languages.map((lang) => (
              <span key={lang} className="rounded bg-[var(--color-cyan)]/8 px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-cyan)]">
                {lang}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {anime.genres.map((g) => (
              <span key={g} className="rounded bg-[var(--color-amber)]/8 px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-amber)]">
                {g}
              </span>
            ))}
          </div>

          <div className="text-[10px] text-[var(--color-mute)]">
            Based on: <span className="text-[var(--color-ink)]">{anime.basedOn}</span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-cyan)] hover:text-[var(--color-cyan)]/80 transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-[var(--color-ink)]/80 leading-relaxed pb-1">
                  {anime.description}
                </p>
                {anime.platforms.some((p) => p.subtitle) && (
                  <div className="mt-2 space-y-1">
                    {anime.platforms
                      .filter((p) => p.subtitle)
                      .map((p) => (
                        <p key={p.name} className="text-[10px] text-[var(--color-mute)]">
                          <span className="font-semibold" style={{ color: p.logoColor }}>{p.name}</span>: {p.subtitle}
                        </p>
                      ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative mb-6">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl opacity-20"
        >
          <svg className="h-20 w-20 text-[var(--color-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-8 rounded-full bg-[var(--color-cyan)]/5 blur-2xl"
        />
      </div>
      <p className="text-sm font-semibold text-[var(--color-mute)]">No titles match your filters</p>
      <p className="text-xs text-[var(--color-mute)]/60 mt-1">Try adjusting your filters to find something</p>
    </motion.div>
  );
}

function LiveActionPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const availableCount = useMemo(() => getAvailableAnime().length, []);
  const upcomingCount = useMemo(() => getUpcomingAnime().length, []);
  const platformCount = useMemo(() => {
    const names = new Set(LIVE_ACTION_ANIME.flatMap((a) => a.platforms.map((p) => p.name)));
    return names.size;
  }, []);

  const filtered = useMemo(() => {
    let result = [...LIVE_ACTION_ANIME];

    switch (statusFilter) {
      case "available":
        result = result.filter((a) => a.status === "available");
        break;
      case "upcoming":
        result = result.filter((a) => a.status === "upcoming");
        break;
      case "series":
        result = result.filter((a) => a.type === "series");
        break;
      case "movie":
        result = result.filter((a) => a.type === "movie");
        break;
    }

    if (selectedPlatform) {
      result = result.filter((a) =>
        a.platforms.some((p) => p.name === selectedPlatform)
      );
    }

    if (selectedLanguages.length > 0) {
      result = result.filter((a) =>
        selectedLanguages.some((lang) => a.languages.includes(lang))
      );
    }

    return result;
  }, [statusFilter, selectedPlatform, selectedLanguages]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero Section */}
        <motion.div
          {...FADE_UP}
          className="mb-10 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-cyan)]/10 via-[var(--color-amber)]/5 to-[var(--color-cyan)]/10 blur-3xl opacity-40 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-amber)]" />
              <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-amber)] bg-clip-text text-transparent">
                Live-Action Anime
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[var(--color-mute)] ml-5 max-w-2xl">
              Every live-action adaptation — available now, coming soon, and where to watch
            </p>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: "Total Titles", value: LIVE_ACTION_ANIME.length, color: "var(--color-cyan)" },
            { label: "Available Now", value: availableCount, color: "#48BB78" },
            { label: "Coming Soon", value: upcomingCount, color: "#ED8936" },
            { label: "Platforms", value: platformCount, color: "var(--color-amber)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 text-center"
            >
              <p className="text-2xl font-black" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-5"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-line)]">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className="rounded-lg border px-4 py-2 text-xs font-bold transition-all shrink-0"
                  style={{
                    borderColor: active ? "var(--color-cyan)" : "var(--color-line)",
                    background: active ? "rgba(0,188,212,0.13)" : "transparent",
                    color: active ? "var(--color-cyan)" : "var(--color-mute)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Platform Filter */}
        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-1 rounded-full bg-[var(--color-amber)]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
              Platforms
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-line)]">
            <button
              onClick={() => setSelectedPlatform(null)}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0"
              style={{
                borderColor: !selectedPlatform ? "var(--color-amber)" : "var(--color-line)",
                background: !selectedPlatform ? "rgba(245,158,11,0.1)" : "transparent",
                color: !selectedPlatform ? "#f59e0b" : "var(--color-mute)",
              }}
            >
              All Platforms
            </button>
            {ALL_PLATFORMS.map((p) => {
              const active = selectedPlatform === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedPlatform(active ? null : p.name)}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0"
                  style={{
                    borderColor: active ? p.color : "var(--color-line)",
                    background: active ? `${p.color}22` : "transparent",
                    color: active ? p.color : "var(--color-mute)",
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Language Filter */}
        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
              Languages
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {ALL_LANGUAGES.map((lang) => {
              const active = selectedLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    borderColor: active ? "var(--color-cyan)" : "var(--color-line)",
                    background: active ? "rgba(0,188,212,0.13)" : "transparent",
                    color: active ? "var(--color-cyan)" : "var(--color-mute)",
                  }}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4"
        >
          <p className="text-xs text-[var(--color-mute)]">
            Showing <span className="font-bold text-[var(--color-ink)]">{filtered.length}</span> title{filtered.length !== 1 ? "s" : ""}
          </p>
        </motion.div>

        {/* Cards Grid */}
        {filtered.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState />
        )}
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
