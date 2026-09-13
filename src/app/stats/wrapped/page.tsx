"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { motion, AnimatePresence, animate } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import type { UserStats } from "@/lib/stats";

const EASE = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring", stiffness: 260, damping: 28, mass: 0.9 } as const;

function CountUp({ value, duration = 1.2, className = "" }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
    </span>
  );
}

function GenreBar({ genre, count, percentage, max, color, delay = 0 }: { genre: string; count: number; percentage: number; max: number; color: string; delay?: number }) {
  const pct = max > 0 ? Math.max(10, (count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 truncate text-left text-[10px] font-bold text-white/70">{genre}</span>
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.8, ease: EASE }}
          className="flex h-full items-center justify-end rounded-full px-1.5"
          style={{ background: color, boxShadow: `0 0 14px ${color}55` }}
        >
          <span className="text-[8px] font-black text-black">{count}</span>
        </motion.div>
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-[10px] text-white/50">{percentage}%</span>
    </div>
  );
}

const SLIDE_DOTS = ["#00ffe0", "#ff7ad9", "#ffd700", "#00ff7c", "#8a2be2", "#ff3366", "#ffa500", "#00ffff"];

export default function WrappedPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ready, setReady] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = selectedYear ? `?year=${selectedYear}` : "";
    fetch(`/api/stats${q}`)
      .then((r) => {
        if (!r.ok) throw new Error("NOT_AUTHED");
        return r.json();
      })
      .then((d) => {
        setStats(d);
        setSlide(0);
        setLoading(false);
        setReady(false);
        setTimeout(() => setReady(true), 200);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [selectedYear]);

  const availableYears = stats
    ? [...new Set(stats.yearlyActivity.map((y) => y.year))].sort((a, b) => b - a)
    : [];
  const yearLabel = selectedYear ? String(selectedYear) : "All Time";
  const fileYear = yearLabel.replace(/\s+/g, "-").toLowerCase();

  const topGenre = stats?.genreBreakdown.length ? [...stats.genreBreakdown].sort((a, b) => b.count - a.count)[0] : null;
  const topFormat = stats?.formatBreakdown.length ? [...stats.formatBreakdown].sort((a, b) => b.count - a.count)[0] : null;
  const favoriteDay = stats?.dayOfWeek?.length ? [...stats.dayOfWeek].sort((a, b) => b.episodes - a.episodes)[0] : null;
  const maxGenreCount = stats ? Math.max(...stats.genreBreakdown.map((g) => g.count), 1) : 1;
  const meanScore = stats?.meanScore || 0;

  const TOTAL_SLIDES = 8;

  const shareText = `🎌 My ZyniVerse Wrapped ${yearLabel}\n\n📺 ${stats?.totalAnime ?? 0} anime watched\n🎬 ${(stats?.totalEpisodes ?? 0).toLocaleString()} episodes\n⏱️ ${stats?.totalDaysWatched ?? 0} days\n🔥 ${stats?.currentStreak ?? 0} day streak\n🏆 Mean Score: ${meanScore}/100\n🎯 Top Genre: ${topGenre?.genre || "N/A"}\n\n#ZyniVerse #AnimeWrapped`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleTweet = () => {
    const text = encodeURIComponent(`🎌 My ZyniVerse Wrapped ${yearLabel}\n\n📺 ${stats?.totalAnime ?? 0} anime | 🎬 ${(stats?.totalEpisodes ?? 0).toLocaleString()} eps | ⏱️ ${stats?.totalDaysWatched ?? 0} days\n🔥 ${stats?.currentStreak ?? 0} day streak | 🏆 Score: ${meanScore}/100\n\n#ZyniVerse #AnimeWrapped`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "width=600,height=400");
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current || !stats) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      setPreviewUrl(dataUrl);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `zyniverse-wrapped-${fileYear}.png`;
      a.click();
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  };

  const go = useCallback(
    (next: number) => {
      setDirection(next > slide ? 1 : -1);
      setSlide(Math.max(0, Math.min(TOTAL_SLIDES - 1, next)));
    },
    [slide]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(slide + 1);
      if (e.key === "ArrowLeft") go(slide - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, slide]);

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <div className="space-y-4">
            <div className="shimmer h-4 w-48 rounded" />
            <div className="shimmer h-[480px] w-full rounded-3xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error === "NOT_AUTHED" || !stats) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-12 backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 50% -10%, rgba(255,122,217,0.16), transparent 55%), radial-gradient(120% 120% at 50% 120%, rgba(0,255,224,0.1), transparent 55%)" }} />
            <div className="relative z-10">
              <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} className="inline-block text-5xl">🎌</motion.span>
              <h1 className="mt-4 font-display text-3xl font-black">Your <span className="neon-text-gradient">Wrapped</span> awaits</h1>
              <p className="mt-2 text-sm text-[var(--color-mute)]">Sign in to see your anime year in review!</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/login" className="rounded-xl px-6 py-3 text-sm font-black uppercase tracking-wider text-black transition-all hover:brightness-110" style={{ background: "linear-gradient(90deg, #00ffe0, #ff7ad9)", boxShadow: "0 0 26px rgba(0,255,224,0.3)" }}>
                  Sign In →
                </Link>
                <Link href="/stats" className="rounded-xl border border-white/[0.09] bg-black/25 px-6 py-3 text-sm font-bold text-[var(--color-mute)] transition-colors hover:text-white">
                  Back to Stats
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const slides = [
    {
      label: "Intro",
      render: () => (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={ready ? { scale: 1, rotate: 0 } : {}} transition={spring} className="h-20 w-20 rounded-full bg-gradient-to-br from-[#ff7ad9] to-[#00ffe0] p-1">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#15121d] text-2xl font-black text-white">
              {session?.user?.name?.[0] || "U"}
            </div>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 14 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15, ...spring }} className="mt-5 font-display text-3xl font-black">
            {session?.user?.name || "Anime Fan"}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.25, ...spring }} className="mt-1 text-sm text-[var(--color-mute)]">
            @{(session?.user as unknown as Record<string, string>)?.username || "user"}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.4 }} className="mt-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#ff7ad9]">Your Year in Anime</p>
            <p>
              <span className="neon-text-gradient font-display text-5xl font-black">{yearLabel}</span>
            </p>
          </motion.div>
        </div>
      ),
    },
    {
      label: "Total Anime",
      render: () => (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={spring} className="flex items-center gap-2 rounded-full border border-[#00ffe0]/30 bg-[#00ffe0]/10 px-4 py-1.5 text-[11px] font-bold text-[#00ffe0]">
            📺 Watched &amp; Watching
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1, ...spring }} className="mt-6">
            <CountUp value={stats.totalAnime} className="bg-gradient-to-r from-[#00ffe0] via-white to-[#ff7ad9] bg-clip-text font-mono text-[96px] font-black leading-none text-transparent sm:text-[120px]" />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} className="mt-4 text-lg font-bold text-white/80">
            anime on your list
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.45 }} className="mt-6 flex gap-2">
            {[
              { label: "Completed", value: stats.completedCount, color: "#00ff7c" },
              { label: "Watching", value: stats.watchingCount, color: "#00ffe0" },
              { label: "Planned", value: stats.planningCount, color: "#ffa500" },
              { label: "Dropped", value: stats.droppedCount, color: "#ff5050" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-2.5 text-center">
                <p className="font-mono text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] uppercase tracking-widest text-[var(--color-mute)]">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      ),
    },
    {
      label: "Watch Time",
      render: () => (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.p initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={spring} className="font-mono text-xs uppercase tracking-[0.25em] text-[#ffd700]">You really committed ⏱️</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.12, ...spring }} className="mt-6">
            <CountUp value={stats.totalEpisodes} className="bg-gradient-to-r from-[#ffd700] to-[#ff7ad9] bg-clip-text font-mono text-7xl font-black leading-none text-transparent sm:text-8xl" />
            <p className="mt-2 text-sm text-[var(--color-mute)]">episodes watched</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={ready ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.28, ...spring }} className="mt-8 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/25 px-6 py-4">
            <span className="text-2xl">🗓️</span>
            <div className="text-left">
              <p className="font-mono text-3xl font-black text-[#00ffe0]">{stats.totalDaysWatched}<span className="text-sm text-[var(--color-mute)]"> days</span></p>
              <p className="text-[10px] text-[var(--color-mute)]">≈ {(stats.totalDaysWatched * 24).toFixed(0)} hours of anime</p>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      label: "Streaks",
      render: () => (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={ready ? { opacity: 1, scale: 1, rotate: [0, 6, -6, 0] } : {}} transition={{ ...spring }} className="text-6xl">🔥</motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1, ...spring }} className="mt-4">
            <CountUp value={stats.currentStreak} className="bg-gradient-to-r from-[#ff5050] via-[#ffd700] to-[#ff7ad9] bg-clip-text font-mono text-7xl font-black leading-none text-transparent" />
          </motion.div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">day streak 🔥</p>
          <div className="mt-6 flex gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-black/25 px-5 py-3">
              <p className="font-mono text-2xl font-black text-[#ffd700]">{stats.longestStreak}</p>
              <p className="text-[10px] text-[var(--color-mute)]">Longest streak</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/25 px-5 py-3">
              <p className="font-mono text-2xl font-black text-[#00ff7c]">{(stats.currentStreak > 0 ? "⚡ Live" : "—")}</p>
              <p className="text-[10px] text-[var(--color-mute)]">Status</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Your Score",
      render: () => (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.p initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={spring} className="font-mono text-xs uppercase tracking-[0.25em] text-[#00ff7c]">Critical eye 🏆</motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={ready ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.15, ...spring }} className="relative mt-8 flex h-40 w-40 items-center justify-center">
            <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#grade-g)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={ready ? { strokeDashoffset: 2 * Math.PI * 42 * (1 - meanScore / 100) } : {}}
                transition={{ delay: 0.3, duration: 1.4, ease: EASE }}
              />
              <defs><linearGradient id="grade-g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ffe0" /><stop offset="100%" stopColor="#ff7ad9" /></linearGradient></defs>
            </motion.svg>
            <div className="text-center">
              <CountUp value={meanScore} className="font-mono text-4xl font-black" duration={1.4} />
              <p className="text-[10px] text-[var(--color-mute)]">/ 100</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="mt-6 flex gap-2">
            {topFormat && (
              <span className="rounded-full border border-[#00ffe0]/30 bg-[#00ffe0]/10 px-4 py-1.5 text-xs font-bold text-[#00ffe0]">
                Mostly {topFormat.format}
              </span>
            )}
            {stats.yearlyActivity.length > 0 && (
              <span className="rounded-full border border-white/[0.08] bg-black/25 px-4 py-1.5 text-xs text-[var(--color-mute)]">
                {stats.yearlyActivity.reduce((s, y) => s + y.completed, 0)} completed all-time
              </span>
            )}
          </motion.div>
        </div>
      ),
    },
    {
      label: "Top Genre",
      render: () => (
        <div className="flex flex-col justify-center py-8">
          <motion.p initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={spring} className="mb-6 text-center font-mono text-xs uppercase tracking-[0.25em] text-[#8a2be2]">Your palette 🎯</motion.p>
          {topGenre && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1, ...spring }} className="mb-6 text-center">
              <p className="text-xs text-[var(--color-mute)]">Top genre</p>
              <p className="neon-text-gradient mt-1 font-display text-4xl font-black">{topGenre.genre}</p>
            </motion.div>
          )}
          <div className="space-y-2">
            {stats.genreBreakdown.slice(0, 6).map((g, i) => (
              <GenreBar key={g.genre} genre={g.genre} count={g.count} percentage={g.percentage} max={maxGenreCount} color={SLIDE_DOTS[i % SLIDE_DOTS.length]} delay={0.25 + i * 0.08} />
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Studios & Days",
      render: () => (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={spring} className="w-full">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#ffa500]">Favourite studios 🎬</p>
            <div className="flex flex-wrap justify-center gap-2">
              {stats.topStudios.slice(0, 4).map((s, i) => (
                <motion.span key={s.name} initial={{ opacity: 0, scale: 0.8 }} animate={ready ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.1 + i * 0.07, ...spring }} className="rounded-xl border border-white/[0.07] bg-black/25 px-4 py-2 text-xs font-bold text-white/80">
                  {s.name} <span className="text-[10px] text-[#ffa500]">×{s.count}</span>
                </motion.span>
              ))}
            </div>
          </motion.div>
          {favoriteDay && (
            <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.4 }} className="mt-6 w-full">
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-[#ff7ad9]">Peak session day 📅</p>
              <p className="text-2xl font-black">{favoriteDay.day} <span className="text-[#ff7ad9]">·</span> <span className="font-mono text-lg text-[var(--color-mute)]">{favoriteDay.episodes} eps</span></p>
            </motion.div>
          )}
        </div>
      ),
    },
    {
      label: "Finale",
      render: () => (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.span animate={{ rotate: [0, 14, -14, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="inline-block text-5xl">🎉</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1, ...spring }} className="mt-4 font-display text-3xl font-black">
            That&apos;s your <span className="neon-text-gradient">{yearLabel}</span>!
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} className="mt-2 max-w-sm text-sm text-[var(--color-mute)]">
            {stats.totalAnime} anime, {(stats.totalEpisodes || 0).toLocaleString()} episodes, and {stats.totalDaysWatched} days of pure anime energy.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45, ...spring }} className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button onClick={handleTweet} className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-black transition-all hover:brightness-110" style={{ background: "linear-gradient(90deg, #1DA1F2, #00ffe0)", boxShadow: "0 0 22px rgba(29,161,242,0.3)" }}>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Share on X
            </button>
            <button onClick={handleDownloadCard} className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-black transition-all hover:brightness-110" style={{ background: "linear-gradient(90deg, #ff7ad9, #ffd700)", boxShadow: "0 0 22px rgba(255,122,217,0.3)" }}>
              {downloading ? "⏳ …" : "🖼️ Download Card"}
            </button>
            <button onClick={handleCopy} className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-black/25 px-5 py-3 text-sm font-bold text-white/80 transition-all hover:border-[#00ffe0]/40 hover:text-[#00ffe0]">
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </motion.div>
          {previewUrl && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
              <p className="mb-2 text-[10px] text-[var(--color-mute)]">Card preview:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Wrapped card" className="mx-auto max-w-[420px] rounded-xl border border-white/10 shadow-2xl shadow-black/50" />
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="mt-6">
            <Link href="/stats" className="text-xs text-[var(--color-mute)] hover:text-[#00ffe0]">← Full Stats</Link>
          </motion.div>
        </div>
      ),
    },
  ];

  const dirVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0, filter: "blur(6px)" }),
    center: () => ({ x: 0, opacity: 1, filter: "blur(0px)" }),
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, filter: "blur(6px)" }),
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl" style={{ background: "linear-gradient(135deg, rgba(255,122,217,0.2), rgba(0,255,224,0.2))", border: "1px solid rgba(255,255,255,0.1)" }}>
              🎌
            </motion.div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff7ad9]">Your Year in Anime</p>
              <h1 className="font-display text-lg font-black sm:text-xl">Wrapped {yearLabel}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setLoading(true);
                setSelectedYear(v ? Number(v) : null);
              }}
              className="rounded-lg border border-white/10 bg-[#1a1626]/90 px-3 py-1.5 text-xs font-bold text-white/80 outline-none transition-colors hover:border-[#00ffe0]/40 focus:border-[#00ffe0]/50"
            >
              <option value="">All Time</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <span className="rounded-full border border-white/[0.08] bg-black/25 px-3 py-1.5 font-mono text-[10px] font-bold text-[var(--color-mute)]">
              {slide + 1} / {TOTAL_SLIDES}
            </span>
          </div>
        </header>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={ready ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
            ref={cardRef}
            className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/95 backdrop-blur-sm"
          >
            <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 75% -10%, rgba(255,122,217,0.12), transparent 55%), radial-gradient(120% 120% at 10% 110%, rgba(0,255,224,0.1), transparent 55%)" }} />

            <div className="absolute left-0 right-0 top-0 z-20 flex gap-1.5 px-6 pt-5">
              {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ background: i <= slide ? SLIDE_DOTS[i % SLIDE_DOTS.length] : "rgba(255,255,255,0.1)", boxShadow: i <= slide ? `0 0 8px ${SLIDE_DOTS[i % SLIDE_DOTS.length]}55` : "none" }}
                />
              ))}
            </div>

            <div className="relative z-10 flex min-h-[440px] sm:min-h-[460px] flex-col justify-center px-6 pb-16 pt-14">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={slide}
                  custom={direction}
                  variants={dirVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {slides[slide].render()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between p-5">
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => go(slide - 1)}
                disabled={slide === 0}
                aria-label="Previous"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-black/30 text-sm text-white/70 transition-colors hover:border-[#00ffe0]/40 hover:text-[#00ffe0] disabled:pointer-events-none disabled:opacity-30"
              >
                ←
              </motion.button>
              {slide === TOTAL_SLIDES - 1 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 rounded-full border border-[#00ff7c]/30 bg-[#00ff7c]/10 px-4 py-2 text-[11px] font-bold text-[#00ff7c]">
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="inline-block">●</motion.span>
                  Wrapped complete
                </motion.div>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">
                  {slides[slide].label}
                </span>
              )}
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => go(slide + 1)}
                disabled={slide === TOTAL_SLIDES - 1}
                aria-label="Next"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-black/30 text-sm text-white/70 transition-colors hover:border-[#ff7ad9]/40 hover:text-[#ff7ad9] disabled:pointer-events-none disabled:opacity-30"
              >
                →
              </motion.button>
            </div>
          </motion.div>
        </div>

        <p className="mt-4 text-center text-[10px] text-[var(--color-mute)]">
          Use <span className="font-mono text-white/60">←</span> <span className="font-mono text-white/60">→</span> arrow keys to navigate
        </p>
      </div>
    </PageTransition>
  );
}