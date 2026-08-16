"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1400;
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const STATS = [
  { to: 200, suffix: "+", label: "Anime Guides" },
  { to: 6, suffix: "+", label: "Dub Languages" },
  { to: 100, suffix: "%", label: "Free Forever" },
  { to: 2025, suffix: "", label: "Founded" },
];

const REASONS = [
  {
    icon: "🇮🇳",
    title: "India-First",
    desc: "Most anime tools ignore Indian fans. Everything here — dub schedules, language support, community — is built around you.",
  },
  {
    icon: "💯",
    title: "100% Free",
    desc: "No paywalls, no premium locks, no hidden fees. Every tool and every feature stays free.",
  },
  {
    icon: "🧭",
    title: "No Guesswork",
    desc: "Exact filler lists, correct watch orders and live dub schedules — so you never waste a second.",
  },
  {
    icon: "🤝",
    title: "Fan Built",
    desc: "Made by fans, for fans. We listen to the community and ship what anime lovers in India actually need.",
  },
];

const FEATURES = [
  {
    icon: "🗺️",
    title: "Filler Guides",
    desc: "Skip filler episodes across 200+ anime — Naruto, One Piece, Bleach, Boruto and more, with exact episode lists.",
    href: "/filler",
  },
  {
    icon: "🧩",
    title: "Watch Orders",
    desc: "Confused about Monogatari, Fate or Re:Zero? We show you the correct order to watch any franchise.",
    href: "/watch-order",
  },
  {
    icon: "📡",
    title: "Indian Dub Tracking",
    desc: "The only platform tracking Hindi, Tamil and Telugu dubs with schedule updates for every channel.",
    href: "/indian-dubs",
  },
  {
    icon: "🤖",
    title: "AI Recommendations",
    desc: "Get personalised anime and manga picks powered by our recommendation engine.",
    href: "/recommendations",
  },
  {
    icon: "📖",
    title: "Manga Reader",
    desc: "Browse thousands of manga titles with a clean, fast reading experience.",
    href: "/manga",
  },
  {
    icon: "💬",
    title: "Community",
    desc: "Clubs, watch parties, cosplay gallery, polls and more — built for Indian anime fans.",
    href: "/community",
  },
];

export default function AboutClient() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      {/* Hero */}
      <section className="mb-16">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]"
        >
          ✦ About ZyniVerse
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="neon-rgb-border inline-block rounded-2xl px-5 py-3"
        >
          <h1 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-4xl font-bold text-transparent sm:text-6xl">
            What is ZyniVerse?
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-5 max-w-2xl text-lg text-[var(--color-mute)]"
        >
          The all-in-one anime platform for Indian anime fans — filler guides, watch orders,
          Indian dubs, AI recommendations, manga, cosplay and a thriving community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {["100% Free", "India-First", "Since 2025", "200+ Anime"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface1)] px-3 py-1 text-xs text-[var(--color-mute)]"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          transition={{ delayChildren: 0.25 }}
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={item}
              className="neon-rgb-border rounded-2xl bg-[var(--color-surface1)]/60 p-4 text-center"
            >
              <p className="bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text font-display text-3xl font-bold text-transparent">
                <CountUp to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs text-[var(--color-mute)]">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* The Story */}
      <section className="mb-14">
        <div className="neon-premium rounded-[20px]">
          <div className="neon-premium-track" />
          <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
          <div className="neon-premium-content rounded-[20px] p-6 sm:p-8">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]"
            >
              01 / The Story
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl"
            >
              From a filler guide to the complete anime companion
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--color-mute)]"
            >
              <p>
                ZyniVerse was founded in 2025 as a free, fan-first anime platform. What started
                as a simple filler-episode guide grew into the most complete anime companion for
                Indian fans — covering filler lists, watch orders, Indian dubs, AI
                recommendations, manga, cosplay and community.
              </p>
              <p>
                ZyniVerse (also written Zyniverse or Zyverse) is built for anime fans who speak
                Hindi, Tamil, Telugu and English. We track every Indian dub across every channel,
                so you never miss when your favourite show airs in your language.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why ZyniVerse */}
      <section className="mb-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-gradient-to-r from-[var(--color-cyan)] to-transparent" />
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
            02 / Why ZyniVerse?
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {REASONS.map((r) => (
            <motion.div
              key={r.title}
              variants={item}
              className="group neon-rgb-border rounded-2xl bg-[var(--color-surface1)]/60 p-5 transition-all hover:-translate-y-1"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] text-xl transition-transform group-hover:scale-110">
                {r.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">{r.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)]">{r.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* What We Offer */}
      <section className="mb-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-gradient-to-r from-[var(--color-cyan)] to-transparent" />
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
            03 / What We Offer
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Link
                href={f.href}
                className="group block h-full rounded-2xl neon-rgb-border bg-[var(--color-surface1)]/60 p-5 transition-all hover:-translate-y-1 hover:bg-[var(--color-surface2)]/60"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] text-xl transition-transform group-hover:scale-110">
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-bold text-[var(--color-ink)] group-hover:text-[var(--color-cyan)]">
                  {f.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)]">{f.desc}</p>
                <p className="mt-3 text-xs font-bold text-[var(--color-cyan)] opacity-0 transition-opacity group-hover:opacity-100">
                  Explore →
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Free & Forever */}
      <section>
        <div className="neon-premium rounded-[20px]">
          <div className="neon-premium-track" />
          <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
          <div className="neon-premium-content rounded-[20px] p-6 text-center sm:p-10">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]"
            >
              ✦ 04 / Free & Forever
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mx-auto max-w-xl bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-3xl font-bold text-transparent sm:text-4xl"
            >
              Free, forever. Just anime tools for Indian fans.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mx-auto mt-3 max-w-lg text-sm text-[var(--color-mute)]"
            >
              No paywalls, no hidden fees — just anime tools and a community that actually cares
              about Indian fans. Join us at{" "}
              <a
                href="https://zyverse.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-cyan)] hover:underline"
              >
                zyverse.in
              </a>
              .
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="mt-6 flex flex-wrap justify-center gap-3"
            >
              <Link
                href="/community"
                className="rounded-xl neon-rgb-border bg-[var(--color-void)]/70 px-6 py-2.5 text-sm font-bold text-[var(--color-ink)] transition-transform hover:scale-[1.03]"
              >
                Join the Community
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-[var(--color-line)] px-6 py-2.5 text-sm text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
              >
                ← Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
