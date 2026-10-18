"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { contestTypeMeta, type ContestHistoryDTO } from "@/lib/contest-meta";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;
const MEDALS = ["🥇", "🥈", "🥉"];

function weekRange(start: string, end: string) {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(new Date(start))} – ${fmt(new Date(end))}`;
}

function TrophyCard({ item }: { item: ContestHistoryDTO }) {
  const meta = contestTypeMeta(item.type);
  const podium = item.podium.slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={spring}
      className="meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-5 backdrop-blur-sm sm:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(60% 90% at 8% 0%, ${meta.color}22, transparent 65%)` }}
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: `${meta.color}55`, background: `${meta.color}12`, color: meta.color }}
            >
              {meta.icon} {meta.label}
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] text-[var(--color-mute)]">
              📅 {weekRange(item.weekStart, item.weekEnd)}
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] text-[var(--color-mute)]">
              {item.entryCount} {item.entryCount === 1 ? "entry" : "entries"}
            </span>
          </div>
          <h2 className="mt-3 font-display text-xl font-bold sm:text-2xl">{item.title}</h2>
          {item.description && <p className="mt-1 max-w-xl text-xs text-[var(--color-mute)]">{item.description}</p>}
          <p className="mt-3 text-[11px] uppercase tracking-widest text-[var(--color-mute)]">
            Prize · <span className="text-white/85">+{item.rewardXp} XP</span> · <span className="text-white/85">50 🪙</span>
            {item.rewardBadge && <> · 🎖️ {item.rewardBadge}</>}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-[#ffd700]/40 bg-[#ffd700]/10 px-4 py-3">
          <span className="text-2xl">👑</span>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#ffd700]/80">Champion</p>
            <p className="text-sm font-bold text-white">@{item.winner?.username ?? podium[0]?.username ?? "—"}</p>
          </div>
        </div>
      </div>

      {podium.length > 0 && (
        <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
          {podium.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.08 * i, ...spring }}
              className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/30 ${
                i === 0 ? "sm:-translate-y-1" : ""
              }`}
            >
              {entry.image ? (
                <>
                  <div className="absolute inset-0 shimmer" />
                  <Image
                    src={entry.image}
                    alt={entry.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width:640px) 100vw, 33vw"
                  />
                </>
              ) : (
                <div className="aspect-[4/5] w-full bg-black/40" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="absolute left-2 top-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                    i === 0
                      ? "bg-gradient-to-r from-[#ffd700] to-[var(--color-magenta)] text-black"
                      : "border border-white/15 bg-black/70 text-white"
                  }`}
                >
                  {MEDALS[i]} #{i + 1}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <p className="line-clamp-1 text-xs font-semibold text-white">{entry.title}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-[var(--color-mute)]">@{entry.username}</p>
                  <p className="font-mono text-[10px] font-bold tabular-nums" style={{ color: meta.color }}>
                    👍 {entry.upvotes}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.article>
  );
}

export default function HallOfFameClient() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ContestHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/contests/hall-of-fame")
      .then((r) => r.json())
      .then((d) => setItems(d.contests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalEntries = items.reduce((sum, c) => sum + c.entryCount, 0);
    const types = new Set(items.map((c) => c.type));
    const memberNames = items.map((c) => c.winner?.username).filter(Boolean);
    const uniqueChamps = new Set(memberNames).size;
    return { totalEntries, types: types.size, uniqueChamps };
  }, [items]);

  const me = session?.user?.id;

  return (
    <div>
      <div className="mb-6">
        <p className="console-label mb-2">🏛️ Archive</p>
        <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-4xl">
          Hall of Fame
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-mute)]">
          Every battle that has closed, newest first — the champion, their winning entry and the runners-up.
        </p>
      </div>

      {!loading && items.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { icon: "⚔️", label: "Battles closed", value: items.length },
            { icon: "🖼️", label: "Entries judged", value: stats.totalEntries },
            { icon: "🏆", label: "Unique champions", value: stats.uniqueChamps },
            { icon: "🎯", label: "Categories", value: stats.types },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.07] bg-black/25 px-4 py-3"
            >
              <p className="font-mono text-lg font-black tabular-nums text-[var(--color-cyan)]">{s.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-mute)]">
                {s.icon} {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-16 text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mb-3 text-5xl">
            🗄️
          </motion.div>
          <p className="font-display text-xl">No battles closed yet</p>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            The archive fills up the moment the first week ends. Go win the opening title.
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
              🚀 Submit an entry
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.id}>
              {me && item.winnerId === me && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-2 inline-block rounded-full border border-[#ffd700]/50 bg-[#ffd700]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#ffd700]"
                >
                  ✨ You won this one
                </motion.span>
              )}
              <TrophyCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
