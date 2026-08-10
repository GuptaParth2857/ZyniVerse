"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useCallback } from "react";
import { eventImageSrc } from "@/lib/event-images";
import type { AnimeEvent } from "@/lib/anime-events";
import EventCountdown from "./EventCountdown";
import MiniCalendar from "./MiniCalendar";

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

export default function FeaturedEventCard({ event }: { event: AnimeEvent }) {
  const eventPoster = eventImageSrc(event.announcements.find((a) => a.posterUrl)?.posterUrl || event.image);
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.convention;
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(1100px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) scale(1.01)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1100px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 34, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="neon-premium rounded-[24px] group h-full"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[24px] overflow-hidden flex flex-col">
        {eventPoster && (
          <div className="relative h-44 sm:h-56 w-full overflow-hidden shrink-0">
            <Image
              src={eventPoster}
              alt={event.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,1)] via-[rgba(10,10,15,0.4)] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10" />
            <span className="absolute right-3 top-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-white/70 border border-white/10 backdrop-blur-sm">
              {event.country}
            </span>
          </div>
        )}

        <div className="p-5 sm:p-7 flex flex-col flex-1">
          {/* Top badges row (voice-lines style) */}
          <div className="mb-4 flex items-center gap-2">
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

          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl sm:text-3xl font-black leading-tight text-white group-hover:text-[var(--color-cyan)] transition-colors">
                {event.name}
              </h3>
              <div className="mt-2.5 flex items-center gap-1.5 text-sm text-[var(--color-mute)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-cyan)]/60">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate">{event.location}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--color-mute)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-magenta)]/60">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <p className="mt-3.5 text-sm text-[var(--color-mute)]/80 line-clamp-3 max-w-2xl leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-3">
              <div className="rounded-2xl border border-white/10 bg-[rgba(10,10,15,0.6)] p-3 backdrop-blur-md">
                <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-cyan)]/80 mb-2 flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                  ⏳ Countdown
                </p>
                <EventCountdown target={event.startDate} />
              </div>
            </div>
          </div>

          {event.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {event.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-[9px] text-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/5 px-1.5 py-0.5 rounded-full border border-[var(--color-cyan)]/10">
                  {t}
                </span>
              ))}
              {event.tags.length > 4 && (
                <span className="text-[9px] text-white/20 px-1 py-0.5">+{event.tags.length - 4}</span>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center gap-2 border-t border-[var(--color-line)] pt-4">
            <MiniCalendar
              startDate={event.startDate}
              endDate={event.endDate}
              name={event.name}
              buttonClassName="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)]"
            />
            <a href={event.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-violet)] to-[var(--color-magenta)] px-3 py-2 text-xs font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_-8px_rgba(41,242,224,0.4)] active:scale-[0.98]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Visit Site
            </a>
            <a href={`/events/${event.slug}`} className="ml-auto flex items-center gap-1 text-sm font-semibold text-[var(--color-cyan)] group-hover:underline">
              View Details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
