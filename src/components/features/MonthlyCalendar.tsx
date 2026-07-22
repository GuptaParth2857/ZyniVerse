"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAiringSchedule, bestTitle, type AiringScheduleEntry } from "@/lib/anilist";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getEntriesByDate(schedule: AiringScheduleEntry[], date: number, month: number, year: number) {
  return schedule.filter((e) => {
    const d = new Date(e.airingAt * 1000);
    return d.getDate() === date && d.getMonth() === month && d.getFullYear() === year;
  });
}

export default function MonthlyCalendar() {
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState<AiringScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  useEffect(() => {
    const from = Math.floor(new Date(year, month, 1).getTime() / 1000);
    const to = Math.floor(new Date(year, month + 1, 0, 23, 59, 59).getTime() / 1000);
    getAiringSchedule(from, to)
      .then((d) => { setSchedule(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl neon-feature-card">
        <div className="neon-border rounded-2xl" style={{ background: "conic-gradient(from var(--border-angle), #29f2e0, #ff2d78, #8a5cff, #29f2e0)" }} />
        <div className="neon-glow rounded-2xl" style={{ background: "linear-gradient(90deg, #29f2e0, #ff2d78)" }} />
        <div className="neon-inner rounded-2xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">📅</span>
              <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-[var(--color-line)]">
            {DAYS.map((d) => (
              <div key={d} className="bg-[var(--color-panel)] p-2 text-center text-[10px] font-bold text-[var(--color-mute)] uppercase tracking-wider">{d}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="bg-[var(--color-panel)] min-h-[100px] animate-pulse p-1.5">
                <div className="h-3 w-5 bg-white/5 rounded mb-2" />
                <div className="space-y-1"><div className="h-7 bg-white/5 rounded" /><div className="h-7 bg-white/5 rounded" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl neon-feature-card">
      <div className="neon-border rounded-2xl" style={{ background: "conic-gradient(from var(--border-angle), #29f2e0, #ff2d78, #8a5cff, #22c55e, #f59e0b, #29f2e0)" }} />
      <div className="neon-glow rounded-2xl" style={{ background: "linear-gradient(90deg, #29f2e0, #ff2d78, #8a5cff)" }} />
      <div className="neon-inner rounded-2xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
        {/* Top RGB strip */}
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #29f2e0, #ff2d78, #8a5cff, #22c55e, #f59e0b)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">📅</span>
            <h3 className="font-display text-lg font-bold">{MONTHS[month]} {year}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={prevMonth}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-line)] hover:border-[var(--color-cyan)]/40 hover:bg-[var(--color-cyan)]/5 text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setDate(new Date())}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border"
              style={{ color: "#ff2d78", background: "rgba(255,45,120,0.1)", borderColor: "rgba(255,45,120,0.2)" }}>
              Today
            </button>
            <button onClick={nextMonth}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-line)] hover:border-[var(--color-cyan)]/40 hover:bg-[var(--color-cyan)]/5 text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-[var(--color-line)]">
          {DAYS.map((d) => (
            <div key={d} className="bg-[var(--color-panel)] px-2 py-2 text-center text-[10px] font-bold text-[var(--color-mute)] uppercase tracking-wider">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[var(--color-panel)] min-h-[100px]" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const entries = getEntriesByDate(schedule, day, month, year);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const display = entries.slice(0, 3);
            const remaining = entries.length - 3;

            return (
              <div key={day}
                className={`bg-[var(--color-panel)] min-h-[100px] p-1.5 transition-all relative
                  ${isToday ? "ring-1 ring-[#29f2e0]/40" : ""}
                  ${isPast && !isToday ? "opacity-35" : ""}
                  ${!isPast && !isToday ? "hover:bg-white/[0.02]" : ""}`}>

                {/* Today glow */}
                {isToday && (
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(41,242,224,0.06), transparent 70%)" }} />
                )}

                <div className="flex items-center justify-between mb-1 px-0.5 relative z-10">
                  <span className={`text-[11px] font-mono font-bold leading-none
                    ${isToday ? "text-[#29f2e0]" : "text-[var(--color-mute)]"}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#29f2e0] animate-pulse" />
                  )}
                </div>

                <div className="relative z-10 space-y-0.5">
                  {display.map((e: AiringScheduleEntry) => (
                    <Link key={e.id} href={`/anime/${e.media.id}`}
                      className="flex items-center gap-1 rounded-md px-1 py-0.5 transition-all group hover:bg-white/5">
                      {e.media.coverImage?.large && (
                        <div className="relative w-5 h-[14px] rounded-sm overflow-hidden shrink-0">
                          <Image src={e.media.coverImage.large} alt="" fill className="object-cover" sizes="20px" />
                        </div>
                      )}
                      <span className="text-[8px] font-mono font-bold text-[#29f2e0] shrink-0">E{e.episode}</span>
                      <span className="text-[9px] truncate text-white/60 group-hover:text-white transition-colors">{bestTitle(e.media.title)}</span>
                    </Link>
                  ))}
                  {remaining > 0 && (
                    <div className="text-[8px] text-center text-[var(--color-mute)] py-0.5">+{remaining} more</div>
                  )}
                  {entries.length === 0 && !isToday && (
                    <div className="flex items-center justify-center h-[60px] opacity-20">
                      <span className="text-[9px] text-[var(--color-mute)]">—</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
