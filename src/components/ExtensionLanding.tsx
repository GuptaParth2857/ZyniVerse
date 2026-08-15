"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition, FadeIn } from "@/components/PageTransition";

const STEPS = [
  {
    n: "1",
    title: "Download the extension",
    desc: "Grab the zyniverse-extension.zip from the button below — it's free and signed by us.",
    icon: "⬇",
    tint: "#29f2e0",
  },
  {
    n: "2",
    title: "Open Chrome extensions",
    desc: "Go to chrome://extensions and flip on Developer mode (top-right corner).",
    icon: "🧩",
    tint: "#a855f7",
  },
  {
    n: "3",
    title: "Load unpacked",
    desc: "Unzip the folder, click “Load unpacked” and select it. Pin the icon next to your address bar.",
    icon: "📂",
    tint: "#ff2d78",
  },
  {
    n: "4",
    title: "Add your API key",
    desc: "Click the icon, paste your free key from Profile → API Keys, and hit Save & Verify. Done!",
    icon: "🔑",
    tint: "#ffb020",
  },
];

const FEATURES = [
  { icon: "▶", title: "Crunchyroll", desc: "Auto-detects the series and episode you're watching.", tint: "#ff7b00" },
  { icon: "N", title: "Netflix", desc: "Tracks your series and advances episode progress as you watch.", tint: "#e50914" },
  { icon: "↻", title: "Auto progress", desc: "Sets your list to Currently Watching and updates episode count.", tint: "#29f2e0" },
  { icon: "🔒", title: "Private by design", desc: "Everything runs locally with your own API key. No tracking.", tint: "#a855f7" },
];

const FLOW = [
  { title: "Detect", desc: "The extension watches the active tab and reads the anime + episode from the player.", icon: "👀", tint: "#29f2e0" },
  { title: "Verify", desc: "Your API key is checked — only one secure request leaves your browser.", icon: "🛡", tint: "#ffb020" },
  { title: "Match", desc: "ZyniVerse matches the title to its AniList entry.", icon: "🎯", tint: "#a855f7" },
  { title: "Tracked", desc: "Your list updates to Currently Watching with episode progress recorded.", icon: "✅", tint: "#ff2d78" },
];

const STATS = [
  { k: "2", v: "Streaming sites", tint: "#29f2e0" },
  { k: "1 min", v: "To install", tint: "#a855f7" },
  { k: "0", v: "Manual tracking", tint: "#ff2d78" },
  { k: "100%", v: "Free & local", tint: "#ffb020" },
];

/* Neon-premium card with 3D tilt — same signature treatment as the voice-lines quote cards */
function NeonTiltCard({
  children,
  className = "",
  overlay = "rgba(10,10,15,0.92)",
}: {
  children: ReactNode;
  className?: string;
  overlay?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / (rect.width / 2) - 1;
    const py = (e.clientY - rect.top) / (rect.height / 2) - 1;
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  }

  function handlePointerLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`neon-premium rounded-[20px] ${className}`}
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: overlay }} />
      <div className="neon-premium-content rounded-[20px]">{children}</div>
    </div>
  );
}

/* Accent chip — glowing pill used across voice-lines cards */
function AccentChip({ tint, label }: { tint: string; label: string }) {
  return (
    <span
      className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: tint, borderColor: `${tint}55`, background: `${tint}11`, boxShadow: `0 0 12px ${tint}33` }}
    >
      {label}
    </span>
  );
}

export default function ExtensionLanding() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* ============ HERO ============ */}
        <section className="relative mb-14 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-12 sm:px-12 sm:py-16">
          {/* animated gradient blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-24 left-1/4 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: "#29f2e0" }}
              animate={{ y: [0, -24, 0], x: [0, 16, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -right-10 top-1/3 h-80 w-80 rounded-full opacity-25 blur-3xl"
              style={{ background: "#a855f7" }}
              animate={{ y: [0, 26, 0], x: [0, -20, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full opacity-25 blur-3xl"
              style={{ background: "#ff2d78" }}
              animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]"
              >
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                ✦ Free Chrome Extension
              </motion.p>

              <div className="neon-rgb-border inline-block rounded-2xl px-5 py-3">
                <h1 className="font-display text-4xl font-black leading-tight sm:text-6xl">
                  <motion.span
                    className="block bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  >
                    Watch. Done.
                  </motion.span>
                  <motion.span
                    className="block bg-gradient-to-r from-[var(--color-magenta)] via-white to-[var(--color-cyan)] bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.6 }}
                  >
                    Tracked.
                  </motion.span>
                </h1>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-mute)]"
              >
                Install the ZyniVerse extension and your Crunchyroll &amp; Netflix sessions auto-sync to
                your watchlist — series added, episode progress updated. No manual entry, ever.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <motion.a
                  href="/api/extension/download"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="neon-rgb-border group inline-flex items-center gap-2 rounded-full bg-[var(--color-void)]/70 px-6 py-3 text-sm font-bold text-[var(--color-ink)]"
                >
                  <motion.span
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="inline-block"
                  >
                    ⬇
                  </motion.span>
                  Download Extension (.zip)
                  <span className="rounded-full bg-[var(--color-cyan)]/15 px-2 py-0.5 font-mono text-[10px] text-[var(--color-cyan)]">
                    FREE
                  </span>
                </motion.a>
                <Link
                  href="/profile"
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-3 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
                >
                  Get Your API Key →
                </Link>
                <a
                  href="https://github.com/GuptaParth2857/ZyniVerse/tree/main/extension"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-3 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)]"
                >
                  GitHub ↗
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 flex flex-wrap gap-2"
              >
                {["100% local", "Open source", "Your API key", "Chrome + Edge"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 text-xs text-[var(--color-mute)]"
                  >
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Browser mockup with extension popup */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-sm"
            >
              <motion.div
                className="absolute -inset-6 rounded-[32px] opacity-40 blur-2xl"
                style={{ background: "linear-gradient(120deg,#29f2e0,#a855f7,#ff2d78)" }}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <NeonTiltCard overlay="rgba(10,10,15,0.85)">
                <div className="relative overflow-hidden rounded-[20px]">
                  {/* browser bar */}
                  <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-black/30 px-3 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    <div className="ml-2 flex-1 truncate rounded-md bg-black/40 px-2 py-1 font-mono text-[10px] text-[var(--color-mute)]">
                      crunchyroll.com/watch/solo-leveling
                    </div>
                  </div>
                  {/* fake player */}
                  <div className="relative grid h-40 place-items-center bg-gradient-to-br from-[#0f1230] to-[#2a0f2f]">
                    <motion.div
                      className="text-3xl"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      ▶
                    </motion.div>
                    <span className="absolute bottom-2 right-3 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white">
                      EP 8 · 12:04
                    </span>
                  </div>
                  {/* extension popup replica */}
                  <div className="border-t border-[var(--color-line)] bg-[#0a0a0f] p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] text-[10px] font-black text-black">
                        ZV
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-ink)]">ZyniVerse Auto-Tracker</p>
                        <p className="text-[10px] text-[var(--color-mute)]">Watch → auto-sync</p>
                      </div>
                      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-400">
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                          animate={{ opacity: [1, 0.2, 1] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                        />
                        ON
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-black/30 px-3 py-2">
                      <span className="text-sm">📺</span>
                      <div className="flex-1">
                        <p className="truncate text-[11px] font-semibold text-[var(--color-ink)]">
                          Solo Leveling — S2
                        </p>
                        <p className="font-mono text-[9px] text-[var(--color-mute)]">
                          Synced · Ep 8 → progress 8/13
                        </p>
                      </div>
                      <motion.span
                        className="text-xs text-emerald-400"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        ✓
                      </motion.span>
                    </div>
                  </div>
                </div>
              </NeonTiltCard>
            </motion.div>
          </div>
        </section>

        {/* ============ STAT STRIP ============ */}
        <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <NeonTiltCard overlay="rgba(10,10,15,0.9)">
                <div className="px-4 py-5 text-center">
                  <p
                    className="bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text font-display text-2xl font-black text-transparent"
                    style={{ filter: `drop-shadow(0 0 10px ${s.tint}44)` }}
                  >
                    {s.k}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--color-mute)]">{s.v}</p>
                </div>
              </NeonTiltCard>
            </motion.div>
          ))}
        </div>

        {/* ============ FEATURES ============ */}
        <section className="mb-14">
          <FadeIn>
            <div className="mb-6 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
                ✦ Features
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
                It just works, in the background
              </h2>
            </div>
          </FadeIn>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <NeonTiltCard>
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="h-1.5 w-8 rounded-full"
                        style={{ background: f.tint, boxShadow: `0 0 10px ${f.tint}88` }}
                      />
                      <AccentChip tint={f.tint} label={f.title} />
                    </div>
                    <motion.div
                      className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-base font-black text-black"
                      style={{
                        background: `linear-gradient(135deg, ${f.tint}, #ffffff22)`,
                        boxShadow: `0 0 18px ${f.tint}44`,
                      }}
                      whileHover={{ rotate: -6, scale: 1.08 }}
                    >
                      {f.icon}
                    </motion.div>
                    <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">{f.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)]">{f.desc}</p>
                  </div>
                </NeonTiltCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ============ INSTALL STEPS ============ */}
        <section className="mb-14">
          <FadeIn>
            <div className="mb-6 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">✦ Install</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
                Live in 1 minute
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <NeonTiltCard>
                  <div className="relative flex items-start gap-4 p-5">
                    <div className="absolute right-4 top-2 font-display text-5xl font-black text-white/[0.05]">
                      {s.n}
                    </div>
                    <motion.span
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-black"
                      style={{
                        background: `linear-gradient(135deg, ${s.tint}, #ffffff22)`,
                        boxShadow: `0 0 14px ${s.tint}44`,
                      }}
                      whileHover={{ rotate: 8, scale: 1.1 }}
                    >
                      {s.icon}
                    </motion.span>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-ink)]">
                        <span className="mr-1.5 font-mono" style={{ color: s.tint }}>{s.n}.</span>
                        {s.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)]">{s.desc}</p>
                    </div>
                  </div>
                </NeonTiltCard>
              </motion.div>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 p-6 text-center">
              <p className="text-sm text-[var(--color-mute)]">
                Already have the zip? Skip the download — just load it unpacked.{" "}
                <span className="text-[var(--color-cyan)]">Need help?</span> Check the README inside the zip.
              </p>
              <motion.a
                href="/api/extension/download"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="neon-rgb-border inline-flex items-center gap-2 rounded-full bg-[var(--color-void)]/70 px-6 py-2.5 text-sm font-bold text-[var(--color-ink)]"
              >
                ⬇ Download zyniverse-extension.zip
              </motion.a>
            </div>
          </FadeIn>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">✦ Pipeline</p>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
              How it works
            </h2>
          </FadeIn>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1 }}
              >
                <NeonTiltCard>
                  <div className="relative p-4">
                    {i < FLOW.length - 1 && (
                      <span
                        className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 text-[var(--color-cyan)] lg:block"
                        style={{ textShadow: "0 0 8px rgba(41,242,224,0.6)" }}
                      >
                        →
                      </span>
                    )}
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="grid h-8 w-8 place-items-center rounded-lg text-sm text-black"
                        style={{
                          background: `linear-gradient(135deg, ${f.tint}, #ffffff22)`,
                          boxShadow: `0 0 14px ${f.tint}44`,
                        }}
                      >
                        {f.icon}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--color-ink)]">{f.title}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--color-mute)]">{f.desc}</p>
                  </div>
                </NeonTiltCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-5 py-2 text-xs font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
            >
              API Docs →
            </Link>
            <Link
              href="/docs/changelog"
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-5 py-2 text-xs font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
            >
              Changelog
            </Link>
            <span className="ml-auto font-mono text-[10px] text-[var(--color-mute)]/60">
              POST /api/v1/scrobble · Bearer API key
            </span>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
