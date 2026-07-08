"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getOSTs, getAllArtists } from "@/lib/ost";
import type { OSTEntry } from "@/lib/ost";
import OSTPlayer from "./OSTPlayer";

const TYPE_BADGES: Record<string, string> = {
  OP: "bg-red-600/20 text-red-400 border-red-600/30",
  ED: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  OST: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  INSERT: "bg-green-600/20 text-green-400 border-green-600/30",
  CHARACTER: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
};

const TYPES = ["", "OP", "ED", "OST", "INSERT", "CHARACTER"];

export default function OSTList() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [playing, setPlaying] = useState<OSTEntry | null>(null);

  const artists = useMemo(() => getAllArtists(), []);

  const results = useMemo(
    () => getOSTs(search || undefined, typeFilter || undefined, artistFilter || undefined),
    [search, typeFilter, artistFilter]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search OSTs..."
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors w-full sm:w-64"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        >
          <option value="">All Types</option>
          {TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors max-w-48"
        >
          <option value="">All Artists</option>
          {artists.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((ost) => (
          <OSTCard key={ost.id} ost={ost} onPlay={() => setPlaying(ost)} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]/30 mb-3">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 18s1.5-2 3-2 3 2 3 2" />
            <path d="M9 9h.01" /><path d="M15 9h.01" />
          </svg>
          <p className="text-sm text-[var(--color-mute)]/50">No OSTs found</p>
        </div>
      )}

      {playing && <OSTPlayer ost={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

function OSTCard({ ost, onPlay }: { ost: OSTEntry; onPlay: () => void }) {
  return (
    <div className="group relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 backdrop-blur-sm overflow-hidden hover:border-[var(--color-cyan)]/40 transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_BADGES[ost.type] || TYPE_BADGES.OST}`}>
            {ost.type}
          </span>
          {ost.videoUrl && (
            <button onClick={onPlay} className="shrink-0 flex items-center gap-1 rounded-full bg-[var(--color-cyan)]/10 px-2.5 py-1 text-xs text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors" aria-label="Play">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Play
            </button>
          )}
        </div>

        <Link href={`/ost/${ost.id}`} className="block">
          <h3 className="font-display font-bold text-sm leading-tight group-hover:text-[var(--color-cyan)] transition-colors">
            {ost.title}
          </h3>
        </Link>

        <p className="text-xs text-[var(--color-mute)] mt-1">{ost.artist}</p>
        <p className="text-[10px] text-[var(--color-mute)]/60 mt-0.5">{ost.animeTitle}</p>

        <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--color-mute)]/40">
          <span>{ost.year}</span>
          {ost.season && <span>· {ost.season}</span>}
          {ost.episodeRange && <span>· {ost.episodeRange}</span>}
        </div>
      </div>
    </div>
  );
}
