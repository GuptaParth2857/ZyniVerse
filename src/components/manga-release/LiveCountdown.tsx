"use client";

import { useEffect, useState } from "react";

export function LiveCountdown({ target }: { target: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const cell = (v: number, label: string) => (
    <div className="flex min-w-[64px] flex-col items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="font-mono text-2xl font-black tabular-nums">
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cell(days, "days")}
      {cell(hours, "hrs")}
      {cell(minutes, "min")}
      {cell(seconds, "sec")}
    </div>
  );
}