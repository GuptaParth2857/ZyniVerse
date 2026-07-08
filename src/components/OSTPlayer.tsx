"use client";

import type { OSTEntry } from "@/lib/ost";

interface OSTPlayerProps {
  ost: OSTEntry;
  onClose?: () => void;
}

export default function OSTPlayer({ ost, onClose }: OSTPlayerProps) {
  if (!ost.videoUrl) return null;

  const videoId = extractYouTubeId(ost.videoUrl);
  if (!videoId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]/50">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold truncate">{ost.title}</h3>
            <p className="text-sm text-[var(--color-mute)] truncate">{ost.animeTitle} · {ost.artist}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="ml-4 shrink-0 text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
            title={`${ost.title} - ${ost.artist}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="px-5 py-3 text-xs text-[var(--color-mute)] space-y-1">
          <p><span className="font-semibold">Song:</span> {ost.title}</p>
          <p><span className="font-semibold">Artist:</span> {ost.artist}</p>
          {ost.composer && <p><span className="font-semibold">Composer:</span> {ost.composer}</p>}
          {ost.type && <p><span className="font-semibold">Type:</span> {ost.type}</p>}
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
