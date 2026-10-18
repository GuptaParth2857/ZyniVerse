"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CONTEST_PRIZES, CONTEST_RULES, CONTEST_TYPE_META } from "@/lib/contest-meta";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const WEEK_FLOW = [
  { day: "Mon 00:00", title: "Battles open", body: "Four new battles go live and submissions open. Pick the one that fits your work.", icon: "🎬" },
  { day: "Mon – Sun", title: "Submit & share", body: "One entry per member per battle. Share it — the community decides.", icon: "🖼️" },
  { day: "Mon 00:00", title: "Voting closes", body: "The week rolls over. The clock above every battle shows exactly how long is left.", icon: "⏱️" },
  { day: "After close", title: "Winner crowned", body: "The top voted entry wins the badge, XP and coins, and takes a permanent Hall of Fame slot.", icon: "👑" },
];

export default function RulesClient() {
  return (
    <div>
      <div className="mb-6">
        <p className="console-label mb-2">📜 The fine print</p>
        <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-4xl">
          Contest Rules
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-mute)]">
          Four battles a week, one entry each, one vote each. Short, fair and fast.
        </p>
      </div>

      {/* ------------------------------------------------------ Type cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(CONTEST_TYPE_META).map(([key, meta], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, ...spring }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/[0.07] bg-black/25 p-4"
            style={{ boxShadow: `0 0 0 1px ${meta.color}22` }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border text-xl" style={{ borderColor: `${meta.color}44`, background: `${meta.color}12` }}>
              {meta.icon}
            </span>
            <p className="mt-3 text-sm font-bold text-white">{meta.label}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-mute)]">{meta.blurb}</p>
          </motion.div>
        ))}
      </div>

      {/* -------------------------------------------------------- Rules */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {CONTEST_RULES.map((rule, i) => (
          <motion.div
            key={rule.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: (i % 2) * 0.08, duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--color-panel)]/60 p-5 backdrop-blur-sm"
          >
            <span className="pointer-events-none absolute inset-x-6 top-0 h-px meme-hairline" />
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-2xl" aria-hidden>{rule.icon}</span>
              <div>
                <p className="text-sm font-bold text-white">{rule.title}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-mute)]">{rule.body}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ----------------------------------------------------- Week flow */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm">
        <div className="border-b border-white/[0.06] bg-[#0a0910]/70 px-5 py-3">
          <p className="console-label text-[10px]">⏳ How a week flows</p>
        </div>
        <div className="relative grid gap-0 sm:grid-cols-4">
          <span aria-hidden className="pointer-events-none absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-[var(--color-cyan)]/40 to-transparent sm:block" />
          {WEEK_FLOW.map((step, i) => (
            <motion.div
              key={step.day}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.09, ...spring }}
              className="relative border-b border-white/[0.05] px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-void)] text-base shadow-[0_0_16px_rgba(0,255,224,0.25)]">
                {step.icon}
              </span>
              <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-cyan)]">{step.day}</p>
              <p className="mt-1 text-sm font-bold text-white">{step.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-mute)]">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------- Prizes */}
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {CONTEST_PRIZES.map((prize, i) => (
          <motion.div
            key={prize.label}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, ...spring }}
            className="rounded-2xl border border-[#ffd700]/25 bg-[#ffd700]/[0.06] px-4 py-4 text-center"
          >
            <p className="text-2xl" aria-hidden>{prize.icon}</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-[#ffd700]">{prize.label}</p>
            <p className="mt-1 text-[11px] text-[var(--color-mute)]">{prize.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-[var(--color-cyan)]/25 bg-[var(--color-cyan)]/[0.05] px-6 py-6 text-center">
        <p className="w-full text-sm font-bold text-white sm:w-auto">Ready to take the crown?</p>
        <Link
          href="/contests"
          className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black"
        >
          See this week&apos;s battles
        </Link>
        <Link
          href="/contests/submit"
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[11px] font-bold text-white/80 hover:text-[var(--color-cyan)]"
        >
          🚀 Submit an entry
        </Link>
      </div>
    </div>
  );
}
