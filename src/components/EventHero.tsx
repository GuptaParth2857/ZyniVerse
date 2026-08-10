"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function useCountUp(target: number, duration = 1100, start = false): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!start || typeof window === "undefined") return;
    const from = fromRef.current;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return value;
}

const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

interface EventHeroProps {
  eventsCount: number;
  announcementsCount: number;
  countriesCount: number;
}

export default function EventHero({
  eventsCount,
  announcementsCount,
  countriesCount,
}: EventHeroProps) {
  const [inView, setInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const events = useCountUp(eventsCount, 1100, inView);
  const announcements = useCountUp(announcementsCount, 1100, inView);
  const countries = useCountUp(countriesCount, 1100, inView);

  const stats = [
    { value: events, label: "Events", color: "cyan" },
    { value: announcements, label: "Announcements", color: "magenta" },
    { value: countries, label: "Countries", color: "cyan" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-line)]">
      {/* Animated background layers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan)]/8 via-[var(--color-magenta)]/5 to-transparent"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-cyan)_0%,_transparent_50%)] opacity-30"
      />
      {/* Floating particles */}
      {[
        { left: "12%", top: "22%", size: 6, delay: 0, color: "rgba(0,255,224,0.35)" },
        { left: "82%", top: "30%", size: 5, delay: 0.4, color: "rgba(255,45,120,0.3)" },
        { left: "68%", top: "72%", size: 7, delay: 0.8, color: "rgba(0,255,224,0.25)" },
        { left: "22%", top: "70%", size: 4, delay: 1.2, color: "rgba(255,45,120,0.3)" },
      ].map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 12px ${p.color}` }}
          animate={{ y: [0, -22, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div variants={heroItem} className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                Live Tracking
              </span>
            </motion.div>
            <motion.div variants={heroItem} className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
              <h1 className="font-display text-4xl font-black sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                Anime{" "}
                <span className="bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">
                  Events Hub
                </span>
              </h1>
            </motion.div>
            <motion.p
              variants={heroItem}
              className="mt-4 text-base sm:text-lg text-[var(--color-mute)] max-w-xl leading-relaxed"
            >
              Track every major anime event worldwide. Conventions, expos, festivals — with
              all announcements, trailers, reveals, and key visuals in one place.
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-4 sm:gap-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`rounded-xl border px-5 py-3 text-center min-w-[90px] ${
                  s.color === "cyan"
                    ? "border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5"
                    : "border-[var(--color-magenta)]/20 bg-[var(--color-magenta)]/5"
                }`}
              >
                <div
                  className={`font-display text-2xl sm:text-3xl font-black tabular-nums ${
                    s.color === "cyan" ? "text-[var(--color-cyan)]" : "text-[var(--color-magenta)]"
                  }`}
                >
                  {s.value.toLocaleString("en-US")}
                </div>
                <div className="text-[10px] font-mono text-[var(--color-mute)]/60 uppercase tracking-wider mt-0.5">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
