"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAiringSchedule, bestTitle } from "@/lib/anilist";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getEntriesByDate(schedule: any[], date: number, month: number, year: number) {
  return schedule.filter((e) => {
    const d = new Date(e.airingAt * 1000);
    return d.getDate() === date && d.getMonth() === month && d.getFullYear() === year;
  });
}

export default function MonthlyCalendar() {
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  useEffect(() => {
    setLoading(true);
    const from = Math.floor(new Date(year, month, 1).getTime() / 1000);
    const to = Math.floor(new Date(year, month + 1, 0, 23, 59, 59).getTime() / 1000);
    getAiringSchedule(from, to)
      .then((d) => { setSchedule(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));

  const loadingSkeleton = () => (
    <div className="grid grid-cols-7 gap-px bg-[var(--color-line)] rounded-lg overflow-hidden">
      {DAYS.map((d) => (
        <div key={d} className="bg-[var(--color-panel)] p-2 text-center text-[11px] font-bold text-[var(--color-mute)] uppercase tracking-wider">{d}</div>
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="bg-[var(--color-panel)] min-h-[110px] animate-pulse p-2">
          <div className="h-3 w-5 bg-white/10 rounded mb-2" />
          <div className="space-y-1.5">
            <div className="h-8 bg-white/5 rounded" />
            <div className="h-8 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-3">
          <span className="text-lg">📅</span>
          <h3 className="font-display text-lg font-bold">{MONTHS[month]} {year}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={prevMonth} className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-line)] hover:bg-white/5 hover:text-white text-[var(--color-mute)] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setDate(new Date())} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-magenta)]/10 to-[var(--color-cyan)]/10 border border-[var(--color-magenta)]/20 text-xs font-semibold text-[var(--color-magenta)] hover:from-[var(--color-magenta)]/20 hover:to-[var(--color-cyan)]/20 transition-all">
            Today
          </button>
          <button onClick={nextMonth} className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-line)] hover:bg-white/5 hover:text-white text-[var(--color-mute)] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? loadingSkeleton() : (
        <div className="grid grid-cols-7 gap-px bg-[var(--color-line)]">
          {DAYS.map((d) => (
            <div key={d} className="bg-[var(--color-panel)] px-2 py-2 text-center text-[11px] font-bold text-[var(--color-mute)] uppercase tracking-wider">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[var(--color-panel)] min-h-[110px]" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const entries = getEntriesByDate(schedule, day, month, year);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const displayEntries = entries.slice(0, 4);
            const remaining = entries.length - 4;
            return (
              <div key={day} className={`bg-[var(--color-panel)] min-h-[110px] p-1.5 transition-colors ${isToday ? "" : isPast ? "opacity-40" : "hover:bg-white/[0.02]"}`}>
                <div className="flex items-center justify-between mb-1 px-0.5">
                  <span className={`text-xs font-mono font-bold leading-none ${isToday ? "text-[var(--color-magenta)]" : "text-[var(--color-mute)]"}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-magenta)] animate-pulse" />
                  )}
                </div>
                {isToday && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--color-magenta)]/5 to-[var(--color-cyan)]/5 pointer-events-none" />
                )}
                <div className="relative z-10 space-y-1">
                  {displayEntries.map((e: any) => (
                    <Link key={e.id} href={`/anime/${e.media.id}`}
                      className="flex items-center gap-1.5 rounded-md bg-black/20 hover:bg-[var(--color-magenta)]/10 px-1.5 py-1 transition-all group"
                    >
                      {e.media.coverImage?.medium && (
                        <div className="relative w-6 h-[17px] rounded overflow-hidden shrink-0 border border-white/5">
                          <Image src={e.media.coverImage.medium} alt="" fill className="object-cover" sizes="24px" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 flex items-center gap-1">
                        <span className="text-[9px] font-mono font-bold text-[var(--color-cyan)] shrink-0">E{e.episode}</span>
                        <span className="text-[10px] truncate text-white/70 group-hover:text-white transition-colors">{bestTitle(e.media.title)}</span>
                      </div>
                    </Link>
                  ))}
                  {remaining > 0 && (
                    <div className="text-[9px] text-center text-[var(--color-mute)] py-0.5">
                      +{remaining} more
                    </div>
                  )}
                  {entries.length === 0 && !isToday && (
                    <div className="flex items-center justify-center h-[72px]">
                      <div className="w-8 h-8 rounded-full border border-[var(--color-line)]/30 flex items-center justify-center opacity-20">
                        <span className="text-[10px] text-[var(--color-mute)]">—</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
