"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useCallback, useState } from "react";
import { eventImageSrc } from "@/lib/event-images";
import TrailerModal from "@/components/TrailerModal";
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

const CATEGORY_ACCENTS: Record<string, string> = {
  "anime-reveal": "#22d3ee",
  "season-announcement": "#4ade80",
  "movie-reveal": "#a78bfa",
  "game-reveal": "#60a5fa",
  collab: "#f472b6",
  trailer: "#fbbf24",
  "key-visual": "#fb923c",
  casting: "#818cf8",
  merchandise: "#fb7185",
  other: "#9ca3af",
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
  index = 0,
}: {
  announcement: AnimeAnnouncement;
  index?: number;
}) {
  const ytId = announcement.trailerUrl
    ? extractYouTubeId(announcement.trailerUrl)
    : null;
  const accent = CATEGORY_ACCENTS[announcement.category] || CATEGORY_ACCENTS.other;
  const color = CATEGORY_COLORS[announcement.category] || CATEGORY_COLORS.other;
  const label = CATEGORY_LABELS[announcement.category] || announcement.category;
  const ref = useRef<HTMLDivElement>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <>
      <motion.div
        ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 9) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="neon-premium rounded-[18px] group overflow-hidden h-full"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[18px] overflow-hidden flex flex-col h-full">
        {/* Video / Poster */}
        {ytId ? (
          <div className="relative aspect-video w-full bg-black overflow-hidden shrink-0">
            <Image
              src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
              alt={announcement.title}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setTrailerOpen(true)}
                className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-600/30"
                aria-label={`Watch trailer for ${announcement.title}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        ) : announcement.posterUrl ? (
          <div className="relative aspect-[16/7] w-full bg-black overflow-hidden shrink-0">
            <Image
              src={eventImageSrc(announcement.posterUrl) ?? ""}
              alt={announcement.title}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.8)] to-transparent" />
          </div>
        ) : null}

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Accent bar row (voice-lines style) */}
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-1.5 w-8 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}88` }} />
            <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${color}`}>
              {label}
            </span>
          </div>

          <h4 className="font-display text-base font-bold mb-2 leading-tight group-hover:text-[var(--color-cyan)] transition-colors">
            {announcement.title}
          </h4>

          <p className="text-sm text-[var(--color-mute)]/80 leading-relaxed flex-1">
            {announcement.description}
          </p>

          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--color-line)]">
            {announcement.trailerUrl && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch Trailer
              </button>
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
      </motion.div>
      <TrailerModal
        url={trailerOpen ? announcement.trailerUrl ?? null : null}
        onClose={() => setTrailerOpen(false)}
      />
    </>
  );
}
