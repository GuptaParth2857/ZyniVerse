"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import type { ContestLeaderDTO } from "@/lib/contest-meta";

const spring = { type: "spring", stiffness: 280, damping: 28 } as const;
const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_STYLE: Record<number, string> = {
  1: "rgba(255,215,0,0.7)",
  2: "rgba(203,213,225,0.65)",
  3: "rgba(217,119,6,0.65)",
};

function Avatar({ username, avatar }: { username: string; avatar: string | null }) {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--color-void)] text-[11px] font-bold text-[var(--color-mute)] ring-1 ring-white/10">
      {avatar ? <Image src={avatar} alt="" fill className="object-cover" sizes="36px" /> : (username || "?")[0].toUpperCase()}
    </span>
  );
}

export default function LeaderboardClient() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<ContestLeaderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/contests/leaderboard")
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const me = session?.user?.id;
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div>
      <div className="mb-6">
        <p className="console-label mb-2">🥇 All-time standings</p>
        <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-4xl">
          Contest Leaderboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-mute)]">
          Ranked by weekly battle wins, then total votes earned. Climb the board, take home badges and coins.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="shimmer h-56 w-full rounded-3xl" />
          <div className="shimmer h-72 w-full rounded-3xl" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-16 text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mb-3 text-5xl">
            📭
          </motion.div>
          <p className="font-display text-xl">Nobody has won yet</p>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            The first champion will be crowned when this week&apos;s battles close.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Link
              href="/contests"
              className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black"
            >
              ← Current battles
            </Link>
            <Link
              href="/contests/submit"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[11px] font-bold text-white/80 hover:text-[var(--color-cyan)]"
            >
              🚀 Enter a battle
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ----------------------------------------------------- Podium */}
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {podium.map((row, i) => (
              <motion.div
                key={row.userId}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, ...spring }}
                whileHover={{ y: -4 }}
                className={`relative overflow-hidden rounded-3xl border bg-black/30 p-5 text-center ${
                  i === 0 ? "sm:-translate-y-3 sm:pb-7" : ""
                }`}
                style={{ boxShadow: `0 0 0 1px ${PODIUM_STYLE[i + 1]}` }}
              >
                <span className="pointer-events-none absolute inset-x-8 top-0 h-px meme-hairline" />
                <p className="text-3xl">{MEDALS[i]}</p>
                <div className="mt-3 flex justify-center">
                  <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--color-void)] text-lg font-black text-white ring-2" style={{ boxShadow: `0 0 0 2px ${PODIUM_STYLE[i + 1]}` }}>
                    {row.avatar ? <Image src={row.avatar} alt="" fill className="object-cover" sizes="64px" /> : (row.username || "?")[0].toUpperCase()}
                  </span>
                </div>
                <p className="mt-3 truncate text-sm font-bold text-white">@{row.username}</p>
                <p className="mt-1 font-mono text-xl font-black tabular-nums text-[var(--color-cyan)]">{row.wins}</p>
                <p className="text-[9px] uppercase tracking-widest text-[var(--color-mute)]">weekly wins</p>
                <p className="mt-2 text-[10px] text-[var(--color-mute)]">
                  {row.votes} votes · {row.entries} entries
                </p>
              </motion.div>
            ))}
          </div>

          {/* ------------------------------------------------------- Table */}
          <div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm">
            <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-white/[0.06] bg-[#0a0910]/70 px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-mute)] sm:grid-cols-[52px_1fr_90px_90px_90px] sm:px-6">
              <span>Rank</span>
              <span>Member</span>
              <span className="text-right">Wins</span>
              <span className="hidden text-right sm:block">Votes</span>
              <span className="hidden text-right sm:block">Entries</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {rest.map((row, i) => {
                const isMe = me && row.userId === me;
                return (
                  <motion.div
                    key={row.userId}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className={`grid grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[52px_1fr_90px_90px_90px] sm:px-6 ${
                      isMe ? "bg-[var(--color-cyan)]/[0.07]" : ""
                    }`}
                  >
                    <span className="font-mono text-sm font-black text-[var(--color-mute)]">#{i + 4}</span>
                    <Link href={`/creators/${row.username}`} className="flex min-w-0 items-center gap-2.5 hover:text-[var(--color-cyan)]">
                      <Avatar username={row.username} avatar={row.avatar} />
                      <span className="truncate text-xs font-semibold text-white/90">
                        @{row.username}
                        {isMe && <span className="ml-2 rounded-full bg-[var(--color-cyan)]/20 px-2 py-0.5 text-[9px] font-black uppercase text-[var(--color-cyan)]">You</span>}
                      </span>
                    </Link>
                    <span className="text-right font-mono text-sm font-black tabular-nums text-[var(--color-cyan)]">{row.wins}</span>
                    <span className="hidden text-right font-mono text-xs tabular-nums text-[var(--color-mute)] sm:block">{row.votes}</span>
                    <span className="hidden text-right font-mono text-xs tabular-nums text-[var(--color-mute)] sm:block">{row.entries}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-[var(--color-mute)]">
            Standings update as votes land. Wins are awarded when each weekly battle closes.
          </p>
        </>
      )}
    </div>
  );
}
