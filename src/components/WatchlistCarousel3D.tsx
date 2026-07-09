"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { bestTitle } from "@/lib/anilist";
import { useWatchlist } from "@/components/WatchlistProvider";
import type { Media } from "@/lib/anilist";

export default function WatchlistCarousel3D({ items }: { items: Media[] }) {
  const [active, setActive] = useState(0);
  const { toggle } = useWatchlist();
  const total = items.length;

  function goNext() { setActive((a) => (a + 1) % total); }
  function goPrev() { setActive((a) => (a - 1 + total) % total); }

  if (total === 0) return null;

  const getIndex = (offset: number) => (active + offset + total) % total;

  return (
    <div className="relative flex items-center justify-center py-10 perspective-[1200px]">
      {/* Carousel stage */}
      <div className="relative flex items-center justify-center h-[420px] w-full" style={{ transformStyle: "preserve-3d" }}>
        {/* Left cards */}
        {[-3, -2, -1].map((offset) => {
          const idx = getIndex(offset);
          const item = items[idx];
          const z = offset * 50;
          const x = offset * 60 - 60;
          const scale = 1 - Math.abs(offset) * 0.15;
          const opacity = 1 - Math.abs(offset) * 0.25;
          const rotateY = offset * 15;

          return (
            <motion.div
              key={`${item.id}-${offset}`}
              className="absolute cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                x: x,
                z: z - 200,
                scale: scale,
                opacity: Math.max(0, opacity),
                rotateY: rotateY,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onClick={goPrev}
            >
              <div className="relative h-64 w-40 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl">
                <Image src={item.coverImage?.extraLarge || item.coverImage?.large || ""} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-3 flex items-end">
                  <p className="text-xs font-bold truncate">{bestTitle(item.title)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Active card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`active-${items[active].id}`}
            className="absolute z-10 cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.8, rotateY: -10, z: -100 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 10, z: -100 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <Link href={`/anime/${items[active].id}`} className="block">
              <div className="relative h-80 w-52 overflow-hidden rounded-2xl border-2 border-[var(--color-magenta)]/50 bg-[var(--color-panel)] shadow-2xl shadow-[var(--color-magenta)]/20">
                <Image src={items[active].coverImage?.extraLarge || items[active].coverImage?.large || ""} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-lg font-bold leading-tight">{bestTitle(items[active].title)}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                  {items[active].averageScore ? <span className="text-[var(--color-cyan)]">★ {(items[active].averageScore / 10).toFixed(1)}</span> : null}
                  {items[active].episodes ? <span>{items[active].episodes} ep</span> : null}
                  {items[active].format ? <span>{items[active].format}</span> : null}
                </div>
              </div>
            </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Right cards */}
        {[1, 2, 3].map((offset) => {
          const idx = getIndex(offset);
          const item = items[idx];
          const x = offset * 60 + 60;
          const scale = 1 - offset * 0.15;
          const opacity = 1 - offset * 0.25;
          const rotateY = offset * -15;

          return (
            <motion.div
              key={`${item.id}-${offset}`}
              className="absolute cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                x: x,
                z: -200,
                scale: scale,
                opacity: Math.max(0, opacity),
                rotateY: rotateY,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onClick={goNext}
            >
              <div className="relative h-64 w-40 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl">
                <Image src={item.coverImage?.extraLarge || item.coverImage?.large || ""} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-3 flex items-end">
                  <p className="text-xs font-bold truncate">{bestTitle(item.title)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <button onClick={goPrev}
        className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-panel)]/80 backdrop-blur text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
        aria-label="Previous"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button onClick={goNext}
        className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-panel)]/80 backdrop-blur text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
        aria-label="Next"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-0 flex items-center gap-2">
        {items.slice(0, Math.min(total, 8)).map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-[var(--color-magenta)]" : "w-1.5 bg-[var(--color-mute)]/30 hover:bg-[var(--color-mute)]/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
