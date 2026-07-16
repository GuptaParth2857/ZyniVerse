"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { bestTitle } from "@/lib/anilist";

interface CarouselItem {
  id: number;
  coverImage: { extraLarge?: string; large?: string; medium?: string };
  title: { english?: string; romaji?: string; native?: string };
  averageScore?: number;
  format?: string;
  episodes?: number;
  chapters?: number;
  type?: string;
}

export default function Carousel3D({
  items,
  accent = "magenta",
  hrefFn,
}: {
  items: CarouselItem[];
  accent?: "magenta" | "violet";
  hrefFn: (item: CarouselItem) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(220);
  const [scrollPct, setScrollPct] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const accentColor = accent === "violet" ? "var(--color-violet)" : "var(--color-magenta)";

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setItemWidth(entry.contentRect.width);
      }
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) { setScrollPct(0); return; }
      setScrollPct(el.scrollLeft / maxScroll);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [items]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(() => scroll(1), 4000);
    return () => clearInterval(interval);
  }, [isPaused, items.length, itemWidth]);

  function scroll(dir: number) {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    if (dir > 0 && el.scrollLeft >= maxScroll - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * (itemWidth + 16) * 2, behavior: "smooth" });
    }
  }

  return (
    <div ref={containerRef} className="relative group/carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {/* Arrows */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)]/80 backdrop-blur flex items-center justify-center text-[var(--color-mute)] hover:text-[var(--color-ink)] hover:border-[var(--color-line)] opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        aria-label="Previous"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)]/80 backdrop-blur flex items-center justify-center text-[var(--color-mute)] hover:text-[var(--color-ink)] hover:border-[var(--color-line)] opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        aria-label="Next"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ perspective: "1200px", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => {
          const href = hrefFn(item);
          const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : null;
          const sub = item.episodes ? `${item.episodes} ep` : item.chapters ? `${item.chapters} ch` : null;

          return (
            <CarouselCard
              key={item.id}
              item={item}
              href={href}
              score={score}
              sub={sub}
              index={i}
              total={items.length}
              scrollPct={scrollPct}
              accentColor={accentColor}
            />
          );
        })}
      </div>
    </div>
  );
}

function CarouselCard({
  item, href, score, sub, index, total, scrollPct, accentColor,
}: {
  item: CarouselItem; href: string; score: string | null; sub: string | null;
  index: number; total: number; scrollPct: number; accentColor: string;
}) {
  return (
    <div
      className="snap-center shrink-0 first:ml-8 last:mr-8"
      style={{ width: 200 }}
    >
      <div
        style={{
          transform: `rotateY(${(scrollPct - 0.5) * 20}deg)`,
          transition: "transform 0.2s ease-out",
        }}
        className="card-glow relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_30px_-5px_var(--tw-shadow-color)] hover:scale-105 hover:z-10"
      >
        <Link href={href} className="block group">
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={item.coverImage?.extraLarge || item.coverImage?.large || ""}
              alt={bestTitle(item.title)}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Score badge */}
            {score && (
              <span
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-mono font-semibold backdrop-blur"
                style={{ color: accentColor }}
              >
                {score}
              </span>
            )}

            {/* Format badge */}
            <div className="absolute inset-x-0 bottom-0 p-3">
              <h3 className="font-display text-sm font-semibold leading-tight text-[var(--color-ink)] truncate">
                {bestTitle(item.title)}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                {sub && <span>{sub}</span>}
                {item.format && !sub && <span>{item.format}</span>}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
