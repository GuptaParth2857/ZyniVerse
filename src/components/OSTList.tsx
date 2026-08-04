"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOSTs, getAllArtists, getCoverImage } from "@/lib/ost";
import type { OSTEntry } from "@/lib/ost";
import OSTPlayer from "./OSTPlayer";
import { NeonSelect } from "./NeonSelect";

const TYPE_BADGES: Record<string, string> = {
  OP: "bg-red-500/90 text-white border-red-400/50 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  ED: "bg-blue-500/90 text-white border-blue-400/50 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
  OST: "bg-purple-500/90 text-white border-purple-400/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]",
  INSERT: "bg-emerald-500/90 text-white border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  CHARACTER: "bg-amber-500/90 text-white border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
};

const TYPE_FALLBACK: Record<string, string> = {
  OP: "op",
  ED: "ed",
  OST: "ost",
  INSERT: "insert",
  CHARACTER: "character",
};

const TYPES = ["", "OP", "ED", "OST", "INSERT", "CHARACTER"];

export default function OSTList() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [playing, setPlaying] = useState<OSTEntry | null>(null);

  const artists = useMemo(() => getAllArtists(), []);

  const artistOptions = useMemo(
    () => [
      { value: "", label: "All Artists" },
      ...artists.map((a) => ({
        value: a,
        label: a,
        badge: String(getOSTs(undefined, undefined, a).length),
      })),
    ],
    [artists]
  );

  const results = useMemo(
    () => getOSTs(search || undefined, typeFilter || undefined, artistFilter || undefined),
    [search, typeFilter, artistFilter]
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="rgb-border rgb-border-always flex-1 min-w-[200px] sm:min-w-[300px]">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-mute)]/50 z-10" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs, artists, anime..."
              className="relative z-10 w-full rounded-xl bg-[var(--color-panel)] pl-10 pr-4 py-3 text-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-mute)]/40"
            />
          </div>
        </div>
        <div className="rgb-border rgb-border-always">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="relative z-10 rounded-xl bg-[var(--color-panel)] px-4 py-3 text-sm outline-none text-[var(--color-ink)] cursor-pointer appearance-none"
          >
            <option value="">All Types</option>
            {TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <NeonSelect
          variant="plain"
          panelAlign="right"
          value={artistFilter}
          onChange={(v) => setArtistFilter(v)}
          placeholder="All Artists"
          panelClassName="max-w-[80vw]"
          options={artistOptions}
        />
      </div>

      {results.length > 0 && (
        <p className="text-xs text-[var(--color-mute)]/50 mb-4 font-mono">
          {results.length} track{results.length !== 1 ? "s" : ""} found
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {results.map((ost) => (
          <OSTCard key={ost.id} ost={ost} onPlay={() => setPlaying(ost)} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-panel)] border border-[var(--color-line)] flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]/30">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p className="text-sm text-[var(--color-mute)]/50 font-medium">No tracks found</p>
          <p className="text-xs text-[var(--color-mute)]/30 mt-1">Try adjusting your filters</p>
        </div>
      )}

      {playing && <OSTPlayer ost={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

function OSTCard({ ost, onPlay }: { ost: OSTEntry; onPlay: () => void }) {
  const [imgError, setImgError] = useState(false);
  const coverImage = getCoverImage(ost.animeTitle);
  const showImage = coverImage && !imgError;

  return (
    <div className="ost-neon-card group">
      <div className="relative z-10 overflow-hidden rounded-[calc(1rem-2px)] bg-[var(--color-panel)]">
        <div className="ost-card-image relative aspect-[2/3]">
          {showImage ? (
            <Image
              src={coverImage}
              alt={ost.animeTitle}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-cover object-top"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`absolute inset-0 h-full w-full ost-type-fallback ${TYPE_FALLBACK[ost.type] || "ost"}`} />
          )}

          <div className="ost-card-overlay absolute inset-0 z-[1]" />

          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-[2]">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${TYPE_BADGES[ost.type] || TYPE_BADGES.OST}`}>
              {ost.type}
            </span>
            {ost.videoUrl && (
              <button
                onClick={(e) => { e.stopPropagation(); onPlay(); }}
                className="ost-play-btn shrink-0 w-8 h-8 rounded-full bg-[var(--color-cyan)]/90 flex items-center justify-center text-[var(--color-void)] hover:bg-[var(--color-cyan)] transition-colors"
                aria-label={`Play ${ost.title}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 z-[2]">
            <Link href={`/ost/${ost.id}`} className="block">
              <h3 className="font-display font-bold text-[13px] sm:text-sm leading-tight text-white group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2 drop-shadow-lg">
                {ost.title}
              </h3>
            </Link>
            <p className="text-[11px] text-white/70 mt-1 truncate font-medium">{ost.artist}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-white/40 truncate">{ost.animeTitle}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] text-white/30 font-mono">
              <span>{ost.year}</span>
              {ost.season && <><span className="text-[var(--color-cyan)]/30">·</span><span>{ost.season}</span></>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
