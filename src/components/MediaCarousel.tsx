"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";

export default function MediaCarousel({
  eyebrow,
  title,
  viewAllTo,
  rows = 1,
  items,
}: {
  eyebrow?: string;
  title: string;
  viewAllTo?: string;
  rows?: number;
  items: Media[];
}) {
  if (items.length === 0) return null;

  const itemsPerRow = Math.ceil(items.length / rows);
  const rowItems = Array.from({ length: rows }, (_, i) =>
    items.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
  );

  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <div>
          {eyebrow && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        </div>
        {viewAllTo && (
          <Link
            href={viewAllTo}
            className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {rowItems.map((row, ri) => (
          <div key={ri} className={ri > 0 ? "hidden sm:block" : ""}>
            <CarouselRow items={row} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CarouselRow({ items }: { items: Media[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 600);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/row">
      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <CarouselCard key={item.id} item={item} index={i} />
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white border border-[var(--color-line)] hover:border-[var(--color-magenta)] transition-all opacity-0 group-hover/row:opacity-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white border border-[var(--color-line)] hover:border-[var(--color-magenta)] transition-all opacity-0 group-hover/row:opacity-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      )}
    </div>
  );
}

const CARD_COLORS = ["#29f2e0", "#ff2d78", "#8a5cff", "#22c55e", "#f59e0b", "#06b6d4", "#ec4899", "#f97316"];

function CarouselCard({ item, index }: { item: Media; index: number }) {
  const title = bestTitle(item.title);
  const href = item.type === "MANGA" ? `/manga/${item.id}` : `/anime/${item.id}`;
  const color = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <Link href={href} className="snap-start shrink-0 group/card overflow-hidden rounded-xl neon-feature-card" style={{ width: 180 }}>
      <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${color}, transparent 40%, ${color}80, transparent 70%, ${color})` }} />
      <div className="neon-glow rounded-xl" style={{ background: color }} />
      <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
        <div className="h-[2px] w-full" style={{ background: color }} />

        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={item.coverImage?.extraLarge || item.coverImage?.large || item.coverImage?.medium || ""}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-110"
            sizes="180px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

          {/* Score */}
          {item.averageScore != null && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-mono font-bold z-10"
              style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
              ★ {(item.averageScore / 10).toFixed(1)}
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 z-10">
            <p className="font-display text-xs font-bold leading-tight line-clamp-2 drop-shadow-lg">{title}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
              {item.episodes && <span>{item.episodes} ep</span>}
              {item.genres && item.genres[0] && <span className="truncate">{item.genres[0]}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
