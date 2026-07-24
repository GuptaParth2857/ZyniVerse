"use client";

import { useState } from "react";
import type { AnimeEvent } from "@/lib/anime-events";

const CATEGORIES = [
  { value: "all", label: "All", icon: "🔥" },
  { value: "trailer", label: "Trailers", icon: "🎬" },
  { value: "movie-reveal", label: "Movies", icon: "🎥" },
  { value: "anime-reveal", label: "New Anime", icon: "✨" },
  { value: "season-announcement", label: "Seasons", icon: "📺" },
  { value: "key-visual", label: "Key Visuals", icon: "🖼️" },
  { value: "collab", label: "Collabs", icon: "🤝" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "anime-reveal": "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  "season-announcement": "text-green-400 border-green-500/40 bg-green-500/10",
  "movie-reveal": "text-purple-400 border-purple-500/40 bg-purple-500/10",
  "game-reveal": "text-blue-400 border-blue-500/40 bg-blue-500/10",
  collab: "text-pink-400 border-pink-500/40 bg-pink-500/10",
  trailer: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  "key-visual": "text-orange-400 border-orange-500/40 bg-orange-500/10",
  casting: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
  merchandise: "text-rose-400 border-rose-500/40 bg-rose-500/10",
  other: "text-gray-400 border-gray-500/30 bg-gray-500/10",
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

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
      eventImage: e.image,
    }))
  );

  const filtered = allAnnouncements.filter((a) => {
    if (category !== "all" && a.category !== category) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !a.title.toLowerCase().includes(s) &&
        !a.description.toLowerCase().includes(s) &&
        !a.eventName.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const categoryCount = (cat: string) =>
    cat === "all"
      ? allAnnouncements.length
      : allAnnouncements.filter((a) => a.category === cat).length;

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search */}
        <div className="neon-input rounded-xl">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]/40 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search announcements, trailers, reveals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm bg-transparent py-0.5 text-[var(--color-text)] placeholder:text-[var(--color-mute)]/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const count = categoryCount(c.value);
            const isActive = category === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  isActive
                    ? "text-[var(--color-cyan)] border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/10 shadow-[0_0_12px_-4px_rgba(0,255,224,0.3)]"
                    : "text-[var(--color-mute)] border-[var(--color-line)] hover:border-[var(--color-mute)]/50 hover:text-[var(--color-text)]"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
                <span className={`text-[9px] ml-0.5 ${isActive ? "text-[var(--color-cyan)]/60" : "text-[var(--color-mute)]/30"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-mute)]/60">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm">No announcements found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => {
            const ytId = a.trailerUrl ? extractYouTubeId(a.trailerUrl) : null;
            const thumbUrl = ytId
              ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
              : a.posterUrl || a.eventImage;

            return (
              <a
                key={a.id}
                href={`/events/${a.eventSlug}`}
                className="neon-premium rounded-[18px] group overflow-hidden"
              >
                <div className="neon-premium-track" />
                <div className="neon-premium-overlay" />
                <div className="neon-premium-content rounded-[18px] overflow-hidden flex flex-col">
                  {/* Thumbnail / Poster */}
                  {thumbUrl && (
                    <div className="relative h-40 w-full overflow-hidden shrink-0">
                      <img
                        src={thumbUrl}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,1)] via-[rgba(10,10,15,0.3)] to-transparent" />
                      {/* Play button for trailers */}
                      {ytId && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg shadow-red-600/30">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {/* Category badge on image */}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm bg-black/40 ${
                          CATEGORY_COLORS[a.category] || CATEGORY_COLORS.other
                        }`}>
                          {a.category.replace(/-/g, " ")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* No image fallback header */}
                  {!thumbUrl && (
                    <div className="px-4 pt-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        CATEGORY_COLORS[a.category] || CATEGORY_COLORS.other
                      }`}>
                        {a.category.replace(/-/g, " ")}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-display text-sm font-bold mb-1.5 leading-tight line-clamp-2 group-hover:text-[var(--color-cyan)] transition-colors">
                      {a.title}
                    </h4>

                    <p className="text-xs text-[var(--color-mute)]/60 line-clamp-2 mb-3 flex-1">
                      {a.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9px] text-[var(--color-mute)]/40">at</span>
                        <span className="text-[10px] text-[var(--color-cyan)]/70 font-medium truncate">
                          {a.eventName}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--color-mute)]/40 shrink-0">
                        {new Date(a.eventDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
