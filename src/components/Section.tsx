import Link from "next/link";
import AnimeCard from "./AnimeCard";
import { CardSkeleton } from "./Loader";
import type { Media } from "@/lib/anilist";

export default function Section({
  eyebrow,
  title,
  viewAllTo,
  loading,
  items,
  emptyMessage,
}: {
  eyebrow?: string;
  title: string;
  viewAllTo?: string;
  loading?: boolean;
  items?: Media[];
  emptyMessage?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          {eyebrow && (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        </div>
        {viewAllTo && (
          <Link
            href={viewAllTo}
            className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
          >
            View all →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((a) => (
            <AnimeCard key={a.id} anime={a} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-mute)]">{emptyMessage || "Nothing found."}</p>
      )}
    </section>
  );
}
