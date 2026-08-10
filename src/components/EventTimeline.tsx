"use client";

import { motion } from "framer-motion";
import { useRef, useCallback } from "react";
import type { AnimeEvent } from "@/lib/anime-events";
import { eventImageSrc } from "@/lib/event-images";
import Image from "next/image";

const TYPE_ICONS: Record<string, string> = {
  expo: "🎯",
  convention: "🎪",
  stream: "📺",
  festival: "🎆",
  premiere: "🎬",
};

function TimelineCard({ event }: { event: AnimeEvent }) {
  const poster = eventImageSrc(event.announcements.find((a) => a.posterUrl)?.posterUrl || event.image);
  const ref = useRef<HTMLAnchorElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
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
    <a
      ref={ref}
      href={`/events/${event.slug}`}
      className="block group/timeline"
      style={{ transition: "transform 0.2s ease-out" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="neon-premium rounded-xl overflow-hidden">
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-xl overflow-hidden flex">
          {/* Poster thumbnail */}
          {poster && (
            <div className="w-16 h-16 shrink-0 overflow-hidden hidden sm:block">
              <Image
                src={poster}
                alt=""
                width={64}
                height={64}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span>{TYPE_ICONS[event.type]}</span>
              <span className="font-display text-sm font-bold group-hover/timeline:text-[var(--color-cyan)] transition-colors">
                {event.name}
              </span>
            </div>
            <p className="text-xs text-[var(--color-mute)]/70">
              {event.location}
            </p>
            {event.announcements.length > 0 && (
              <p className="text-[10px] text-[var(--color-magenta)] mt-1">
                {event.announcements.length} announcement{event.announcements.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function EventTimeline({ events }: { events: AnimeEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-mute)]/60">
        <p className="text-sm">No events to display in timeline.</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-cyan)]/30 via-[var(--color-magenta)]/20 to-transparent" />

      <div className="space-y-4">
        {sorted.map((event, index) => {
          const isPast = event.status === "past";
          const isOngoing = event.status === "ongoing";

          return (
            <motion.div
              key={event.id}
              className="relative pl-10"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 z-10 ${
                  isPast
                    ? "bg-gray-500 border-gray-400"
                    : isOngoing
                      ? "bg-blue-500 border-blue-400 animate-pulse"
                      : "bg-[var(--color-cyan)] border-[var(--color-cyan)] shadow-[0_0_8px_-2px_rgba(0,255,224,0.5)]"
                }`}
              />

              <div className="text-[10px] font-mono text-[var(--color-mute)]/60 mb-1.5">
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              <TimelineCard event={event} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
