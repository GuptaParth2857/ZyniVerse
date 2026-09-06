"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

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

interface TopAnime {
  mediaId: number;
  title: string;
  episodeCount: number;
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

export default function WatchHistoryTimeline() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/stats/timeline");
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
      <div className="mt-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <div className="h-8 w-20 rounded bg-[var(--color-line)]" />
              <div className="h-3 w-16 mt-2 rounded bg-[var(--color-line)]" />
            </div>
          ))}
        </div>
        <div className="space-y-4 ml-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-4 rounded-full bg-[var(--color-line)]" />
              <div className="flex-1 h-16 rounded-xl bg-[var(--color-line)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
        <p className="text-[var(--color-magenta)] text-sm">{error}</p>
        <button onClick={fetchData} className="mt-3 text-xs text-[var(--color-cyan)] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.months.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
        <p className="text-[var(--color-mute)] text-sm">
          No watch history yet.{" "}
          <Link href="/search" className="text-[var(--color-cyan)] hover:underline">
            Browse anime
          </Link>{" "}
          to start tracking your journey.
        </p>
      </div>
    );
  }

  const maxEpisodes = Math.max(...data.months.map((m) => m.episodes), 1);

  const stats = [
    { label: "Total Anime", value: data.overall.totalAnime, color: "var(--color-cyan)", icon: "\u{1F4FA}" },
    { label: "Episodes", value: data.overall.totalEpisodes, color: "var(--color-magenta)", icon: "\u{1F3AC}" },
    { label: "Hours", value: data.overall.totalHours, color: "var(--color-violet)", icon: "\u23F1\uFE0F" },
    { label: "Streak", value: data.overall.currentStreak, color: "#facc15", icon: "\u{1F525}" },
  ];

  return (
    <div className="mt-6 space-y-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 flex items-center gap-3"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
            >
              <span className="text-lg">{stat.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold font-mono" style={{ color: stat.color }}>
                {stat.label === "Hours" ? (
                  <AnimatedCounter target={stat.value} duration={1.4} />
                ) : (
                  <AnimatedCounter target={stat.value} />
                )}
                {stat.label === "Hours" && <span className="text-xs font-normal ml-0.5">h</span>}
                {stat.label === "Streak" && <span className="text-xs font-normal ml-0.5">d</span>}
              </div>
              <div className="text-xs text-[var(--color-mute)] truncate">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {data.overall.mostActiveMonth && (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 flex items-center gap-3">
          <span className="text-lg">{"\u{1F3C6}"}</span>
          <div>
            <span className="text-sm font-bold">
              {data.overall.mostActiveMonth.month} {data.overall.mostActiveMonth.year}
            </span>
            <span className="text-xs text-[var(--color-mute)] ml-2">
              Most active — {data.overall.mostActiveMonth.episodes} episodes
            </span>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display text-sm font-bold mb-4">Timeline</h3>
        <div className="relative ml-3">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-violet)]" />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
            className="space-y-3"
          >
            {data.months.map((m) => {
              const key = `${m.year}-${m.monthNum}`;
              const isExpanded = !!expanded[key];
              const dotColor = SEASON_COLORS[m.season] || "#00e5ff";
              const dotBg = SEASON_BG[m.season] || "rgba(0,229,255,0.12)";

              return (
                <motion.div
                  key={key}
                  variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="relative pl-8"
                >
                  <div
                    className="absolute left-[-7px] top-4 h-[14px] w-[14px] rounded-full border-2 border-[var(--color-void)] z-10"
                    style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}60` }}
                  />

                  <div
                    className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden cursor-pointer hover:border-[var(--color-cyan)]/40 transition-all"
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
                            {m.month} {m.year}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[var(--color-mute)]">
                              {m.episodes} ep{m.episodes !== 1 ? "s" : ""} · {m.animeCount} anime
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-[var(--color-mute)]">
                          {m.totalHours}h
                        </span>
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
                          <div className="px-4 pb-4 space-y-1.5 border-t border-[var(--color-line)] pt-3">
                            {m.topAnime.map((anime) => (
                              <Link
                                key={anime.mediaId}
                                href={`/anime/${anime.mediaId}`}
                                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-xs text-[var(--color-ink)] truncate">{anime.title}</span>
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
              );
            })}
          </motion.div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold mb-4">Episodes per Month</h3>
        <div className="space-y-2">
          {data.months.map((m) => {
            const key = `bar-${m.year}-${m.monthNum}`;
            const pct = (m.episodes / maxEpisodes) * 100;
            const color = SEASON_COLORS[m.season] || "#00e5ff";

            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-20 text-[10px] font-mono text-[var(--color-mute)] text-right shrink-0 truncate">
                  {m.month.slice(0, 3)} {m.year}
                </span>
                <div className="flex-1 h-5 rounded-md bg-[var(--color-line)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="h-full rounded-md"
                    style={{
                      background: `linear-gradient(to right, ${color}, ${color}99)`,
                      boxShadow: `0 0 6px ${color}40`,
                    }}
                  />
                </div>
                <span className="w-8 text-[10px] font-mono text-[var(--color-mute)] text-right shrink-0">
                  {m.episodes}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
