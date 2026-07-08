"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import type { DoujinshiEntry } from "@/lib/doujinshi-data";

interface Props {
  entry: DoujinshiEntry;
  onTrack?: (id: string, status: string) => void;
  trackedStatus?: string | null;
}

export default function DoujinshiCard({ entry, onTrack, trackedStatus }: Props) {
  const { data: session } = useSession();

  return (
    <div className="group relative flex flex-col rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-magenta)]/30 transition-all duration-300">
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-[var(--color-magenta)]/10 to-[var(--color-violet)]/10 overflow-hidden">
        {entry.image ? (
          <img src={entry.image} alt={entry.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-mute)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v15H6.5A2.5 2.5 0 004 19.5z" />
            </svg>
            <span className="text-[10px] font-mono opacity-60">Read Online</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Title */}
        <Link href={`/doujinshi/${entry.id}`} className="group/title">
          <h3 className="text-sm font-bold leading-tight line-clamp-2 group-hover/title:text-[var(--color-magenta)] transition-colors">
            {entry.title}
          </h3>
        </Link>

        {/* Circle & Artist */}
        <div className="flex flex-wrap gap-1 text-[10px] text-[var(--color-mute)]">
          {entry.circle && (
            <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5">{entry.circle}</span>
          )}
          {entry.artist && (
            <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5">{entry.artist}</span>
          )}
        </div>

        {/* Parody & Language badges */}
        <div className="flex flex-wrap gap-1">
          {entry.parody && entry.parody !== "Original" && (
            <span className="rounded-full bg-[var(--color-magenta)]/10 px-2 py-0.5 text-[9px] font-mono text-[var(--color-magenta)]">
              {entry.parody}
            </span>
          )}
          <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-mono text-[var(--color-cyan)] uppercase">
            {entry.language}
          </span>
          {entry.isTranslated && (
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[9px] font-mono text-green-400">
              Translated
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {entry.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] text-[var(--color-mute)] opacity-60">
              #{tag}
            </span>
          ))}
        </div>

        {/* Pages & External link */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--color-line)]/50">
          {entry.pages ? (
            <span className="text-[10px] font-mono text-[var(--color-mute)]">{entry.pages} pages</span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1">
            {/* Read Online button */}
            {entry.externalUrl && (
              <a
                href={entry.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[var(--color-cyan)]/10 px-2 py-1 text-[10px] font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
              >
                Read ↗
              </a>
            )}

            {/* Track button */}
            {session && onTrack && (
              <button
                onClick={() => onTrack(entry.id, trackedStatus === "favorite" ? "want" : "favorite")}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                  trackedStatus
                    ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]"
                    : "bg-[var(--color-panel)] border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]"
                }`}
              >
                {trackedStatus ? "Tracked" : "Track"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
