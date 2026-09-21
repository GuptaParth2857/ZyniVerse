"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export type DubListItem = {
  slug: string;
  name: string;
  tagline: string;
  genres: string[];
  platforms: string[];
  languages: string[];
  status: "Airing" | "Completed" | "Upcoming" | "On Hiatus";
  episodeCount: string;
  schedule: string;
  poster: string | null;
  color: string | null;
  score: number | null;
};

const LANG_COLORS: Record<string, string> = {
  Hindi: "bg-[#ff9933]/20 text-[#ffb366]",
  Tamil: "bg-[#4fa3ff]/20 text-[#8ec5ff]",
  Telugu: "bg-[#2fbf71]/20 text-[#6ee0a4]",
};

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  Airing: { label: "Airing", cls: "bg-cyan-500/20 text-cyan-300", dot: "bg-[var(--color-cyan)]" },
  Completed: { label: "Complete", cls: "bg-white/10 text-white/70", dot: "bg-white/40" },
  Upcoming: { label: "Coming Soon", cls: "bg-amber-500/20 text-amber-300", dot: "bg-amber-400" },
  "On Hiatus": { label: "On Hiatus", cls: "bg-orange-500/20 text-orange-300", dot: "bg-orange-400" },
};

type LangFilter = "All" | "Hindi" | "Tamil" | "Telugu";
type StatusFilter = "All" | "Airing" | "Completed" | "Upcoming" | "On Hiatus";
type SortKey = "name" | "episodes" | "score";

function PosterFallback({ name, color }: { name: string; color: string | null }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: color
          ? `linear-gradient(160deg, ${color}30, #0a0a0f 85%)`
          : "linear-gradient(160deg, rgba(139,92,246,0.35), rgba(255,45,120,0.2) 60%, #0a0a0f 90%)",
      }}
    >
      <span className="font-display text-5xl font-black text-white/25">{name.charAt(0)}</span>
    </div>
  );
}

function DubCard({ item }: { item: DubListItem }) {
  const status = STATUS_META[item.status];
  return (
    <Link href={`/indian-dubs/${item.slug}`} className="group flex h-full flex-col">
      <div className="dub-poster-card aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-[var(--color-panel)]">
        {item.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.poster}
            alt={`${item.name} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <PosterFallback name={item.name} color={item.color} />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md ${status.cls}`}>
            <span className={`h-1 w-1 rounded-full ${status.dot} ${item.status === "Airing" ? "animate-pulse" : ""}`} />
            {status.label}
          </span>
        </div>

        {item.score != null && (
          <span className="glass-score absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
            {item.score}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex flex-wrap gap-1">
            {item.languages.map((l) => (
              <span key={l} className={`rounded-full px-2 py-0.5 text-[9px] font-bold backdrop-blur-md ${LANG_COLORS[l] || "bg-white/15 text-white"}`}>
                {l}
              </span>
            ))}
          </div>
          <h3 className="mt-2 font-display text-lg font-bold leading-tight text-white transition-colors group-hover:text-[var(--color-cyan)]">
            {item.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/60">{item.tagline}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1.5 px-0.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-mono text-[var(--color-mute)]">{item.episodeCount}</span>
          <span className="font-bold text-[var(--color-violet)]">{item.platforms.join(" / ")}</span>
        </div>
        <p className="text-[11px] text-[var(--color-mute)]">{item.schedule}</p>
        <p className="mt-auto pt-1 text-xs font-bold text-[var(--color-cyan)] transition-transform group-hover:translate-x-1">
          Full guide →
        </p>
      </div>
    </Link>
  );
}

export default function DubExplorer({ items }: { items: DubListItem[] }) {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<LangFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortKey>("name");

  const langs: LangFilter[] = ["All", "Hindi", "Tamil", "Telugu"];
  const statuses: StatusFilter[] = ["All", "Airing", "Completed", "On Hiatus", "Upcoming"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((it) => {
      if (lang !== "All" && !it.languages.includes(lang)) return false;
      if (status !== "All" && it.status !== status) return false;
      if (q && !`${it.name} ${it.tagline} ${it.genres.join(" ")} ${it.platforms.join(" ")}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "episodes") return epNum(b.episodeCount) - epNum(a.episodeCount);
      return (b.score ?? 0) - (a.score ?? 0);
    });
    return list;
  }, [items, query, lang, status, sort]);

  function epNum(t: string): number {
    const m = t.match(/\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : 0;
  }

  return (
    <section id="explore" className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="console-label">Dub Directory</p>
          <h2 className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">
            Every Indian Dub, One Place
          </h2>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs text-[var(--color-mute)]">
          <span className="text-[var(--color-cyan)]">{filtered.length}</span>
          <span>/ {items.length} series</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 space-y-3">
        <div className="rgb-border flex items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search one piece, doraemon, solo leveling…"
            className="glass-input w-full px-4 py-3 text-sm"
            aria-label="Search dubs"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  lang === l
                    ? "bg-[var(--color-cyan)] text-black"
                    : "border border-white/10 bg-white/[0.04] text-[var(--color-mute)] hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  status === s
                    ? "bg-[var(--color-magenta)] text-white"
                    : "border border-white/10 bg-white/[0.04] text-[var(--color-mute)] hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-2 text-[11px] text-[var(--color-mute)]">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="glass-input rounded-lg px-2 py-1.5 text-xs text-white"
            >
              <option value="name">A → Z</option>
              <option value="episodes">Most episodes</option>
              <option value="score">Top rated</option>
            </select>
          </label>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="font-display text-lg font-bold text-white">No dubs match those filters</p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">Try clearing the search or switching filters.</p>
        </div>
      ) : (
        <motion.div layout className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                layout
                key={item.slug}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <DubCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}