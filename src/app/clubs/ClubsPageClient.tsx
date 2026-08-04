"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ClubCard from "@/components/ClubCard";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "fan_club", label: "Fan Clubs" },
  { value: "discussion", label: "Discussion" },
  { value: "watching", label: "Watching" },
  { value: "reading", label: "Reading" },
  { value: "region", label: "Region" },
  { value: "language", label: "Language" },
  { value: "other", label: "Other" },
];

interface Club {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  coverImage?: string | null;
  category: string;
  memberCount: number;
  isPrivate: boolean;
  owner: { id: string; username: string; avatar?: string | null };
  _count: { members: number; posts: number };
}

export default function ClubsPageClient() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`/api/clubs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setClubs(data.clubs || []); setLoading(false); } })
      .catch(() => { if (!cancelled) { setClubs([]); setLoading(false); } });

    return () => { cancelled = true; };
  }, [category, debouncedSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          <span className="gradient-text">Clubs & Groups</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--color-mute)]">
          Find your people. Join clubs for specific anime, manga, regions, languages, and more.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`neon-rgb-border rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                category === cat.value
                  ? "bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] text-black shadow-[0_0_16px_-4px_var(--color-magenta)]"
                  : "bg-[var(--color-panel)] text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="neon-rgb-border relative rounded-full">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-mute)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search clubs..."
              className="w-full rounded-full bg-[var(--color-panel)] py-2 pl-10 pr-4 text-sm text-[var(--color-ink)] outline-none placeholder-[var(--color-mute)] sm:w-56"
            />
          </div>
          <Link href="/clubs/create" className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-magenta)] via-[#7000ff] to-[var(--color-cyan)] px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_-6px_var(--color-magenta)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_32px_-4px_var(--color-magenta)]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
            Create Club
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="neon-rgb-border rounded-2xl bg-[var(--color-panel)] p-4" style={{ minHeight: 160 }}>
              <div className="h-20 w-full animate-pulse rounded-xl bg-[var(--color-line)]" />
              <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-[var(--color-line)]" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-[var(--color-line)]" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[var(--color-line)]" />
            </div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)] px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-magenta)" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <h3 className="mb-2 font-display text-lg font-bold text-white">No clubs yet</h3>
          <p className="mb-4 text-sm text-[var(--color-mute)]">Be the first to create a community!</p>
          <Link href="/clubs/create" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-magenta)] via-[#7000ff] to-[var(--color-cyan)] px-6 py-3 text-sm font-bold text-black shadow-[0_0_24px_-6px_var(--color-magenta)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_36px_-4px_var(--color-magenta)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
            Create Club
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club, i) => (
            <ClubCard key={club.id} club={club} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
