"use client";

import { motion } from "framer-motion";
import { TV_CHANNELS, findAnimeSchedule, type TimeSlot } from "@/lib/tv-channels";

function isNowPlaying(slot: TimeSlot): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = slot.start.split(":").map(Number);
  const [endH, endM] = slot.end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes === 0 && startMinutes > 0) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export default function TvScheduleCard({ title }: { title: string }) {
  const scheduleMatches = findAnimeSchedule(title);

  if (scheduleMatches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5"
    >
      <h3 className="font-display text-base font-bold mb-1 flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-[var(--color-amber)]" />
        TV Schedule Today
      </h3>
      <p className="text-[10px] text-[var(--color-mute)] mb-3">Broadcast timings on Indian TV channels</p>

      <div className="space-y-3">
        {scheduleMatches.map(({ channelId, slots }) => {
          const channel = TV_CHANNELS[channelId];
          if (!channel) return null;
          const color = channel.color;

          return (
            <div
              key={channelId}
              className="rounded-lg border border-[var(--color-line)] p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded text-[8px] font-bold text-white shrink-0"
                  style={{ background: color }}
                >
                  {channel.shortName}
                </div>
                <span className="text-xs font-semibold text-[var(--color-ink)]">{channel.name}</span>
              </div>
              <div className="space-y-1">
                {slots.map((slot, i) => {
                  const now = isNowPlaying(slot);
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-[11px] rounded px-1 py-0.5 -mx-1 ${
                        now ? "bg-[var(--color-cyan)]/5 shadow-[inset_0_0_6px_2px_var(--color-cyan)_at_-50%_-50%]" : ""
                      }`}
                      style={now ? { boxShadow: "inset 0 0 8px 2px color-mix(in srgb, var(--color-cyan) 30%, transparent)" } : undefined}
                    >
                      <span className="font-mono text-[var(--color-mute)] w-20 text-right shrink-0">
                        {slot.start} - {slot.end}
                      </span>
                      <span className={`text-[var(--color-ink)] font-medium truncate ${now ? "text-[var(--color-cyan)]" : ""}`}>
                        {slot.show}
                      </span>
                      <span className="text-[var(--color-mute)] shrink-0">({slot.duration}m)</span>
                      {now && (
                        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-[var(--color-cyan)] animate-pulse shrink-0">
                          NOW
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
