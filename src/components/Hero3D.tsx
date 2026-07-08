"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";

export default function Hero3D({ items }: { items: Media[] }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const total = Math.min(items.length, 8);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setActive((a) => (a + 1) % total);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [total]);

  function goTo(i: number) {
    setDirection(i > active ? 1 : -1);
    setActive(i);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setActive((a) => (a + 1) % total);
    }, 5000);
  }

  const hero = items[active];
  const prev = items[(active - 1 + total) % total];
  const next = items[(active + 1) % total];

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden border-b border-[var(--color-line)]">
      {/* Background layers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={hero?.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {hero?.bannerImage && (
            <div className="relative h-full w-full">
              <Image src={hero.bannerImage} alt="" fill className="object-cover opacity-30" sizes="100vw" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-void)] via-[var(--color-void)]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-transparent to-[var(--color-void)]/30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex w-full max-w-7xl items-center gap-8 px-4 sm:px-6">
        {/* Left content */}
        <div className="max-w-2xl shrink-0">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-cyan)]">
            {hero?.type === "MANGA" ? "// Manga Spotlight" : "// Live Discovery Platform"}
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={hero?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] sm:text-7xl">
                {hero && bestTitle(hero.title).split(" ").slice(0, 4).join(" ")}
                <br />
                <span className="glow-text text-[var(--color-magenta)]">
                  {hero ? bestTitle(hero.title).split(" ").slice(4).join(" ") || "✦ Spotlight" : "✦ Spotlight"}
                </span>
              </h1>

              <p className="mt-4 line-clamp-2 max-w-xl text-[var(--color-mute)] sm:text-lg leading-relaxed">
                {hero?.description ? hero.description.replace(/<[^>]*>/g, "").slice(0, 200) + "…" : ""}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--color-mute)]">
                {hero?.genres?.slice(0, 3).map((g) => (
                  <Link key={g} href={`/search?genre=${g}`}
                    className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
                  >{g}</Link>
                ))}
                {hero?.averageScore ? (
                  <span className="font-mono text-[var(--color-cyan)]">
                    ★ {(hero.averageScore / 10).toFixed(1)}
                  </span>
                ) : null}
                {hero?.format ? <span className="text-[10px] uppercase tracking-wider">{hero.format}</span> : null}
                {hero?.seasonYear ? <span>{hero.seasonYear}</span> : null}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {hero && (
                  <Link href={hero.type === "MANGA" ? `/manga/${hero.id}` : `/anime/${hero.id}`}
                    className="group relative inline-flex items-center gap-2 rounded-full bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105 overflow-hidden"
                  >
                    <span className="relative z-10">View Details</span>
                    <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
                <Link href="/search"
                  className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/5 transition-all"
                >Explore All →</Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="mt-8 flex items-center gap-2">
            {items.slice(0, total).map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-8 bg-[var(--color-magenta)]" : "w-1.5 bg-[var(--color-mute)]/30 hover:bg-[var(--color-mute)]/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
            <span className="ml-3 font-mono text-[10px] text-[var(--color-mute)]">
              {String(active + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* 3D Card Stack */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative h-[500px] perspective-[1200px]">
          {/* Previous card */}
          {prev && (
            <motion.div
              key={`prev-${prev.id}`}
              initial={{ opacity: 0, x: -100, rotateY: 30 }}
              animate={{ opacity: 0.5, x: -80, rotateY: 25 }}
              className="absolute cursor-pointer"
              style={{ transformStyle: "preserve-3d", zIndex: active > 0 ? active : 1 }}
              onClick={() => goTo((active - 1 + total) % total)}
            >
              <div className="relative h-72 w-48 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl">
                <Image src={prev.coverImage?.extraLarge || prev.coverImage?.large || ""} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex items-end">
                  <p className="text-sm font-bold truncate">{bestTitle(prev.title)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active card */}
          {hero && (
            <motion.div
              key={`active-${hero.id}`}
              initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute cursor-pointer"
              style={{ transformStyle: "preserve-3d", zIndex: total }}
              onClick={() => goTo(active)}
            >
              <div className="relative h-80 w-52 overflow-hidden rounded-2xl border-2 border-[var(--color-magenta)]/50 bg-[var(--color-panel)] shadow-2xl shadow-[var(--color-magenta)]/20">
                <Image src={hero.coverImage?.extraLarge || hero.coverImage?.large || ""} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-lg font-bold leading-tight">{bestTitle(hero.title)}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                    {hero.averageScore ? <span className="text-[var(--color-cyan)]">★ {(hero.averageScore / 10).toFixed(1)}</span> : null}
                    {hero.episodes ? <span>{hero.episodes} ep</span> : null}
                    {hero.format ? <span>{hero.format}</span> : null}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next card */}
          {next && (
            <motion.div
              key={`next-${next.id}`}
              initial={{ opacity: 0, x: 100, rotateY: -30 }}
              animate={{ opacity: 0.5, x: 80, rotateY: -25 }}
              className="absolute cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => goTo((active + 1) % total)}
            >
              <div className="relative h-72 w-48 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl">
                <Image src={next.coverImage?.extraLarge || next.coverImage?.large || ""} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex items-end">
                  <p className="text-sm font-bold truncate">{bestTitle(next.title)}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
