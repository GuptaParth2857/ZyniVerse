"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader, { ErrorState } from "@/components/Loader";
import { useState, useEffect, useMemo } from "react";

interface SharedMedia {
  mediaId: number;
  title: string;
  image: string | null;
  color: string | null;
  genres: string[];
  format: string | null;
  status: string | null;
  episodes: number | null;
  myScore: number | null;
  theirScore: number | null;
  diff: number | null;
}

interface CompareData {
  user: { id: string; username: string; avatar: string | null };
  stats: {
    myTotal: number; theirTotal: number; shared: number;
    onlyMe: number; onlyThem: number; compatibility: number; genresInCommon: number;
  };
  insights: {
    whoRatesHigher: string | null;
    topGenres: { genre: string; count: number }[];
    highestShared: { title: string; myScore: number; theirScore: number } | null;
    lowestShared: { title: string; myScore: number; theirScore: number } | null;
    mostDivided: { title: string; diff: number } | null;
    averageDiff: number | null;
  };
  sharedMedia: SharedMedia[];
}

type SortKey = "diff" | "myScore" | "theirScore" | "title";
type FilterKey = "all" | "scored" | "mine" | "theirs";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "diff", label: "Most divided" },
  { key: "myScore", label: "My score" },
  { key: "theirScore", label: "Their score" },
  { key: "title", label: "Title" },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scored", label: "Both scored" },
  { key: "mine", label: "I rate higher" },
  { key: "theirs", label: "They rate higher" },
];

function scoreColor(s: number | null): string {
  if (!s) return "var(--color-mute)";
  return s >= 70 ? "var(--color-cyan)" : s >= 40 ? "#eab308" : "var(--color-magenta)";
}

function compatColor(v: number): string {
  return v >= 70 ? "var(--color-cyan)" : v >= 40 ? "#eab308" : "var(--color-magenta)";
}

function Avatar({ src, name, fallbackColor }: { src?: string | null; name: string; fallbackColor: string }) {
  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--color-line)] sm:h-20 sm:w-20">
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="80px" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg font-bold sm:text-xl" style={{ color: fallbackColor, background: `${fallbackColor}1f` }}>
          {name[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default function ListComparison({ username }: { username: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState("");
  const [sort, setSort] = useState<SortKey>("diff");
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setData(null);
      setError(null);
      try {
        const r = await fetch(`/api/compare/${encodeURIComponent(username)}`);
        if (cancelled) return;
        if (r.status === 401) throw new Error("Your session expired. Sign in again to compare.");
        if (r.status === 404) throw new Error("User not found.");
        if (!r.ok) throw new Error("Comparison failed. Try again.");
        const d = await r.json();
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Comparison failed. Try again.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const recompare = (e: React.FormEvent) => {
    e.preventDefault();
    const u = newUser.trim().replace(/^@/, "");
    if (!u) return;
    router.push(`/compare/${encodeURIComponent(u)}`);
  };

  const visible = useMemo(() => {
    let list = data?.sharedMedia || [];
    if (filter === "scored") list = list.filter((m) => m.myScore && m.theirScore);
    else if (filter === "mine") list = list.filter((m) => m.myScore && m.theirScore && m.myScore > m.theirScore);
    else if (filter === "theirs") list = list.filter((m) => m.myScore && m.theirScore && m.theirScore > m.myScore);
    const sorted = [...list];
    if (sort === "diff") sorted.sort((a, b) => (b.diff ?? -1) - (a.diff ?? -1));
    else if (sort === "myScore") sorted.sort((a, b) => (b.myScore ?? -1) - (a.myScore ?? -1));
    else if (sort === "theirScore") sorted.sort((a, b) => (b.theirScore ?? -1) - (a.theirScore ?? -1));
    else sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [data, sort, filter]);

  if (loading) return <Loader label="Comparing lists..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data || !data.user) return null;

  const { stats, user: other, insights } = data;
  const compat = compatColor(stats.compatibility);

  /* Empty states */
  if (stats.theirTotal === 0) {
    return (
      <div className="space-y-6">
        <EmptyPrompt
          emoji="🫥"
          title={`@${other.username} hasn't added any anime yet`}
          desc="Their list is empty right now — no comparison possible yet. Come back once they start tracking!"
        />
        <RecompareBar value={newUser} onChange={setNewUser} onSubmit={recompare} />
      </div>
    );
  }
  if (stats.shared === 0) {
    return (
      <div className="space-y-6">
        <EmptyPrompt
          emoji="🎲"
          title="No anime in common yet"
          desc={`You and @${other.username} haven't added any of the same anime. Different tastes — or you just haven't compared the right lists.`}
        />
        <RecompareBar value={newUser} onChange={setNewUser} onSubmit={recompare} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Compatibility header */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-black/25 p-6 text-center">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center gap-2">
            <Avatar src={session?.user?.image} name={session?.user?.name || "You"} fallbackColor="var(--color-magenta)" />
            <p className="max-w-[90px] truncate text-xs font-semibold">{session?.user?.name || "You"}</p>
          </div>
          <div>
            <div className="font-mono text-4xl font-bold sm:text-5xl" style={{ color: compat, textShadow: `0 0 24px ${compat}55` }}>{stats.compatibility}%</div>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Compatibility</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Link href={`/u/${encodeURIComponent(other.username)}`} className="transition-transform hover:scale-105">
              <Avatar src={other.avatar} name={other.username} fallbackColor="var(--color-cyan)" />
            </Link>
            <Link href={`/u/${encodeURIComponent(other.username)}`} className="max-w-[90px] truncate text-xs font-semibold text-[var(--color-cyan)] hover:underline">{other.username}</Link>
          </div>
        </div>
        {insights.whoRatesHigher && (
          <p className="mt-4 text-xs text-[var(--color-mute)]">
            <span className="text-[var(--color-cyan)]">✦</span> {insights.whoRatesHigher}
            {insights.averageDiff !== null && <span className="ml-1 text-[var(--color-mute)]">· avg diff {insights.averageDiff} pts</span>}
          </p>
        )}
      </div>

      {/* Taste insights */}
      {insights.topGenres.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-line)] bg-black/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Top shared genres</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {insights.topGenres.map((g) => (
                <span key={g.genre} className="rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] text-[var(--color-cyan)]">
                  {g.genre} <span className="font-mono opacity-70">{g.count}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-black/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">You both love</p>
            {insights.highestShared ? (
              <p className="mt-2 text-xs text-[var(--color-ink)]">{insights.highestShared.title}</p>
            ) : (
              <p className="mt-2 text-xs text-[var(--color-mute)]">—</p>
            )}
            <p className="mt-1 font-mono text-[10px]">
              <span style={{ color: scoreColor(insights.highestShared?.myScore ?? null) }}>{insights.highestShared?.myScore ?? "—"}</span>
              <span className="text-[var(--color-mute)]"> vs </span>
              <span style={{ color: scoreColor(insights.highestShared?.theirScore ?? null) }}>{insights.highestShared?.theirScore ?? "—"}</span>
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-black/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Biggest fight</p>
            {insights.mostDivided ? (
              <p className="mt-2 text-xs text-[var(--color-ink)]">{insights.mostDivided.title}</p>
            ) : (
              <p className="mt-2 text-xs text-[var(--color-mute)]">—</p>
            )}
            {insights.mostDivided && (
              <p className="mt-1 font-mono text-[10px] text-[var(--color-magenta)]">{insights.mostDivided.diff} pts apart</p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatBox label="Your Anime" value={stats.myTotal} />
        <StatBox label="Their Anime" value={stats.theirTotal} />
        <StatBox label="Shared" value={stats.shared} color="var(--color-cyan)" />
        <StatBox label="Only You" value={stats.onlyMe} />
        <StatBox label="Only Them" value={stats.onlyThem} />
      </div>

      {/* Shared media */}
      {data.sharedMedia.length > 0 && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-sm font-bold">Shared Anime ({data.sharedMedia.length})</h3>
            <div className="ml-auto flex flex-wrap gap-1.5">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                    sort === s.key
                      ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                      : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                  filter === f.key
                    ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/10 text-[var(--color-magenta)]"
                    : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]/40 hover:text-[var(--color-magenta)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--color-line)] bg-black/20 p-6 text-center text-xs text-[var(--color-mute)]">
              No anime match this filter.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visible.map((m) => {
                const myWins = m.myScore && m.theirScore && m.myScore > m.theirScore;
                const theirWins = m.myScore && m.theirScore && m.theirScore > m.myScore;
                return (
                  <Link key={m.mediaId} href={`/anime/${m.mediaId}`} className="group block">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--color-panel)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(41,242,224,0.15)] group-hover:ring-1 group-hover:ring-[var(--color-cyan)]/40">
                      {m.image ? (
                        <Image src={m.image} alt={m.title} fill loading="lazy" className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-[var(--color-mute)]">No Image</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      {(m.myScore || m.theirScore) && (
                        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 font-mono text-[10px] font-bold backdrop-blur-sm" style={{ color: myWins ? "var(--color-cyan)" : theirWins ? "var(--color-magenta)" : "var(--color-mute)", boxShadow: myWins ? "0 0 10px rgba(41,242,224,0.25)" : theirWins ? "0 0 10px rgba(255,45,120,0.25)" : "none" }}>
                          {m.diff != null ? `±${m.diff}` : "—"}
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-2.5">
                        <h3 className="line-clamp-2 font-display text-xs font-semibold leading-tight text-white drop-shadow-lg">{m.title}</h3>
                        <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px]">
                          <span className="rounded-md bg-black/60 px-1.5 py-0.5" style={{ color: scoreColor(m.myScore) }}>{m.myScore ?? "—"}</span>
                          <span className="text-[var(--color-mute)]">vs</span>
                          <span className="rounded-md bg-black/60 px-1.5 py-0.5" style={{ color: scoreColor(m.theirScore) }}>{m.theirScore ?? "—"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      <RecompareBar value={newUser} onChange={setNewUser} onSubmit={recompare} />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-3 text-center">
      <div className="text-xl font-bold font-mono" style={{ color: color || "var(--color-ink)" }}>{value}</div>
      <div className="text-[9px] text-[var(--color-mute)] mt-0.5">{label}</div>
    </div>
  );
}

function EmptyPrompt({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-black/25 p-10 text-center">
      <p className="text-4xl">{emoji}</p>
      <p className="mt-4 font-display text-lg font-bold text-[var(--color-ink)]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[var(--color-mute)]">{desc}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href="/friends" className="rounded-full border border-[var(--color-cyan)]/50 px-5 py-2 text-xs font-bold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/10">Find Friends</Link>
        <Link href="/top-anime" className="rounded-full border border-[var(--color-line)] px-5 py-2 text-xs font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)]">Top Anime</Link>
      </div>
    </div>
  );
}

function RecompareBar({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Compare with someone else…"
        className="neon-rgb-border flex-1 rounded-xl bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none"
      />
      <button type="submit" className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[#29f2e0]/80 px-5 py-2.5 text-sm font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(41,242,224,0.35)]">
        Compare →
      </button>
    </form>
  );
}
