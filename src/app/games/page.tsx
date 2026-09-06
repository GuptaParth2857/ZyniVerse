"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type GameTab = "plot" | "ost" | "silhouette";

const TABS: { key: GameTab; icon: string; label: string; desc: string }[] = [
  { key: "plot", icon: "📖", label: "Guess the Plot", desc: "Read the plot, guess the anime" },
  { key: "ost", icon: "🎵", label: "Guess the OST", desc: "Name the song, name the anime" },
  { key: "silhouette", icon: "🎭", label: "Silhouette Quiz", desc: "Spot the character" },
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

function HintRow({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm animate-in slide-in-from-bottom-2 fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="text-[var(--color-cyan)] font-mono text-xs mt-0.5 shrink-0">#{index + 1}</span>
      <span className="text-[var(--color-text)]">{text}</span>
    </div>
  );
}

function PlotGame() {
  const [state, setState] = useState<GameState>(makeEmpty);
  const [stats, setStats] = useState({ played: 0, won: 0 });
  const [error, setError] = useState("");

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
    fetchGame();
  }, [fetchGame]);

  const gd = state.gameData as { plot?: string; genres?: string[]; year?: number };

  async function submit() {
    if (!state.guess.trim() || state.gameOver) return;
    setError("");
    try {
      const res = await fetch("/api/games/guess-plot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: state.guess.trim(), attempts: state.attempts }),
      });
      const data = await res.json();
      const newHints = [...state.hints, ...(data.hints || [])];
      const won = data.correct;
      setState((s) => ({
        ...s,
        guess: "",
        attempts: data.attempts,
        gameOver: data.gameOver,
        won,
        target: data.target || s.target,
        hints: newHints,
      }));
      if (data.gameOver) {
        const newStats = { played: stats.played + 1, won: stats.won + (won ? 1 : 0) };
        setStats(newStats);
        localStorage.setItem("zyni-guess-plot-stats", JSON.stringify(newStats));
      }
    } catch { setError("Failed to submit guess"); }
  }

  if (state.loading) return <div className="flex items-center justify-center py-16"><div className="h-6 w-6 rounded-full border-2 border-[var(--color-cyan)] border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)] mb-3">Today&apos;s Plot</p>
        <p className="text-base text-[var(--color-text)] leading-relaxed italic">&ldquo;{gd.plot || "..."}&rdquo;</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(gd.genres || []).map((g) => (
            <span key={g} className="px-2 py-0.5 rounded-full bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] text-[11px] font-medium">{g}</span>
          ))}
          {gd.year && <span className="px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-mute)] text-[11px]">{gd.year}</span>}
        </div>
      </div>

      <div className="space-y-2">
        {state.hints.map((h, i) => <HintRow key={i} text={h} index={i} />)}
      </div>

      {state.gameOver ? (
        <div className={`rounded-xl p-5 text-center ${state.won ? "bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30" : "bg-red-500/10 border border-red-500/30"}`}>
          <p className="text-lg font-bold mb-1">{state.won ? "🎉 Correct!" : "😢 Game Over"}</p>
          <p className="text-sm text-[var(--color-mute)]">The answer was <span className="text-[var(--color-cyan)] font-semibold">{state.target?.title}</span></p>
          <Link href={`/anime/${state.target?.mediaId}`} className="mt-2 inline-block text-sm text-[var(--color-cyan)] hover:underline">View Anime →</Link>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
          <input
            value={state.guess}
            onChange={(e) => setState((s) => ({ ...s, guess: e.target.value }))}
            placeholder="Type anime name..."
            className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors placeholder:text-[var(--color-mute)]"
          />
          <button type="submit" className="rounded-xl px-6 py-3 text-sm font-bold bg-[var(--color-cyan)] text-black hover:opacity-90 transition-opacity shrink-0">Guess</button>
        </form>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-4 text-center">
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-[var(--color-cyan)]">{stats.played}</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Played</div></div>
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-green-400">{stats.played ? Math.round((stats.won / stats.played) * 100) : 0}%</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Win Rate</div></div>
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-[var(--color-magenta)]">{state.attempts}/6</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Attempts</div></div>
      </div>
    </div>
  );
}

function OstGame() {
  const [state, setState] = useState<GameState>(makeEmpty);
  const [stats, setStats] = useState({ played: 0, won: 0 });
  const [error, setError] = useState("");

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
    fetchGame();
  }, [fetchGame]);

  const gd = state.gameData as { song?: string; artist?: string; type?: string; hint?: string };

  async function submit() {
    if (!state.guess.trim() || state.gameOver) return;
    setError("");
    try {
      const res = await fetch("/api/games/guess-ost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: state.guess.trim(), attempts: state.attempts }),
      });
      const data = await res.json();
      const newHints = [...state.hints, ...(data.hints || [])];
      const won = data.correct;
      setState((s) => ({ ...s, guess: "", attempts: data.attempts, gameOver: data.gameOver, won, target: data.target || s.target, hints: newHints }));
      if (data.gameOver) {
        const ns = { played: stats.played + 1, won: stats.won + (won ? 1 : 0) };
        setStats(ns);
        localStorage.setItem("zyni-guess-ost-stats", JSON.stringify(ns));
      }
    } catch { setError("Failed to submit guess"); }
  }

  if (state.loading) return <div className="flex items-center justify-center py-16"><div className="h-6 w-6 rounded-full border-2 border-[var(--color-magenta)] border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)] mb-3">Today&apos;s Track</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
            {gd.type === "OP" ? "🎙" : gd.type === "ED" ? "🎶" : "🎼"}
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-text)]">{gd.song || "..."}</p>
            <p className="text-sm text-[var(--color-mute)]">by {gd.artist || "..."}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-[var(--color-text)]/70 italic">&ldquo;{gd.hint || ""}&rdquo;</p>
      </div>

      <div className="space-y-2">
        {state.hints.map((h, i) => <HintRow key={i} text={h} index={i} />)}
      </div>

      {state.gameOver ? (
        <div className={`rounded-xl p-5 text-center ${state.won ? "bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30" : "bg-red-500/10 border border-red-500/30"}`}>
          <p className="text-lg font-bold mb-1">{state.won ? "🎉 Correct!" : "😢 Game Over"}</p>
          <p className="text-sm text-[var(--color-mute)]">The anime was <span className="text-[var(--color-cyan)] font-semibold">{state.target?.title}</span></p>
          <Link href={`/anime/${state.target?.mediaId}`} className="mt-2 inline-block text-sm text-[var(--color-cyan)] hover:underline">View Anime →</Link>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
          <input value={state.guess} onChange={(e) => setState((s) => ({ ...s, guess: e.target.value }))}
            placeholder="Which anime is this song from?" className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm outline-none focus:border-[var(--color-magenta)] transition-colors placeholder:text-[var(--color-mute)]" />
          <button type="submit" className="rounded-xl px-6 py-3 text-sm font-bold bg-[var(--color-magenta)] text-black hover:opacity-90 transition-opacity shrink-0">Guess</button>
        </form>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-4 text-center">
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-[var(--color-magenta)]">{stats.played}</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Played</div></div>
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-green-400">{stats.played ? Math.round((stats.won / stats.played) * 100) : 0}%</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Win Rate</div></div>
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-[var(--color-cyan)]">{state.attempts}/6</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Attempts</div></div>
      </div>
    </div>
  );
}

function SilhouetteGame() {
  const [state, setState] = useState<GameState>(makeEmpty);
  const [stats, setStats] = useState({ played: 0, won: 0 });
  const [error, setError] = useState("");

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
    fetchGame();
  }, [fetchGame]);

  const gd = state.gameData as { imageUrl?: string; hint?: string };

  const computedBlur = state.gameOver ? 0 : state.attempts >= 1 ? Math.max(4, 20 - state.attempts * 4) : 20;

  async function submit() {
    if (!state.guess.trim() || state.gameOver) return;
    setError("");
    try {
      const res = await fetch("/api/games/silhouette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: state.guess.trim(), attempts: state.attempts }),
      });
      const data = await res.json();
      const newHints = [...state.hints, ...(data.hints || [])];
      const won = data.correct;
      setState((s) => ({ ...s, guess: "", attempts: data.attempts, gameOver: data.gameOver, won, target: data.target || s.target, hints: newHints }));
      if (data.gameOver) {
        const ns = { played: stats.played + 1, won: stats.won + (won ? 1 : 0) };
        setStats(ns);
        localStorage.setItem("zyni-silhouette-stats", JSON.stringify(ns));
      }
    } catch { setError("Failed to submit guess"); }
  }

  if (state.loading) return <div className="flex items-center justify-center py-16"><div className="h-6 w-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col items-center">
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)] mb-4">Who&apos;s This?</p>
        <div className="relative h-48 w-48 rounded-2xl overflow-hidden border-2 border-white/10 bg-[#0a0a14]">
          {gd.imageUrl ? (
            <Image src={gd.imageUrl} alt="?" fill className="object-cover transition-all duration-700" style={{ filter: `blur(${computedBlur}px) brightness(0.3) grayscale(${Math.min(computedBlur * 3, 100)}%)` }} sizes="192px" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">?</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="text-[10px] font-mono text-white/40 bg-black/50 px-2 py-0.5 rounded">Blur: {computedBlur.toFixed(0)}px</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {state.hints.map((h, i) => <HintRow key={i} text={h} index={i} />)}
      </div>

      {state.gameOver ? (
        <div className={`rounded-xl p-5 text-center ${state.won ? "bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30" : "bg-red-500/10 border border-red-500/30"}`}>
          <p className="text-lg font-bold mb-1">{state.won ? "🎉 Correct!" : "😢 Game Over"}</p>
          <p className="text-sm text-[var(--color-mute)]">
            It was <span className="text-[var(--color-cyan)] font-semibold">{state.target?.character}</span> from <span className="text-[var(--color-magenta)] font-semibold">{state.target?.anime}</span>
          </p>
          {state.target?.imageUrl && (
            <div className="mt-3 flex justify-center">
              <div className="relative h-32 w-24 rounded-lg overflow-hidden border border-[var(--color-cyan)]/30">
                <Image src={state.target.imageUrl} alt={state.target.character || ""} fill className="object-cover" sizes="96px" unoptimized />
              </div>
            </div>
          )}
          <Link href={`/anime/${state.target?.mediaId}`} className="mt-2 inline-block text-sm text-[var(--color-cyan)] hover:underline">View Anime →</Link>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
          <input value={state.guess} onChange={(e) => setState((s) => ({ ...s, guess: e.target.value }))}
            placeholder="Character name or anime name?" className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-colors placeholder:text-[var(--color-mute)]" />
          <button type="submit" className="rounded-xl px-6 py-3 text-sm font-bold bg-yellow-400 text-black hover:opacity-90 transition-opacity shrink-0">Guess</button>
        </form>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-4 text-center">
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-yellow-400">{stats.played}</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Played</div></div>
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-green-400">{stats.played ? Math.round((stats.won / stats.played) * 100) : 0}%</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Win Rate</div></div>
        <div className="flex-1 rounded-lg bg-white/[0.03] p-3"><div className="text-xl font-bold font-mono text-[var(--color-magenta)]">{state.attempts}/6</div><div className="text-[10px] text-[var(--color-mute)] uppercase">Attempts</div></div>
      </div>
    </div>
  );
}

export default function GamesPage() {
  const [tab, setTab] = useState<GameTab>("plot");

  return (
    <div className="min-h-screen animate-page-in">
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[var(--color-void)]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[var(--color-magenta)]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[var(--color-cyan)]/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="neon-rgb-border rounded-xl h-12 w-12 flex items-center justify-center bg-[var(--color-panel)]/60 backdrop-blur-sm">
              <span className="text-2xl">🎮</span>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]" style={{ textShadow: "0 0 10px rgba(0,255,255,0.5)" }}>Mini Games</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-ink)]">
            Anime <span className="text-[var(--color-cyan)]">Games</span>
          </h1>
          <p className="mt-3 text-base text-[var(--color-mute)] max-w-lg">
            Test your anime knowledge — guess from plots, identify theme songs, or spot characters by silhouette!
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-cyan)] to-transparent shadow-[0_0_10px_rgba(0,255,255,0.3)]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                tab === t.key ? "bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30 text-[var(--color-cyan)]" : "bg-white/[0.03] border border-white/[0.06] text-[var(--color-mute)] hover:text-[var(--color-text)]"
              }`}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {tab === "plot" && <PlotGame />}
          {tab === "ost" && <OstGame />}
          {tab === "silhouette" && <SilhouetteGame />}
        </div>
      </div>
    </div>
  );
}
