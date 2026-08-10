"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { eventImageSrc } from "@/lib/event-images";
import MiniCalendar from "./MiniCalendar";
import type { AnimeEvent } from "@/lib/anime-events";

const TYPE_CONFIG: Record<string, { icon: string; color: string; accent: string }> = {
  expo: { icon: "🎯", color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10", accent: "#22d3ee" },
  convention: { icon: "🎪", color: "text-purple-400 border-purple-500/40 bg-purple-500/10", accent: "#a78bfa" },
  stream: { icon: "📺", color: "text-blue-400 border-blue-500/40 bg-blue-500/10", accent: "#60a5fa" },
  festival: { icon: "🎆", color: "text-pink-400 border-pink-500/40 bg-pink-500/10", accent: "#f472b6" },
  premiere: { icon: "🎬", color: "text-amber-400 border-amber-500/40 bg-amber-500/10", accent: "#fbbf24" },
};

const STATUS_STYLES: Record<string, string> = {
  upcoming: "text-green-400 border-green-500/40 bg-green-500/10",
  ongoing: "text-blue-400 border-blue-500/40 bg-blue-500/10 animate-pulse",
  past: "text-gray-400 border-gray-500/30 bg-gray-500/10",
};

export default function EventCard({ event, index = 0 }: { event: AnimeEvent; index?: number }) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const isPast = event.status === "past";
  const isOngoing = event.status === "ongoing";
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.convention;

  const dateStr = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const daysUntil = Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const countdownText = isPast
    ? "Ended"
    : isOngoing
      ? "Live Now"
      : daysUntil === 0
        ? "Today!"
        : daysUntil === 1
          ? "Tomorrow"
          : `In ${daysUntil} days`;

  const poster = eventImageSrc(event.announcements.find((a) => a.posterUrl)?.posterUrl || event.image);
  const [posterFailed, setPosterFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 9) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="neon-premium rounded-[22px] group h-full"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[22px] flex flex-col overflow-hidden h-full">
        {poster && !posterFailed ? (
          <div className="relative h-36 overflow-hidden shrink-0 sm:h-40">
            <Image
              src={poster}
              alt={event.name}
              fill
              onError={() => setPosterFailed(true)}
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,1)] via-[rgba(10,10,15,0.35)] to-transparent" />
            <span className="absolute left-3 top-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-white/70 border border-white/10 backdrop-blur-sm">
              {event.country}
            </span>
          </div>
        ) : (
          <div className="relative flex h-24 items-center justify-center shrink-0 bg-gradient-to-br from-[var(--color-cyan)]/10 via-transparent to-[var(--color-magenta)]/10">
            <span className="text-[10px] font-bold text-[var(--color-cyan)]/50">{event.country}</span>
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Top badges row */}
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-8 rounded-full" style={{ background: config.accent, boxShadow: `0 0 10px ${config.accent}88` }} />
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
              {config.icon} {event.type}
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[event.status] || STATUS_STYLES.upcoming}`}>
                {event.status}
              </span>
            </span>
          </div>

          <Link href={`/events/${event.slug}`} className="block no-underline">
            <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-[var(--color-cyan)]">
              {event.name}
            </h3>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-mute)]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-cyan)]/60">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{event.location}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-mute)]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-magenta)]/60">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="truncate">{dateStr}</span>
              <span className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                isOngoing
                  ? "text-blue-400 bg-blue-500/10 border-blue-500/30 animate-pulse"
                  : isPast
                    ? "text-gray-400 bg-gray-500/10 border-gray-500/30"
                    : daysUntil <= 14
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                      : "text-green-400 bg-green-500/10 border-green-500/30"
              }`}>
                {countdownText}
              </span>
            </div>
          </Link>

          <p className="mt-3 text-sm text-[var(--color-mute)]/80 line-clamp-2 leading-relaxed flex-1">
            {event.description}
          </p>

          {event.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {event.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[9px] text-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/5 px-1.5 py-0.5 rounded-full border border-[var(--color-cyan)]/10">
                  {t}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-[9px] text-white/20 px-1 py-0.5">+{event.tags.length - 3}</span>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-line)] pt-3">
            <MiniCalendar
              startDate={event.startDate}
              endDate={event.endDate}
              name={event.name}
              buttonClassName={`${event.website ? "flex-1" : "w-full"} flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-line)] px-2.5 py-2 text-[11px] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)]`}
            />
            {event.website && (
              <a href={event.website} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-violet)] to-[var(--color-magenta)] px-2.5 py-2 text-[11px] font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_-8px_rgba(41,242,224,0.4)] active:scale-[0.98]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Visit Site
              </a>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-[9px] text-[var(--color-mute)]/50">
            {event.announcements.length > 0 ? (
              <span>{event.announcements.length} announcement{event.announcements.length !== 1 ? "s" : ""}</span>
            ) : (
              <span />
            )}
            {event.attendance && (
              <span className="font-mono">{(event.attendance / 1000).toFixed(0)}k+ attendees</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
