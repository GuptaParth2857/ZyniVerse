"use client";

import { useState, useEffect, useCallback } from "react";
import AnimeWordle from "@/components/AnimeWordle";

interface WordleStats {
  totalGames: number;
  wins: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
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
    <div className="min-h-screen animate-page-in">
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[var(--color-void)]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#8a2be2]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#ff00ff]/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="neon-rgb-border rounded-xl h-12 w-12 flex items-center justify-center bg-[var(--color-panel)]/60 backdrop-blur-sm">
                  <span className="text-2xl">{"\u{1F3AE}"}</span>
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#8a2be2]" style={{ textShadow: "0 0 10px rgba(138,43,226,0.5)" }}>Mini Game</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-ink)]" style={{ textShadow: "0 0 30px rgba(138,43,226,0.3), 0 0 60px rgba(255,0,255,0.2)" }}>
                Anime <span className="text-[#8a2be2]">Wordle</span>
              </h1>
              <p className="mt-3 text-base text-[var(--color-mute)] max-w-lg">
                Guess the daily anime in 6 tries! Get hints about genre, format, year, and studio with each guess.
              </p>
            </div>
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm px-5 py-2.5 text-sm font-bold text-[var(--color-cyan)]"
            >
              {"\u{2753}"} How to Play
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8a2be2] to-transparent shadow-[0_0_10px_rgba(138,43,226,0.5)]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {showHowTo && (
          <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-6 mb-8">
            <h2 className="font-display text-lg font-bold mb-3">{"\u{1F4CB}"} How to Play</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-[var(--color-mute)]">
              <div className="space-y-2">
                <p><span className="text-[var(--color-cyan)] font-bold">1.</span> Type the name of any anime as your guess</p>
                <p><span className="text-[var(--color-cyan)] font-bold">2.</span> After each guess, you get comparison hints</p>
                <p><span className="text-[var(--color-cyan)] font-bold">3.</span> Use hints to narrow down the answer</p>
                <p><span className="text-[var(--color-cyan)] font-bold">4.</span> You have 6 attempts to guess correctly</p>
              </div>
              <div className="space-y-2">
                <p><span className="text-[var(--color-magenta)] font-bold">Hints include:</span></p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-[#00ff7f]/10 text-[#00ff7f]">Genre match</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffd700]/10 text-[#ffd700]">Format</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#00ffff]/10 text-[#00ffff]">Year</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff00ff]/10 text-[#ff00ff]">Studio</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff3366]/10 text-[#ff3366]">Episode count</span>
                </div>
                <p className="text-[10px] mt-2">A new anime is available each day!</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div>
            <AnimeWordle stats={stats || undefined} />
          </div>

          <div className="space-y-4">
            <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-5">
              <h3 className="font-display text-sm font-bold mb-3">{"\u{1F4CA}"} Your Stats</h3>
              {stats ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Played", value: stats.totalGames, color: "#00ffff" },
                      { label: "Win %", value: stats.winPercentage, color: "#00ff7f" },
                      { label: "Streak", value: stats.currentStreak, color: "#ffd700" },
                      { label: "Max", value: stats.maxStreak, color: "#ff00ff" },
                    ].map((s) => (
                      <div key={s.label} className="text-center rounded-lg bg-white/5 border border-white/8 p-2">
                        <div className="text-lg font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[9px] text-[var(--color-mute)] uppercase">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[var(--color-mute)] uppercase mb-1.5">Guess Distribution</h4>
                    <div className="space-y-1">
                      {[1, 2, 3, 4, 5, 6].map((n) => {
                        const count = stats.guessDistribution[n] || 0;
                        const maxCount = Math.max(...Object.values(stats.guessDistribution), 1);
                        return (
                          <div key={n} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[var(--color-mute)] w-3">{n}</span>
                            <div className="flex-1 h-3 rounded bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]"
                                style={{ width: `${(count / maxCount) * 100}%`, minWidth: count > 0 ? "12px" : "0" }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-[var(--color-mute)] w-3 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-mute)]">Play a game to see your stats!</p>
              )}
            </div>

            <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-5">
              <h3 className="font-display text-sm font-bold mb-2">{"\u{1F525}"} Tips</h3>
              <ul className="text-[11px] text-[var(--color-mute)] space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00ff7f] mt-0.5">{"\u{25CF}"}</span>
                  <span>Start with popular, well-known anime for better hints</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ffd700] mt-0.5">{"\u{25CF}"}</span>
                  <span>Pay attention to genre and studio hints</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ff00ff] mt-0.5">{"\u{25CF}"}</span>
                  <span>Try different eras (90s, 2000s, 2010s, 2020s)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00ffff] mt-0.5">{"\u{25CF}"}</span>
                  <span>Share your results with friends!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
