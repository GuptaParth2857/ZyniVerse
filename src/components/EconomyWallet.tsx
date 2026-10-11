"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import type { RankInfo } from "@/lib/achievements";
import { RankPill } from "@/components/RankBadge";

interface LedgerEntry {
  id: string;
  currency: "coin" | "xp";
  amount: number;
  balanceAfter: number;
  reason: string;
  label: string;
  ref: string | null;
  createdAt: string;
}

interface EarnRate {
  reason: string;
  label: string;
  coins: number;
  xp: number;
}

interface ShopItem {
  key: string;
  label: string;
  cost: number;
  icon: string;
  description: string;
}

interface EconomyState {
  authenticated: boolean;
  coins: number;
  lifetimeEarned: number;
  points: number;
  level: number;
  levelProgress: { current: number; needed: number };
  rank: RankInfo;
  nextRank: { rank: RankInfo; needed: number } | null;
  freezes: number;
  recent: LedgerEntry[];
  rates: EarnRate[];
  shop: ShopItem[];
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function EconomyWallet() {
  const { status } = useSession();
  const [state, setState] = useState<EconomyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchEconomy = useCallback(async (): Promise<EconomyState> => {
    const res = await fetch("/api/economy");
    return (await res.json()) as EconomyState;
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    void fetchEconomy()
      .then((d) => {
        if (cancelled) return;
        setState(d);
        setLoading(false);
      })
      .catch(() => {
        // Leave the widget empty; the next mount (or purchase) retries.
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, fetchEconomy]);

  async function buy(item: ShopItem) {
    if (busyItem) return;
    setBusyItem(item.key);
    setError("");
    setToast(null);
    try {
      const res = await fetch("/api/economy/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: item.key }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Purchase failed.");
      setToast(`Bought ${item.icon} ${item.label} for ${item.cost} coins!`);
      setState(await fetchEconomy());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed.");
    } finally {
      setBusyItem(null);
    }
  }

  if (status === "loading" || (loading && status === "authenticated")) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
        <div className="h-4 w-40 animate-pulse rounded bg-[var(--color-line)]" />
        <div className="mt-3 h-20 animate-pulse rounded-xl bg-[var(--color-line)]/50" />
      </div>
    );
  }

  if (!state?.authenticated) return null;

  const { coins, lifetimeEarned, points, level, rank, freezes, recent, rates, shop } = state;
  const xpPercent = state.levelProgress.needed > 0
    ? Math.min(100, Math.round((state.levelProgress.current / state.levelProgress.needed) * 100))
    : 100;
  const freezeItem = shop.find((s) => s.key === "streak_freeze");

  return (
    <div className="rounded-2xl border-2 border-[var(--color-violet)]/30 bg-gradient-to-br from-[var(--color-violet)]/10 via-[var(--color-panel)] to-[var(--color-cyan)]/10 p-4 shadow-[0_0_25px_-12px_var(--color-violet)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-line)] pb-3">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-violet)]">🪙 Coins &amp; XP</p>
        <RankPill rank={rank} />
      </div>

      {/* Balances */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-[#ffb800]/30 bg-black/20 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Coins</p>
          <p className="mt-1 text-2xl font-black text-[#ffb800]">{coins.toLocaleString()}</p>
          <p className="mt-0.5 text-[10px] text-[var(--color-mute)]">{lifetimeEarned.toLocaleString()} earned all-time</p>
        </div>
        <div className="rounded-xl border border-[var(--color-cyan)]/30 bg-black/20 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Level {level}</p>
          <p className="mt-1 text-2xl font-black text-[var(--color-cyan)]">{points.toLocaleString()}</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-cyan), var(--color-violet))" }}
            />
          </div>
          <p className="mt-1 text-[10px] text-[var(--color-mute)]">
            {state.levelProgress.needed
              ? `${(state.levelProgress.needed - state.levelProgress.current).toLocaleString()} XP to LV.${level + 1}`
              : "Max level"}
          </p>
        </div>
      </div>

      {/* Shop */}
      {freezeItem && (
        <div className="mt-3 rounded-xl border border-[var(--color-line)] bg-black/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {freezeItem.icon} {freezeItem.label}
                <span className="ml-2 rounded-full bg-black/40 px-2 py-0.5 font-mono text-[10px] text-[var(--color-cyan)]">{freezes} owned</span>
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--color-mute)]">{freezeItem.description}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => buy(freezeItem)}
              disabled={busyItem !== null || coins < freezeItem.cost}
              className="shrink-0 rounded-xl bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-cyan)] px-4 py-2 text-xs font-bold text-black transition-opacity disabled:opacity-40"
            >
              {busyItem === freezeItem.key ? "Buying…" : `Buy · ${freezeItem.cost} 🪙`}
            </motion.button>
          </div>
          {coins < freezeItem.cost && (
            <p className="mt-2 text-[11px] text-[var(--color-mute)]">
              Need {(freezeItem.cost - coins).toLocaleString()} more coins — claim your daily reward to earn them.
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300"
          >
            {error}
          </motion.p>
        )}
        {toast && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 rounded-lg border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-cyan)]"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Recent activity */}
      <div className="mt-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Recent activity</p>
        {recent.length === 0 ? (
          <p className="mt-1.5 text-xs text-[var(--color-mute)]">No coin or XP movements yet. Your first claim starts the ledger.</p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {recent.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-xs hover:bg-white/5">
                <span className="flex min-w-0 items-center gap-1.5 text-[var(--color-mute)]">
                  <span>{entry.currency === "coin" ? "🪙" : "⚡"}</span>
                  <span className="truncate">{entry.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`font-mono font-bold ${entry.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {entry.amount >= 0 ? "+" : ""}{entry.amount.toLocaleString()}
                  </span>
                  <span className="w-14 text-right text-[10px] text-[var(--color-mute)]">{timeAgo(entry.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Earn rates */}
      <div className="mt-3 rounded-xl border border-[var(--color-line)] bg-black/20 p-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">How to earn</p>
        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
          {rates.map((r) => (
            <div key={r.reason} className="flex items-center justify-between text-[11px]">
              <span className="truncate text-[var(--color-mute)]">{r.label}</span>
              <span className="ml-2 shrink-0 font-mono text-[10px] text-[#ffb800]">
                {r.coins > 0 ? `+${r.coins}🪙` : ""}
                {r.coins > 0 && r.xp > 0 ? " " : ""}
                {r.xp > 0 ? `+${r.xp}⚡` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
