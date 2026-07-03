"use client";

import Link from "next/link";
import { bestTitle } from "@/lib/anilist";
import type { AiringScheduleEntry } from "@/lib/anilist";

export default function OnAirTicker({ items }: { items: AiringScheduleEntry[] }) {
  if (!items || items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-[var(--color-line)] bg-[var(--color-panel)]/80 py-2.5">
      <div className="flex whitespace-nowrap ticker-track">
        {loop.map((item, idx) => (
          <Link
            href={`/anime/${item.media.id}`}
            key={`${item.id}-${idx}`}
            className="mx-4 flex items-center gap-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)] pulse-dot on-air-dot shrink-0" />
            <span className="font-display font-semibold text-[var(--color-ink)]">
              {bestTitle(item.media.title)}
            </span>
            <span className="font-mono text-[var(--color-cyan)]">EP {item.episode}</span>
            <span className="text-[var(--color-line)]">/</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
