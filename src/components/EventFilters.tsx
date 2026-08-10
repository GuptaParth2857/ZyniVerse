"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnimeEvent } from "@/lib/anime-events";
import EventCard from "./EventCard";

interface EventFiltersProps {
  events: AnimeEvent[];
  types: string[];
  countries: string[];
}

export default function EventFilters({
  events,
  types,
  countries,
}: EventFiltersProps) {
  const [status, setStatus] = useState<"all" | "upcoming" | "ongoing" | "past">("all");
  const [type, setType] = useState("all");
  const [country, setCountry] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = events.filter((e) => {
    if (status !== "all" && e.status !== status) return false;
    if (type !== "all" && e.type !== type) return false;
    if (country !== "all" && e.country !== country) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !e.name.toLowerCase().includes(s) &&
        !e.description.toLowerCase().includes(s) &&
        !e.tags.some((t) => t.includes(s))
      )
        return false;
    }
    return true;
  });

  const upcoming = filtered.filter((e) => e.status === "upcoming");
  const ongoing = filtered.filter((e) => e.status === "ongoing");
  const past = filtered.filter((e) => e.status === "past");

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <div className="neon-input rounded-xl">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]/40 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search events by name, description, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm bg-transparent py-0.5 text-[var(--color-text)] placeholder:text-[var(--color-mute)]/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {(["all", "upcoming", "ongoing", "past"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full border capitalize transition-all duration-200 ${
                  status === s
                    ? "text-[var(--color-cyan)] border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/10 shadow-[0_0_12px_-4px_rgba(0,255,224,0.3)]"
                    : "text-[var(--color-mute)] border-[var(--color-line)] hover:border-[var(--color-mute)]/50 hover:text-[var(--color-text)]"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>

          <div className="neon-input rounded-full">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="text-[10px] font-bold px-3 py-1 bg-[var(--color-void)] text-[var(--color-mute)] focus:outline-none capitalize cursor-pointer"
            >
              <option value="all">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="neon-input rounded-full">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="text-[10px] font-bold px-3 py-1 bg-[var(--color-void)] text-[var(--color-mute)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-16 text-[var(--color-mute)]/60"
        >
          <p className="text-lg mb-1">No events found</p>
          <p className="text-sm">Try adjusting your filters or search.</p>
        </motion.div>
      ) : (
        <motion.div layout className="space-y-8">
          {ongoing.length > 0 && (
            <motion.section layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Happening Now ({ongoing.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ongoing.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {upcoming.length > 0 && (
            <motion.section layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Upcoming ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcoming.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {past.length > 0 && (
            <motion.section layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-lg font-bold text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Past ({past.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {past.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i} />
                ))}
              </div>
            </motion.section>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
