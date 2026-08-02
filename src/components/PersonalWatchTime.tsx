"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const TOTAL_EPISODES = 500000;
const ONE_PIECE_EPS = 1120;
const NARUTO_EPS = 720;

export default function PersonalWatchTime() {
  const [episodes, setEpisodes] = useState<number>(0);
  const [avgMin, setAvgMin] = useState<number>(24);

  const stats = useMemo(() => {
    if (episodes <= 0) return null;
    const hours = (episodes * avgMin) / 60;
    const days = hours / 24;
    const weeks = days / 7;
    const months = days / 30.44;
    const years = days / 365.25;
    const pctOfAll = (episodes / TOTAL_EPISODES) * 100;
    const onePieceEq = episodes / ONE_PIECE_EPS;
    const narutoEq = episodes / NARUTO_EPS;
    return { hours, days, weeks, months, years, pctOfAll, onePieceEq, narutoEq };
  }, [episodes, avgMin]);

  return (
    <section className="mb-16">
      <h2 className="font-display text-2xl font-bold mb-6 text-center">Your Personal Watch Time</h2>
      <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1.5">Episodes You’ve Watched</label>
            <input
              type="number"
              min={0}
              value={episodes || ""}
              onChange={(e) => setEpisodes(Number(e.target.value))}
              placeholder="e.g. 850"
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--color-cyan)]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1.5">Avg Episode Length (min)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={avgMin}
              onChange={(e) => setAvgMin(Math.min(60, Math.max(1, Number(e.target.value))))}
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--color-cyan)]/50 transition-colors"
            />
          </div>
        </div>

        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
              <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
                <p className="font-display text-2xl font-bold text-[var(--color-cyan)]">{stats.hours.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Hours Watched</p>
              </div>
              <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
                <p className="font-display text-2xl font-bold text-[var(--color-magenta)]">{stats.days.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Days of Non-Stop Anime</p>
              </div>
              <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
                <p className="font-display text-2xl font-bold text-[var(--color-amber)]">{stats.pctOfAll.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">of All Anime Ever</p>
              </div>
              <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
                <p className="font-display text-2xl font-bold text-[var(--color-cyan)]">{stats.onePieceEq.toLocaleString(undefined, { maximumFractionDigits: 1 })}x</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">One Piece Rewatches</p>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--color-void)] p-4 text-sm text-[var(--color-mute)]">
              <p className="mb-1">
                That&apos;s <strong className="text-[var(--color-cyan)]">{stats.weeks.toLocaleString(undefined, { maximumFractionDigits: 1 })} weeks</strong>
                {" "}of your life — about <strong className="text-[var(--color-magenta)]">{stats.years.toLocaleString(undefined, { maximumFractionDigits: 2 })} years</strong>.
              </p>
              <p>
                Equivalent to watching <strong className="text-[var(--color-cyan)]">Naruto {stats.narutoEq.toLocaleString(undefined, { maximumFractionDigits: 1 })} times</strong>
                {" "}or the whole of Detective Conan{" "}
                <strong className="text-[var(--color-magenta)]">{(episodes / 1150).toLocaleString(undefined, { maximumFractionDigits: 1 })} times</strong>.
              </p>
            </div>
          </motion.div>
        )}

        {!stats && (
          <p className="text-center text-xs text-[var(--color-mute)]">
            Enter your episodes watched above to see your personal stats.
          </p>
        )}
      </div>
    </section>
  );
}
