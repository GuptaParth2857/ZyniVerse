"use client";

import { useState } from "react";
import Link from "next/link";

interface Entry {
  mediaId: number;
  title: string;
  cover: string;
  agree: number;
  refute: number;
  total: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

function AgreeBar({ agree, refute }: { agree: number; refute: number }) {
  const total = agree + refute;
  const pct = total === 0 ? 50 : Math.round((agree / total) * 100);
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-cyan)]" style={{ width: `${pct}%` }} />
      </div>
      <span className="whitespace-nowrap text-[10px] text-white/50">{Math.round(pct)}% agree</span>
    </div>
  );
}

export default function TheoryLeaderboard({ initial, initialPeriod }: { initial: Entry[]; initialPeriod: "all" | "week" }) {
  const [period, setPeriod] = useState<"all" | "week">(initialPeriod);
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [loading, setLoading] = useState(false);

  const switchPeriod = async (p: "all" | "week") => {
    if (p === period) return;
    setPeriod(p);
    setLoading(true);
    try {
      const res = await fetch(`/api/theories/leaderboard?period=${p}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.entries)) setEntries(data.entries);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => switchPeriod("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            period === "all"
              ? "bg-[var(--color-cyan)] text-black shadow-[0_0_16px_-4px_var(--color-cyan)]"
              : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          All-Time
        </button>
        <button
          onClick={() => switchPeriod("week")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            period === "week"
              ? "bg-[var(--color-cyan)] text-black shadow-[0_0_16px_-4px_var(--color-cyan)]"
              : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          This Week
        </button>
      </div>

      {loading && <p className="mb-3 text-xs text-white/40">Refreshing…</p>}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/50">
          No theory votes yet. Open any anime → Zyni AI Lab → vote agree/refute on a fan theory to see it ranked here.
        </div>
      ) : (
        <ol className="space-y-2">
          {entries.map((e, i) => (
            <li key={`${period}-${e.mediaId}`}>
              <Link
                href={`/anime/${e.mediaId}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-[var(--color-cyan)]/40 hover:bg-white/10"
              >
                <span className="w-8 shrink-0 text-center text-lg">{MEDALS[i] ?? `${i + 1}`}</span>
                {e.cover ? (
                  <img src={e.cover} alt={e.title} loading="lazy" className="h-16 w-11 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="flex h-16 w-11 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs text-white/40">?</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{e.title}</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    🙏 {e.agree} agree · 🧢 {e.refute} refute · <span className="font-semibold text-[var(--color-cyan)]">{e.total} votes</span>
                  </p>
                  <AgreeBar agree={e.agree} refute={e.refute} />
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}