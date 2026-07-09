"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { DoujinshiEntry } from "@/lib/mangadex-api";

interface Props {
  entry: DoujinshiEntry;
}

export default function DoujinshiDetail({ entry }: Props) {
  const { data: session } = useSession();
  const [trackStatus, setTrackStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/doujinshi/my`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.entries?.find(
          (e: { doujinshi: { id: string }; entry: { status: string } }) =>
            e.doujinshi.id === entry.id,
        );
        if (found) setTrackStatus(found.entry.status);
      })
      .catch(() => {});
  }, [session, entry.id]);

  async function handleTrack(status: string) {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/doujinshi/${entry.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setTrackStatus(status);
    } catch {}
  }

  async function handleRemoveTracking() {
    try {
      const res = await fetch(`/api/doujinshi/${entry.id}/track`, {
        method: "DELETE",
      });
      if (res.ok) setTrackStatus(null);
    } catch {}
  }

  const STATUS_OPTIONS = [
    { value: "want", label: "Want to Read", color: "var(--color-cyan)" },
    { value: "reading", label: "Reading", color: "var(--color-violet)" },
    { value: "read", label: "Read", color: "var(--color-magenta)" },
    { value: "favorite", label: "Favorite", color: "var(--color-amber)" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link
          href="/doujinshi"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          Back to Doujinshi
        </Link>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Cover */}
        <div className="shrink-0">
          <div className="h-64 w-44 rounded-xl border border-[var(--color-line)] overflow-hidden">
            {entry.image ? (
              <img src={entry.image} alt={entry.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--color-magenta)]/10 to-[var(--color-violet)]/10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-[var(--color-mute)]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v15H6.5A2.5 2.5 0 004 19.5z" />
                  </svg>
                  <span className="text-xs font-mono opacity-60">Doujinshi</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-4">
          <h1 className="font-display text-3xl font-bold">{entry.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-[var(--color-mute)]">
            {entry.circle && (
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-60 block">Circle</span>
                <span className="font-medium text-[var(--color-ink)]">{entry.circle}</span>
              </div>
            )}
            {entry.artist && (
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-60 block">Artist</span>
                <span className="font-medium text-[var(--color-ink)]">{entry.artist}</span>
              </div>
            )}
            {entry.parody && (
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-60 block">Parody</span>
                <span className="font-medium text-[var(--color-ink)]">{entry.parody}</span>
              </div>
            )}
            {entry.pages && (
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-60 block">Pages</span>
                <span className="font-medium text-[var(--color-ink)]">{entry.pages}</span>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase tracking-wider opacity-60 block">Language</span>
              <span className="font-medium text-[var(--color-ink)] uppercase">{entry.language}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {entry.parody !== "Original" && entry.parody && (
              <span className="rounded-full bg-[var(--color-magenta)]/10 px-3 py-1 text-xs font-mono text-[var(--color-magenta)]">
                {entry.parody}
              </span>
            )}
            {entry.isTranslated && (
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-mono text-green-400">
                Translated
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <Link
                key={tag}
                href={`/doujinshi?tag=${tag}`}
                className="rounded-full border border-[var(--color-line)] px-2.5 py-1 text-[11px] text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Description */}
          {entry.description && (
            <p className="leading-relaxed text-[var(--color-mute)] text-sm">{entry.description}</p>
          )}

          {/* External link */}
          {entry.externalUrl && (
            <a
              href={entry.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cyan)] px-5 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
            >
              Read Online ↗
            </a>
          )}

          {/* Tracking controls */}
          {session && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)] mb-3">
                Tracking
              </h3>
              {trackStatus ? (
                <div className="space-y-2">
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-black"
                    style={{
                      backgroundColor: STATUS_OPTIONS.find((s) => s.value === trackStatus)?.color || "var(--color-mute)",
                    }}
                  >
                    {STATUS_OPTIONS.find((s) => s.value === trackStatus)?.label || trackStatus}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {STATUS_OPTIONS.filter((s) => s.value !== trackStatus).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleTrack(opt.value)}
                        className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      onClick={handleRemoveTracking}
                      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleTrack(opt.value)}
                      className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
