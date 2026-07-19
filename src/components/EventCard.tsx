"use client";

import Link from "next/link";
import type { AnimeEvent } from "@/lib/anime-events";

const TYPE_CONFIG: Record<string, { icon: string; color: string; gradient: string }> = {
  expo: { icon: "🎯", color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10", gradient: "from-cyan-500/20" },
  convention: { icon: "🎪", color: "text-purple-400 border-purple-500/40 bg-purple-500/10", gradient: "from-purple-500/20" },
  stream: { icon: "📺", color: "text-blue-400 border-blue-500/40 bg-blue-500/10", gradient: "from-blue-500/20" },
  festival: { icon: "🎆", color: "text-pink-400 border-pink-500/40 bg-pink-500/10", gradient: "from-pink-500/20" },
  premiere: { icon: "🎬", color: "text-amber-400 border-amber-500/40 bg-amber-500/10", gradient: "from-amber-500/20" },
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "text-green-400 border-green-500/40 bg-green-500/10",
  ongoing: "text-blue-400 border-blue-500/40 bg-blue-500/10 animate-pulse",
  past: "text-gray-400 border-gray-500/30 bg-gray-500/10",
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  expo: "bg-cyan-500/10 text-cyan-400",
  convention: "bg-purple-500/10 text-purple-400",
  stream: "bg-blue-500/10 text-blue-400",
  festival: "bg-pink-500/10 text-pink-400",
  premiere: "bg-amber-500/10 text-amber-400",
};

export default function EventCard({ event }: { event: AnimeEvent }) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const isPast = event.status === "past";
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.convention;

  const dateStr = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const daysUntil = Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const countdownText = isPast
    ? "Ended"
    : daysUntil === 0
      ? "Today!"
      : daysUntil === 1
        ? "Tomorrow"
        : daysUntil > 0
          ? `In ${daysUntil} days`
          : "Ongoing";

  return (
    <Link href={`/events/${event.slug}`}>
      <div className={`group relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 backdrop-blur-sm overflow-hidden transition-all hover:border-[var(--color-cyan)]/40 hover:shadow-xl hover:shadow-[var(--color-cyan)]/5 ${isPast ? "opacity-70 hover:opacity-100" : ""}`}>
        {/* Top gradient bar */}
        <div className={`h-1 bg-gradient-to-r ${config.gradient} to-transparent`} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${config.color}`}>
                {config.icon} {event.type}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[event.status]}`}>
                {event.status}
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-mute)]/50 shrink-0 font-mono">
              {event.country}
            </span>
          </div>

          <h3 className="font-display text-lg font-bold mb-1.5 group-hover:text-[var(--color-cyan)] transition-colors leading-tight">
            {event.name}
          </h3>

          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs text-[var(--color-mute)]/70 truncate">{event.location}</p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono text-[var(--color-cyan)]/70">
              {dateStr}
            </p>
            {!isPast && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                event.status === "ongoing"
                  ? "text-blue-400 bg-blue-500/10"
                  : daysUntil <= 14
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-green-400 bg-green-500/10"
              }`}>
                {countdownText}
              </span>
            )}
          </div>

          <p className="text-sm text-[var(--color-mute)]/70 line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {event.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[9px] text-[var(--color-mute)]/50 bg-[var(--color-void)]/50 px-2 py-0.5 rounded-full border border-[var(--color-line)]/40 shrink-0"
                >
                  {t}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-[9px] text-[var(--color-mute)]/30 shrink-0">
                  +{event.tags.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {event.announcements.length > 0 && (
                <span className="text-[10px] font-bold text-[var(--color-magenta)] bg-[var(--color-magenta)]/10 px-2 py-0.5 rounded-full border border-[var(--color-magenta)]/30">
                  {event.announcements.length}
                </span>
              )}
              {event.attendance && (
                <span className="text-[10px] text-[var(--color-mute)]/40 font-mono">
                  {(event.attendance / 1000).toFixed(0)}k+
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover gradient */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[var(--color-cyan)]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  );
}
