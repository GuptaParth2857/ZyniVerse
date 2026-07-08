"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSuggestions } from "@/lib/anilist";
import type { Suggestion } from "@/lib/anilist";

export default function FillerSearch() {
  const router = useRouter();
  const [inputVal, setInputVal] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inputVal.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await getSuggestions(inputVal.trim());
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
      } catch { setSuggestions([]); setShowSuggestions(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [inputVal]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(id: number) {
    setShowSuggestions(false);
    setInputVal("");
    router.push(`/anime/${id}/filler`);
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300 focus-within:border-[var(--color-magenta)]/50">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)] shrink-0"
        >
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions.length > 0) {
              handleSelect(suggestions[0].id);
            }
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search any anime for its filler guide..."
          className="w-full bg-transparent py-4 pl-12 pr-4 text-base text-white placeholder-[var(--color-mute)]/50 outline-none"
        />
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-[var(--color-line)] last:border-0"
            >
              {s.poster && (
                <div className="relative h-12 w-8 rounded overflow-hidden border border-[var(--color-line)] shrink-0">
                  <Image src={s.poster} alt="" fill className="object-cover" sizes="32px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{s.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                  {s.format && <span>{s.format}</span>}
                  {s.year && <span>{s.year}</span>}
                  {s.episodes && <span>{s.episodes} ep</span>}
                </div>
              </div>
              <span className="text-[10px] text-[var(--color-cyan)] shrink-0">View Filler →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
