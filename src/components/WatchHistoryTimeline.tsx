"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;

const SEASON_COLORS: Record<string, string> = {
  winter: "#00e5ff",
  spring: "#ff69b4",
  summer: "#ffb300",
  fall: "#9b59b6",
};

const SEASON_BG: Record<string, string> = {
  winter: "rgba(0,229,255,0.12)",
  spring: "rgba(255,105,180,0.12)",
  summer: "rgba(255,179,0,0.12)",
  fall: "rgba(155,89,182,0.12)",
};

const SEASON_LEGEND = [
  { key: "winter", label: "Winter", icon: "❄️" },
  { key: "spring", label: "Spring", icon: "🌸" },
  { key: "summer", label: "Summer", icon: "☀️" },
  { key: "fall", label: "Fall", icon: "🍂" },
];

interface TopAnime {
  mediaId: number;
  title: string;
  episodeCount: number;
  coverImage: string | null;
}

interface MonthData {
  month: string;
  monthNum: number;
  year: number;
  season: string;
  episodes: number;
  animeCount: number;
  topAnime: TopAnime[];
  totalHours: number;
}

interface Overall {
  totalAnime: number;
  totalEpisodes: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveMonth: { month: string; year: number; episodes: number } | null;
}

interface TimelineData {
  months: MonthData[];
  overall: Overall;
}

function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setValue(target);
        return;
      }
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setValue(Math.round(eased * target));
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span>{value.toLocaleString()}</span>;
}

function SeasonLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, ...SPRING }}
      className="flex flex-wrap items-center gap-1.5"
    >
      {SEASON_LEGEND.map((s) => (
        <span
          key={s.key}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-black/30 px-2.5 py-1 text-[10px] font-medium"
          style={{ color: SEASON_COLORS[s.key] }}
        >
          <span>{s.icon}</span>
          {s.label}
        </span>
      ))}
    </motion.div>
  );
}

export default function WatchHistoryTimeline() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/stats/timeline");
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to load timeline");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <div className="h-8 w-20 rounded bg-white/[0.05]" />
              <div className="h-3 w-16 mt-2 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
        <div className="space-y-4 ml-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-4 rounded-full bg-white/[0.06]" />
              <div className="flex-1 h-16 animate-pulse rounded-xl bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (authRequired || error) {
    return (
      <div className="neon-rgb-ring relative mt-6 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
        <div
          className="absolute inset-0 opacity-[0.2] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--color-magenta)]/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--color-cyan)]/20 blur-[100px]" />

        <div className="relative z-10 p-10 sm:p-12 text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
            className="mb-4 block text-5xl"
          >
            {authRequired ? "🎬" : "⚠️"}
          </motion.span>
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...SPRING }}
            className="font-display text-2xl font-bold"
          >
            {authRequired ? "Your Anime Journey Awaits" : "Couldn&apos;t load your timeline"}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, ...SPRING }}
            className="mx-auto mt-2 max-w-md text-sm text-[var(--color-mute)]"
          >
            {authRequired
              ? "Sign in to unlock your watch history timeline — every episode, month, and milestone, beautifully visualized."
              : "Something went wrong while fetching your watch history. Please try again."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, ...SPRING }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            {authRequired ? (
              <>
                <Link
                  href="/login"
                  className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  Sign In
                </Link>
                <Link
                  href="/search"
                  className="rounded-xl border border-white/10 bg-black/30 px-6 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-[var(--color-cyan)]/40 hover:text-white"
                >
                  Browse Anime
                </Link>
              </>
            ) : (
              <button
                onClick={fetchData}
                className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                Try Again
              </button>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  if (!data || data.months.length === 0) {
    return (
      <div className="neon-rgb-ring relative mt-6 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
        <div className="relative z-10 p-12 text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mb-3 block text-4xl"
          >
            🎬
          </motion.span>
          <h3 className="font-display text-xl font-bold">No watch history yet</h3>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            Start tracking episodes and your journey timeline will light up here.
          </p>
          <Link
            href="/search"
            className="mt-5 inline-block rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.03]"
          >
            Browse Anime
          </Link>
        </div>
      </div>
    );
  }

  const maxEpisodes = Math.max(...data.months.map((m) => m.episodes), 1);

  const statsCards: { label: string; value?: number; text?: string; sub?: string; suffix?: string; color: string; icon: string }[] = [
    { label: "Total Anime", value: data.overall.totalAnime, color: "#00e5ff", icon: "📺" },
    { label: "Episodes", value: data.overall.totalEpisodes, color: "#ff2d78", icon: "🎬" },
    { label: "Hours", value: data.overall.totalHours, suffix: "h", color: "#a78bfa", icon: "⏱️" },
    { label: "Current Streak", value: data.overall.currentStreak, suffix: "d", color: "#facc15", icon: "🔥" },
    { label: "Longest Streak", value: data.overall.longestStreak, suffix: "d", color: "#f59e0b", icon: "🏅" },
    data.overall.mostActiveMonth
      ? {
          label: "Most Active",
          text: `${data.overall.mostActiveMonth.month} ${data.overall.mostActiveMonth.year}`,
          sub: `${data.overall.mostActiveMonth.episodes} episodes`,
          color: "#22d3ee",
          icon: "🏆",
        }
      : { label: "Most Active", value: 0, color: "#22d3ee", icon: "🏆" },
  ];

  return (
    <div className="mt-6 space-y-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {statsCards.map((stat) => (
          <motion.div
            key={stat.label}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 transition-colors hover:border-white/15"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
              >
                <span className="text-lg">{stat.icon}</span>
              </div>
              <div className="min-w-0">
                {stat.value !== undefined ? (
                  <div className="text-xl font-bold font-mono tabular-nums" style={{ color: stat.color }}>
                    <AnimatedCounter target={stat.value} />
                    {stat.suffix && <span className="text-xs font-normal ml-0.5">{stat.suffix}</span>}
                  </div>
                ) : (
                  <div className="text-sm font-bold font-mono text-white leading-tight">{stat.text}</div>
                )}
                <div className="text-[10px] text-[var(--color-mute)] truncate">{stat.label}</div>
                {stat.sub && <div className="text-[10px] text-[var(--color-mute)]/70">{stat.sub}</div>}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-sm font-bold">Timeline</h3>
        <SeasonLegend />
      </div>

      <div>
        <div className="relative ml-3">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#00e5ff] via-[#ff2d78] to-[#a78bfa]" />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
            className="space-y-3"
          >
            {data.months.map((m, i) => {
              const key = `${m.year}-${m.monthNum}`;
              const isExpanded = !!expanded[key];
              const dotColor = SEASON_COLORS[m.season] || "#00e5ff";
              const dotBg = SEASON_BG[m.season] || "rgba(0,229,255,0.12)";
              const isNewYear = i === 0 || m.year !== data.months[i - 1].year;

              return (
                <div key={key}>
                  {isNewYear && (
                    <motion.div
                      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                      className="relative flex items-center gap-3 py-2"
                    >
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--color-magenta)]/50" />
                      <span className="font-display text-xs font-bold tracking-[0.3em] text-[var(--color-magenta)]">
                        {m.year}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--color-cyan)]/50" />
                    </motion.div>
                  )}

                  <motion.div
                    variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="relative pl-8"
                  >
                    <div
                      className="absolute left-[-7px] top-5 h-[14px] w-[14px] rounded-full border-2 border-[var(--color-void)] z-10"
                      style={{ backgroundColor: dotColor, boxShadow: `0 0 10px ${dotColor}70` }}
                    />

                    <div
                      className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] cursor-pointer transition-all hover:border-white/15 hover:shadow-[0_0_20px_rgba(0,0,0,0.25)]"
                      style={{ borderLeft: `2px solid ${dotColor}55` }}
                      onClick={() => toggleExpand(key)}
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase shrink-0"
                            style={{ backgroundColor: dotBg, color: dotColor }}
                          >
                            {m.season}
                          </div>
                          <div className="min-w-0">
                            <span className="font-display text-sm font-bold">
                              {m.month} <span className="text-white/40">{m.year}</span>
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[var(--color-mute)]">
                                {m.episodes} ep{m.episodes !== 1 ? "s" : ""} · {m.animeCount} anime · {m.totalHours}h
                              </span>
                            </div>
                            <div className="mt-2 flex h-1 w-40 max-w-full gap-1">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.max(8, (m.episodes / maxEpisodes) * 100)}%`,
                                  background: `linear-gradient(to right, ${dotColor}, ${dotColor}55)`,
                                  boxShadow: `0 0 6px ${dotColor}50`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:inline text-xs font-mono text-[var(--color-mute)]">{m.totalHours}h</span>
                          <motion.svg
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-4 w-4 text-[var(--color-mute)]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </motion.svg>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 space-y-1 border-t border-[var(--color-line)] pt-3">
                              {m.topAnime.length === 0 && (
                                <p className="px-3 py-2 text-xs text-[var(--color-mute)]">No anime recorded this month.</p>
                              )}
                              {m.topAnime.map((anime, rank) => (
                                <Link
                                  key={anime.mediaId}
                                  href={`/anime/${anime.mediaId}`}
                                  className="group/row flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {anime.coverImage ? (
                                    <div className="h-10 w-7 shrink-0 overflow-hidden rounded border border-white/10">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={anime.coverImage} alt={anime.title} className="h-full w-full object-cover" loading="lazy" />
                                    </div>
                                  ) : (
                                    <div
                                      className="flex h-10 w-7 shrink-0 items-center justify-center rounded text-[9px] font-black"
                                      style={{ backgroundColor: dotBg, color: dotColor }}
                                    >
                                      #{rank + 1}
                                    </div>
                                  )}
                                  <span
                                    className="w-4 text-[9px] font-black font-mono shrink-0"
                                    style={{ color: dotColor, opacity: anime.coverImage ? 0.9 : 0 }}
                                  >
                                    {rank + 1}
                                  </span>
                                  <span className="flex-1 truncate text-xs text-[var(--color-ink)] group-hover/row:text-white transition-colors">
                                    {anime.title}
                                  </span>
                                  <span className="text-[10px] font-mono text-[var(--color-mute)] shrink-0 ml-2">
                                    {anime.episodeCount} ep{anime.episodeCount !== 1 ? "s" : ""}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold">Episodes per Month</h3>
          <span className="text-[10px] font-mono text-[var(--color-mute)]">
            {data.months.length} month{data.months.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="space-y-2">
          {data.months.map((m) => {
            const key = `bar-${m.year}-${m.monthNum}`;
            const pct = (m.episodes / maxEpisodes) * 100;
            const color = SEASON_COLORS[m.season] || "#00e5ff";

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, ease: EASE }}
                className="group flex items-center gap-3"
              >
                <span className="w-20 text-[10px] font-mono text-[var(--color-mute)] text-right shrink-0 truncate">
                  {m.month.slice(0, 3)} {m.year}
                </span>
                <div className="relative flex-1">
                  <div className="flex h-5 items-center rounded-md bg-[var(--color-line)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
                      className="h-full rounded-md transition-opacity group-hover:opacity-80"
                      style={{
                        background: `linear-gradient(to right, ${color}, ${color}88)`,
                        boxShadow: `0 0 8px ${color}50`,
                      }}
                    />
                  </div>
                  <div className="pointer-events-none absolute -top-7 right-0 flex items-center gap-1 rounded-md border border-white/10 bg-black/80 px-2 py-0.5 text-[9px] font-mono text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
                    <span style={{ color }}>{m.episodes} ep</span>
                    <span className="text-white/40">· {Math.round(pct)}% peak</span>
                  </div>
                </div>
                <span className="w-8 text-[10px] font-mono text-[var(--color-mute)] text-right shrink-0">
                  {m.episodes}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}