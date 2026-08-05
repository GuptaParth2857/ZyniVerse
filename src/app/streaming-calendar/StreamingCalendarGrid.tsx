"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { StreamingCalendarEntry } from "@/lib/anilist-schedule";

const PLATFORMS = [
  { name: "Crunchyroll", color: "#F47521", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Crunchyroll_2024.svg" },
  { name: "Netflix", color: "#E50914", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "JioHotstar", color: "#0A3FC4", logo: "https://img.hotstar.com/image/upload/v1737554969/web-assets/prod/images/rebrand/logo.png" },
  { name: "Amazon Prime", color: "#00A8E1", logo: "https://upload.wikimedia.org/wikipedia/commons/4/43/Amazon_Prime_Video_logo_%282022%29.svg" },
  { name: "Muse Asia", color: "#FF0000", logo: "https://www.e-muse.com/wp-content/themes/ks_emuse/assets/img/header/muse_logo.svg" },
] as const;

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function DayCard({ day, entries, isToday, index }: { day: string; entries: StreamingCalendarEntry[]; isToday: boolean; index: number }) {
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
      transition={{ duration: 0.45, delay: (index % 7) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="neon-premium rounded-[20px]"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track rounded-[20px]" />
      <div
        className="neon-premium-overlay rounded-[18.5px]"
        style={{ background: isToday ? "rgba(24,8,30,0.94)" : "rgba(10,10,15,0.92)" }}
      />
      <div className="neon-premium-content rounded-[20px] overflow-hidden">
        <div className={`relative flex items-center justify-between px-4 py-3 ${isToday ? "bg-[var(--color-magenta)]/10" : "bg-white/[0.03]"}`}>
          {isToday && (
            <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)]" />
          )}
          <h2 className={`font-display text-sm font-bold ${isToday ? "text-[var(--color-magenta)]" : "text-[var(--color-text)]"}`}>
            {day}
            {isToday && (
              <span className="ml-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[var(--color-magenta)]">
                Today
              </span>
            )}
          </h2>
          <span className="text-[10px] font-mono text-[var(--color-mute)]">{entries.length} eps</span>
        </div>
        <div className="divide-y divide-[var(--color-line)]/40">
          {entries.length === 0 ? (
            <p className="px-4 py-4 text-[10px] font-mono text-[var(--color-mute)]">No airings scheduled this week.</p>
          ) : (
            entries.map((entry) => {
              const platformColor = PLATFORMS.find((p) => p.name === entry.platform)?.color || "#666";
              return (
                <Link
                  key={entry.id}
                  href={`/anime/${entry.id}`}
                  className="group flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors no-underline"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: platformColor, boxShadow: `0 0 8px ${platformColor}88` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--color-text)] group-hover:text-[var(--color-cyan)] truncate transition-colors">
                      {entry.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-mono text-[var(--color-mute)]">Ep {entry.episode}</span>
                      <span className="text-[9px] font-mono" style={{ color: platformColor }}>{entry.platform}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-mute)] shrink-0 whitespace-nowrap">{entry.time}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function StreamingCalendarGrid({ entries }: { entries: StreamingCalendarEntry[] }) {
  const grouped: Record<string, StreamingCalendarEntry[]> = {};
  for (const day of DAYS_ORDER) grouped[day] = [];
  for (const entry of entries) {
    grouped[entry.date]?.push(entry);
  }

  const today = DAYS_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <>
      {/* Platform Legend */}
      <div className="mt-6 flex flex-wrap gap-3">
        {PLATFORMS.map((p) => (
          <div key={p.name} className="neon-rgb-border flex items-center gap-2 rounded-lg bg-[var(--color-panel)] px-3 py-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
            <span className="text-xs font-medium text-[var(--color-text)]">{p.name}</span>
          </div>
        ))}
      </div>

      {/* Weekly Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS_ORDER.map((day, i) => (
          <DayCard key={day} day={day} entries={grouped[day]} isToday={day === today} index={i} />
        ))}
      </div>

      {/* Full Where to Watch */}
      <div className="mt-12 neon-premium rounded-2xl">
        <div className="neon-premium-track rounded-2xl" />
        <div className="neon-premium-overlay rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-2xl p-6">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
            <span className="h-1 w-4 rounded-full bg-[var(--color-cyan)]" />
            All Platforms
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="neon-premium rounded-lg">
                <div className="neon-premium-track rounded-lg" />
                <div className="neon-premium-overlay rounded-[6.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
                <div className="neon-premium-content flex items-center gap-3 rounded-lg p-3">
                  <span className="flex h-9 w-20 shrink-0 items-center justify-center rounded-lg bg-black/40">
                    <Image
                      src={p.logo}
                      alt={`${p.name} logo`}
                      width={80}
                      height={36}
                      unoptimized
                      className="h-4 w-full object-contain"
                    />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text)]">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-mute)]">
                      {p.name === "Crunchyroll" && "Largest anime library • ₹79/mo"}
                      {p.name === "Netflix" && "Select anime • Hindi dubs • ₹149/mo"}
                      {p.name === "JioHotstar" && "Indian anime • Hindi dubs"}
                      {p.name === "Amazon Prime" && "Select anime • ₹299/mo"}
                      {p.name === "Muse Asia" && "Free with ads • Legal streams"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/season/upcoming" className="text-sm text-[var(--color-cyan)] hover:text-[var(--color-magenta)] transition-colors">
          Upcoming Season →
        </Link>
        <Link href="/schedule" className="text-sm text-[var(--color-cyan)] hover:text-[var(--color-magenta)] transition-colors">
          Full Airing Schedule →
        </Link>
        <Link href="/seasonal" className="text-sm text-[var(--color-cyan)] hover:text-[var(--color-magenta)] transition-colors">
          Seasonal Charts →
        </Link>
      </div>
    </>
  );
}
