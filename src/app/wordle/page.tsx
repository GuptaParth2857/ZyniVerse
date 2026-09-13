"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimeWordle from "@/components/AnimeWordle";

interface WordleStats {
  totalGames: number;
  wins: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
}

const TILES = [
  { icon: "🎮", color: "#8a2be2" },
  { icon: "🧠", color: "#ff7ad9" },
  { icon: "🎯", color: "#ffd700" },
  { icon: "✨", color: "#00ff7c" },
];

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

function StatTile({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, ...spring }}
      whileHover={{ y: -3 }}
      className="rounded-xl border border-white/[0.07] bg-black/25 p-3 text-center"
    >
      <motion.p
        key={String(value)}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
        className="font-mono text-xl font-black tabular-nums"
        style={{ color, textShadow: `0 0 18px ${color}55` }}
      >
        {value}
      </motion.p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--color-mute)]">{label}</p>
    </motion.div>
  );
}

function DistributionBar({ rank, count, maxCount, delay = 0 }: { rank: number; count: number; maxCount: number; delay?: number }) {
  const pct = count > 0 ? Math.max(12, (count / maxCount) * 100) : 0;
  const color = count > 0 ? "#00ff7c" : "#c9b6ff";
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 text-[10px] font-mono text-[var(--color-mute)]">{rank}</span>
      <div className="h-4 flex-1 overflow-hidden rounded bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-full items-center justify-end rounded bg-gradient-to-r from-[#8a2be2]/70 to-[#00ff7c] px-1.5"
          style={{ boxShadow: `0 0 14px ${color}44` }}
        >
          {count > 0 && <span className="text-[9px] font-mono font-bold text-black">{count}</span>}
        </motion.div>
      </div>
    </div>
  );
}

function StatsCard({ stats }: { stats: WordleStats }) {
  const maxCount = Math.max(...Object.values(stats.guessDistribution), 1);
  return (
    <div className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-6 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 75% -10%, rgba(138,43,226,0.16), transparent 55%), radial-gradient(120% 120% at 10% 110%, rgba(0,255,124,0.1), transparent 55%)" }} />
      <div className="relative z-10">
        <p className="console-label mb-4">📊 Your Stats</p>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Played" value={stats.totalGames} color="#00ffff" delay={0} />
          <StatTile label="Win %" value={stats.winPercentage} color="#00ff7c" delay={0.05} />
          <StatTile label="Streak" value={stats.currentStreak} color="#ffd700" delay={0.1} />
          <StatTile label="Max" value={stats.maxStreak} color="#ff7ad9" delay={0.15} />
        </div>
        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Guess Distribution</p>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map((n, i) => (
              <DistributionBar key={n} rank={n} count={stats.guessDistribution[n] || 0} maxCount={maxCount} delay={0.15 + i * 0.06} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TipsCard() {
  const tips = [
    { color: "#00ff7c", text: "Start with popular, well-known anime for better hints" },
    { color: "#ffd700", text: "Pay attention to genre and studio hints" },
    { color: "#ff7ad9", text: "Try different eras (90s, 2000s, 2010s, 2020s)" },
    { color: "#00ffff", text: "Share your results with friends!" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, ...spring }} className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-6 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(110% 110% at 90% 0%, rgba(255,215,0,0.12), transparent 55%)" }} />
      <div className="relative z-10">
        <p className="console-label mb-4">🔥 Pro Tips</p>
        <ul className="space-y-3">
          {tips.map((t, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08, ...spring }} className="flex items-start gap-2.5">
              <motion.span animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}88` }} />
              <span className="text-xs leading-relaxed text-[var(--color-mute)]">{t.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function WordlePage() {
  const [stats, setStats] = useState<WordleStats | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/wordle/history");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="animate-page-in relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-50 blur-[120px]" style={{ background: "radial-gradient(45% 50% at 15% 10%, rgba(138,43,226,0.35), transparent 70%), radial-gradient(50% 50% at 85% 15%, rgba(0,255,124,0.3), transparent 70%), radial-gradient(40% 40% at 50% 90%, rgba(255,215,0,0.25), transparent 70%)" }} />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="neon-banner-card relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-10 backdrop-blur-sm sm:px-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <p className="console-label mb-3">✦ Mini Game · Daily Challenge</p>
            <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">Anime Wordle 🔮</h1>
            <p className="mt-3 text-sm text-[var(--color-mute)]">Guess the daily anime in 6 tries! Get hints about genre, format, year, and studio with each guess.</p>
            <div className="mt-5 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowHowTo(!showHowTo)}
                className="rounded-xl border border-white/[0.09] bg-black/25 px-5 py-2.5 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[#8a2be2]/50 hover:text-white"
              >
                {showHowTo ? "Hide How to Play" : "❓ How to Play"}
              </motion.button>
              <span className="hidden items-center gap-1.5 rounded-full border border-[#00ff7c]/30 bg-[#00ff7c]/10 px-3 py-1.5 text-[11px] font-bold text-[#00ff7c] sm:flex">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="inline-block">●</motion.span>
                New puzzle daily
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {TILES.map((t, i) => (
              <motion.div
                key={t.icon}
                animate={{ y: [0, -8, 0], rotate: [0, t.icon === "🎮" ? 8 : -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
                whileHover={{ scale: 1.1 }}
                className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/25 text-2xl sm:flex"
                style={{ boxShadow: `0 0 16px ${t.color}22`, color: t.color }}
              >
                {t.icon}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {showHowTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div initial={{ y: 12 }} animate={{ y: 0 }} className="group meme-card-border relative mt-6 overflow-hidden rounded-3xl bg-[#15121d]/90 p-6 backdrop-blur-sm sm:p-7">
              <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 20% 0%, rgba(138,43,226,0.16), transparent 55%)" }} />
              <div className="relative z-10">
                <p className="console-label mb-4">📋 How to Play</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    {[
                      "Type the name of any anime as your guess",
                      "After each guess, you get comparison hints",
                      "Use hints to narrow down the answer",
                      "You have 6 attempts to guess correctly",
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.07, ...spring }}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#8a2be2] text-[10px] font-black text-white" style={{ boxShadow: "0 0 12px rgba(138,43,226,0.5)" }}>{i + 1}</span>
                        <span className="text-sm text-[var(--color-ink)]">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#ff7ad9]">What the hints mean</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-lg border border-[#00ff7c]/30 bg-[#00ff7c]/10 px-2.5 py-1 font-semibold text-[#00ff7c]">Genre match</span>
                      <span className="rounded-lg border border-[#ffd700]/30 bg-[#ffd700]/10 px-2.5 py-1 font-semibold text-[#ffd700]">Format</span>
                      <span className="rounded-lg border border-[#00ffff]/30 bg-[#00ffff]/10 px-2.5 py-1 font-semibold text-[#00ffff]">Year</span>
                      <span className="rounded-lg border border-[#ff7ad9]/30 bg-[#ff7ad9]/10 px-2.5 py-1 font-semibold text-[#ff7ad9]">Studio</span>
                      <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-400">Episode count</span>
                    </div>
                    <p className="mt-3 text-[11px] text-[var(--color-mute)]">A new anime is available each day!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <AnimeWordle stats={stats || undefined} />
        </div>
        <aside className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...spring }}>
            {stats ? <StatsCard stats={stats} /> : (
              <div className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-6 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
                <div className="relative z-10 text-center">
                  <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="text-3xl">🤝</motion.span>
                  <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">Sign in to save stats</p>
                  <p className="mt-1 text-xs text-[var(--color-mute)]">Your plays, streaks &amp; distribution live on your account.</p>
                </div>
              </div>
            )}
          </motion.div>
          <TipsCard />
        </aside>
      </div>
    </div>
  );
}