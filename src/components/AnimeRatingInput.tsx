"use client";

import { useState } from "react";
import { useWatchlist } from "@/components/WatchlistProvider";

const SCORE_OPTIONS = [
  { value: 10, label: "10", color: "#10b981" },
  { value: 9, label: "9", color: "#10b981" },
  { value: 8, label: "8", color: "var(--color-cyan)" },
  { value: 7, label: "7", color: "var(--color-cyan)" },
  { value: 6, label: "6", color: "#f59e0b" },
  { value: 5, label: "5", color: "#f59e0b" },
  { value: 4, label: "4", color: "var(--color-magenta)" },
  { value: 3, label: "3", color: "var(--color-magenta)" },
  { value: 2, label: "2", color: "var(--color-magenta)" },
  { value: 1, label: "1", color: "var(--color-magenta)" },
];

export default function AnimeRatingInput({ mediaId, type = "ANIME" }: { mediaId: number; type?: string }) {
  const { getScore, rate } = useWatchlist();
  const currentScore = getScore(mediaId);
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleRate(score: number) {
    setSaving(true);
    try {
      rate(mediaId, score, type);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      rate(mediaId, null, type);
    } finally {
      setSaving(false);
    }
  }

  const displayScore = hoverScore ?? currentScore;

  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-bold flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
          Your Rating
        </h3>
        {currentScore && (
          <span className="font-mono text-sm font-bold text-[var(--color-magenta)]">
            {currentScore}/10
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SCORE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleRate(opt.value)}
            onMouseEnter={() => setHoverScore(opt.value)}
            onMouseLeave={() => setHoverScore(null)}
            disabled={saving}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
              displayScore === opt.value
                ? "text-black shadow-lg scale-110"
                : currentScore === opt.value
                  ? "border-2 text-black"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)]"
            }`}
            style={
              displayScore === opt.value
                ? { backgroundColor: opt.color }
                : currentScore === opt.value
                  ? { borderColor: opt.color, backgroundColor: `${opt.color}22` }
                  : undefined
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {currentScore && (
        <button
          onClick={handleClear}
          disabled={saving}
          className="mt-2 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors"
        >
          Clear rating
        </button>
      )}
    </div>
  );
}
