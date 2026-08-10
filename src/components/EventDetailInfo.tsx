"use client";

import { motion } from "framer-motion";
import { useRef, useCallback } from "react";
import type { AnimeEvent } from "@/lib/anime-events";

const TYPE_CONFIG: Record<string, { icon: string; color: string; accent: string }> = {
  expo: { icon: "🎯", color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10", accent: "#22d3ee" },
  convention: { icon: "🎪", color: "text-purple-400 border-purple-500/40 bg-purple-500/10", accent: "#a78bfa" },
  stream: { icon: "📺", color: "text-blue-400 border-blue-500/40 bg-blue-500/10", accent: "#60a5fa" },
  festival: { icon: "🎆", color: "text-pink-400 border-pink-500/40 bg-pink-500/10", accent: "#f472b6" },
  premiere: { icon: "🎬", color: "text-amber-400 border-amber-500/40 bg-amber-500/10", accent: "#fbbf24" },
};

function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`neon-premium rounded-2xl group ${className}`}
      style={{ transition: "transform 0.2s ease-out" }}
    >
      {children}
    </div>
  );
}

export default function EventDetailInfo({ event }: { event: AnimeEvent }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.convention;
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const dateStr = `${start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} — ${end.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`;

  const infos = [
    {
      icon: "📅",
      label: "Dates",
      value: dateStr,
      accent: config.accent,
    },
    {
      icon: "📍",
      label: "Location",
      value: `${event.location}, ${event.country}`,
      accent: "#29f2e0",
    },
    {
      icon: "👥",
      label: "Expected Attendance",
      value: event.attendance ? `${event.attendance.toLocaleString("en-US")}+` : "TBA",
      accent: "#ff2d78",
    },
  ];

  return (
    <div>
      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {infos.map((info, i) => (
          <motion.div
            key={info.label}
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <TiltCard className="h-full">
              <div className="neon-premium-track" />
              <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
              <div className="neon-premium-content rounded-2xl p-5 h-full">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="h-1.5 w-8 rounded-full" style={{ background: info.accent, boxShadow: `0 0 10px ${info.accent}88` }} />
                  <span className="text-sm">{info.icon}</span>
                </div>
                <p className="text-[10px] font-mono text-[var(--color-mute)]/50 uppercase tracking-wider mb-1.5">{info.label}</p>
                <p className="text-sm font-medium leading-snug">{info.value}</p>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <TiltCard>
          <div className="neon-premium-track" />
          <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
          <div className="neon-premium-content rounded-2xl p-6 sm:p-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full" style={{ background: config.accent, boxShadow: `0 0 10px ${config.accent}88` }} />
              <h3 className="font-display font-bold text-sm text-white/90">About This Event</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{event.description}</p>
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {event.tags.map((t) => (
                  <span key={t} className="text-[10px] text-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/5 px-2.5 py-1 rounded-full border border-[var(--color-cyan)]/10">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}
