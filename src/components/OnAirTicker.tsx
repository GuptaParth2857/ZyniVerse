"use client";

import Link from "next/link";
import { bestTitle } from "@/lib/anilist";
import type { AiringScheduleEntry } from "@/lib/anilist";

function TickerItem({
  item,
  idx,
  hidden,
}: {
  item: AiringScheduleEntry;
  idx: number;
  hidden?: boolean;
}) {
  return (
    <Link
      href={`/anime/${item.media.id}`}
      key={`${item.id}-${idx}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="group mx-5 inline-flex items-center gap-2 text-sm"
    >
      <span className="on-air-dot h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)] pulse-dot shrink-0" />
      <span className="neon-tick-title font-display font-semibold text-[var(--color-ink)]">
        {bestTitle(item.media.title)}
      </span>
      <span className="neon-tick-ep font-mono text-xs tracking-wider text-[var(--color-cyan)]">
        EP {item.episode}
      </span>
      <span className="text-[var(--color-line)] transition-colors duration-300 group-hover:text-[var(--color-cyan)]">
        /
      </span>
    </Link>
  );
}

export default function OnAirTicker({ items }: { items: AiringScheduleEntry[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="on-air-ticker relative" aria-label="Currently airing episodes">
      <div className="relative flex items-stretch bg-[var(--color-panel)]/80">
        <div className="on-air-badge hidden select-none items-center gap-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-[var(--color-magenta)] pulse-dot shrink-0" />
          <span>ON AIR</span>
        </div>
        <div className="ticker-window relative flex-1 overflow-hidden py-2.5">
          <div className="ticker-track flex w-max whitespace-nowrap">
            {items.map((item, idx) => (
              <TickerItem item={item} idx={idx} key={`a-${item.id}-${idx}`} />
            ))}
            {items.map((item, idx) => (
              <TickerItem
                item={item}
                idx={items.length + idx}
                hidden
                key={`b-${item.id}-${idx}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
