"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { searchMedia, getGenres } from "@/lib/anilist";
import { ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import AnimeCard from "@/components/AnimeCard";
import type { Media } from "@/lib/anilist";

export default function GenrePage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);
  const [type, setType] = useState<"ANIME" | "MANGA">("ANIME");
  const [list, setList] = useState<Media[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGenres().then(setAllGenres).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError(null);
    searchMedia({ genre: decodedName, type, sort: "POPULARITY_DESC", perPage: 48 })
      .then((d) => !cancelled && setList(d.media))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [decodedName, type]);

  const isValidGenre = allGenres.some((g) => g.toLowerCase() === decodedName.toLowerCase());

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 pb-8 border-b border-[var(--color-line)]">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">{/* Genre */}</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{decodedName}</h1>
          </div>
          <div className="flex rounded-xl border border-[var(--color-line)] overflow-hidden">
            {(["ANIME", "MANGA"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  type === t ? "bg-[var(--color-magenta)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >{t.charAt(0) + t.slice(1).toLowerCase()}</button>
            ))}
          </div>
        </div>

        {/* Other genres quick nav */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {allGenres.slice(0, 20).map((g) => (
            <Link key={g} href={`/genre/${g}`}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                g.toLowerCase() === decodedName.toLowerCase()
                  ? "bg-[var(--color-magenta)] text-black"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
              }`}
            >{g}</Link>
          ))}
          {allGenres.length > 20 && (
            <Link href="/search" className="rounded-full border border-dashed border-[var(--color-line)] px-5 py-2.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)]">
              More →
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="mt-8">
          {error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {list.map((m) => <AnimeCard key={m.id} anime={m} />)}
                {loading && Array.from({ length: 6 }).map((_, i) => (
                  <div key={`s${i}`} className="rounded-xl bg-[var(--color-panel)] animate-pulse aspect-[3/4]" />
                ))}
              </div>
              {!loading && list.length === 0 && (
                <EmptyState icon="film" title={`No ${type.toLowerCase()} found in this genre.`} description="Try a different genre or browse all." actionLabel="Browse All" actionHref="/browse" />
              )}
            </>
          )}
        </div>

        {!isValidGenre && !loading && (
          <p className="mt-6 text-center text-xs text-[var(--color-mute)]">
            &quot;{decodedName}&quot; is not a recognized genre. Browse all genres above.
          </p>
        )}
      </div>
    </PageTransition>
  );
}
