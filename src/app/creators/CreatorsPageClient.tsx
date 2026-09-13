"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CreatorCard from "@/components/CreatorCard";
import Link from "next/link";

const SPRING = { type: "spring", stiffness: 260, damping: 20 } as const;

interface CreatorData {
  id: string;
  displayName: string | null;
  bio: string | null;
  totalTips: number;
  kofiUrl: string | null;
  buymeacoffeeUrl: string | null;
  upiId: string | null;
  user: { id: string; username: string; avatar: string | null };
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (target <= 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatPill({ value, label, prefix = "" }: { value: number; label: string; prefix?: string }) {
  const v = useCountUp(value);
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-2xl font-bold tabular-nums text-white">
        {prefix}
        {v.toLocaleString("en-IN")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] leading-tight">{label}</span>
    </div>
  );
}

export default function CreatorsPageClient({
  creators: initial,
  isLoggedIn,
  currentUserId,
  stats,
}: {
  creators: CreatorData[];
  isLoggedIn: boolean;
  currentUserId: string | null;
  stats: { totalCreators: number; totalReceived: number; totalTips: number };
}) {
  const [search, setSearch] = useState("");

  const filtered = initial.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.displayName?.toLowerCase().includes(q) ||
      c.user.username.toLowerCase().includes(q) ||
      c.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <PageTransition>
      <ErrorBoundary label="Creators">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {/* ── Hero ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="neon-rgb-ring relative mb-10 overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
            <div
              className="absolute inset-0 opacity-[0.2] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--color-magenta)]/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--color-cyan)]/20 blur-[100px]" />

            <div className="relative z-10 px-8 py-12 sm:px-12">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, ...SPRING }}
                className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_12px_var(--color-cyan)]" />
                Support the community
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, ...SPRING }}
                className="font-display text-4xl font-bold sm:text-5xl"
              >
                <span className="neon-text-gradient">Anime Creators</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...SPRING }}
                className="mt-4 max-w-xl text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Discover artists, editors, cosplayers, and musicians. Drop a tip to show some love — every rupee goes
                straight to the creator.
              </motion.p>

              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, ...SPRING }}
                  className="mt-7"
                >
                  {currentUserId && (
                    <Link
                      href="/creators/setup"
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] bg-[length:200%_100%] transition-[background-position] duration-500 group-hover:bg-[position:100%_0]" />
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        My Creator Profile
                      </span>
                    </Link>
                  )}
                </motion.div>
              )}
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-8 border-t border-white/10 bg-black/20 px-8 py-5 sm:px-12">
              <StatPill value={stats.totalCreators} label="Creators" />
              <div className="h-8 w-px bg-white/10" />
              <StatPill value={stats.totalReceived} label="Rupees received" prefix="₹" />
              <div className="h-8 w-px bg-white/10" />
              <StatPill value={stats.totalTips} label="Tips sent" />
            </div>
          </motion.div>

          {/* ── Filter row ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, ...SPRING }}
            className="mb-8"
          >
            <div className="relative max-w-md">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-mute)]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, handle, or craft..."
                className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] py-3 pl-11 pr-4 text-sm text-[var(--color-ink)] shadow-[0_0_0px_transparent] transition-shadow placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)] focus:shadow-[0_0_24px_rgba(0,255,224,0.12)] focus:outline-none"
              />
            </div>
          </motion.div>

          {/* ── Grid ─────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((creator, i) => (
                <motion.div
                  key={creator.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: Math.min(i * 0.05, 0.5), ...SPRING }}
                >
                  <CreatorCard creator={creator} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎨</div>
              <p className="text-lg font-bold text-[var(--color-mute)]">
                {search ? "No creators found" : "No creators yet"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-mute)]">
                {search ? "Try a different search" : "Be the first to set up a creator profile"}
              </p>
              {!search && !isLoggedIn && (
                <Link
                  href="/creators/setup"
                  className="mt-6 inline-flex rounded-xl px-6 py-2.5 text-sm font-bold text-black transition-all hover:brightness-110"
                  style={{ background: "linear-gradient(90deg, #00ffe0, #ff7ad9)", boxShadow: "0 0 26px rgba(0,255,224,0.3)" }}
                >
                  Set Up Your Profile
                </Link>
              )}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}