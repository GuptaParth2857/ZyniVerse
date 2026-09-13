"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CommissionGrid from "@/components/CommissionGrid";

const SPRING = { type: "spring", stiffness: 260, damping: 20 } as const;

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

function StatPill({ value, label }: { value: number; label: string }) {
  const v = useCountUp(value);
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-2xl font-bold tabular-nums text-white">{v.toLocaleString("en-IN")}</span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] leading-tight">{label}</span>
    </div>
  );
}

export default function CommissionsPage() {
  const { status } = useSession();
  const [stats, setStats] = useState({ total: 0, creators: 0 });

  useEffect(() => {
    fetch("/api/commissions?perPage=1")
      .then((r) => r.json())
      .then((data) => setStats({ total: data.total ?? 0, creators: data.creators ?? 0 }))
      .catch(() => {});
  }, []);

  return (
    <PageTransition>
      <ErrorBoundary label="Commissions">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="neon-rgb-ring relative mb-8 overflow-hidden rounded-3xl"
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
                Marketplace
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, ...SPRING }}
                className="font-display text-4xl font-bold sm:text-5xl"
              >
                <span className="neon-text-gradient">Commission Marketplace</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...SPRING }}
                className="mt-4 max-w-xl text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Find incredible anime artists and creators. Commission custom fan art, cosplay, music, editing, and
                more from the community.
              </motion.p>

              {status === "authenticated" && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, ...SPRING }}
                  className="mt-7"
                >
                  <Link
                    href="/commissions/create"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] bg-[length:200%_100%] transition-[background-position] duration-500 group-hover:bg-[position:100%_0]" />
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Create Listing
                    </span>
                  </Link>
                </motion.div>
              )}
            </div>

            <div className="relative z-10 flex items-center gap-8 border-t border-white/10 bg-black/20 px-8 py-5 sm:px-12">
              <StatPill value={stats.total} label="Commission Listings" />
              <div className="h-8 w-px bg-white/10" />
              <StatPill value={stats.creators} label="Active Creators" />
            </div>
          </motion.div>

          <CommissionGrid />
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}