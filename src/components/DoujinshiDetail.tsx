"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import type { DoujinshiEntry } from "@/lib/mangadex-api";
import { logError } from "@/lib/logger";

interface Props {
  entry: DoujinshiEntry;
}

const STATUS_OPTIONS = [
  { value: "want", label: "Want to Read", color: "var(--color-cyan)" },
  { value: "reading", label: "Reading", color: "var(--color-violet)" },
  { value: "read", label: "Read", color: "var(--color-magenta)" },
  { value: "favorite", label: "Favorite", color: "var(--color-amber)" },
];

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
    } catch (e) { logError(e); }
  }

  async function handleRemoveTracking() {
    try {
      const res = await fetch(`/api/doujinshi/${entry.id}/track`, {
        method: "DELETE",
      });
      if (res.ok) setTrackStatus(null);
    } catch (e) { logError(e); }
  }

  return (
    <div className="min-h-screen animate-page-in">
      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#ff00ff]/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#8a2be2]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,0,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(138,43,226,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/doujinshi"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            Back to Doujinshi
          </Link>

          <div className="mt-6 flex flex-col gap-8 sm:flex-row">
            {/* Cover */}
            <div className="relative shrink-0 h-72 w-48 sm:h-80 sm:w-56 rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 shadow-2xl overflow-hidden">
              {entry.image ? (
                <Image src={entry.image} alt={entry.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)]/10 to-[var(--color-violet)]/10">
                  <div className="flex flex-col items-center gap-2 text-[var(--color-mute)]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v15H6.5A2.5 2.5 0 004 19.5z" />
                    </svg>
                    <span className="text-xs font-mono opacity-60">Doujinshi</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff00ff]" style={{ textShadow: "0 0 10px rgba(255,0,255,0.5)" }}>
                Doujinshi
              </span>

              <div className="neon-rgb-border rounded-xl px-4 py-2 mt-2">
                <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{entry.title}</h1>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--color-mute)]">
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
                {entry.parody && entry.parody !== "Original" && entry.parody !== "Various" && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider opacity-60 block">Parody</span>
                    <span className="font-medium text-[var(--color-ink)]">{entry.parody}</span>
                  </div>
                )}
                {entry.pages > 0 && (
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
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--color-magenta)]/10 px-3 py-1 text-xs font-mono text-[var(--color-magenta)]">
                  {entry.language.toUpperCase()}
                </span>
                {entry.isTranslated && (
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-mono text-green-400">
                    Translated
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.tags.slice(0, 12).map((tag) => (
                  <Link
                    key={tag}
                    href={`/doujinshi?tag=${tag}`}
                    className="rounded-full border border-[var(--color-line)] px-2.5 py-1 text-[11px] text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={entry.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff00ff] to-[#8a2be2] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity"
                >
                  Read Online ↗
                </a>
                {session && trackStatus && (
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-black"
                    style={{ backgroundColor: STATUS_OPTIONS.find((s) => s.value === trackStatus)?.color || "var(--color-mute)" }}
                  >
                    {STATUS_OPTIONS.find((s) => s.value === trackStatus)?.label || trackStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
      </div>

      {/* ═══════════════ MAIN ═══════════════ */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12 min-w-0">
          {/* Story */}
          <section>
            <SectionTitle>Story</SectionTitle>
            {entry.description ? (
              <p className="leading-relaxed text-[var(--color-mute)] whitespace-pre-line">{entry.description}</p>
            ) : (
              <p className="text-sm text-[var(--color-mute)]">No description available.</p>
            )}
          </section>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <section>
              <SectionTitle>Tags</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/doujinshi?tag=${tag}`}
                    className="rounded-full bg-[var(--color-void)] px-2.5 py-1 text-[11px] text-[var(--color-mute)] border border-[var(--color-line)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Tracking */}
          {session && (
            <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm p-5">
              <h3 className="font-display text-sm font-bold mb-3">Tracking</h3>
              {trackStatus ? (
                <div className="space-y-2">
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-black"
                    style={{ backgroundColor: STATUS_OPTIONS.find((s) => s.value === trackStatus)?.color || "var(--color-mute)" }}
                  >
                    {STATUS_OPTIONS.find((s) => s.value === trackStatus)?.label || trackStatus}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {STATUS_OPTIONS.filter((s) => s.value !== trackStatus).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleTrack(opt.value)}
                        className="neon-rgb-border rounded-lg px-3 py-1.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors"
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
                      className="neon-rgb-border rounded-lg px-3 py-1.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Read */}
          <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm p-5">
            <h3 className="font-display text-sm font-bold mb-3">Read</h3>
            <a
              href={entry.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
            >
              <span className="text-[10px] font-bold">📖</span>
              Read Online on MangaDex
              <span className="ml-auto">↗</span>
            </a>
          </div>

          {/* Info */}
          <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm p-5 text-xs">
            <h3 className="font-display text-sm font-bold mb-3">Details</h3>
            <dl className="space-y-2 text-[var(--color-mute)]">
              {entry.circle && (
                <div className="flex justify-between gap-4">
                  <dt className="uppercase tracking-wider opacity-60">Circle</dt>
                  <dd className="text-right text-[var(--color-ink)]">{entry.circle}</dd>
                </div>
              )}
              {entry.artist && (
                <div className="flex justify-between gap-4">
                  <dt className="uppercase tracking-wider opacity-60">Artist</dt>
                  <dd className="text-right text-[var(--color-ink)]">{entry.artist}</dd>
                </div>
              )}
              {entry.parody && entry.parody !== "Original" && entry.parody !== "Various" && (
                <div className="flex justify-between gap-4">
                  <dt className="uppercase tracking-wider opacity-60">Parody</dt>
                  <dd className="text-right text-[var(--color-ink)]">{entry.parody}</dd>
                </div>
              )}
              {entry.pages > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="uppercase tracking-wider opacity-60">Pages</dt>
                  <dd className="text-right text-[var(--color-ink)]">{entry.pages}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="uppercase tracking-wider opacity-60">Language</dt>
                <dd className="text-right text-[var(--color-ink)] uppercase">{entry.language}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="uppercase tracking-wider opacity-60">Translation</dt>
                <dd className="text-right text-[var(--color-ink)]">{entry.isTranslated ? "English" : "Not available"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="uppercase tracking-wider opacity-60">Tags</dt>
                <dd className="text-right text-[var(--color-ink)]">{entry.tags.length}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
    <span className="h-4 w-1 rounded-full bg-[var(--color-violet)]" />
    {children}
  </h2>;
}
