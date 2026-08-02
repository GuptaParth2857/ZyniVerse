"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Loader from "@/components/Loader";
import { getAiringSchedule, type AiringScheduleEntry } from "@/lib/anilist";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface CalendarItem {
  mediaId?: number;
  title?: string;
  episode?: number;
}

type ScheduleEntry = AiringScheduleEntry & { mediaId?: number };

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let i = 1; i <= last.getDate(); i++) days.push(i);
  return days;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [schedule, setSchedule] = useState<Record<string, CalendarItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const startSec = Math.floor(new Date(year, month, 1).getTime() / 1000);
    const endSec = Math.floor(new Date(year, month + 1, 0, 23, 59, 59).getTime() / 1000);

    getAiringSchedule(startSec, endSec)
      .then((items) => {
        const grouped: Record<string, CalendarItem[]> = {};
        (items || []).forEach((item) => {
          const entry = item as ScheduleEntry;
          const d = entry.airingAt ? new Date(entry.airingAt * 1000).toISOString().slice(0, 10) : "";
          if (d) {
            if (!grouped[d]) grouped[d] = [];
            grouped[d].push({
              mediaId: entry.media?.id || entry.mediaId,
              title: entry.media?.title?.romaji || entry.media?.title?.english || `Anime #${entry.media?.id}`,
              episode: entry.episode,
            });
          }
        });
        setSchedule(grouped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  function prev() { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }
  function next() { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }

  return (
    <PageTransition>
      <ErrorBoundary label="Calendar">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Calendar</p>
              <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
                <h1 className="font-display text-3xl font-bold mt-1">Anime Release Calendar</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prev} className="rounded-lg px-5 py-2.5 text-xs hover:border-[var(--color-cyan)] transition-colors">←</button>
              <span className="font-display text-sm font-bold min-w-[140px] text-center">{MONTHS[month]} {year}</span>
              <button onClick={next} className="rounded-lg px-5 py-2.5 text-xs hover:border-[var(--color-cyan)] transition-colors">→</button>
            </div>
          </div>

          {loading ? <Loader /> : (
            <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-[var(--color-line)]">
              {DAYS.map(d => (
                <div key={d} className="bg-[var(--color-panel)] px-2 py-2 text-[10px] font-mono font-bold text-[var(--color-mute)] uppercase text-center">{d}</div>
              ))}
              {days.map((d, i) => {
                const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d || 0).padStart(2, "0")}`;
                const items = d ? (schedule[key] || []) : [];
                const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                return (
                  <div key={i} className={`min-h-[100px] bg-[var(--color-void)] p-1.5 ${isToday ? "ring-1 ring-inset ring-[var(--color-cyan)]" : ""}`}>
                    {d && (
                      <>
                        <span className={`text-[10px] font-mono font-bold ${isToday ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)]"}`}>{d}</span>
                        <div className="mt-1 space-y-0.5">
                          {items.slice(0, 3).map((item, idx: number) => (
                            <Link key={idx} href={`/anime/${item.mediaId}`}
                              className="block truncate rounded px-1 py-0.5 text-[8px] leading-tight bg-[var(--color-magenta)]/10 text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/20 transition-colors"
                            >
                              {item.title || `Anime #${item.mediaId}`}
                            </Link>
                          ))}
                          {items.length > 3 && (
                            <span className="block text-[8px] text-[var(--color-mute)] px-1">+{items.length - 3} more</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
