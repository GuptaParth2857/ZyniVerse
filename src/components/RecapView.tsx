"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Loader, { ErrorState } from "@/components/Loader";
import { useSearchParams, useRouter } from "next/navigation";
import type { YearRecap } from "@/lib/recap";

function formatHours(h: number): string {
  if (h >= 1000) return `${Math.round(h / 100) / 10}k`;
  return `${Math.round(h)}`;
}

export default function RecapView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year");
  const requestedYear = yearParam ? Number(yearParam) : null;
  const year = requestedYear && requestedYear > 2000 && requestedYear <= new Date().getFullYear() ? requestedYear : new Date().getFullYear();

  const [data, setData] = useState<YearRecap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/recap?year=${year}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load");
        return d;
      })
      .then((d: YearRecap) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [year]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16 text-center"><Loader /></div>;
  if (error) return <div className="mx-auto max-w-4xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!data) return null;

  const ogUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in"}/api/og/recap?year=${year}`;
  const maxEp = Math.max(1, ...data.monthlyEpisodes.map((m) => m.episodes));

  const shareText = `My ${year} in Anime 🎌 I watched ${data.totalAnimeWatched} anime (${data.totalEpisodes} eps, ~${data.hoursWatched}h). ${data.description}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const xLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const years: number[] = [];
  for (let y = new Date().getFullYear(); y >= new Date().getFullYear() - 2; y--) years.push(y);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="rounded-xl px-4 py-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Your Year in Anime</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{year} Recap</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-[var(--color-mute)]">Year</label>
          <select
            value={year}
            onChange={(e) => router.replace(`/recap?year=${e.target.value}`)}
            className="rounded-lg border border-[var(--color-line)] bg-black/20 px-3 py-1.5 text-sm outline-none"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <p className="mb-8 max-w-2xl text-[var(--color-mute)] leading-relaxed">{data.description}</p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 text-center">
          <p className="font-mono text-3xl font-bold text-[var(--color-cyan)]">{data.totalAnimeWatched}</p>
          <p className="mt-1 text-xs text-[var(--color-mute)]">Anime dekhe</p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
          <p className="font-mono text-3xl font-bold text-[var(--color-ink)]">{data.totalEpisodes}</p>
          <p className="mt-1 text-xs text-[var(--color-mute)]">Episodes</p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
          <p className="font-mono text-3xl font-bold text-[var(--color-magenta)]">{formatHours(data.hoursWatched)}h</p>
          <p className="mt-1 text-xs text-[var(--color-mute)]">Time watched</p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
          <p className="font-mono text-3xl font-bold text-amber-400">{data.completions}</p>
          <p className="mt-1 text-xs text-[var(--color-mute)]">Completed</p>
        </div>
      </div>

      {(data.mostWatched.length > 0 || data.favourites.length > 0) && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {data.mostWatched.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h2 className="mb-3 font-display font-bold text-[var(--color-cyan)]">🔥 Most Watched</h2>
              <div className="space-y-3">
                {data.mostWatched.map((m, i) => (
                  <div key={m.mediaId} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--color-mute)]">#{i + 1}</span>
                    <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-black/30" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{m.title}</p>
                      <p className="text-xs text-[var(--color-mute)]">{m.count} episodes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.favourites.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h2 className="mb-3 font-display font-bold text-amber-400">💛 Favourites</h2>
              <div className="space-y-3">
          {data.favourites.map((m) => (
            <div key={m.mediaId} className="flex items-center gap-3">
              <span className="text-amber-400">★{m.count}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.title}</p>
              </div>
            </div>
          ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <h2 className="mb-4 font-display font-bold">📅 Watching rhythm</h2>
        <div className="flex h-32 items-end gap-1.5">
          {data.monthlyEpisodes.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-[var(--color-mute)]">{m.episodes > 0 ? m.episodes : ""}</span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-[var(--color-cyan)]/40 to-[var(--color-cyan)]"
                style={{ height: `${Math.max(4, (m.episodes / maxEp) * 100)}%` }}
              />
              <span className="text-[10px] text-[var(--color-mute)]">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-5">
        <h2 className="mb-3 font-display font-bold">Share your recap</h2>
        <div className="flex flex-wrap gap-3">
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-[var(--color-magenta)] px-5 py-2 text-sm font-bold text-black hover:opacity-90">
            WhatsApp
          </a>
          <a href={xLink} target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white border border-[var(--color-line)]">
            X / Twitter
          </a>
          <button
            onClick={() => { navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="rounded-full neon-rgb-border px-5 py-2 text-sm font-semibold">
            {copied ? "Copied ✅" : "Copy text"}
          </button>
        </div>
        <div className="relative mt-4 aspect-[1200/630] w-full overflow-hidden rounded-xl border border-[var(--color-line)]">
          <Image src={ogUrl} alt="Recap card" fill unoptimized className="object-cover" sizes="(max-width: 896px) 100vw, 896px" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
}
