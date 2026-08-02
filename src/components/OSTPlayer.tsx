"use client";

import type { OSTEntry } from "@/lib/ost";
import { getCoverImage } from "@/lib/ost";
import Image from "next/image";

interface OSTPlayerProps {
  ost: OSTEntry;
  onClose?: () => void;
}

export default function OSTPlayer({ ost, onClose }: OSTPlayerProps) {
  if (!ost.videoUrl) return null;

  const videoId = extractYouTubeId(ost.videoUrl);
  if (!videoId) return null;

  const coverImage = getCoverImage(ost.animeTitle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl overflow-hidden animate-page-slide" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]/50">
          {coverImage && (
            <div className="absolute inset-0 opacity-10">
              <Image src={coverImage} alt="" fill className="object-cover blur-xl" sizes="100vw" />
            </div>
          )}
          <div className="relative z-10 min-w-0 flex-1 flex items-center gap-3">
            {coverImage && (
              <Image src={coverImage} alt={ost.animeTitle} width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-[var(--color-magenta)]/20" />
            )}
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold truncate">{ost.title}</h3>
              <p className="text-sm text-[var(--color-mute)] truncate">{ost.animeTitle} · {ost.artist}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="relative z-10 ml-4 shrink-0 w-8 h-8 rounded-full bg-[var(--color-line)]/50 flex items-center justify-center text-[var(--color-mute)] hover:text-white hover:bg-[var(--color-line)] transition-all" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
            title={`${ost.title} - ${ost.artist}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="px-5 py-3 text-xs text-[var(--color-mute)] flex flex-wrap gap-x-4 gap-y-1">
          <span><span className="font-semibold text-[var(--color-ink)]">Song:</span> {ost.title}</span>
          <span><span className="font-semibold text-[var(--color-ink)]">Artist:</span> {ost.artist}</span>
          {ost.composer && <span><span className="font-semibold text-[var(--color-ink)]">Composer:</span> {ost.composer}</span>}
          <span><span className="font-semibold text-[var(--color-ink)]">Type:</span> {ost.type}</span>
        </div>
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
