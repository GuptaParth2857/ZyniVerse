"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseDate(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
}

function dayKey(y: number, m: number, d: number): string {
  return `${y}-${m}-${d}`;
}

export default function MiniCalendar({
  startDate,
  endDate,
  name,
  buttonClassName,
  label = "Calendar",
}: {
  startDate: string;
  endDate: string;
  name: string;
  buttonClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [view, setView] = useState(() => parseDate(startDate));
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const startKey = dayKey(start.y, start.m, start.d);
  const endKey = dayKey(end.y, end.m, end.d);

  const rangeKeys = new Set<string>();
  {
    const cursor = new Date(start.y, start.m, start.d);
    const endTime = new Date(end.y, end.m, end.d).getTime();
    while (cursor.getTime() <= endTime) {
      rangeKeys.add(dayKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const openPanel = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const w = 284;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - w - 8));
    const top = Math.min(rect.bottom + 8, window.innerHeight - 320);
    setPos({ top, left });
    setView(parseDate(startDate));
    setOpen(true);
  }, [startDate]);

  const toggle = () => {
    if (open) {
      setOpen(false);
    } else {
      openPanel();
    }
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const today = new Date();

  const prevMonth = () => setView((v) => (v.m === 0 ? { ...v, y: v.y - 1, m: 11 } : { ...v, m: v.m - 1 }));
  const nextMonth = () => setView((v) => (v.m === 11 ? { ...v, y: v.y + 1, m: 0 } : { ...v, m: v.m + 1 }));

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={buttonClassName}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {label}
      </button>

      {open &&
        pos &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[100] w-[284px] rounded-2xl border border-[var(--color-line)] bg-[rgba(13,13,22,0.98)] shadow-2xl shadow-black/60 backdrop-blur-xl p-4"
              style={{ top: pos.top, left: pos.left }}
            >
              {/* Header: month nav + range */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-7 h-7 rounded-lg border border-[var(--color-line)] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)] flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <span className="text-sm font-display font-bold text-white">
                  {MONTHS[view.m]} {view.y}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-7 h-7 rounded-lg border border-[var(--color-line)] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)] flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>

              {/* Date range */}
              <div className="mb-3 flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-2 py-0.5 font-bold text-[var(--color-cyan)]">
                  {MONTHS[start.m].slice(0, 3)} {start.d}
                </span>
                <span className="text-[var(--color-mute)]/50">→</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-2 py-0.5 font-bold text-[var(--color-magenta)]">
                  {MONTHS[end.m].slice(0, 3)} {end.d}
                </span>
              </div>

              {/* Weekday header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="text-[9px] font-mono uppercase text-[var(--color-mute)]/40 py-1">
                    {d}
                  </span>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstWeekday }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const key = dayKey(view.y, view.m, d);
                  const isStart = key === startKey;
                  const isEnd = key === endKey;
                  const inRange = rangeKeys.has(key);
                  const isToday =
                    d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
                  return (
                    <div
                      key={d}
                      className={`relative h-8 rounded-lg text-xs flex items-center justify-center font-mono ${
                        isStart || isEnd
                          ? "font-black text-black"
                          : inRange
                            ? "text-[var(--color-cyan)] bg-[var(--color-cyan)]/10"
                            : "text-[var(--color-mute)]"
                      } ${isStart ? "bg-[var(--color-cyan)] shadow-[0_0_12px_-2px_rgba(41,242,224,0.6)]" : ""} ${
                        isEnd ? "bg-[var(--color-magenta)] shadow-[0_0_12px_-2px_rgba(255,45,120,0.6)]" : ""
                      }`}
                    >
                      {d}
                      {isToday && (
                        <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-white/50" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer: event name */}
              <div className="mt-3 border-t border-[var(--color-line)] pt-2.5">
                <p className="text-[10px] text-[var(--color-mute)]/70 truncate">
                  <span className="text-[var(--color-cyan)]/60">●</span> {name}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
