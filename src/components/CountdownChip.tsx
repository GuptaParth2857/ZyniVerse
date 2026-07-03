"use client";

import { useEffect, useState } from "react";

function formatRemaining(seconds: number) {
  if (seconds <= 0) return "Airing now";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function CountdownChip({
  target,
  compact = false,
}: {
  target: { airingAt: number; episode: number };
  compact?: boolean;
}) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, target.airingAt - Math.floor(Date.now() / 1000))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, target.airingAt - Math.floor(Date.now() / 1000)));
    }, 30000);
    return () => clearInterval(id);
  }, [target.airingAt]);

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono ${
        compact
          ? "text-[10px] text-[var(--color-cyan)]"
          : "rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-2.5 py-1 text-xs text-[var(--color-cyan)]"
      }`}
    >
      <svg width={compact ? 10 : 12} height={compact ? 10 : 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
      Ep {target.episode} · {formatRemaining(remaining)}
    </span>
  );
}
