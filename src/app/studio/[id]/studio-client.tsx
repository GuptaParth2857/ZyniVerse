"use client";

import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import AnimeCard from "@/components/AnimeCard";
import type { StudioFull } from "@/lib/anilist";

export default function StudioDetailClient({ initialStudio }: { initialStudio: StudioFull }) {
  const studio = initialStudio;

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 pb-8 border-b border-[var(--color-line)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] text-xl font-bold text-black">
            {studio.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">{/* Studio */}</p>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{studio.name}</h1>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-[var(--color-mute)]">
              {studio.isAnimationStudio && <span className="text-[var(--color-cyan)]">Animation Studio</span>}
              {studio.favourites != null && <span>♥ {studio.favourites.toLocaleString()} favorites</span>}
              <span>{studio.media?.pageInfo?.total || 0} anime</span>
              {studio.siteUrl && (
                <a href={studio.siteUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyan)] hover:underline">AniList ↗</a>
              )}
            </div>
          </div>
        </div>

        {/* Anime Grid */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold mb-4">Anime by {studio.name}</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {studio.media?.nodes?.map((m) => <AnimeCard key={m.id} anime={m} />)}
          </div>
          {(!studio.media?.nodes || studio.media.nodes.length === 0) && (
            <EmptyState icon="film" title="No anime found for this studio." description="This studio may not have any anime listed yet." actionLabel="Explore Anime" actionHref="/search" />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
