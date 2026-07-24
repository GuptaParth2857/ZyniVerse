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

export default function EventCard({ event }: { event: AnimeEvent }) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const isPast = event.status === "past";
  const isOngoing = event.status === "ongoing";
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

  // Get poster: first try announcements, then event.image
  const poster = event.announcements.find((a) => a.posterUrl)?.posterUrl || event.image;

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="neon-premium rounded-[22px] group h-full">
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" />
        <div className="neon-premium-content rounded-[22px] flex flex-col h-full min-h-[360px] transition-all hover:shadow-xl hover:shadow-[var(--color-cyan)]/5 overflow-hidden">
          {/* Poster Image */}
          {poster ? (
            <div className="relative h-44 w-full overflow-hidden shrink-0">
              <img
                src={poster}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,1)] via-[rgba(10,10,15,0.5)] to-transparent" />
              {/* Overlay badges on poster */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize backdrop-blur-sm ${config.color}`}>
                  {config.icon} {event.type}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize backdrop-blur-sm ${STATUS_COLORS[event.status]}`}>
                  {event.status}
                </span>
              </div>
              <span className="absolute top-3 right-3 text-[10px] text-white/60 shrink-0 font-mono backdrop-blur-sm bg-black/30 px-2 py-0.5 rounded-full">
                {event.country}
              </span>
            </div>
          ) : (
            /* Fallback: gradient header without image */
            <div className={`relative h-28 w-full bg-gradient-to-br ${config.gradient} to-transparent shrink-0`}>
              <div className="absolute inset-0 flex items-start justify-between p-4">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${config.color}`}>
                    {config.icon} {event.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[event.status]}`}>
                    {event.status}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--color-mute)]/50 shrink-0 font-mono">
                  {event.country}
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-5 flex flex-col flex-1 -mt-6 relative z-10">
            {/* Event Name */}
            <h3 className="font-display text-lg sm:text-xl font-black mb-1.5 group-hover:text-[var(--color-cyan)] transition-colors leading-tight">
              {event.name}
            </h3>

            {/* Location */}
            <p className="text-xs text-[var(--color-mute)]/70 mb-2 truncate">{event.location}</p>

            {/* Date + Countdown */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-[var(--color-cyan)]/70">
                {dateStr}
              </p>
              {!isPast && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  isOngoing
                    ? "text-blue-400 bg-blue-500/10"
                    : daysUntil <= 14
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-green-400 bg-green-500/10"
                }`}>
                  {countdownText}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--color-mute)]/70 line-clamp-2 mb-3 leading-relaxed flex-1">
              {event.description}
            </p>

            {/* Footer: Tags + Meta */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {event.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-[9px] text-[var(--color-mute)]/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 shrink-0"
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

              <div className="flex items-center gap-2.5 shrink-0">
                {event.announcements.length > 0 && (
                  <span className="text-[10px] font-bold text-[var(--color-magenta)] bg-[var(--color-magenta)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-magenta)]/30">
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
        </div>
      </div>
    </Link>
  );
}
