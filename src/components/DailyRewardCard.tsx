"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Status {
  authenticated: boolean;
  streak?: number;
  totalClaims?: number;
  totalXpAwarded?: number;
  claimedToday?: boolean;
  freezes?: number;
}

export default function DailyRewardCard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Status | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ xp: number; streak: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      void fetch("/api/daily-login/claim").then((r) => r.json()).then((d: Status) => setData(d)).catch(() => {});
    }
  }, [status, session?.user?.id]);

  async function claim() {
    if (busy || claimed) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/daily-login/claim", { method: "POST" });
      const d = await res.json();
      if (res.status === 409) {
        setClaimed(true);
        setData(d as Status);
        return;
      }
      if (!res.ok) throw new Error(d.error || "Couldn't claim.");
      setClaimed(true);
      setToast({ xp: d.xp, streak: d.streak });
      setData((prev) => ({ ...(prev ?? { authenticated: true }), streak: d.streak, freezes: d.remainingFreezes, claimedToday: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't claim your bonus.");
    } finally {
      setBusy(false);
    }
  }

  if (!data?.authenticated) return null;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#ffb800]/30 bg-gradient-to-br from-[#ffb800]/10 via-[var(--color-panel)] to-[#ff7b00]/10 shadow-[0_0_25px_-10px_rgba(255,184,0,0.35)]">
      <div className="flex items-center justify-between gap-1.5 px-4 py-3 border-b border-[var(--color-line)]">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#ffb800]">⚡ Daily Login Reward</p>
        {data.streak ? (
          <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-bold text-[#ffb800]" aria-label={`${data.streak} day streak`}>
            🔥 {data.streak}-day streak
          </span>
        ) : null}
      </div>

      <div className="px-4 py-4">
        {data.claimedToday || claimed ? (
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffb800]/20 text-xl">🔥</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#ffb800]">Claimed for today!</p>
              <p className="text-xs text-[var(--color-mute)]">
                {toast ? <>+{toast.xp} XP earned on a {toast.streak}-day streak 🎉</> : <>See you again tomorrow to keep your streak alive.</>}
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-0.5 text-sm text-[var(--color-mute)]">
              Log in daily to earn XP and build your streak. Longer streak = bigger bonus.
              {data.streak && data.freezes ? (
                <span className="text-[var(--color-cyan)]"> You have {data.freezes} streak freeze{data.freezes > 1 ? "s" : ""}.</span>
              ) : null}
            </p>
            {error && <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">{error}</p>}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={claim}
              disabled={busy}
              className="mt-3 rounded-xl bg-gradient-to-r from-[#ffb800] to-[#ff7b00] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-60 transition-opacity"
            >
              {busy ? "Claiming…" : data.streak ? `Continue ${data.streak + 1}-day streak  •  +${Math.min(10 + (data.streak + 1) * 2, 40)} XP` : "Claim Day 1  •  +12 XP"}
            </motion.button>
          </>
        )}

        {toast && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-3 rounded-xl border border-[#ffb800]/40 bg-black/30 px-3 py-2 text-sm font-semibold text-[#ffb800]"
            >
              +{toast.xp} XP • {toast.streak}-day streak 🔥
            </motion.div>
          </AnimatePresence>
        )}

        <Link href="/profile" className="mt-3 inline-block text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">View my XP & ranks →</Link>
      </div>
    </div>
  );
}