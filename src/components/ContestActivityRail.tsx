"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { contestTypeMeta, type ContestActivityDTO } from "@/lib/contest-meta";

function relativeTime(iso: string, now: number): string {
  const diff = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (diff < 45) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Live "who voted for what" rail. Polls a 20s-cached endpoint while mounted. */
export default function ContestActivityRail() {
  const [items, setItems] = useState<ContestActivityDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/contests/activity")
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          setItems((d.activity || []).slice(0, 12));
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setLoading(false);
        });
    void load();
    const id = setInterval(() => void load(), 45000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0a0910]/70 px-4 py-3">
        <motion.span
          animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-2 w-2 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_var(--color-cyan)]"
        />
        <p className="console-label text-[10px]">Live votes</p>
        <Link href="/contests/leaderboard" className="ml-auto text-[10px] font-bold text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]">
          Leaderboard →
        </Link>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {loading && items.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="shimmer h-7 w-7 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="shimmer h-3 w-3/4 rounded" />
                  <div className="shimmer h-2.5 w-1/3 rounded" />
                </div>
              </div>
            ))
          : items.slice(0, 12).map((a, i) => {
              const meta = contestTypeMeta(a.contestType);
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 6) * 0.04, duration: 0.3 }}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-void)] text-[9px] text-[var(--color-mute)] ring-1 ring-white/10">
                    {a.avatar ? <Image src={a.avatar} alt="" fill className="object-cover" sizes="28px" /> : (a.username || "?")[0].toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-white/85">
                      <span className="font-semibold">@{a.username}</span> voted{" "}
                      <span className="text-white/60">👍</span>
                    </p>
                    <p className="truncate text-[10px] text-[var(--color-mute)]">
                      {meta.icon} {a.entryTitle} · {a.contestTitle}
                    </p>
                  </div>
                  {now !== null && (
                    <span className="shrink-0 font-mono text-[9px] text-[var(--color-mute)]">{relativeTime(a.createdAt, now)}</span>
                  )}
                </motion.div>
              );
            })}
      </div>

      {!loading && items.length === 0 && (
        <p className="px-4 py-6 text-center text-[11px] text-[var(--color-mute)]">
          No votes yet this week — be the first to pick a favourite.
        </p>
      )}
    </div>
  );
}
