"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSuggestions } from "@/lib/anilist";
import type { Suggestion } from "@/lib/anilist";

export default function FillerSearch() {
  const router = useRouter();
  const [inputVal, setInputVal] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputVal.trim()) return;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getSuggestions(inputVal.trim());
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
      } catch { setSuggestions([]); setShowSuggestions(false); }
      setLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
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

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  function handleSelect(id: number) {
    setShowSuggestions(false);
    setInputVal("");
    router.push(`/anime/${id}/filler`);
  }

  return (
    <div ref={ref} className="relative">
      {/* Premium neon border */}
      <div className="relative rounded-full">
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0"
            style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
          />
          <div className="absolute inset-[1.5px] rounded-full" style={{ background: "rgba(10,10,15,0.95)" }} />
        </div>

        <div className="relative z-10 flex items-center">
          <div className="pl-5 pr-1 flex items-center">
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-[var(--color-cyan)]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[var(--color-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => {
              const val = e.target.value;
              setInputVal(val);
              if (!val.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
                setLoading(false);
              } else {
                setLoading(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && suggestions.length > 0) {
                handleSelect(suggestions[0].id);
              }
              if (e.key === "Escape") {
                setShowSuggestions(false);
                inputRef.current?.blur();
              }
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search any anime for its filler guide..."
            className="flex-1 bg-transparent py-3.5 px-2 text-sm outline-none placeholder-[var(--color-mute)]/60 text-[var(--color-ink)]"
          />
          {inputVal && (
            <button
              onClick={() => { setInputVal(""); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus(); }}
              className="pr-2 text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50">
          {/* Animated border for dropdown */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0"
              style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
            />
            <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.97)" }} />
          </div>

          <div className="relative z-10 max-h-80 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s.id)}
                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-[var(--color-line)]/50 last:border-0 group"
              >
                {s.poster ? (
                  <div className="relative h-12 w-9 rounded-lg overflow-hidden border border-[var(--color-line)] shrink-0">
                    <Image src={s.poster} alt="" fill className="object-cover" sizes="36px" />
                  </div>
                ) : (
                  <div className="h-12 w-9 rounded-lg bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 border border-[var(--color-line)] shrink-0 flex items-center justify-center">
                    <span className="text-[8px] text-[var(--color-mute)]">N/A</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-[var(--color-cyan)] transition-colors">{s.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)] mt-0.5">
                    {s.format && <span className="rounded-full bg-white/5 px-1.5 py-0.5">{s.format}</span>}
                    {s.year && <span>{s.year}</span>}
                    {s.episodes && <span>{s.episodes} ep</span>}
                  </div>
                </div>
                <span className="text-[10px] text-[var(--color-cyan)]/60 shrink-0 group-hover:text-[var(--color-cyan)] transition-colors">View →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
