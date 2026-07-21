"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";

const CARD_COLORS = ["#29f2e0", "#ff2d78", "#8a5cff", "#22c55e", "#f59e0b", "#06b6d4", "#ec4899", "#f97316"];

export default function HorizontalScroll({
  items,
  title = "Trending Now",
  eyebrow,
  viewAllHref,
  subtitle,
  autoPlaySpeed,
}: {
  items: Media[];
  title?: string;
  eyebrow?: string;
  viewAllHref?: string;
  subtitle?: string;
  autoPlaySpeed?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  useEffect(() => {
    return () => { if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current); };
  }, []);

  useEffect(() => {
    if (isPaused || items.length === 0 || autoPlaySpeed === 0) return;
    intervalRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = 220 + 12;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, autoPlaySpeed ?? 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, items.length, autoPlaySpeed]);

  const pauseTemporarily = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 8000);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    pauseTemporarily();
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.75 : el.clientWidth * 0.75, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-line)]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e]/60 via-[#2d1b4e]/30 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--color-magenta)]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-cyan)]">{eyebrow}</p>}
            <h2 className="font-display text-3xl font-black sm:text-4xl md:text-5xl tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-[var(--color-mute)]">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="shrink-0 text-xs uppercase tracking-wider text-[var(--color-mute)] hover:text-white transition-colors">View all</Link>
          )}
        </div>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 pb-6 pt-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={item.type === "MANGA" ? `/manga/${item.id}` : `/anime/${item.id}`}
              className="snap-start shrink-0 group/card relative overflow-hidden rounded-xl neon-feature-card"
              style={{ width: 210 }}
            >
              <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${CARD_COLORS[i % CARD_COLORS.length]}, transparent 40%, ${CARD_COLORS[i % CARD_COLORS.length]}80, transparent 70%, ${CARD_COLORS[i % CARD_COLORS.length]})` }} />
              <div className="neon-glow rounded-xl" style={{ background: CARD_COLORS[i % CARD_COLORS.length] }} />
              <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
                <div className="h-[2px] w-full" style={{ background: CARD_COLORS[i % CARD_COLORS.length] }} />

                {/* Rank number */}
                <div className="absolute -left-1 bottom-8 z-20 select-none pointer-events-none">
                  <span className="font-display text-[100px] font-black leading-none text-black/30" style={{ WebkitTextStroke: `2px ${CARD_COLORS[i % CARD_COLORS.length]}15` }}>
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                </div>

                {/* Cover */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <Image
                    src={item.coverImage?.extraLarge || item.coverImage?.large || ""}
                    alt={bestTitle(item.title)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                    sizes="(max-width: 768px) 50vw, 210px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Score */}
                  {item.averageScore != null && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-mono font-bold z-10"
                      style={{ background: `${CARD_COLORS[i % CARD_COLORS.length]}25`, color: CARD_COLORS[i % CARD_COLORS.length], border: `1px solid ${CARD_COLORS[i % CARD_COLORS.length]}40` }}>
                      ★ {(item.averageScore / 10).toFixed(1)}
                    </div>
                  )}

                  {/* Bottom info */}
                  <div className="absolute inset-x-0 bottom-0 p-3 z-10">
                    <p className="font-display text-sm font-bold leading-tight line-clamp-2 drop-shadow-lg">{bestTitle(item.title)}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                      {item.episodes && <span>{item.episodes} ep</span>}
                      {item.genres && item.genres[0] && <span className="truncate">{item.genres[0]}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {canScrollLeft && (
          <button onClick={() => scroll("left")}
            className="absolute left-1 top-[calc(50%-20px)] z-20 hidden sm:flex h-10 w-10 items-center justify-center rounded-[8px] bg-black/90 text-white border border-white/10 hover:border-[var(--color-cyan)]/40 transition-all hover:scale-105">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll("right")}
            className="absolute right-1 top-[calc(50%-20px)] z-20 hidden sm:flex h-10 w-10 items-center justify-center rounded-[8px] bg-black/90 text-white border border-white/10 hover:border-[var(--color-cyan)]/40 transition-all hover:scale-105">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
      </div>
    </section>
  );
}
