"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Segments {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function split(ms: number): Segments {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: total <= 0,
  };
}

/**
 * Live countdown to a contest's voting deadline. Everything time-dependent is
 * resolved inside an effect, so the server-rendered markup is just a neutral
 * placeholder and hydration can never mismatch.
 */
export default function ContestCountdown({
  target,
  color = "#00ffe0",
  compact = false,
  label = "Voting closes in",
}: {
  /** ISO timestamp of the deadline. */
  target: string;
  color?: string;
  /** Single-line chip for dense cards / rails. */
  compact?: boolean;
  label?: string;
}) {
  const deadline = new Date(target).getTime();
  const [remaining, setRemaining] = useState<Segments | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(split(deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (compact) {
    const text = !remaining
      ? "…"
      : remaining.done
        ? "Voting closed"
        : remaining.days > 0
          ? `${remaining.days}d ${remaining.hours}h left`
          : remaining.hours > 0
            ? `${remaining.hours}h ${remaining.minutes}m left`
            : `${remaining.minutes}m ${remaining.seconds}s left`;
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tabular-nums"
        style={{ background: `${color}12`, borderColor: `${color}44`, color }}
      >
        <motion.span
          animate={remaining && !remaining.done ? { opacity: [1, 0.35, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        {text}
      </span>
    );
  }

  const cells: { value: number | null; unit: string }[] = [
    { value: remaining ? remaining.days : null, unit: "days" },
    { value: remaining ? remaining.hours : null, unit: "hrs" },
    { value: remaining ? remaining.minutes : null, unit: "min" },
    { value: remaining ? remaining.seconds : null, unit: "sec" },
  ];

  return (
    <div>
      <p className="console-label mb-2 text-[10px]" style={{ color }}>
        {remaining?.done ? "● Voting closed" : `◷ ${label}`}
      </p>
      <div className="flex items-end gap-1.5" role="timer" aria-live="off">
        {cells.map((cell, i) => (
          <div key={cell.unit} className="flex items-end gap-1.5">
            <div className="flex flex-col items-center">
              <div
                className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border font-mono text-lg font-black tabular-nums sm:h-12 sm:w-12 sm:text-xl"
                style={{ borderColor: `${color}33`, background: `linear-gradient(180deg, ${color}14, rgba(0,0,0,0.35))` }}
              >
                <motion.span
                  key={cell.value ?? "…"}
                  initial={{ y: i === 3 ? -14 : 0, opacity: i === 3 ? 0 : 1 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="text-white"
                >
                  {cell.value === null ? "--" : String(cell.value).padStart(2, "0")}
                </motion.span>
                <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/10" />
              </div>
              <span className="mt-1 text-[9px] uppercase tracking-widest text-[var(--color-mute)]">{cell.unit}</span>
            </div>
            {i < cells.length - 1 && <span className="pb-5 font-mono text-sm text-white/25">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
