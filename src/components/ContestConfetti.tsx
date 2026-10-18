"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";

const PALETTE = ["#00ffe0", "#ff00e6", "#7000ff", "#facc15", "#f472b6"];

interface Shard {
  x: number;
  drift: number;
  rise: number;
  rot: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  round: boolean;
}

/**
 * One-shot confetti burst, mounted by the parent and unmounted after ~1.4s so
 * nothing keeps animating in the background. Mounted-gated the same way as the
 * other particle layers on the site so SSR markup stays empty.
 */
export default function ContestConfetti({
  color = "#00ffe0",
  count = 26,
}: {
  /** Contest accent colour, mixed into the palette. */
  color?: string;
  count?: number;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [shards] = useState<Shard[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      drift: (Math.random() - 0.5) * 160,
      rise: 120 + Math.random() * 170,
      rot: (Math.random() - 0.5) * 900,
      size: 5 + Math.random() * 7,
      duration: 0.85 + Math.random() * 0.55,
      delay: Math.random() * 0.12,
      color: Math.random() < 0.4 ? color : PALETTE[i % PALETTE.length],
      round: i % 3 === 0,
    }));
  });

  if (!mounted) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {shards.map((s, i) => (
        <motion.span
          key={i}
          className={s.round ? "absolute block rounded-full" : "absolute block rounded-[2px]"}
          style={{
            left: `${s.x}%`,
            bottom: 0,
            width: s.size,
            height: s.round ? s.size : s.size * 0.5,
            background: s.color,
            boxShadow: `0 0 10px ${s.color}88`,
            willChange: "transform, opacity",
          }}
          initial={{ y: 8, opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ y: -s.rise, x: s.drift, opacity: [0, 1, 1, 0], scale: 1, rotate: s.rot }}
          transition={{ duration: s.duration, delay: s.delay, ease: [0.18, 0.9, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
