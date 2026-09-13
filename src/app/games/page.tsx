"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type GameTab = "plot" | "ost" | "silhouette";

const TABS: { key: GameTab; icon: string; label: string; color: string }[] = [
  { key: "plot", icon: "📖", label: "Guess the Plot", color: "#00ffe0" },
  { key: "ost", icon: "🎵", label: "Guess the OST", color: "#ff7ad9" },
  { key: "silhouette", icon: "🎭", label: "Silhouette Quiz", color: "#ffd700" },
];

interface GameState {
  loading: boolean;
  guess: string;
  attempts: number;
  gameOver: boolean;
  won: boolean;
  target: { title?: string; character?: string; anime?: string; mediaId?: number; imageUrl?: string } | null;
  hints: string[];
  gameData: Record<string, unknown>;
}

function makeEmpty(): GameState {
  return { loading: true, guess: "", attempts: 0, gameOver: false, won: false, target: null, hints: [], gameData: {} };
}

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

function HintRow({ text, index, accent }: { text: string; index: number; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: index * 0.08, ...spring }}
      className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5"
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-black"
        style={{ background: accent }}
      >
        {index + 1}
      </span>
      <span className="text-sm leading-relaxed text-[var(--color-ink)]">{text}</span>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex-1 rounded-xl border border-white/[0.06] bg-black/25 p-3 text-center">
      <motion.p
        key={String(value)}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
        className="font-mono text-xl font-black tabular-nums"
        style={{ color }}
      >
        {value}
      </motion.p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">{label}</p>
    </div>
  );
}

function GuessInput({ value, onChange, onSubmit, color, placeholder }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; color: string; placeholder: string;
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-[var(--color-mute)] focus:border-white/20 focus:bg-black/40"
        style={{ caretColor: color }}
      />
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        type="submit"
        className="shrink-0 rounded-xl px-7 py-3.5 text-sm font-black uppercase tracking-wider text-black transition-all"
        style={{ background: color, boxShadow: `0 0 22px ${color}44` }}
      >
        Guess
      </motion.button>
    </form>
  );
}

function GameOverBanner({ won, title, mediaId, accent, children }: {
  won: boolean; title?: string; mediaId?: number; accent: string; children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring}
      className="overflow-hidden rounded-2xl border p-6 text-center"
      style={{
        borderColor: won ? `${accent}55` : "rgba(255,50,50,0.4)",
        background: won ? `${accent}10` : "rgba(255,50,50,0.08)",
      }}
    >
      {won && (
        <motion.span
          animate={{ rotate: [0, 14, -14, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block text-4xl"
        >
          🎉
        </motion.span>
      )}
      <p className="mt-2 text-xl font-black" style={{ color: won ? accent : "#ff5050" }}>
        {won ? "Correct!" : "Game Over"}
      </p>
      {title && (
        <p className="mt-1.5 text-sm text-[var(--color-mute)]">
          Answer: <span className="font-bold" style={{ color: accent }}>{title}</span>
        </p>
      )}
      {children}
      {mediaId != null && (
        <Link
          href={`/anime/${mediaId}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold transition-all hover:bg-white/5"
          style={{ borderColor: `${accent}44`, color: accent }}
        >
          View Anime →
        </Link>
      )}
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="shimmer h-4 w-32 rounded" />
      <div className="shimmer h-24 w-full rounded-2xl" />
      <div className="space-y-2"><div className="shimmer h-10 w-full rounded-xl" /><div className="shimmer h-10 w-full rounded-xl" /></div>
      <div className="shimmer h-14 w-full rounded-xl" />
      <div className="flex gap-3">
        <div className="shimmer h-16 flex-1 rounded-xl" /><div className="shimmer h-16 flex-1 rounded-xl" /><div className="shimmer h-16 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

function PlotGame() {
  const [state, setState] = useState<GameState>(makeEmpty);
  const [stats, setStats] = useState({ played: 0, won: 0 });
  const [error, setError] = useState("");
  const A = "#00ffe0";

  const fetchGame = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch("/api/games/guess-plot");
      const data = await res.json();
      setState((s) => ({ ...s, loading: false, gameData: data }));
      const saved = localStorage.getItem("zyni-guess-plot-stats");
      if (saved) setStats(JSON.parse(saved));
    } catch { setState((s) => ({ ...s, loading: false })); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchGame();
  }, [fetchGame]);

  const gd = state.gameData as { plot?: string; genres?: string[]; year?: number };

  async function submit() {
    if (!state.guess.trim() || state.gameOver) return;
    setError("");
    try {
      const res = await fetch("/api/games/guess-plot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guess: state.guess.trim(), attempts: state.attempts }) });
      const data = await res.json();
      const won = data.correct;
      setState((s) => ({ ...s, guess: "", attempts: data.attempts, gameOver: data.gameOver, won, target: data.target || s.target, hints: [...s.hints, ...(data.hints || [])] }));
      if (data.gameOver) { const ns = { played: stats.played + 1, won: stats.won + (won ? 1 : 0) }; setStats(ns); localStorage.setItem("zyni-guess-plot-stats", JSON.stringify(ns)); }
    } catch { setError("Failed to submit guess"); }
  }

  if (state.loading) return <div className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-7"><LoadingSkeleton /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 120% at 75% -10%, ${A}14, transparent 55%), radial-gradient(120% 120% at 10% 110%, ${A}0a, transparent 55%)` }} />
      <div className="relative z-10 p-5 sm:p-7">
        <p className="console-label mb-4">📖 Today&apos;s Plot</p>
        <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-5">
          <p className="text-lg leading-relaxed italic text-[var(--color-ink)]">&ldquo;{gd.plot || "..."}&rdquo;</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(gd.genres || []).map((g) => <span key={g} className="rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ borderColor: `${A}33`, color: A, background: `${A}10` }}>{g}</span>)}
            {gd.year && <span className="rounded-full border border-white/[0.08] bg-black/25 px-3 py-1 text-[11px] text-[var(--color-mute)]">{gd.year}</span>}
          </div>
        </div>
        <div className="mt-5 space-y-2">{state.hints.map((h, i) => <HintRow key={i} text={h} index={i} accent={A} />)}</div>
        {state.gameOver
          ? <div className="mt-5"><GameOverBanner won={state.won} title={state.target?.title} mediaId={state.target?.mediaId} accent={A} /></div>
          : <div className="mt-5"><GuessInput value={state.guess} onChange={(v) => setState((s) => ({ ...s, guess: v }))} onSubmit={submit} color={A} placeholder="Type anime name..." /></div>}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-5 flex gap-3">
          <StatCard label="Played" value={stats.played} color={A} />
          <StatCard label="Win Rate" value={stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%"} color="#4ade80" />
          <StatCard label="Attempts" value={`${state.attempts}/6`} color="#ff7ad9" />
        </div>
      </div>
    </motion.div>
  );
}

function OstGame() {
  const [state, setState] = useState<GameState>(makeEmpty);
  const [stats, setStats] = useState({ played: 0, won: 0 });
  const [error, setError] = useState("");
  const A = "#ff7ad9";

  const fetchGame = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch("/api/games/guess-ost");
      const data = await res.json();
      setState((s) => ({ ...s, loading: false, gameData: data }));
      const saved = localStorage.getItem("zyni-guess-ost-stats");
      if (saved) setStats(JSON.parse(saved));
    } catch { setState((s) => ({ ...s, loading: false })); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchGame();
  }, [fetchGame]);

  const gd = state.gameData as { song?: string; artist?: string; type?: string; hint?: string };

  async function submit() {
    if (!state.guess.trim() || state.gameOver) return;
    setError("");
    try {
      const res = await fetch("/api/games/guess-ost", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guess: state.guess.trim(), attempts: state.attempts }) });
      const data = await res.json();
      const won = data.correct;
      setState((s) => ({ ...s, guess: "", attempts: data.attempts, gameOver: data.gameOver, won, target: data.target || s.target, hints: [...s.hints, ...(data.hints || [])] }));
      if (data.gameOver) { const ns = { played: stats.played + 1, won: stats.won + (won ? 1 : 0) }; setStats(ns); localStorage.setItem("zyni-guess-ost-stats", JSON.stringify(ns)); }
    } catch { setError("Failed to submit guess"); }
  }

  if (state.loading) return <div className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-7"><LoadingSkeleton /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 120% at 75% -10%, ${A}14, transparent 55%), radial-gradient(120% 120% at 10% 110%, ${A}0a, transparent 55%)` }} />
      <div className="relative z-10 p-5 sm:p-7">
        <p className="console-label mb-4">🎵 Today&apos;s Track</p>
        <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-5">
          <div className="flex items-center gap-4">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: `${A}14`, border: `1px solid ${A}33` }}>
              {gd.type === "OP" ? "🎙" : gd.type === "ED" ? "🎶" : "🎼"}
            </motion.div>
            <div><p className="text-lg font-bold text-[var(--color-ink)]">{gd.song || "..."}</p><p className="text-sm text-[var(--color-mute)]">by {gd.artist || "..."}</p></div>
          </div>
          {gd.hint && <p className="mt-3 border-t border-white/[0.06] pt-3 text-sm italic text-[var(--color-mute)]">&ldquo;{gd.hint}&rdquo;</p>}
        </div>
        <div className="mt-5 space-y-2">{state.hints.map((h, i) => <HintRow key={i} text={h} index={i} accent={A} />)}</div>
        {state.gameOver
          ? <div className="mt-5"><GameOverBanner won={state.won} title={state.target?.title} mediaId={state.target?.mediaId} accent={A} /></div>
          : <div className="mt-5"><GuessInput value={state.guess} onChange={(v) => setState((s) => ({ ...s, guess: v }))} onSubmit={submit} color={A} placeholder="Which anime is this song from?" /></div>}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-5 flex gap-3">
          <StatCard label="Played" value={stats.played} color={A} />
          <StatCard label="Win Rate" value={stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%"} color="#4ade80" />
          <StatCard label="Attempts" value={`${state.attempts}/6`} color="#00ffe0" />
        </div>
      </div>
    </motion.div>
  );
}

function SilhouetteGame() {
  const [state, setState] = useState<GameState>(makeEmpty);
  const [stats, setStats] = useState({ played: 0, won: 0 });
  const [error, setError] = useState("");
  const A = "#ffd700";

  const fetchGame = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch("/api/games/silhouette");
      const data = await res.json();
      setState((s) => ({ ...s, loading: false, gameData: data }));
      const saved = localStorage.getItem("zyni-silhouette-stats");
      if (saved) setStats(JSON.parse(saved));
    } catch { setState((s) => ({ ...s, loading: false })); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchGame();
  }, [fetchGame]);

  const gd = state.gameData as { imageUrl?: string; hint?: string };
  const blur = state.gameOver ? 0 : Math.max(4, 22 - state.attempts * 5);

  async function submit() {
    if (!state.guess.trim() || state.gameOver) return;
    setError("");
    try {
      const res = await fetch("/api/games/silhouette", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guess: state.guess.trim(), attempts: state.attempts }) });
      const data = await res.json();
      const won = data.correct;
      setState((s) => ({ ...s, guess: "", attempts: data.attempts, gameOver: data.gameOver, won, target: data.target || s.target, hints: [...s.hints, ...(data.hints || [])] }));
      if (data.gameOver) { const ns = { played: stats.played + 1, won: stats.won + (won ? 1 : 0) }; setStats(ns); localStorage.setItem("zyni-silhouette-stats", JSON.stringify(ns)); }
    } catch { setError("Failed to submit guess"); }
  }

  if (state.loading) return <div className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-7"><LoadingSkeleton /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 120% at 75% -10%, ${A}14, transparent 55%), radial-gradient(120% 120% at 10% 110%, ${A}0a, transparent 55%)` }} />
      <div className="relative z-10 p-5 sm:p-7">
        <p className="console-label mb-4">🎭 Who&apos;s This?</p>
        <div className="flex flex-col items-center">
          <div className="relative h-52 w-52 overflow-hidden rounded-2xl border-2 border-white/10 bg-[#0a0910]">
            {gd.imageUrl
              ? <Image src={gd.imageUrl} alt="?" fill className="object-cover transition-all duration-1000" style={{ filter: `blur(${blur}px) brightness(0.35) grayscale(${Math.min(blur * 4, 100)}%)` }} sizes="208px" unoptimized />
              : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">?</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] text-white/60 backdrop-blur-sm">Blur: {blur.toFixed(0)}px</span>
              <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] text-white/60 backdrop-blur-sm">{state.attempts}/6</span>
            </div>
            {state.gameOver && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-black/20"><motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl">✨</motion.span></motion.div>}
          </div>
        </div>
        <div className="mt-5 space-y-2">{state.hints.map((h, i) => <HintRow key={i} text={h} index={i} accent={A} />)}</div>
        {state.gameOver
          ? <div className="mt-5"><GameOverBanner won={state.won} title={state.target?.character ? `${state.target.character} (${state.target.anime})` : state.target?.anime} mediaId={state.target?.mediaId} accent={A}>
              {state.target?.imageUrl && <div className="mt-3 flex justify-center"><div className="relative h-28 w-20 overflow-hidden rounded-xl border border-white/10"><Image src={state.target.imageUrl} alt="" fill className="object-cover" sizes="80px" unoptimized /></div></div>}
            </GameOverBanner></div>
          : <div className="mt-5"><GuessInput value={state.guess} onChange={(v) => setState((s) => ({ ...s, guess: v }))} onSubmit={submit} color={A} placeholder="Character or anime name?" /></div>}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-5 flex gap-3">
          <StatCard label="Played" value={stats.played} color={A} />
          <StatCard label="Win Rate" value={stats.played ? `${Math.round((stats.won / stats.played) * 100)}%` : "0%"} color="#4ade80" />
          <StatCard label="Attempts" value={`${state.attempts}/6`} color="#ff7ad9" />
        </div>
      </div>
    </motion.div>
  );
}

export default function GamesPage() {
  const [tab, setTab] = useState<GameTab>("plot");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]" style={{ background: "radial-gradient(45% 50% at 15% 10%, rgba(0,255,224,0.35), transparent 70%), radial-gradient(50% 50% at 85% 15%, rgba(255,122,217,0.35), transparent 70%), radial-gradient(40% 40% at 50% 90%, rgba(255,215,0,0.25), transparent 70%)" }} />

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="neon-banner-card relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-10 backdrop-blur-sm sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <p className="console-label mb-3">✦ Mini Games · Daily Challenges</p>
            <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">Anime Games 🎮</h1>
            <p className="mt-3 text-sm text-[var(--color-mute)]">Test your anime knowledge — guess from plots, identify theme songs, or spot characters by silhouette!</p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            {TABS.map((t, i) => (
              <motion.div key={t.key} animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }} className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/25 text-2xl" style={{ boxShadow: `0 0 14px ${t.color}22` }}>{t.icon}</motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${tab === t.key ? "text-black" : "border-white/[0.07] bg-black/20 text-[var(--color-mute)] hover:text-white"}`}>
            {tab === t.key && <motion.span layoutId="game-tab-bg" className="absolute inset-0 rounded-xl" style={{ background: t.color, boxShadow: `0 0 20px ${t.color}44` }} transition={spring} />}
            <span className="relative z-10">{t.icon}</span>
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-[420px]">
        <AnimatePresence mode="wait">
          {tab === "plot" && <PlotGame key="plot" />}
          {tab === "ost" && <OstGame key="ost" />}
          {tab === "silhouette" && <SilhouetteGame key="silhouette" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
