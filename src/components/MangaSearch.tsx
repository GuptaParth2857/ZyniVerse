"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { searchManga } from "@/lib/manga";
import type { Media } from "@/lib/anilist";

interface Props {
  onAdd?: (manga: Media, status: string) => void;
}

export default function MangaSearch({ onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchManga(query.trim());
        setResults(res);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleAdd(manga: Media, status: string) {
    try {
      const res = await fetch("/api/manga/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: manga.id,
          title: manga.title.english || manga.title.romaji,
          coverImage: manga.coverImage?.extraLarge || manga.coverImage?.large,
          status,
          totalChapters: manga.chapters,
          totalVolumes: manga.volumes,
        }),
      });
      if (res.ok && onAdd) onAdd(manga, status);
    } catch (e) {
      console.error("Failed to add manga", e);
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 focus-within:border-[var(--color-violet)] transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search manga to add to your list..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
        />
        {loading && <span className="text-xs text-[var(--color-mute)]">Searching...</span>}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          {results.map((m) => {
            const title = m.title.english || m.title.romaji || "";
            return (
              <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-[var(--color-line)] last:border-0">
                <div className="relative h-14 w-10 rounded overflow-hidden border border-[var(--color-line)] shrink-0">
                  <Image src={m.coverImage?.extraLarge || m.coverImage?.large || ""} alt={title} fill className="object-cover" sizes="40px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                    {m.chapters && <span>{m.chapters} ch</span>}
                    {m.volumes && <span>{m.volumes} vol</span>}
                    {m.format && <span>{m.format}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleAdd(m, "READING")} className="rounded-lg bg-[var(--color-violet)] px-2.5 py-1 text-[10px] font-semibold text-black hover:opacity-90">Reading</button>
                  <button onClick={() => handleAdd(m, "PLANNING")} className="rounded-lg border border-[var(--color-line)] px-2.5 py-1 text-[10px] text-[var(--color-mute)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)]">Plan</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
