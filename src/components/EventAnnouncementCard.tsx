"use client";

import type { AnimeAnnouncement } from "@/lib/anime-events";

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

const CATEGORY_LABELS: Record<string, string> = {
  "anime-reveal": "New Anime",
  "season-announcement": "Season Announced",
  "movie-reveal": "Movie Revealed",
  "game-reveal": "Game Revealed",
  collab: "Collaboration",
  trailer: "Trailer Drop",
  "key-visual": "Key Visual",
  casting: "Voice Cast",
  merchandise: "Merchandise",
  other: "Other",
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function EventAnnouncementCard({
  announcement,
}: {
  announcement: AnimeAnnouncement;
}) {
  const ytId = announcement.trailerUrl
    ? extractYouTubeId(announcement.trailerUrl)
    : null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 backdrop-blur-sm overflow-hidden transition-all hover:border-[var(--color-cyan)]/30">
      {ytId && (
        <div className="relative aspect-video w-full bg-black">
          <img
            src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
            alt={announcement.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <a
              href={announcement.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {!ytId && announcement.posterUrl && (
        <div className="relative aspect-[16/7] w-full bg-black">
          <img
            src={announcement.posterUrl}
            alt={announcement.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[announcement.category] || CATEGORY_COLORS.other}`}
          >
            {CATEGORY_LABELS[announcement.category] || announcement.category}
          </span>
        </div>

        <h4 className="font-display text-base font-bold mb-2 leading-tight">
          {announcement.title}
        </h4>

        <p className="text-sm text-[var(--color-mute)]/80 leading-relaxed">
          {announcement.description}
        </p>

        <div className="flex items-center gap-3 mt-3">
          {announcement.trailerUrl && (
            <a
              href={announcement.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Trailer
            </a>
          )}
          {announcement.sourceUrl && (
            <a
              href={announcement.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-cyan)] hover:underline"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
