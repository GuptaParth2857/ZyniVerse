"use client";

import { useState } from "react";
import type { AnimeEvent } from "@/lib/anime-events";
import EventCard from "./EventCard";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "anime-reveal", label: "New Anime" },
  { value: "season-announcement", label: "Seasons" },
  { value: "movie-reveal", label: "Movies" },
  { value: "trailer", label: "Trailers" },
  { value: "collab", label: "Collabs" },
  { value: "key-visual", label: "Key Visuals" },
];

export default function AnnouncementsSection({
  events,
}: {
  events: AnimeEvent[];
}) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const allAnnouncements = events.flatMap((e) =>
    e.announcements.map((a) => ({
      ...a,
      eventSlug: e.slug,
      eventName: e.name,
      eventDate: e.startDate,
      eventStatus: e.status,
    }))
  );

  const filtered = allAnnouncements.filter((a) => {
    if (category !== "all" && a.category !== category) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !a.title.toLowerCase().includes(s) &&
        !a.description.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${
                category === c.value
                  ? "text-[var(--color-cyan)] border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/10"
                  : "text-[var(--color-mute)] border-[var(--color-line)] hover:border-[var(--color-mute)]/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm bg-[var(--color-void)]/50 border border-[var(--color-line)] rounded-lg px-3 py-1.5 text-[var(--color-text)] placeholder:text-[var(--color-mute)]/40 focus:outline-none focus:border-[var(--color-cyan)]/50 w-full sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-mute)]/60">
          <p className="text-sm">No announcements found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <a
              key={a.id}
              href={`/events/${a.eventSlug}`}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 backdrop-blur-sm p-4 transition-all hover:border-[var(--color-cyan)]/30 hover:shadow-lg hover:shadow-[var(--color-cyan)]/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-[var(--color-mute)]/60">
                  {new Date(a.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                  a.category === "movie-reveal"
                    ? "text-purple-400 border-purple-500/40 bg-purple-500/10"
                    : a.category === "season-announcement"
                      ? "text-green-400 border-green-500/40 bg-green-500/10"
                      : a.category === "anime-reveal"
                        ? "text-cyan-400 border-cyan-500/40 bg-cyan-500/10"
                        : a.category === "trailer"
                          ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
                          : "text-gray-400 border-gray-500/30 bg-gray-500/10"
                }`}>
                  {a.category.replace("-", " ")}
                </span>
              </div>

              <h4 className="font-display text-sm font-bold mb-1 leading-tight line-clamp-2">
                {a.title}
              </h4>

              <p className="text-xs text-[var(--color-mute)]/70 line-clamp-2 mb-2">
                {a.description}
              </p>

              <p className="text-[10px] text-[var(--color-mute)]/40">
                at {a.eventName}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
