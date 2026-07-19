"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { getSuggestions } from "@/lib/anilist";
import type { Suggestion } from "@/lib/anilist";
import MomentMaker from "./MomentMaker";

export default function HomeMomentButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [makerOpen, setMakerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!query.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await getSuggestions(query.trim());
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
      } catch { setSuggestions([]); setShowSuggestions(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!makerOpen) setSelected(null);
  }, [makerOpen]);

  const handleSelect = useCallback((s: Suggestion) => {
    setSelected(s);
    setShowSuggestions(false);
    setOpen(false);
    setMakerOpen(true);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 px-5 py-2.5 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-colors"
      >
        ✦ Create Moments
      </button>

      {/* Anime search dialog */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
              <h3 className="font-display text-base font-bold">Pick an Anime</h3>
              <button onClick={() => setOpen(false)} className="text-sm text-[var(--color-mute)] hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-5" ref={suggestRef}>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2.5 focus-within:border-[var(--color-cyan)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search anime..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)] text-[var(--color-ink)]"
                />
              </div>
              {showSuggestions && (
                <div className="mt-2 max-h-64 overflow-y-auto space-y-1">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(s)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      {s.poster && (
                        <div className="relative h-12 w-8 rounded overflow-hidden border border-[var(--color-line)] shrink-0">
                          <Image src={s.poster} alt="" fill className="object-cover" sizes="32px" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--color-ink)] truncate">{s.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                          {s.format && <span>{s.format}</span>}
                          {s.year && <span>{s.year}</span>}
                          {s.episodes && <span>{s.episodes} ep</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {query.trim() && !showSuggestions && suggestions.length === 0 && (
                <p className="mt-3 text-xs text-[var(--color-mute)] text-center">No results found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MomentMaker */}
      {selected && (
        <MomentMaker
          isOpen={makerOpen}
          onClose={() => setMakerOpen(false)}
          animeId={selected.id}
          animeTitle={selected.title}
          animeCover={selected.poster}
        />
      )}
    </>
  );
}
