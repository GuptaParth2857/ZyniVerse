"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { AnimeEvent } from "@/lib/anime-events";

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  expo: { icon: "🎯", color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10" },
  convention: { icon: "🎪", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
  stream: { icon: "📺", color: "text-blue-400 border-blue-500/40 bg-blue-500/10" },
  festival: { icon: "🎆", color: "text-pink-400 border-pink-500/40 bg-pink-500/10" },
  premiere: { icon: "🎬", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "text-green-400 border-green-500/50 bg-green-500/10",
  ongoing: "text-blue-400 border-blue-500/50 bg-blue-500/10 animate-pulse",
  past: "text-gray-400 border-gray-500/30 bg-gray-500/10",
};

export default function EventDetailHero({
  event,
  dateStr,
  countdownText,
  isPast,
}: {
  event: AnimeEvent;
  dateStr: string;
  countdownText: string;
  isPast: boolean;
}) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.convention;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-[var(--color-cyan)] transition-colors mb-6 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-2xl">{config.icon}</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
              {event.type}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[event.status] || STATUS_COLORS.upcoming}`}>
              {event.status}
            </span>
          </div>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
              {event.name}
            </h1>
          </div>
          <p className="text-sm text-white/70">{event.location}</p>
          <p className="text-xs font-mono text-[var(--color-cyan)]/80 mt-1">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isPast && (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${
              event.status === "ongoing"
                ? "text-blue-400 bg-blue-500/20 border border-blue-500/30"
                : countdownText === "Tomorrow" || countdownText === "Happening Today!"
                  ? "text-amber-400 bg-amber-500/20 border border-amber-500/30"
                  : "text-green-400 bg-green-500/20 border border-green-500/30"
            }`}>
              {countdownText}
            </span>
          )}
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[var(--color-cyan)] px-5 py-2.5 text-xs font-semibold text-black hover:opacity-80 transition-opacity"
          >
            Official Website ↗
          </a>
        </div>
      </div>
    </motion.div>
  );
}
