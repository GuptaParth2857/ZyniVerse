"use client";

import Link from "next/link";
import { useWatchlist } from "@/components/WatchlistProvider";
import WatchlistCarousel3D from "@/components/WatchlistCarousel3D";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

export default function WatchlistPage() {
  const { items, toggle } = useWatchlist();

  return (
    <PageTransition><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">// Saved</p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">My List</h1>
      <p className="mt-1 text-sm text-[var(--color-mute)]">
        Saved items are synced to your account when logged in.
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon="box"
          title="Your list is empty."
          description="Saved items are synced to your account when logged in."
          actionLabel="Explore Anime"
          actionHref="/search"
        />
      ) : (
        <div className="mt-8">
          <p className="mb-4 text-sm text-[var(--color-mute)]">{items.length} saved</p>
          <WatchlistCarousel3D items={items} />
        </div>
      )}
    </div></PageTransition>
  );
}
