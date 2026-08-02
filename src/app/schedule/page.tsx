"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getAiringSchedule, bestTitle } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";
import type { AiringScheduleEntry } from "@/lib/anilist";

const PROXY = "/api/proxy-image?url=";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function startOfWeek(offsetWeeks = 0) {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - day + offsetWeeks * 7);
  return start;
}

function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedule, setSchedule] = useState<AiringScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const weekStart = useMemo(() => startOfWeek(weekOffset), [weekOffset]);
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError(null);
    const from = Math.floor(weekStart.getTime() / 1000);
    const to = Math.floor(weekEnd.getTime() / 1000);
    getAiringSchedule(from, to)
      .then((data) => !cancelled && setSchedule(data))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [weekStart, weekEnd]);

  const byDay = useMemo(() => {
    const buckets: AiringScheduleEntry[][] = Array.from({ length: 7 }, () => []);
    schedule.forEach((item) => {
      const d = new Date(item.airingAt * 1000);
      buckets[d.getDay()].push(item);
    });
    buckets.forEach((b) => b.sort((a, b2) => a.airingAt - b2.airingAt));
    return buckets;
  }, [schedule]);

  const todayIdx = new Date().getDay();
  const isCurrentWeek = weekOffset === 0;

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!autoScroll || !scrollRef.current) return;
    const el = scrollRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    intervalRef.current = setInterval(() => {
      const current = el.scrollLeft;
      const step = el.clientWidth * 0.85;
      const next = current + step;
      if (next >= maxScroll) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: next, behavior: "smooth" });
      }
    }, 5000);
  }, [autoScroll]);

  useEffect(() => {
    startAutoScroll();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoScroll, byDay]);

  function scrollToDay(idx: number) {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.clientWidth * 0.85;
    el.scrollTo({ left: cardWidth * idx, behavior: "smooth" });
  }

  return (
    <PageTransition>
      <ErrorBoundary label="Schedule"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* ── HEADER ── */}
        <div className="neon-rgb-border rounded-2xl p-6 sm:p-8 mb-8 bg-[var(--color-panel)]/80 backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-cyan)] mb-1">Weekly Schedule</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                <span className="bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] bg-clip-text text-transparent">
                  Broadcast Board
                </span>
              </h1>
              <p className="mt-1.5 text-sm text-[var(--color-mute)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                {formatDate(weekStart)} — {formatDate(new Date(weekEnd.getTime() - 1))}
                <span className="hidden sm:inline text-[var(--color-mute)]/50">· local time</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setWeekOffset((w) => w - 1)}
                className="neon-rgb-border rounded-full px-4 py-2 text-xs font-semibold text-white/80 hover:text-white transition-all"
              >← Prev</button>
              <button onClick={() => { setWeekOffset(0); scrollToDay(todayIdx); }}
                disabled={isCurrentWeek}
                className="neon-rgb-border rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-30 transition-all"
              >Today</button>
              <button onClick={() => setWeekOffset((w) => w + 1)}
                className="neon-rgb-border rounded-full px-4 py-2 text-xs font-semibold text-white/80 hover:text-white transition-all"
              >Next →</button>
              <button onClick={() => setAutoScroll((a) => !a)}
                className={`neon-rgb-border rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  autoScroll ? "text-[var(--color-magenta)]" : "text-[var(--color-mute)]"
                }`}
              >{autoScroll ? "◎ Auto" : "◉ Manual"}</button>
            </div>
          </div>
        </div>

        {/* ── DAY PILLS ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {DAY_LABELS.map((label, idx) => {
            const isToday = isCurrentWeek && idx === todayIdx;
            return (
              <button key={label} onClick={() => scrollToDay(idx)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all backdrop-blur-sm ${
                  isToday
                    ? "neon-rgb-border bg-[var(--color-magenta)]/10 text-white shadow-lg"
                    : "border border-white/5 bg-black/20 text-[var(--color-mute)] hover:text-white hover:border-white/15"
                }`}
              >
                <span className="flex items-center gap-2">
                  {isToday && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)] animate-pulse" />}
                  {label.slice(0, 3)}
                  <span className="text-[10px] opacity-60">{formatDate(new Date(weekStart.getTime() + idx * 86400000))}</span>
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <Loader label="Loading schedule..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <>
            {/* ── DAY CARDS (horizontal scroll) ── */}
            <div ref={scrollRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-none"
              onMouseEnter={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
              onMouseLeave={() => { startAutoScroll(); }}
            >
              {DAY_LABELS.map((label, idx) => {
                const items = byDay[idx];
                const isToday = isCurrentWeek && idx === todayIdx;

                return (
                  <motion.div
                    key={`${weekOffset}-${label}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="snap-center shrink-0 w-[85vw] max-w-sm"
                  >
                    <div className={`rounded-2xl h-full flex flex-col overflow-hidden ${
                      isToday ? "neon-rgb-border" : "border border-white/5"
                    } bg-[var(--color-panel)]/60 backdrop-blur-sm`}>
                      {/* Day header */}
                      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
                        <div>
                          <h3 className="font-display text-lg font-bold flex items-center gap-2">
                            {label}
                            {isToday && (
                              <span className="rounded-full bg-[var(--color-magenta)] px-2 py-0.5 text-[9px] font-bold text-black tracking-wider">
                                TODAY
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-[var(--color-mute)] font-mono mt-0.5">
                            {formatDate(new Date(weekStart.getTime() + idx * 86400000))}
                          </p>
                        </div>
                        <div className="neon-rgb-border rounded-full px-3 py-1">
                          <span className="text-xs font-mono font-bold text-white">
                            {items.length}
                          </span>
                        </div>
                      </div>

                      {/* Episode list */}
                      <div className="flex-1 space-y-2.5 p-4 overflow-y-auto max-h-[55vh] sm:max-h-[460px] custom-scroll">
                        {items.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-white/5 p-4 mb-3">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]/40">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                            </div>
                            <p className="text-sm text-[var(--color-mute)]/50 font-medium">Nothing scheduled</p>
                            <p className="text-[10px] text-[var(--color-mute)]/30 mt-1">No airings for this day</p>
                          </div>
                        )}
                        <AnimatePresence>
                          {items.map((item, i) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                            >
                              <Link href={`/anime/${item.media.id}`}
                                className="neon-rgb-border rounded-xl overflow-hidden group block hover:scale-[1.02] transition-transform"
                              >
                                <div className="m-[1px] rounded-[11px] bg-[var(--color-void)]/80 backdrop-blur-sm p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="relative shrink-0 h-16 w-11 rounded-lg overflow-hidden border border-white/5">
                                      <Image src={`${PROXY}${encodeURIComponent(item.media.coverImage?.large || "")}`} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" unoptimized />
                                      <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cyan)] text-[9px] font-bold text-black shadow-lg shadow-[var(--color-cyan)]/30">
                                        {item.episode}
                                      </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-bold leading-tight truncate group-hover:text-[var(--color-cyan)] transition-colors">
                                        {bestTitle(item.media.title)}
                                      </p>
                                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[var(--color-mute)] font-mono">
                                        <span className="flex items-center gap-1.5 bg-[var(--color-cyan)]/10 px-2 py-0.5 rounded-full">
                                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                                          {formatTime(item.airingAt)}
                                        </span>
                                        {item.media.format && (
                                          <span className="uppercase tracking-wider text-[10px] border border-white/10 px-1.5 py-0.5 rounded-full">
                                            {item.media.format}
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-1.5 flex gap-1 flex-wrap">
                                        {item.media.genres?.slice(0, 2).map((g) => (
                                          <span key={g} className="text-[9px] text-[var(--color-mute)]/50 bg-white/5 px-1.5 py-0.5 rounded-full">
                                            {g}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── FOOTER ── */}
            <div className="mt-6 flex items-center justify-between text-xs text-[var(--color-mute)]/40">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)]" />
                Hover or touch to pause auto-scroll
              </span>
              <span className="neon-rgb-border rounded-full px-3 py-1">
                <span className="text-xs font-mono">{schedule.length} airings</span>
              </span>
            </div>
          </>
        )}
      </div></ErrorBoundary>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
