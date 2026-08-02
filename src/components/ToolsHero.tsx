"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function ToolsHero() {
  const [eps, setEps] = useState<number>(720);
  const [filler, setFiller] = useState<number>(41);

  const hoursSaved = useMemo(() => Math.round(eps * (filler / 100) * 0.42 * 10) / 10, [eps, filler]);
  const fillerEps = useMemo(() => Math.round((eps * filler) / 100), [eps, filler]);

  return (
    <section className="relative mb-16">
      <div className="absolute -inset-x-24 -top-10 -bottom-10 opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(41,242,224,0.12), transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255,45,120,0.12), transparent 50%)" }}
      />
      <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Free Tools</p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl mt-2 leading-tight">
            Anime Tools &{" "}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, var(--color-cyan), var(--color-magenta))" }}>
              Calculators
            </span>
          </h1>
          <p className="mt-4 text-[var(--color-mute)] max-w-lg">
            Free tools no other anime site offers. Try the live demo — drag the sliders and see how much time you&apos;d save skipping filler.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="#tools" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
              Explore Tools ↓
            </a>
            <a href="/filler" className="rounded-full neon-rgb-border px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">
              Filler Guides
            </a>
          </div>
        </div>

        {/* Live Demo Widget */}
        <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-sm font-bold">⚡ Live Demo — Time Saved</p>
            <span className="rounded-full bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] px-2 py-0.5 text-[10px] font-semibold">
              Real-Time
            </span>
          </div>
          <div className="space-y-4 mb-5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-mute)]">Total Episodes</span>
                <span className="font-mono font-bold text-[var(--color-cyan)]">{eps.toLocaleString()}</span>
              </div>
              <input type="range" min={12} max={1500} step={12} value={eps} onChange={(e) => setEps(Number(e.target.value))} className="w-full accent-[var(--color-cyan)]" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-mute)]">Filler %</span>
                <span className="font-mono font-bold text-[var(--color-magenta)]">{filler}%</span>
              </div>
              <input type="range" min={0} max={90} step={1} value={filler} onChange={(e) => setFiller(Number(e.target.value))} className="w-full accent-[var(--color-magenta)]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--color-void)] p-3 text-center">
              <p className="font-display text-2xl font-bold text-[var(--color-magenta)]">{fillerEps.toLocaleString()}</p>
              <p className="text-[10px] text-[var(--color-mute)]">Filler Eps</p>
            </div>
            <div className="rounded-xl bg-[var(--color-void)] p-3 text-center">
              <p className="font-display text-2xl font-bold text-[var(--color-cyan)]">{hoursSaved.toLocaleString()}h</p>
              <p className="text-[10px] text-[var(--color-mute)]">You Save</p>
            </div>
          </div>
          <motion.a
            href="/tools/filler-time"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 block text-center rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] px-4 py-3 text-sm font-bold text-black"
          >
            Get Your Real Numbers →
          </motion.a>
        </div>
      </div>
    </section>
  );
}
