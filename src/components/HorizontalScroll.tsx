"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";

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
      const cardWidth = 200 + 4;
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
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#461518]/20 blur-[100px] pointer-events-none" />

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
          className="flex gap-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={item.type === "MANGA" ? `/manga/${item.id}` : `/anime/${item.id}`}
              className="snap-start shrink-0 group/card relative"
              style={{ width: 200 }}
            >
              <div className="absolute -left-2 bottom-0 z-20 select-none pointer-events-none">
                <span className="font-display text-[130px] font-black leading-none text-black/40 [-webkit-text-stroke:2px_rgba(255,255,255,0.08)]">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
              </div>

              <div className="relative z-10 ml-[30px]">
                <div className="relative aspect-[2/3] overflow-hidden rounded-[8px] bg-[#161616] transition-all duration-500 group-hover/card:scale-[1.02] group-hover/card:shadow-[0_0_40px_-8px_var(--color-magenta)]">
                  <Image
                    src={item.coverImage?.extraLarge || item.coverImage?.large || ""}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="font-display text-xs sm:text-sm font-bold leading-tight line-clamp-2 drop-shadow-lg">
                      {bestTitle(item.title)}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                      {item.averageScore ? (
                        <span className="text-[var(--color-cyan)]">★ {(item.averageScore / 10).toFixed(1)}</span>
                      ) : null}
                      {item.episodes ? <span>{item.episodes} ep</span> : null}
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
