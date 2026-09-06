"use client";

import { useState } from "react";

interface Ep {
  episode: number;
  title: string;
  type: string;
}

export default function FillerChecklist({ episodes, storageKey }: { episodes: Ep[]; storageKey: string }) {
  const [checked, setChecked] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set<number>();
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return new Set<number>();
      return new Set<number>(JSON.parse(raw) as number[]);
    } catch {
      return new Set<number>();
    }
  });

  function toggle(ep: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(ep)) next.delete(ep);
      else next.add(ep);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  function clear() {
    setChecked(new Set<number>());
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }

  return (
    <div className="mb-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
          My Watch Checklist
        </h2>
        {checked.size > 0 && (
          <button onClick={clear} className="text-[10px] text-[var(--color-mute)] hover:text-red-400 transition-colors">Reset</button>
        )}
      </div>
      <p className="mb-3 text-xs text-[var(--color-mute)]">
        {checked.size} / {episodes.length} seen · progress saved on this device
      </p>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--color-line)]">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all duration-300"
          style={{ width: `${episodes.length ? Math.round((checked.size / episodes.length) * 100) : 0}%` }} />
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto pr-1">
        {episodes.map((ep) => {
          const done = checked.has(ep.episode);
          return (
            <button
              key={ep.episode}
              onClick={() => toggle(ep.episode)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                done ? "border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10" : "border-[var(--color-line)] bg-black/15 hover:border-[var(--color-cyan)]/30"
              }`}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${done ? "bg-[var(--color-cyan)] text-black border-[var(--color-cyan)]" : "border-[var(--color-mute)]"}`}>
                {done ? "✓" : ""}
              </span>
              <span className={`truncate text-xs ${done ? "text-[var(--color-cyan)] line-through" : "text-[var(--color-ink)]"}`}>
                EP {ep.episode} — {ep.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}