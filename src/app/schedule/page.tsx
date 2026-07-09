"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getAiringSchedule, bestTitle } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import type { AiringScheduleEntry } from "@/lib/anilist";

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

  // Auto-scroll effect
  useEffect(() => {
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

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoScroll, byDay]);

  function scrollToDay(idx: number) {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.clientWidth * 0.85;
    el.scrollTo({ left: cardWidth * idx, behavior: "smooth" });
  }

  return (
    <PageTransition>
      <ErrorBoundary label="Schedule"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
              // Weekly Schedule
            </p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Broadcast Board</h1>
            <p className="mt-1 text-sm text-[var(--color-mute)]">
              {formatDate(weekStart)} — {formatDate(new Date(weekEnd.getTime() - 1))}
              <span className="hidden sm:inline"> · local time</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((w) => w - 1)}
              className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm hover:border-[var(--color-cyan)] transition-colors"
            >← Prev</button>
            <button onClick={() => { setWeekOffset(0); scrollToDay(todayIdx); }}
              disabled={isCurrentWeek}
              className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm disabled:opacity-40 hover:border-[var(--color-cyan)] transition-colors"
            >Today</button>
            <button onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm hover:border-[var(--color-cyan)] transition-colors"
            >Next →</button>
            <button onClick={() => setAutoScroll((a) => !a)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                autoScroll ? "border-[var(--color-magenta)] text-[var(--color-magenta)]" : "border-[var(--color-line)] text-[var(--color-mute)]"
              }`}
            >{autoScroll ? "◎ Auto" : "◉ Manual"}</button>
          </div>
        </div>

        {/* Day indicator pills */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {DAY_LABELS.map((label, idx) => (
            <button key={label} onClick={() => scrollToDay(idx)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isCurrentWeek && idx === todayIdx
                  ? "bg-[var(--color-magenta)] text-black"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]"
              }`}
            >{label.slice(0, 3)} {formatDate(new Date(weekStart.getTime() + idx * 86400000))}</button>
          ))}
        </div>

        {loading ? (
          <Loader label="Loading schedule..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <>
            {/* Horizontal scroll area */}
            <div ref={scrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-none"
              onMouseEnter={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
              onMouseLeave={() => { if (autoScroll) { intervalRef.current = setInterval(() => { /* re-triggered by effect */ }, 5000); } }}
            >
              {DAY_LABELS.map((label, idx) => {
                const items = byDay[idx];
                const isToday = isCurrentWeek && idx === todayIdx;

                return (
                  <motion.div
                    key={`${weekOffset}-${label}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="snap-center shrink-0 w-[85vw] max-w-sm"
                  >
                    <div className={`rounded-2xl border h-full flex flex-col ${
                      isToday
                        ? "border-[var(--color-magenta)]/50 bg-gradient-to-b from-[var(--color-magenta)]/5 to-transparent"
                        : "border-[var(--color-line)] bg-[var(--color-panel)]/50"
                    } backdrop-blur-sm`}>
                      {/* Day header */}
                      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--color-line)]/50">
                        <div>
                          <h3 className="font-display text-base font-bold">{label}</h3>
                          <p className="text-[10px] text-[var(--color-mute)] font-mono">
                            {formatDate(new Date(weekStart.getTime() + idx * 86400000))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="rounded-full bg-[var(--color-magenta)] px-2 py-0.5 text-[10px] sm:text-[9px] font-bold text-black">
                              TODAY
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-[var(--color-mute)] bg-[var(--color-void)]/50 px-2 py-0.5 rounded-full">
                            {items.length}
                          </span>
                        </div>
                      </div>

                      {/* Episode list */}
                      <div className="flex-1 space-y-2 p-3 overflow-y-auto max-h-[50vh] sm:max-h-[420px] custom-scroll">
                        {items.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]/30 mb-2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <p className="text-xs text-[var(--color-mute)]/50">Nothing scheduled</p>
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
                                className="group flex items-center gap-3 rounded-xl border border-[var(--color-line)]/50 bg-black/20 p-2.5 hover:border-[var(--color-cyan)]/40 hover:bg-[var(--color-cyan)]/5 transition-all"
                              >
                                <div className="relative shrink-0 h-14 w-10 rounded-lg overflow-hidden">
                                  <Image src={item.media.coverImage?.large || ""} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                                  <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cyan)] text-[10px] sm:text-[9px] font-bold text-black shadow-lg">
                                    {item.episode}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold leading-tight truncate group-hover:text-[var(--color-cyan)] transition-colors">
                                    {bestTitle(item.media.title)}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)] font-mono">
                                    <span className="flex items-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                                      {formatTime(item.airingAt)}
                                    </span>
                                    {item.media.format && (
                                      <span className="uppercase tracking-wider text-[10px] sm:text-[9px] border border-[var(--color-line)] px-1.5 py-0.5 rounded">
                                        {item.media.format}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex gap-1 flex-wrap">
                                    {item.media.genres?.slice(0, 2).map((g) => (
                                      <span key={g} className="text-[10px] sm:text-[8px] text-[var(--color-mute)]/60 bg-[var(--color-void)]/50 px-1.5 py-0.5 rounded-full">
                                        {g}
                                      </span>
                                    ))}
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

            {/* Bottom info */}
            <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-mute)]/50">
              <span>Hover or touch to pause auto-scroll</span>
              <span>{schedule.length} airings this week</span>
            </div>
          </>
        )}
      </div></ErrorBoundary>
    </PageTransition>
  );
}
