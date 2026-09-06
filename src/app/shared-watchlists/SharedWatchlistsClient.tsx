"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SharedWatchlistCard from "@/components/SharedWatchlistCard";

interface Member {
  user: { id: string; username: string; avatar: string | null };
  role: string;
}

interface WatchlistData {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  owner: { id: string; username: string; avatar: string | null };
  members: Member[];
  _count: { items: number };
}

export default function SharedWatchlistsPage({
  watchlists: initial,
  isLoggedIn,
}: {
  watchlists: WatchlistData[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [watchlists, setWatchlists] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function createWatchlist() {
    if (creating || !title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/shared-watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlists((prev) => [data.watchlist, ...prev]);
        setShowCreate(false);
        setTitle("");
        setDescription("");
        router.push(`/shared-watchlists/${data.watchlist.id}`);
      }
    } catch {}
    setCreating(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            <span className="neon-text-gradient">Shared Watchlists</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--color-mute)]">Collaborate on watchlists with friends</p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-full bg-[var(--color-cyan)] px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
          >
            + Create
          </button>
        )}
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5"
        >
          <h3 className="mb-3 text-sm font-bold">New Shared Watchlist</h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Watchlist title"
            autoFocus
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none mb-3"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none resize-none mb-4"
          />
          <div className="flex gap-2">
            <button onClick={createWatchlist} disabled={creating || !title.trim()} className="rounded-full bg-[var(--color-cyan)] px-5 py-2 text-xs font-bold text-black hover:opacity-90 disabled:opacity-50">
              {creating ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowCreate(false)} className="rounded-full border border-[var(--color-line)] px-5 py-2 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)]">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlists.map((w, i) => (
          <SharedWatchlistCard key={w.id} watchlist={w} index={i} />
        ))}
      </div>

      {watchlists.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-lg font-bold text-[var(--color-mute)]">No shared watchlists yet</p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">Create one to start collaborating with friends</p>
        </div>
      )}
    </div>
  );
}
