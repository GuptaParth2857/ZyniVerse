"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CreatorCard from "@/components/CreatorCard";
import Link from "next/link";

interface CreatorData {
  id: string;
  displayName: string | null;
  bio: string | null;
  totalTips: number;
  kofiUrl: string | null;
  buymeacoffeeUrl: string | null;
  upiId: string | null;
  user: { id: string; username: string; avatar: string | null };
}

export default function CreatorsPageClient({
  creators: initial,
  isLoggedIn,
  currentUserId,
}: {
  creators: CreatorData[];
  isLoggedIn: boolean;
  currentUserId: string | null;
}) {
  const [search, setSearch] = useState("");

  const filtered = initial.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.displayName?.toLowerCase().includes(q) ||
      c.user.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            <span className="neon-text-gradient">Creators</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--color-mute)]">Support content creators on ZyniVerse</p>
        </div>
        {isLoggedIn && !currentUserId && (
          <div />
        )}
        {isLoggedIn && (
          <div className="flex gap-2">
            <Link
              href="/creators/setup"
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
            >
              My Creator Profile
            </Link>
          </div>
        )}
      </div>

      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search creators..."
          className="w-full max-w-md rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((creator, i) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CreatorCard creator={creator} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎨</div>
          <p className="text-lg font-bold text-[var(--color-mute)]">
            {search ? "No creators found" : "No creators yet"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            {search ? "Try a different search" : "Be the first to set up a creator profile"}
          </p>
        </div>
      )}
    </div>
  );
}
