"use client";

import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);

    fetch(`/api/clubs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setClubs(data.clubs || []))
      .catch(() => setClubs([]))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
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
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs..."
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-cyan)] w-full sm:w-48"
          />
          <Link href="/clubs/create" className="rounded-xl bg-[var(--color-magenta)] px-4 py-1.5 text-xs font-bold text-black hover:opacity-90 transition-opacity">
            + Create Club
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-[var(--color-line)] rounded mb-3" />
              <div className="h-3 w-full bg-[var(--color-line)] rounded mb-2" />
              <div className="h-3 w-1/2 bg-[var(--color-line)] rounded" />
            </div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--color-mute)] mb-4">No clubs found</p>
          <Link href="/clubs/create" className="rounded-xl bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity">
            Create the first club
          </Link>
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
