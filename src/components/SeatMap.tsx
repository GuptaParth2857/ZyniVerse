"use client";

import { SEAT_CLASSES, type SeatClassId } from "@/lib/theaters";

interface SeatMapProps {
  classes: SeatClassId[];
}

/**
 * Representative seat matrix — NOT live availability.
 * Shows a typical auditorium layout: screen at top, sections stacked back-to-front.
 */
export default function SeatMap({ classes }: SeatMapProps) {
  const ordered = ["RECLINER", "PREMIUM", "GOLD", "SILVER", "WHEELCHAIR"] as SeatClassId[];
  const visible = ordered.filter((c) => classes.includes(c));

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)]/60 p-4 sm:p-6">
      {/* Screen */}
      <div className="relative mx-auto mb-6 h-6 w-3/4 max-w-sm">
        <svg viewBox="0 0 200 28" className="h-full w-full">
          <path d="M5 27 Q100 2 195 27" fill="none" stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M15 27 Q100 8 185 27" fill="var(--color-cyan)" opacity="0.12" />
        </svg>
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-cyan)]/70">
          Screen
        </span>
      </div>

      {/* Wheelchair — back corners */}
      {visible.includes("WHEELCHAIR") && (
        <div className="mb-1 flex items-center justify-between gap-24 px-6">
          {[0, 1].map((i) => (
            <span key={i} className="rounded-md border border-dashed border-[#6b7280] px-2.5 py-1 text-[9px] font-medium text-[#9ca3af]">
              ♿ WC
            </span>
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-2.5">
        {visible
          .filter((c) => c !== "WHEELCHAIR")
          .map((cls) => {
            const cfg = SEAT_CLASSES[cls];
            const isWide = cfg.cols > 16;
            return (
              <div key={cls} className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--color-mute)]">
                    1-{cfg.rows} · {cfg.cols} seats
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {Array.from({ length: cfg.rows }).map((_, r) => (
                    <div key={r} className="flex items-center justify-center gap-1">
                      {isWide && <span className="w-6 pr-1 text-right font-mono text-[8px] text-[var(--color-mute)]">{r + 1}</span>}
                      {Array.from({ length: cfg.cols }).map((_, c) => {
                        const half = Math.floor(cfg.cols / 2);
                        return (
                          <div key={c} className="flex items-center">
                            {isWide && c === half && <span className="w-3" />}
                            <span
                              className={`rounded-[4px] transition-transform hover:scale-125 ${
                                cls === "RECLINER" ? "h-4 w-5 rounded-md" : "h-3 w-3 sm:h-3.5 sm:w-3.5"
                              }`}
                              style={{ backgroundColor: cfg.color, opacity: 0.85 }}
                              title={`${cfg.label} · Row ${r + 1} · Seat ${c + 1}`}
                            />
                          </div>
                        );
                      })}
                      {isWide && <span className="w-6 pl-1 font-mono text-[8px] text-[var(--color-mute)]">{r + 1}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* Legend + disclaimer */}
      <div className="mt-5 border-t border-[var(--color-line)] pt-3">
        <div className="mb-2 flex flex-wrap items-center gap-4">
          {visible.map((cls) => {
            const cfg = SEAT_CLASSES[cls];
            return (
              <span key={cls} className="flex items-center gap-1.5 text-[10px] text-[var(--color-mute)]">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </span>
            );
          })}
        </div>
        <p className="text-[10px] leading-relaxed text-[var(--color-mute)]/80">
          Representative layout only — actual seat rows, prices aur availability booking platform par dekho
          (BookMyShow / PVR / District) showtime select karte waqt.
        </p>
      </div>
    </div>
  );
}
