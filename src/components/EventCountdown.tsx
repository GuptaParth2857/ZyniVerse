"use client";

import { useEffect, useState } from "react";

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function getParts(target: number): CountdownParts {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

const CELLS: { key: keyof CountdownParts; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Mins" },
  { key: "seconds", label: "Secs" },
];

export default function EventCountdown({ target }: { target: string }) {
  const [parts, setParts] = useState<CountdownParts>(() =>
    getParts(new Date(target).getTime())
  );

  useEffect(() => {
    const targetTime = new Date(target).getTime();
    const id = setInterval(() => setParts(getParts(targetTime)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (parts.done) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        Event has started
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {CELLS.map(({ key, label }) => {
        const value = parts[key];
        const isSeconds = key === "seconds";
        return (
          <div
            key={key}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-center backdrop-blur-sm"
          >
            <div
              className={`font-display text-xl sm:text-2xl font-black tabular-nums ${
                isSeconds ? "text-[var(--color-cyan)]" : "text-white"
              }`}
            >
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-mute)]/60">
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
