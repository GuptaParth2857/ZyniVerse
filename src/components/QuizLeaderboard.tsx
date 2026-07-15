"use client";

import { useState, useEffect } from "react";

interface ScoreEntry {
  user: { id: string; username: string; avatar: string | null };
  bestScore: number;
  bestXp: number;
  category: string;
  difficulty: string;
  date: string;
}

export default function QuizLeaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quiz/scores?limit=20")
      .then((r) => r.json())
      .then((data) => setScores(data.scores || []))
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
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

      {loading ? (
        <p className="text-sm text-[var(--color-mute)] py-4 text-center">Loading...</p>
      ) : scores.length === 0 ? (
        <p className="text-sm text-[var(--color-mute)] py-4 text-center">No scores yet. Complete a quiz to show up here!</p>
      ) : (
        <div className="space-y-1">
          {scores.map((s, i) => (
            <div key={s.user.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition-colors">
              <span className={`w-6 text-center font-mono text-xs font-bold ${
                i === 0 ? "text-[var(--color-amber)]" : i === 1 ? "text-[var(--color-mute)]" : i === 2 ? "text-orange-600" : "text-[var(--color-mute)]"
              }`}>{i + 1}</span>
              {s.user.avatar ? (
                <img src={s.user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[var(--color-violet)]/20 flex items-center justify-center text-[9px] font-bold text-[var(--color-violet)]">
                  {s.user.username[0].toUpperCase()}
                </div>
              )}
              <span className="flex-1 truncate font-medium">{s.user.username}</span>
              <span className="font-mono text-xs text-[var(--color-cyan)]">{s.bestScore}</span>
              <span className="font-mono text-[10px] text-[var(--color-amber)]">{s.bestXp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
