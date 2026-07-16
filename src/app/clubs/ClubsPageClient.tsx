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
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Clubs & Groups</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Find your people. Join clubs for specific anime, manga, regions, languages, and more.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-colors ${
                category === cat.value
                  ? "bg-[var(--color-magenta)] text-black"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-mute)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search clubs..."
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] pl-9 pr-3 py-2 text-sm outline-none w-full sm:w-56 text-[var(--color-ink)] placeholder-[var(--color-mute)] focus:border-[var(--color-cyan)] transition-colors"
            />
          </div>
          <Link href="/clubs/create" className="neon-premium rounded-xl no-underline">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <span className="neon-premium-content flex items-center px-5 py-2.5 text-xs font-bold text-[var(--color-cyan)] hover:text-white transition-colors rounded-xl">
              + Create Club
            </span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="neon-premium rounded-xl" style={{ minHeight: 160 }}>
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content p-4 animate-pulse">
                <div className="h-4 w-3/4 bg-[var(--color-line)] rounded mb-3" />
                <div className="h-3 w-full bg-[var(--color-line)] rounded mb-2" />
                <div className="h-3 w-1/2 bg-[var(--color-line)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="neon-premium rounded-xl text-center">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content py-20 px-6">
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-magenta)" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">No clubs yet</h3>
            <p className="text-sm text-[var(--color-mute)] mb-4">Be the first to create a community!</p>
            <Link href="/clubs/create" className="neon-premium rounded-xl inline-flex no-underline">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <span className="neon-premium-content flex items-center gap-2 px-6 py-3 text-sm font-bold text-[var(--color-cyan)] hover:text-white transition-colors rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                Create Club
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}
    </div>
  );
}
