"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
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

  const track = trackRef.current;
  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    function onScroll() {
      if (maxScroll <= 0) { scrollProgress.set(0); return; }
      scrollProgress.set(el!.scrollLeft / maxScroll);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [items, scrollProgress]);

  function scroll(dir: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (itemWidth + 16) * 2, behavior: "smooth" });
  }

  return (
    <div ref={containerRef} className="relative group/carousel">
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
              scrollProgress={scrollProgress}
              accentColor={accentColor}
            />
          );
        })}
      </div>
    </div>
  );
}

function CarouselCard({
  item, href, score, sub, index, total, scrollProgress, accentColor,
}: {
  item: CarouselItem; href: string; score: string | null; sub: string | null;
  index: number; total: number; scrollProgress: import("framer-motion").MotionValue; accentColor: string;
}) {
  const [snapIndex, setSnapIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const cards = parent.children;
            for (let i = 0; i < cards.length; i++) {
              if (cards[i] === el) { setSnapIndex(i); break; }
            }
          }
        }
      },
      { root: parent, threshold: [0.4, 0.6, 0.8] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const offset = useTransform(scrollProgress, [0, 1], [-30, 30]);
  const rotateY = useTransform(scrollProgress, [0, 0.5, 1], [10, 0, -10]);

  return (
    <div
      ref={cardRef}
      className="snap-center shrink-0 first:ml-8 last:mr-8"
      style={{ width: 200 }}
    >
      <motion.div
        style={{ rotateY }}
        whileHover={{ rotateY: 0, scale: 1.05, z: 50 }}
        className="card-glow relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_30px_-5px_var(--tw-shadow-color)]"
      >
        <Link href={href} className="block group">
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={item.coverImage?.extraLarge || item.coverImage?.large}
              alt={bestTitle(item.title)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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
      </motion.div>
    </div>
  );
}
