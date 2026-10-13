"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { bestTitle } from "@/lib/anilist";
import { ErrorState } from "@/components/Loader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";
import { LIST_STATUS_LABELS, useWatchlist, type WatchlistItem } from "@/components/WatchlistProvider";
import type { AiringScheduleEntry } from "@/lib/anilist";
import { DAY_MS, formatISTTime, formatIstDate, istDayIndex, startOfWeekIST, toIstWallMs } from "@/lib/ist";

/** Build a `WatchlistItem` from an airing-schedule media node. */
function toWatchlistItem(media: AiringScheduleEntry["media"]): WatchlistItem {
  return {
    id: media.id,
    title: media.title,
    coverImage: media.coverImage,
    genres: media.genres,
    type: "ANIME",
    format: media.format,
    episodes: media.episodes,
  };
}

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Format chips mirror exactly what the AniList feed actually carries (no fake
// options); chips that have zero airings this week simply don't render.
const FORMAT_OPTIONS = ["TV", "MOVIE", "ONA", "OVA", "SPECIAL"];

// The feed carries no runtime, so "on air" is a presentation window — an episode
// keeps its LIVE pulse for an hour after its scheduled IST start.
const LIVE_WINDOW_S = 60 * 60;
// Relative "in 2h 15m" labels only help for the near future; further out we just
// show the IST clock time so the rows stay calm.
const SOON_WINDOW_S = 6 * 60 * 60;

const pad2 = (n: number) => String(n).padStart(2, "0");

function countdownParts(targetSec: number, nowMs: number) {
  const diff = Math.max(0, targetSec - Math.floor(nowMs / 1000));
  return {
    d: Math.floor(diff / 86400),
    h: Math.floor((diff % 86400) / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
    total: diff,
  };
}

function countdownLabel(targetSec: number, nowMs: number, coarse = false) {
  const { d, h, m, s, total } = countdownParts(targetSec, nowMs);
  if (total <= 0) return "airing now";
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${pad2(m)}m`;
  if (m > 0) return coarse ? `${m}m` : `${m}m ${pad2(s)}s`;
  return coarse ? "<1m" : `${s}s`;
}

function isLive(airingAt: number, nowSec: number) {
  const since = nowSec - airingAt;
  return since >= 0 && since < LIVE_WINDOW_S;
}

// "9:41:07 PM" in IST for the live wall clock.
function clockIST(nowMs: number) {
  const d = new Date(toIstWallMs(nowMs));
  let h = d.getUTCHours();
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} ${suffix}`;
}

function platformFrom(links?: { url: string; site?: string }[]): string | null {
  const sites = (links ?? []).map((l) => `${l.site ?? ""} ${l.url}`.toLowerCase());
  const map: [string[], string][] = [
    [["crunchyroll"], "Crunchyroll"],
    [["netflix"], "Netflix"],
    [["amazon"], "Prime Video"],
    [["disney", "hotstar"], "JioHotstar"],
    [["muse"], "Muse Asia"],
    [["ani-one", "anione"], "Ani-One"],
    [["hulu"], "Hulu"],
  ];
  for (const [keys, name] of map) {
    if (sites.some((s) => keys.some((k) => s.includes(k)))) return name;
  }
  return null;
}

// Ticking clock. Isolated from the board so a 1s cadence only ever re-renders the
// tiny components that actually need it, never the full episode list.
function useNow(intervalMs: number) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function LiveClock({ className = "" }: { className?: string }) {
  const now = useNow(1000);
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-cyan)]" />
      </span>
      <span className="font-mono tabular-nums">{now ? `${clockIST(now)} IST` : "--:--:-- IST"}</span>
    </span>
  );
}

function Countdown({ targetSec, size = "lg" }: { targetSec: number; size?: "sm" | "lg" }) {
  const now = useNow(1000);
  const big = size === "lg";
  const { d, h, m, s } = countdownParts(targetSec, now);

  if (!now) {
    return <div className={`rounded-xl bg-white/5 ${big ? "h-16 w-52" : "h-10 w-32"}`} />;
  }

  const cells = [
    ...(d > 0 ? [{ v: d, l: "DAY" }] : []),
    { v: h, l: "HR" },
    { v: m, l: "MIN" },
    { v: s, l: "SEC" },
  ];

  return (
    <div className="flex items-stretch gap-1.5 sm:gap-2">
      {cells.map((c) => (
        <div
          key={c.l}
          className={`flex flex-col items-center rounded-xl border border-[var(--color-cyan)]/20 bg-black/40 shadow-[inset_0_0_18px_-10px_var(--color-cyan)] ${
            big ? "min-w-[3.25rem] px-2 py-1.5" : "min-w-[2.4rem] px-1.5 py-1"
          }`}
        >
          <span className={`font-mono font-bold tabular-nums text-white ${big ? "text-2xl sm:text-3xl" : "text-base"}`}>
            {pad2(c.v)}
          </span>
          <span className={`mt-0.5 font-semibold tracking-[0.18em] text-[var(--color-mute)] ${big ? "text-[9px]" : "text-[8px]"}`}>
            {c.l}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-3xl border border-white/5 bg-[var(--color-panel)]/60 p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="h-40 w-28 rounded-2xl bg-white/5 sm:h-48 sm:w-32" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 rounded-full bg-white/10" />
            <div className="h-7 w-3/4 rounded-lg bg-white/10" />
            <div className="h-4 w-1/2 rounded-full bg-white/5" />
          </div>
          <div className="h-20 w-48 rounded-2xl bg-white/5" />
        </div>
      </div>
      <div className="flex gap-5 overflow-hidden">
        {[0, 1, 2].map((c) => (
          <div key={c} className="w-[85vw] max-w-sm shrink-0 rounded-2xl border border-white/5 bg-[var(--color-panel)]/60 p-4">
            <div className="mb-4 h-6 w-32 rounded-lg bg-white/10" />
            <div className="space-y-3">
              {[0, 1, 2, 3].map((r) => (
                <div key={r} className="h-[72px] rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ScheduleBoardProps {
  /** Week-0 data rendered on the server and streamed with the page HTML. */
  initialSchedule: AiringScheduleEntry[];
  /** IST week-start the server rendered, so hydration draws the same board. */
  initialWeekStartMs: number;
  /** Non-null when the server-side fetch failed (AniList hiccup). */
  initialError: string | null;
}

export default function ScheduleBoard({ initialSchedule, initialWeekStartMs, initialError }: ScheduleBoardProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedule, setSchedule] = useState<AiringScheduleEntry[]>(initialSchedule);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useReducedMotion();

  const router = useRouter();
  const { isSaved, getStatus, toggle } = useWatchlist();

  // Filters. `formatFilter` lives up here (not next to its useMemo) so
  // `goToWeek` below can clear it when the week changes.
  const [formatFilter, setFormatFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyMyList, setOnlyMyList] = useState(false);

  // Airing alerts for the signed-in user, keyed `mediaId:episode`. Fetched once
  // for the whole board so rows don't each hit `/api/alerts`.
  const [alerts, setAlerts] = useState<Set<string>>(() => new Set());
  const [alertsReady, setAlertsReady] = useState(false);
  const [alertsSignedIn, setAlertsSignedIn] = useState<boolean | null>(null);

  // Board-level clock: live badges, "today" highlight and relative labels only
  // need a coarse cadence. Per-second ticking lives inside LiveClock/Countdown.
  const now = useNow(30_000);
  const nowSec = Math.floor(now / 1000);

  // Anchor "this week" to the server-rendered value for a hydration-stable
  // first paint; week navigation computes fresh windows from the client clock.
  const [weekStartMs, setWeekStartMs] = useState(initialWeekStartMs);
  const weekEndMs = useMemo(() => weekStartMs + 7 * DAY_MS, [weekStartMs]);

  // Tracks which window `schedule` currently holds (SSR week 0 is "committed"
  // at initialWeekStartMs). The fetch effect only runs when the requested
  // window differs, so the first paint and revisits skip the client round-trip.
  //
  // Exception: if the server render came back EMPTY with no error (AniList
  // rate-limited during revalidation), do NOT treat the window as committed —
  // otherwise the effect below skips its fetch and the board stays blank for
  // the whole ISR window. The sentinel forces one client round-trip.
  const committedWindowRef = useRef<number>(
    initialSchedule.length === 0 && !initialError ? -1 : initialWeekStartMs,
  );
  const [retryNonce, setRetryNonce] = useState(0);

  const goToWeek = useCallback((offset: number) => {
    setWeekOffset(offset);
    setWeekStartMs(startOfWeekIST(offset));
    // A format chip that was valid last week may not exist this week, which
    // would leave the board empty with no highlighted chip. Clear it.
    setFormatFilter(null);
  }, []);

  const prefetchNeighbours = useCallback((startMs: number, endMs: number) => {
    // Warm adjacent week windows in the background so day-pill and arrow
    // navigation feels instant instead of waiting for its own cold server
    // fetch. The server's fetch cache dedupes repeat warming.
    void fetch(
      `/api/anilist/airing-schedule?from=${Math.floor((startMs - 7 * DAY_MS) / 1000)}&to=${Math.floor(startMs / 1000)}`,
    ).catch(() => {});
    void fetch(
      `/api/anilist/airing-schedule?from=${Math.floor(endMs / 1000)}&to=${Math.floor((endMs + 7 * DAY_MS) / 1000)}`,
    ).catch(() => {});
  }, []);

  // The initial week's data already arrived in the SSR payload, so there is no
  // client round-trip (and no skeleton flash) on first paint. Fetch only when
  // the window changes (arrow navigation) or the last render left an error —
  // which also gives a failed server-side render one automatic retry.
  useEffect(() => {
    if (weekStartMs === committedWindowRef.current && !error) {
      prefetchNeighbours(weekStartMs, weekEndMs);
      return;
    }
    let cancelled = false;
    setLoading(true); setError(null);
    const from = Math.floor(weekStartMs / 1000);
    const to = Math.floor(weekEndMs / 1000);
    fetch(`/api/anilist/airing-schedule?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? (data as AiringScheduleEntry[]) : [];
        setSchedule(items);
        setError(null);
        committedWindowRef.current = weekStartMs;
        prefetchNeighbours(weekStartMs, weekEndMs);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // `error` is deliberately not a dependency: a failed fetch sets it and we
    // must NOT auto-refetch (that would loop on an outage); retry is manual via
    // `retryNonce`, and the skipped-window check reads the closure's error.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartMs, weekEndMs, retryNonce, prefetchNeighbours]);

  // If the IST week rolls over while the tab is open (Sunday 00:00 IST), the
  // server-rendered "current week" window goes stale. Re-anchor to the client
  // clock so a long-lived tab never shows last week's board for a whole week.
  useEffect(() => {
    if (weekOffset !== 0) return;
    const check = () => {
      const freshWeek = startOfWeekIST(0);
      if (freshWeek !== weekStartMs) setWeekStartMs(freshWeek);
    };
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [weekOffset, weekStartMs]);

  const retry = useCallback(() => { setRetryNonce((n) => n + 1); }, []);

  // Load the user's existing airing alerts once. A 401 means "guest" — rows then
  // route to /login when the bell is clicked.
  useEffect(() => {
    let alive = true;
    fetch("/api/alerts")
      .then(async (res) => {
        if (!alive) return;
        if (res.status === 401) { setAlertsSignedIn(false); setAlertsReady(true); return; }
        const data = await res.json();
        if (!alive) return;
        setAlertsSignedIn(true);
        const next = new Set<string>();
        for (const a of (data?.alerts ?? []) as { mediaId?: number; episode?: number }[]) {
          if (a?.mediaId && a?.episode) next.add(`${a.mediaId}:${a.episode}`);
        }
        setAlerts(next);
        setAlertsReady(true);
      })
      .catch(() => { if (alive) setAlertsReady(true); });
    return () => { alive = false; };
  }, []);

  // ── Format filter + this-week stats (all derived from real AniList data) ──
  const viewSchedule = useMemo(() => {
    const q = query.trim().toLowerCase();
    return schedule.filter((i) => {
      if (formatFilter && (i.media?.format ?? "") !== formatFilter) return false;
      if (onlyMyList && !isSaved(i.media.id)) return false;
      if (q && !bestTitle(i.media.title).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [schedule, formatFilter, onlyMyList, query, isSaved]);
  const presentFormats = useMemo(
    () => FORMAT_OPTIONS.filter((f) => schedule.some((i) => (i.media?.format ?? "") === f)),
    [schedule],
  );
  const stats = useMemo(() => {
    const total = viewSchedule.length;
    const premieres = viewSchedule.filter((i) => {
      const episodeTotal = i.media?.episodes;
      return i.episode === 1 && (episodeTotal == null || episodeTotal > 1);
    }).length;
    const finales = viewSchedule.filter(
      (i) => i.media?.episodes != null && i.media.episodes > 1 && i.episode === i.media.episodes,
    ).length;
    return { total, premieres, finales, ongoing: Math.max(0, total - premieres - finales) };
  }, [viewSchedule]);

  const byDay = useMemo(() => {
    const buckets: AiringScheduleEntry[][] = Array.from({ length: 7 }, () => []);
    viewSchedule.forEach((item) => {
      buckets[istDayIndex(item.airingAt)].push(item);
    });
    buckets.forEach((b) => b.sort((a, b2) => a.airingAt - b2.airingAt));
    return buckets;
  }, [viewSchedule]);

  const todayIdx = now ? istDayIndex(now / 1000) : -1;
  const isCurrentWeek = weekOffset === 0;

  // ── ON AIR / UP NEXT spotlight ──
  const { focus, focusLive, liveAgeMin, queue } = useMemo(() => {
    if (!isCurrentWeek || !nowSec) {
      return { focus: null as AiringScheduleEntry | null, focusLive: false, liveAgeMin: 0, queue: [] as AiringScheduleEntry[] };
    }
    const live = viewSchedule
      .filter((i) => isLive(i.airingAt, nowSec))
      .sort((a, b) => b.airingAt - a.airingAt)[0] ?? null;
    const upcoming = viewSchedule
      .filter((i) => i.airingAt > nowSec)
      .sort((a, b) => a.airingAt - b.airingAt);
    const next = live ?? upcoming[0] ?? null;
    const rest = live ? upcoming : upcoming.slice(1);
    return {
      focus: next,
      focusLive: !!live,
      liveAgeMin: live ? Math.floor((nowSec - live.airingAt) / 60) : 0,
      queue: rest.slice(0, 4),
    };
  }, [viewSchedule, nowSec, isCurrentWeek]);

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!autoScroll || reduceMotion || !scrollRef.current) return;
    const el = scrollRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    intervalRef.current = setInterval(() => {
      const next = el.scrollLeft + el.clientWidth * 0.85;
      if (next >= maxScroll) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: next, behavior: "smooth" });
      }
    }, 5000);
  }, [autoScroll, reduceMotion]);

  useEffect(() => {
    startAutoScroll();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoScroll, byDay]);

  const scrollToDay = useCallback((idx: number) => {
    if (!scrollRef.current || idx < 0) return;
    const el = scrollRef.current;
    el.scrollTo({ left: el.clientWidth * 0.85 * idx, behavior: "smooth" });
  }, []);

  // Bell on a row / spotlight. Guests are sent to login; members get an
  // optimistic toggle that rolls back if the request fails.
  const toggleAlert = useCallback((item: AiringScheduleEntry) => {
    const key = `${item.media.id}:${item.episode}`;
    if (alertsSignedIn === false) { router.push("/login"); return; }
    const active = alerts.has(key);
    setAlerts((prev) => {
      const next = new Set(prev);
      if (active) next.delete(key); else next.add(key);
      return next;
    });
    fetch("/api/alerts", {
      method: active ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        active
          ? { mediaId: item.media.id, episode: item.episode }
          : { mediaId: item.media.id, episode: item.episode, airingAt: new Date(item.airingAt * 1000).toISOString() }
      ),
    })
      .then((res) => {
        if (res.status === 401) { setAlertsSignedIn(false); router.push("/login"); return; }
        if (!res.ok) throw new Error("alert request failed");
      })
      .catch(() => {
        setAlerts((prev) => {
          const next = new Set(prev);
          if (active) next.add(key); else next.delete(key);
          return next;
        });
      });
  }, [alerts, alertsSignedIn, router]);

  // Build a calendar file from whatever the board is currently showing
  // (week + format/search/my-list filters applied). Client-side, so it works
  // for guests too and needs no extra endpoint.
  const downloadIcs = useCallback(() => {
    if (viewSchedule.length === 0) return;
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
    const events = viewSchedule.map((it) => {
      const start = new Date(it.airingAt * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const title = bestTitle(it.media.title);
      return [
        "BEGIN:VEVENT",
        `UID:${it.media.id}-${it.episode}@zyniverse.in`,
        `DTSTAMP:${fmt(new Date())}`,
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${esc(`${title} Episode ${it.episode}`)}`,
        `DESCRIPTION:${esc(`Episode ${it.episode} airs on ZyniVerse — https://zyverse.in/anime/${it.media.id}`)}`,
        `URL:https://zyverse.in/anime/${it.media.id}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
      ].join("\r\n");
    });
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ZyniVerse//Weekly Anime Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${esc(`ZyniVerse Schedule — ${formatIstDate(toIstWallMs(weekStartMs))}`)}`,
      "X-WR-TIMEZONE:Asia/Kolkata",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `zyniverse_schedule_${new Date(weekStartMs).toISOString().slice(0, 10)}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [viewSchedule, weekStartMs]);

  const jumpToNow = useCallback(() => {
    goToWeek(0);
    // Wait for the current week to paint, then land on today's live/next card.
    requestAnimationFrame(() => {
      scrollToDay(todayIdx);
      scrollRef.current
        ?.querySelector<HTMLElement>('[data-now-focus="true"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, [goToWeek, scrollToDay, todayIdx]);

  // Keyboard shortcuts: ←/→ change week, T jumps to today, 1-7 jump to a day.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goToWeek(weekOffset - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goToWeek(weekOffset + 1); }
      else if (e.key.toLowerCase() === "t") { goToWeek(0); scrollToDay(todayIdx); }
      else if (/^[1-7]$/.test(e.key)) { scrollToDay(Number(e.key) - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToWeek, weekOffset, todayIdx, scrollToDay]);

  const platform = focus ? platformFrom(focus.media.externalLinks) : null;
  const focusSaved = focus ? isSaved(focus.media.id) : false;
  const focusStatus = focus ? getStatus(focus.media.id) : null;
  const focusAlertOn = focus ? alerts.has(`${focus.media.id}:${focus.episode}`) : false;

  return (
    <PageTransition>
      <MotionConfig reducedMotion="user">
        <ErrorBoundary label="Schedule">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            {/* ── HEADER ── */}
            <div className="neon-rgb-border relative mb-6 overflow-hidden rounded-2xl bg-[var(--color-panel)]/80 p-6 backdrop-blur-sm sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-violet)]/20 blur-3xl" />
              <div className="relative flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-cyan)]">Weekly Schedule</p>
                  <h1 className="font-display text-3xl font-bold sm:text-4xl">
                    <span className="bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] bg-clip-text text-transparent">
                      Broadcast Board
                    </span>
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-mute)]">
                    <span>
                      {formatIstDate(toIstWallMs(weekStartMs))} — {formatIstDate(toIstWallMs(weekStartMs + 6 * DAY_MS))}
                    </span>
                    <span aria-hidden className="hidden h-3 w-px bg-white/10 sm:inline-block" />
                    <LiveClock className="text-xs" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => goToWeek(weekOffset - 1)}
                    className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-[var(--color-cyan)]/40 hover:text-white"
                  >← Prev</button>
                  <button
                    onClick={jumpToNow}
                    className="rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20"
                  >⟳ Now</button>
                  <button
                    onClick={() => goToWeek(weekOffset + 1)}
                    className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-[var(--color-cyan)]/40 hover:text-white"
                  >Next →</button>
                  <button
                    onClick={downloadIcs}
                    disabled={viewSchedule.length === 0}
                    title="Download what's on screen as a calendar file (.ics)"
                    className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-[var(--color-cyan)]/40 hover:text-white disabled:opacity-30"
                  >📅 Calendar</button>
                  <button
                    onClick={() => setAutoScroll((a) => !a)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                      autoScroll
                        ? "border-[var(--color-magenta)]/50 bg-[var(--color-magenta)]/10 text-[var(--color-magenta)]"
                        : "border-white/10 bg-black/30 text-[var(--color-mute)] hover:text-white"
                    }`}
                  >{autoScroll ? "◎ Auto-scroll" : "◉ Manual"}</button>
                </div>
              </div>
            </div>

            {/* ── WEEK STATS + FORMAT FILTER ── */}
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--color-cyan)]/25 bg-[var(--color-cyan)]/10 px-3 py-1 font-mono text-[11px] text-[var(--color-cyan)]">
                  {stats.total} airing{stats.total !== 1 ? "s" : ""}
                </span>
                {stats.premieres > 0 && (
                  <span className="rounded-full border border-[var(--color-magenta)]/25 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-[11px] text-[var(--color-magenta)]">
                    {stats.premieres} premiere{stats.premieres !== 1 ? "s" : ""}
                  </span>
                )}
                {stats.finales > 0 && (
                  <span className="rounded-full border border-[var(--color-violet)]/25 bg-[var(--color-violet)]/10 px-3 py-1 font-mono text-[11px] text-[var(--color-violet)]">
                    {stats.finales} finale{stats.finales !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[11px] text-[var(--color-mute)]">
                  {stats.ongoing} ongoing
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", ...presentFormats].map((f) => {
                  const active = (formatFilter ?? "All") === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFormatFilter(f === "All" ? null : f)}
                      aria-pressed={active}
                      className={`relative rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        active
                          ? "text-black"
                          : "border border-white/10 bg-black/20 text-[var(--color-mute)] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="format-chip"
                          className="absolute inset-0 rounded-full bg-[var(--color-cyan)]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative">{f}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setOnlyMyList((v) => !v)}
                  aria-pressed={onlyMyList}
                  title="Show only shows in your list"
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    onlyMyList
                      ? "bg-[var(--color-amber)] text-black"
                      : "border border-white/10 bg-black/20 text-[var(--color-mute)] hover:border-white/20 hover:text-white"
                  }`}
                >★ My list</button>

                <label className="relative ml-auto block w-full sm:w-56">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)]">⌕</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search this week…"
                    aria-label="Search this week's schedule"
                    className="w-full rounded-full neon-rgb-border bg-black/30 py-1.5 pl-8 pr-8 text-[11px] text-white placeholder:text-[var(--color-mute)] focus:outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-mute)] hover:text-white"
                    >✕</button>
                  )}
                </label>
              </div>
            </div>

            {/* ── DAY PILLS ── */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
              {DAY_LABELS.map((label, idx) => {
                const isToday = isCurrentWeek && idx === todayIdx;
                return (
                  <button
                    key={label}
                    onClick={() => scrollToDay(idx)}
                    className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      isToday ? "text-white" : "border border-white/5 bg-black/20 text-[var(--color-mute)] hover:border-white/15 hover:text-white"
                    }`}
                  >
                    {isToday && (
                      <motion.span
                        layoutId="active-day"
                        className="absolute inset-0 rounded-full bg-[var(--color-magenta)]/15 ring-1 ring-[var(--color-magenta)]/50"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      {isToday && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-magenta)]" />}
                      {label.slice(0, 3)}
                      <span className="text-[10px] opacity-60">{formatIstDate(toIstWallMs(weekStartMs) + idx * DAY_MS)}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <ScheduleSkeleton />
            ) : error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : (
              <>
                {viewSchedule.length === 0 && schedule.length > 0 && (
                  <div className="mb-6 rounded-2xl border border-white/5 bg-[var(--color-panel)]/60 p-8 text-center">
                    <p className="text-sm font-medium text-[var(--color-mute)]">
                      No airings match your filters this week.
                    </p>
                    <button
                      onClick={() => { setFormatFilter(null); setQuery(""); setOnlyMyList(false); }}
                      className="mt-3 rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20"
                    >Clear filters</button>
                  </div>
                )}

                {/* ── ON AIR / UP NEXT SPOTLIGHT ── */}
                <AnimatePresence>
                  {isCurrentWeek && focus && (
                    <motion.section
                      key="spotlight"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="relative mb-6 overflow-hidden rounded-3xl border border-white/5 bg-[var(--color-panel)]/70 backdrop-blur-sm"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-80"
                        style={{
                          background:
                            "radial-gradient(120% 140% at 12% 0%, rgba(255,45,120,0.18), transparent 55%), radial-gradient(120% 140% at 88% 20%, rgba(41,242,224,0.16), transparent 55%), radial-gradient(120% 120% at 60% 120%, rgba(138,92,255,0.18), transparent 60%)",
                        }}
                      />
                      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-cyan)]/70 to-transparent" />

                      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                        <Link href={`/anime/${focus.media.id}`} className="group relative shrink-0 self-start">
                          <div className="relative h-40 w-28 overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_var(--color-magenta)] sm:h-48 sm:w-32">
                            {focus.media.coverImage?.large ? (
                              <Image
                                src={focus.media.coverImage.large}
                                alt=""
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="128px"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-white/5 text-3xl">📺</div>
                            )}
                          </div>
                          <span className="absolute -bottom-2 -right-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--color-cyan)] px-2 text-xs font-bold text-black shadow-lg shadow-[var(--color-cyan)]/40">
                            EP {focus.episode}
                          </span>
                        </Link>

                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {focusLive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-magenta)]/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[var(--color-magenta)] ring-1 ring-[var(--color-magenta)]/40">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-magenta)] opacity-70" />
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]" />
                                </span>
                                ON AIR
                              </span>
                            ) : (
                              <span className="rounded-full bg-[var(--color-cyan)]/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[var(--color-cyan)] ring-1 ring-[var(--color-cyan)]/40">
                                UP NEXT
                              </span>
                            )}
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-mute)]">
                              {formatISTTime(focus.airingAt, { suffix: true })}
                            </span>
                          </div>
                          <h2 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                            <Link href={`/anime/${focus.media.id}`} className="transition-colors hover:text-[var(--color-cyan)]">
                              {bestTitle(focus.media.title)}
                            </Link>
                          </h2>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-mute)]">
                            {focus.media.format && (
                              <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase tracking-wider">{focus.media.format}</span>
                            )}
                            {focus.media.genres?.slice(0, 3).map((g) => (
                              <span key={g} className="rounded-full bg-white/5 px-2 py-0.5">{g}</span>
                            ))}
                            {platform && (
                              <span className="rounded-full bg-[var(--color-violet)]/15 px-2 py-0.5 text-[var(--color-violet)]">on {platform}</span>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => toggle(toWatchlistItem(focus.media))}
                              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                                focusSaved
                                  ? "border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                                  : "border border-white/10 bg-black/30 text-white/80 hover:border-[var(--color-cyan)]/40 hover:text-white"
                              }`}
                            >{focusSaved ? "✓ In your list" : "+ Add to list"}</button>
                            {focusStatus && (
                              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                                {LIST_STATUS_LABELS[focusStatus] ?? focusStatus}
                              </span>
                            )}
                            <button
                              onClick={() => toggleAlert(focus)}
                              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                                focusAlertOn
                                  ? "bg-[var(--color-magenta)] text-black"
                                  : "border border-white/10 bg-black/30 text-white/80 hover:border-[var(--color-magenta)]/40 hover:text-white"
                              }`}
                            >{focusAlertOn ? "🔔 Alert on" : "🔔 Notify me"}</button>
                          </div>
                        </div>

                        <div className="lg:pl-2">
                          {focusLive ? (
                            <div className="flex flex-col items-start lg:items-center">
                              <span className="font-mono text-4xl font-bold text-[var(--color-magenta)] sm:text-5xl">{liveAgeMin}m</span>
                              <span className="mt-1 text-xs text-[var(--color-mute)]">since broadcast start</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-start gap-2 lg:items-end">
                              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-mute)]">Airs in</span>
                              <Countdown targetSec={focus.airingAt} />
                            </div>
                          )}
                        </div>
                      </div>

                      {queue.length > 0 && (
                        <div className="relative border-t border-white/5 px-5 py-3 sm:px-7">
                          <div className="flex items-center gap-3 overflow-x-auto">
                            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-mute)]">Then</span>
                            {queue.map((q) => (
                              <Link
                                key={q.id}
                                href={`/anime/${q.media.id}`}
                                title={bestTitle(q.media.title)}
                                className="group flex shrink-0 items-center gap-2 rounded-full border border-white/5 bg-black/30 py-1 pl-1 pr-3 transition-colors hover:border-[var(--color-cyan)]/40"
                              >
                                <span className="relative flex h-7 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/5 text-[10px]">
                                  {q.media.coverImage?.large ? (
                                    <Image src={q.media.coverImage.large} alt="" fill className="object-cover" sizes="20px" unoptimized />
                                  ) : (
                                    "📺"
                                  )}
                                </span>
                                <span className="max-w-[10rem] truncate text-xs font-medium text-white/80 group-hover:text-white">
                                  {bestTitle(q.media.title)}
                                </span>
                                <span className="font-mono text-[10px] text-[var(--color-cyan)]">
                                  {formatISTTime(q.airingAt, { suffix: false })}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* ── DAY CARDS (horizontal scroll) ── */}
                <div
                  ref={scrollRef}
                  className="board-scroll flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4"
                  onMouseEnter={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
                  onMouseLeave={() => startAutoScroll()}
                  onTouchStart={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
                >
                  {DAY_LABELS.map((label, idx) => {
                    const items = byDay[idx];
                    const isToday = isCurrentWeek && idx === todayIdx;
                    const hasLive = items.some((i) => isLive(i.airingAt, nowSec));

                    return (
                      <motion.div
                        key={`${weekOffset}-${label}`}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
                        className="w-[85vw] max-w-sm shrink-0 snap-center"
                      >
                        <div className={`flex h-full flex-col overflow-hidden rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm ${
                          isToday ? "neon-rgb-border" : "border border-white/5"
                        }`}>
                          {/* Day header */}
                          <div className="relative flex items-center justify-between border-b border-white/5 px-5 pb-4 pt-5">
                            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-magenta)]/50 to-transparent" />
                            <div>
                              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                                {label}
                                {isToday && (
                                  <span className="rounded-full bg-[var(--color-magenta)] px-2 py-0.5 text-[9px] font-bold tracking-wider text-black">TODAY</span>
                                )}
                                {hasLive && (
                                  <span className="flex items-center gap-1 rounded-full bg-[var(--color-magenta)]/15 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[var(--color-magenta)]">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-magenta)]" />LIVE
                                  </span>
                                )}
                              </h3>
                              <p className="mt-0.5 font-mono text-[11px] text-[var(--color-mute)]">
                                {formatIstDate(toIstWallMs(weekStartMs) + idx * DAY_MS)}
                              </p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30">
                              <span className="font-mono text-xs font-bold text-white">{items.length}</span>
                            </div>
                          </div>

                          {/* Episode list */}
                          <div className="board-scroll flex-1 space-y-2.5 overflow-y-auto p-4 max-h-[55vh] sm:max-h-[460px]">
                            {items.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-3 rounded-full bg-white/5 p-4">
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]/40">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                  </svg>
                                </div>
                                <p className="text-sm font-medium text-[var(--color-mute)]/50">Nothing scheduled</p>
                                <p className="mt-1 text-[10px] text-[var(--color-mute)]/30">No airings for this day</p>
                              </div>
                            )}

                            {items.map((item, i) => {
                              const live = isLive(item.airingAt, nowSec);
                              const upcoming = item.airingAt > nowSec;
                              const soon = upcoming && item.airingAt - nowSec <= SOON_WINDOW_S;
                              const rowStatus = getStatus(item.media.id);
                              const rowSaved = isSaved(item.media.id);
                              const rowAlertOn = alerts.has(`${item.media.id}:${item.episode}`);
                              const isFocus = focus != null && focus.id === item.id;
                              return (
                                <motion.div
                                  key={item.id}
                                  data-now-focus={isFocus ? "true" : undefined}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.24) }}
                                  className="relative"
                                >
                                  <Link
                                    href={`/anime/${item.media.id}`}
                                    title={bestTitle(item.media.title)}
                                    className={`group relative block overflow-hidden rounded-xl border bg-[var(--color-void)]/70 p-3 pr-9 transition-all duration-300 ${
                                      live
                                        ? "border-[var(--color-magenta)]/40 shadow-[0_0_26px_-10px_var(--color-magenta)]"
                                        : "border-white/5 hover:border-[var(--color-cyan)]/40 hover:shadow-[0_0_26px_-10px_var(--color-cyan)]"
                                    }`}
                                  >
                                    <span
                                      aria-hidden
                                      className={`absolute left-0 top-0 h-full w-[3px] ${
                                        live ? "bg-[var(--color-magenta)]" : upcoming ? "bg-[var(--color-cyan)]/50" : "bg-white/5"
                                      }`}
                                    />
                                    <div className="flex items-center gap-3 pl-1.5">
                                      <div className="relative flex h-16 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-white/5 text-lg">
                                        {item.media.coverImage?.large ? (
                                          <Image
                                            src={item.media.coverImage.large}
                                            alt=""
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            unoptimized
                                          />
                                        ) : (
                                          "📺"
                                        )}
                                        <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cyan)] text-[9px] font-bold text-black shadow-lg shadow-[var(--color-cyan)]/30">
                                          {item.episode}
                                        </div>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-[var(--color-cyan)]">
                                          {bestTitle(item.media.title)}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--color-mute)]">
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[var(--color-ink)]">
                                            {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-magenta)]" />}
                                            {formatISTTime(item.airingAt, { suffix: true })}
                                          </span>
                                          {live ? (
                                            <span className="rounded-full bg-[var(--color-magenta)]/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--color-magenta)]">LIVE</span>
                                          ) : soon ? (
                                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--color-cyan)]">
                                              in {countdownLabel(item.airingAt, now, true)}
                                            </span>
                                          ) : null}
                                          {item.media.format && (
                                            <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                                              {item.media.format}
                                            </span>
                                          )}
                                          {rowStatus && (
                                            <span className="rounded-full bg-[var(--color-cyan)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--color-cyan)]">
                                              {LIST_STATUS_LABELS[rowStatus] ?? rowStatus}
                                            </span>
                                          )}
                                        </div>
                                        {item.media.genres?.length ? (
                                          <div className="mt-1.5 flex flex-wrap gap-1">
                                            {item.media.genres.slice(0, 2).map((g) => (
                                              <span key={g} className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-[var(--color-mute)]/60">{g}</span>
                                            ))}
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  </Link>

                                  {/* Row actions live outside the Link so clicks don't navigate. */}
                                  <div className="absolute right-1.5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => toggle(toWatchlistItem(item.media))}
                                      aria-label={rowSaved ? "Remove from your list" : "Add to your list"}
                                      title={rowSaved ? "Remove from your list" : "Add to your list"}
                                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition-colors ${
                                        rowSaved
                                          ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]"
                                          : "bg-black/40 text-[var(--color-mute)] hover:text-white"
                                      }`}
                                    >{rowSaved ? "★" : "☆"}</button>
                                  <button
                                    onClick={() => toggleAlert(item)}
                                    disabled={!alertsReady}
                                    aria-label={rowAlertOn ? "Turn off episode alert" : "Notify me about this episode"}
                                    title={rowAlertOn ? "Alert on" : "Notify me"}
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition-colors disabled:opacity-30 ${
                                      rowAlertOn
                                        ? "bg-[var(--color-magenta)] text-black"
                                        : "bg-black/40 text-[var(--color-mute)] hover:text-white"
                                    }`}
                                  >🔔</button>
                                  </div>
                                </motion.div>
                              );
                            })}
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
                    Hover or touch to pause auto-scroll · times in IST
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    <span className="font-mono">
                      {viewSchedule.length}
                      {(formatFilter || query || onlyMyList) && schedule.length !== viewSchedule.length ? ` / ${schedule.length}` : ""} airings
                    </span>
                  </span>
                </div>
              </>
            )}
          </div>
        </ErrorBoundary>
      </MotionConfig>
      <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
