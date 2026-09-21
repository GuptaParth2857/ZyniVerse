"use client";

import { useEffect, useState } from "react";

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function getParts(target: number): Parts {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: false,
  };
}

export default function IndianDubCountdown({
  target,
  size = "md",
}: {
  target: number;
  size?: "md" | "lg";
}) {
  const [parts, setParts] = useState<Parts>(() => getParts(target));

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells: { key: keyof Parts; label: string }[] = [
    { key: "days", label: "days" },
    { key: "hours", label: "hours" },
    { key: "minutes", label: "mins" },
    { key: "seconds", label: "secs" },
  ];

  if (parts.done) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-cyan)]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-cyan)]" />
        Dropping tonight — tune in
      </div>
    );
  }

  const box = size === "lg" ? "w-14 py-3 text-2xl sm:w-16 sm:text-3xl" : "min-w-[3.25rem] px-2 py-2 text-xl";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {cells.map(({ key, label }, i) => {
        const val = String(parts[key] ?? 0).padStart(2, "0");
        return (
          <div key={key} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`${box} rounded-xl border border-white/10 bg-white/[0.04] text-center backdrop-blur-sm`}
            >
              <div
                className={`font-display font-black tabular-nums ${
                  key === "seconds" ? "text-[var(--color-cyan)]" : "text-white"
                }`}
              >
                {val}
              </div>
              <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-[var(--color-mute)] sm:text-[9px]">
                {label}
              </div>
            </div>
            {i < cells.length - 1 && <span className="font-display text-lg text-[var(--color-magenta)]">:</span>}
          </div>
        );
      })}
    </div>
  );
}