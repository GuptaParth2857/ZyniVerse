"use client";

import { useState, useEffect } from "react";

interface ScoreEntry {
  name: string;
  score: number;
  total: number;
  time: number;
  date: string;
}

export default function QuizLeaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [myBest, setMyBest] = useState<ScoreEntry | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("quizScores") || "[]") as ScoreEntry[];
      const sorted = stored.sort((a, b) => {
        const aPct = a.score / a.total;
        const bPct = b.score / b.total;
        if (bPct !== aPct) return bPct - aPct;
        return a.time - b.time;
      });
      setScores(sorted.slice(0, 20));
      if (sorted.length > 0) setMyBest(sorted[0]);
    } catch {
      setScores([]);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
      <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-amber)]">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 6 9z" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 18 9z" />
          <path d="M4 22h16" />
          <path d="M10 22V8h4v14" />
          <path d="M10 8h4" />
        </svg>
        Leaderboard
      </h3>

      {myBest && (
        <div className="mb-4 rounded-lg border border-[var(--color-violet)]/30 bg-[var(--color-violet)]/5 p-3">
          <p className="text-[10px] text-[var(--color-mute)] uppercase tracking-wider mb-1">Your Best</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{myBest.score}/{myBest.total}</span>
            <span className="text-xs text-[var(--color-mute)]">{myBest.time}s</span>
          </div>
        </div>
      )}

      {scores.length === 0 ? (
        <p className="text-sm text-[var(--color-mute)] py-4 text-center">No scores yet. Complete a quiz to show up here!</p>
      ) : (
        <div className="space-y-1">
          {scores.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition-colors">
              <span className={`w-6 text-center font-mono text-xs font-bold ${
                i === 0 ? "text-[var(--color-amber)]" : i === 1 ? "text-[var(--color-mute)]" : i === 2 ? "text-orange-600" : "text-[var(--color-mute)]"
              }`}>{i + 1}</span>
              <span className="flex-1 truncate font-medium">{s.name}</span>
              <span className="font-mono text-xs text-[var(--color-cyan)]">{s.score}/{s.total}</span>
              <span className="font-mono text-[10px] text-[var(--color-mute)]">{s.time}s</span>
              <span className="text-[10px] text-[var(--color-mute)]">{s.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
