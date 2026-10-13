"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { CardSkeleton } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import MangaSearch from "@/components/MangaSearch";
import {
  MANGA_TYPE_OPTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  getMediaTypeColor,
  getMediaTypeLabel,
  type MangaTypeKey,
} from "@/lib/manga";
import { logError } from "@/lib/logger";

/* ----------------------------------------------------------------- types */

interface MangaListEntry {
  id: string;
  mediaId: number;
  title: string;
  coverImage: string | null;
  subType: string;
  status: string;
  chapters: number;
  volumes: number;
  totalChapters: number | null;
  totalVolumes: number | null;
  score: number | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

interface ContinueItem {
  chapter: number;
  entry: {
    mediaId: number;
    title: string;
    coverImage: string | null;
    subType: string | null;
    chapters?: number;
    totalChapters?: number | null;
  } | null;
}

/* ------------------------------------------------------------- constants */

const LIST_TABS = [
  "ALL",
  "READING",
  "PLANNING",
  "COMPLETED",
  "PAUSED",
  "DROPPED",
  "REREADING",
] as const;
type ListTab = (typeof LIST_TABS)[number];

const SORT_OPTIONS = [
  { key: "updated", label: "Recently updated" },
  { key: "title", label: "Title A–Z" },
  { key: "score", label: "Top rated" },
  { key: "chapters", label: "Most read" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

const LIST_STATUS_ACCENT: Record<string, string> = {
  READING: "var(--color-cyan)",
  COMPLETED: "#4ade80",
  PLANNING: "var(--color-violet)",
  PAUSED: "var(--color-amber)",
  DROPPED: "#f87171",
  REREADING: "var(--color-magenta)",
};

const GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
const RAIL_CLASS = "board-scroll flex gap-3";
const PER_PAGE = 24;
const MAX_EXPORT_PAGES = 40;
const VIEW_KEY = "zyniverse_mangalist_view";

type ViewMode = "grid" | "carousel";

/* --------------------------------------------------------------- helpers */

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-24 -top-28 h-64 w-64 rounded-full bg-[var(--color-cyan)]/25 blur-3xl" />
      <div className="absolute -right-20 -top-10 h-60 w-60 rounded-full bg-[var(--color-violet)]/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[var(--color-magenta)]/20 blur-3xl" />
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 120, damping: 22 });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  useMotionValueEvent(spring, "change", (v) =>
    setDisplay(Math.round(v as number)),
  );
  return <>{display}</>;
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-4 py-2.5 backdrop-blur-sm">
      <div className="font-mono text-lg font-bold" style={{ color: accent }}>
        <AnimatedNumber value={value} />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
        {label}
      </p>
    </div>
  );
}

function TypeChips({
  value,
  onChange,
}: {
  value: MangaTypeKey;
  onChange: (v: MangaTypeKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {MANGA_TYPE_OPTIONS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            aria-pressed={active}
            style={
              active
                ? {
                    background:
                      t.key === "ALL"
                        ? "var(--color-violet)"
                        : getMediaTypeColor(t.key),
                  }
                : undefined
            }
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              active
                ? "text-black"
                : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Sort your list</span>
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-2.5 text-[var(--color-mute)]"
      >
        <path d="M3 6h18M6 12h12M10 18h4" />
      </svg>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="appearance-none rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] py-1.5 pl-8 pr-7 text-xs text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-violet)]"
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s.key} value={s.key} className="bg-[var(--color-panel)]">
            {s.label}
          </option>
        ))}
      </select>
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute right-2.5 text-[var(--color-mute)]"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}

function ListSearch({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-mute)]"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search my list…"
        aria-label="Search your manga list"
        className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] py-1.5 pl-8 pr-7 text-xs text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-mute)]/60 focus:border-[var(--color-violet)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const base =
    "flex h-7 w-7 items-center justify-center rounded-md transition-all";
  return (
    <div className="flex gap-0.5 rounded-lg border border-[var(--color-line)] p-0.5">
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        className={`${base} ${
          view === "grid"
            ? "bg-[var(--color-violet)] text-black"
            : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("carousel")}
        aria-label="Carousel view"
        aria-pressed={view === "carousel"}
        className={`${base} ${
          view === "carousel"
            ? "bg-[var(--color-violet)] text-black"
            : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 4v16M17 4v16" />
        </svg>
      </button>
    </div>
  );
}

function LoadMore({
  hasMore,
  loading,
  onClick,
}: {
  hasMore: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  if (!hasMore) return null;
  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] transition-all hover:border-[var(--color-violet)] hover:text-[var(--color-violet)] disabled:opacity-50"
      >
        {loading ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  body,
  cta,
  secondary,
}: {
  emoji: string;
  title: string;
  body: string;
  cta?: { href: string; label: string };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-16 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)] text-3xl">
        {emoji}
      </div>
      <h2 className="mt-5 font-display text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-mute)]">
        {body}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {cta && (
          <Link
            href={cta.href}
            className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-semibold text-black"
          >
            {cta.label}
          </Link>
        )}
        {secondary && (
          <button
            type="button"
            onClick={secondary.onClick}
            className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-violet)] hover:text-[var(--color-violet)]"
          >
            {secondary.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ card */

function ShelfCard({
  entry,
  index,
  reduce,
  onIncrement,
  onStatus,
  onRemove,
}: {
  entry: MangaListEntry;
  index: number;
  reduce: boolean;
  onIncrement: (e: MangaListEntry) => void;
  onStatus: (e: MangaListEntry, status: string) => void;
  onRemove: (e: MangaListEntry) => void;
}) {
  const total = entry.totalChapters ?? 0;
  const pct =
    total > 0 ? Math.min(100, Math.round((entry.chapters / total) * 100)) : 0;
  const complete = total > 0 && entry.chapters >= total;
  const subType = entry.subType || "manga";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: reduce ? 0 : Math.min(index, 12) * 0.03,
      }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 transition-colors hover:border-[var(--color-violet)]/50"
    >
      <Link
        href={`/manga/${entry.mediaId}`}
        className="relative block aspect-[2/3] overflow-hidden"
      >
        {entry.coverImage ? (
          <Image
            src={entry.coverImage}
            alt={entry.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] text-3xl opacity-50">
            📖
          </div>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <span
          className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-black"
          style={{
            backgroundColor: STATUS_COLORS[entry.status] || "var(--color-mute)",
          }}
        >
          {STATUS_LABELS[entry.status] || entry.status}
        </span>
        {entry.score ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--color-violet)]">
            ★ {entry.score}/10
          </span>
        ) : null}
        {subType !== "manga" && (
          <span
            className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase text-black"
            style={{ backgroundColor: getMediaTypeColor(subType) }}
          >
            {getMediaTypeLabel(subType)}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-3">
        <Link
          href={`/manga/${entry.mediaId}`}
          className="line-clamp-2 text-sm font-semibold text-white transition-colors hover:text-[var(--color-violet)]"
        >
          {entry.title}
        </Link>

        <div className="mt-auto pt-2">
          <div className="mb-1 flex items-center justify-between font-mono text-[11px] text-[var(--color-mute)]">
            <span>
              {entry.chapters}
              {total ? ` / ${total}` : ""} ch
            </span>
            {total ? (
              <span className={complete ? "text-[#4ade80]" : ""}>
                {complete ? "Done" : `${pct}%`}
              </span>
            ) : (
              <span>not counted</span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                background: complete ? "#4ade80" : "var(--color-violet)",
              }}
            />
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onIncrement(entry)}
              disabled={complete}
              className="flex-1 rounded-lg border border-[var(--color-line)] px-2 py-1 text-[11px] font-medium transition-colors hover:border-[var(--color-violet)] hover:text-[var(--color-violet)] disabled:opacity-40"
            >
              +1 Chapter
            </button>
            <button
              type="button"
              onClick={() => onRemove(entry)}
              aria-label={`Remove ${entry.title}`}
              className="rounded-lg border border-[var(--color-line)] px-2 py-1 text-[11px] text-[var(--color-mute)] transition-colors hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)]"
            >
              Remove
            </button>
          </div>

          <label className="mt-2 block">
            <span className="sr-only">Status for {entry.title}</span>
            <select
              value={entry.status}
              onChange={(e) => onStatus(entry, e.target.value)}
              className="w-full appearance-none rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-1.5 text-[11px] font-semibold text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-violet)]"
            >
              {LIST_TABS.filter((s) => s !== "ALL").map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ view */

function ShelfView({
  entries,
  loading,
  error,
  shelfTotal,
  hasMore,
  query,
  view,
  reduce,
  onLoadMore,
  onIncrement,
  onStatus,
  onRemove,
  onClearQuery,
  onShowAll,
  onRetry,
}: {
  entries: MangaListEntry[];
  loading: boolean;
  error: string | null;
  shelfTotal: number;
  hasMore: boolean;
  query: string;
  view: ViewMode;
  reduce: boolean;
  onLoadMore: () => void;
  onIncrement: (e: MangaListEntry) => void;
  onStatus: (e: MangaListEntry, status: string) => void;
  onRemove: (e: MangaListEntry) => void;
  onClearQuery: () => void;
  onShowAll: () => void;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <EmptyState
        emoji="⚠️"
        title="Couldn't load your list"
        body={error}
        secondary={{ label: "Try again", onClick: onRetry }}
      />
    );
  }

  const firstLoad = loading && entries.length === 0;
  if (firstLoad) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={`s${i}`} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    if (query.trim()) {
      return (
        <EmptyState
          emoji="🔍"
          title={`No matches for “${query.trim()}”`}
          body="Nothing in your list matches that search."
          secondary={{ label: "Clear search", onClick: onClearQuery }}
        />
      );
    }
    if (shelfTotal === 0) {
      return (
        <EmptyState
          emoji="📚"
          title="Your manga shelf is empty"
          body="Search above and add a title to Reading or Plan to Read to start tracking chapters, volumes and scores."
          cta={{ href: "/manga", label: "Discover manga" }}
        />
      );
    }
    return (
      <EmptyState
        emoji="🗂️"
        title="Nothing in this view"
        body="No titles match the current status or type filters."
        secondary={{ label: "Show all", onClick: onShowAll }}
      />
    );
  }

  return (
    <>
      <motion.div
        key={view}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={view === "grid" ? GRID_CLASS : RAIL_CLASS}
      >
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className={
              view === "carousel" ? "w-40 shrink-0 snap-start" : "h-full"
            }
          >
            <ShelfCard
              entry={entry}
              index={i}
              reduce={reduce}
              onIncrement={onIncrement}
              onStatus={onStatus}
              onRemove={onRemove}
            />
          </div>
        ))}
        {view === "grid" &&
          loading &&
          entries.length > 0 &&
          Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={`a${i}`} />
          ))}
      </motion.div>
      <LoadMore hasMore={hasMore} loading={loading} onClick={onLoadMore} />
    </>
  );
}

/* ------------------------------------------------------------------ main */

export default function MyMangaListClient() {
  const { status: authStatus } = useSession();
  const reduce = useReducedMotion() ?? false;

  const [entries, setEntries] = useState<MangaListEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<ListTab>("ALL");
  const [type, setType] = useState<MangaTypeKey>("ALL");
  const [sort, setSort] = useState<SortKey>("updated");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [overallTotal, setOverallTotal] = useState(0);
  const [history, setHistory] = useState<ContinueItem[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [view, setView] = useState<ViewMode>("grid");
  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);
  const [stickyShow, setStickyShow] = useState(false);
  const [headerH, setHeaderH] = useState(52);

  const toolbarRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => {
    setPage(1);
    setRefresh((n) => n + 1);
  }, []);

  // Restore the saved grid/carousel preference.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "grid" || saved === "carousel") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setView(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const chooseView = (next: ViewMode) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* ignore */
    }
  };

  // Keep the sticky mini-toolbar tucked right under the site header.
  useEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderH(el.offsetHeight || 52));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setStickyShow(el.getBoundingClientRect().top < headerH),
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [headerH, authStatus]);

  // Debounce the in-list search; reset paging with the same tick.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Continue-reading rail (latest chapter per series).
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    fetch("/api/manga/history?limit=30")
      .then((r) => (r.ok ? r.json() : { history: [] }))
      .then((d) => {
        if (!cancelled) setHistory(d.history ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authStatus, refresh]);

  // The list itself — server handles status/type/sort/search + paging, and
  // always returns unfiltered per-status `counts` so the chips stay accurate.
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (tab !== "ALL") params.set("status", tab);
    if (type !== "ALL") params.set("type", type);
    if (sort !== "updated") params.set("sort", sort);
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    params.set("perPage", String(PER_PAGE));
    params.set("page", String(page));

    fetch(`/api/manga/list?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        const batch = (d.entries ?? []) as MangaListEntry[];
        setEntries((prev) => (page === 1 ? batch : [...prev, ...batch]));
        setHasMore(!!d.hasMore);
        setTotal(d.total ?? 0);
        if (d.counts) setCounts(d.counts);
        if (typeof d.overallTotal === "number") setOverallTotal(d.overallTotal);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        logError(e);
        setError("Could not load your manga list. Try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus, tab, type, sort, debouncedQuery, page, refresh]);

  const incrementChapter = async (entry: MangaListEntry) => {
    const next = entry.chapters + 1;
    if (entry.totalChapters && next > entry.totalChapters) return;
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, chapters: next } : e)),
    );
    try {
      const res = await fetch(`/api/manga/list/${entry.mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapters: next }),
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      logError(e);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id ? { ...e, chapters: entry.chapters } : e,
        ),
      );
      setToast("Couldn't save progress — try again.");
      setTimeout(() => setToast(""), 2600);
    }
  };

  const removeEntry = async (entry: MangaListEntry) => {
    const snapshot = entries;
    const snapshotCounts = counts;
    const snapshotTotal = overallTotal;
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    setCounts((prev) => ({
      ...prev,
      [entry.status]: Math.max(0, (prev[entry.status] || 0) - 1),
    }));
    setOverallTotal((t) => Math.max(0, t - 1));
    setTotal((t) => Math.max(0, t - 1));
    try {
      const res = await fetch("/api/manga/list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: entry.mediaId }),
      });
      if (!res.ok) throw new Error();
      setToast(`Removed “${entry.title}”.`);
      setTimeout(() => setToast(""), 2600);
    } catch (e) {
      logError(e);
      setEntries(snapshot);
      setCounts(snapshotCounts);
      setOverallTotal(snapshotTotal);
      setTotal((t) => t + 1);
      setToast("Couldn't remove — try again.");
      setTimeout(() => setToast(""), 2600);
    }
  };

  const changeStatus = async (entry: MangaListEntry, status: string) => {
    if (status === entry.status) return;
    const prevStatus = entry.status;
    const stillVisible = tab === "ALL" || tab === status;
    const snapshot = entries;
    const snapshotCounts = counts;
    const snapshotTotal = total;
    setEntries((prev) =>
      stillVisible
        ? prev.map((e) => (e.id === entry.id ? { ...e, status } : e))
        : prev.filter((e) => e.id !== entry.id),
    );
    setCounts((prev) => ({
      ...prev,
      [prevStatus]: Math.max(0, (prev[prevStatus] || 0) - 1),
      [status]: (prev[status] || 0) + 1,
    }));
    if (!stillVisible) setTotal((t) => Math.max(0, t - 1));
    try {
      const res = await fetch(`/api/manga/list/${entry.mediaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setToast(`Moved to ${STATUS_LABELS[status] || status}.`);
      setTimeout(() => setToast(""), 2600);
    } catch (e) {
      logError(e);
      setEntries(snapshot);
      setCounts(snapshotCounts);
      setTotal(snapshotTotal);
      setToast("Couldn't update status — try again.");
      setTimeout(() => setToast(""), 2600);
    }
  };

  const exportList = async (format: "csv" | "json") => {
    if (exporting) return;
    setExporting(true);
    try {
      const all: MangaListEntry[] = [];
      let p = 1;
      let more = true;
      while (more && p <= MAX_EXPORT_PAGES) {
        const params = new URLSearchParams();
        if (tab !== "ALL") params.set("status", tab);
        if (type !== "ALL") params.set("type", type);
        if (sort !== "updated") params.set("sort", sort);
        if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
        params.set("perPage", "48");
        params.set("page", String(p));
        const res = await fetch(`/api/manga/list?${params.toString()}`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        all.push(...((d.entries ?? []) as MangaListEntry[]));
        more = !!d.hasMore;
        p += 1;
      }
      if (all.length === 0) {
        setToast("Nothing to export yet.");
        setTimeout(() => setToast(""), 2600);
        return;
      }

      let blob: Blob;
      let filename: string;
      if (format === "json") {
        blob = new Blob([JSON.stringify(all, null, 2)], {
          type: "application/json",
        });
        filename = "zyniverse-manga-list.json";
      } else {
        const header = [
          "Title",
          "Status",
          "Type",
          "Chapters",
          "Total chapters",
          "Volumes",
          "Total volumes",
          "Score",
          "Updated",
        ];
        const rows = all.map((e) => [
          e.title,
          STATUS_LABELS[e.status] || e.status,
          getMediaTypeLabel(e.subType || "manga"),
          e.chapters,
          e.totalChapters ?? "",
          e.volumes,
          e.totalVolumes ?? "",
          e.score ?? "",
          e.updatedAt ?? "",
        ]);
        const csv = [header, ...rows]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n");
        blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        filename = "zyniverse-manga-list.csv";
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToast(`Exported ${all.length} title${all.length === 1 ? "" : "s"}.`);
      setTimeout(() => setToast(""), 2600);
    } catch (e) {
      logError(e);
      setToast("Export failed — try again.");
      setTimeout(() => setToast(""), 2600);
    } finally {
      setExporting(false);
    }
  };

  const continueItems = useMemo(() => {
    const seen = new Set<number>();
    const out: ContinueItem[] = [];
    for (const h of history) {
      if (!h.entry || seen.has(h.entry.mediaId)) continue;
      seen.add(h.entry.mediaId);
      out.push(h);
      if (out.length >= 8) break;
    }
    return out;
  }, [history]);

  const stats = [
    { label: "Saved", value: overallTotal, accent: "var(--color-ink)" },
    { label: "Reading", value: counts.READING || 0, accent: "var(--color-cyan)" },
    { label: "Completed", value: counts.COMPLETED || 0, accent: "#4ade80" },
    { label: "Planned", value: counts.PLANNING || 0, accent: "var(--color-violet)" },
  ];

  const authenticated = authStatus === "authenticated";

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-6 sm:p-8">
          <Aurora />
          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-cyan)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_var(--color-cyan)]" />
                My Library
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                My Manga List
              </h1>
              <p className="mt-3 max-w-xl text-sm text-[var(--color-mute)]">
                Every manga, light novel, manhwa and manhua you follow — in one
                synced shelf. Track chapters read, volumes, status and your
                personal score without ever losing your place.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-[var(--color-mute)]">
                {[
                  "📖 Chapter progress",
                  "⭐ Personal scores",
                  "☁️ Synced devices",
                ].map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/40 px-3 py-1"
                  >
                    {f}
                  </span>
                ))}
              </div>
              {overallTotal > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {stats.map((s) => (
                    <Stat
                      key={s.label}
                      label={s.label}
                      value={s.value}
                      accent={s.accent}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="w-full">
              {authenticated ? (
                <>
                  <MangaSearch
                    onAdd={() => {
                      setTab("READING");
                      reload();
                    }}
                  />
                  <p className="mt-2 text-[11px] text-[var(--color-mute)]">
                    Search 1000+ series and add them to{" "}
                    <span className="text-[var(--color-ink)]">Reading</span> or{" "}
                    <span className="text-[var(--color-ink)]">
                      Plan to Read
                    </span>
                    .
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)]/40 p-5 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    Sign in to build your library
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-mute)]">
                    Progress, scores and shelves stay in sync on every device.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/login?next=%2Fmanga-list"
                      className="rounded-full bg-[var(--color-magenta)] px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/manga"
                      className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] transition-colors hover:border-[var(--color-violet)] hover:text-[var(--color-violet)]"
                    >
                      Browse manga
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Continue reading */}
        {authenticated && continueItems.length > 0 && (
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_var(--color-cyan)]" />
                Continue Reading
              </p>
              <span className="text-[10px] font-mono text-[var(--color-mute)]">
                {continueItems.length}
              </span>
            </div>
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--color-void)] to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--color-void)] to-transparent"
              />
              <div className={RAIL_CLASS}>
                {continueItems.map((h) => {
                  const e = h.entry!;
                  const t = e.totalChapters ?? 0;
                  const read = Math.max(h.chapter, e.chapters ?? 0);
                  const pct =
                    t > 0 ? Math.min(100, Math.round((read / t) * 100)) : 0;
                  return (
                    <Link
                      key={e.mediaId}
                      href={`/manga/${e.mediaId}`}
                      className="group relative w-32 shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all hover:border-[var(--color-violet)]/60"
                    >
                      <div className="relative aspect-[2/3] w-full">
                        {e.coverImage ? (
                          <Image
                            src={e.coverImage}
                            alt={e.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            sizes="128px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] text-3xl opacity-50">
                            📖
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-2">
                          <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-white drop-shadow-lg">
                            {e.title}
                          </p>
                        </div>
                      </div>
                      {t > 0 && (
                        <div className="h-1 w-full bg-[var(--color-line)]">
                          <div
                            className="h-full rounded-r-full bg-[var(--color-cyan)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between px-2 py-1.5 text-[9px] font-mono text-[var(--color-mute)]">
                        <span>
                          Ch. {read}
                          {t ? `/${t}` : ""}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[var(--color-cyan)] transition-transform group-hover:translate-x-0.5">
                          Resume →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {authenticated && (
          <div
            ref={toolbarRef}
            className="mt-8 space-y-3 border-b border-[var(--color-line)] pb-3"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {LIST_TABS.map((s) => {
                const active = tab === s;
                const n = s === "ALL" ? overallTotal : counts[s] || 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setTab(s);
                      setPage(1);
                    }}
                    aria-pressed={active}
                    style={
                      active
                        ? {
                            background:
                              s === "ALL"
                                ? "var(--color-violet)"
                                : LIST_STATUS_ACCENT[s] || "var(--color-violet)",
                          }
                        : undefined
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "text-black"
                        : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)]"
                    }`}
                  >
                    {s === "ALL" ? "All" : STATUS_LABELS[s] || s}
                    <span className="ml-1.5 font-mono text-[10px] opacity-70">
                      {n}
                    </span>
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-2">
                <ListSearch
                  value={query}
                  onChange={setQuery}
                  className="w-44"
                />
                <ViewToggle view={view} onChange={chooseView} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <TypeChips
                value={type}
                onChange={(t) => {
                  setType(t);
                  setPage(1);
                }}
              />
              <div className="ml-auto flex items-center gap-2">
                <SortSelect
                  value={sort}
                  onChange={(s) => {
                    setSort(s);
                    setPage(1);
                  }}
                />
                <div className="flex items-center gap-0.5 rounded-full border border-[var(--color-line)] p-0.5">
                  <button
                    type="button"
                    onClick={() => exportList("csv")}
                    disabled={exporting}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-40"
                  >
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => exportList("json")}
                    disabled={exporting}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-40"
                  >
                    JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {authStatus === "loading" ? (
            <div className={GRID_CLASS}>
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={`l${i}`} />
              ))}
            </div>
          ) : !authenticated ? (
            <EmptyState
              emoji="🔒"
              title="Sign in to track manga"
              body="Your reading list and progress are saved to your account and synced across every device."
              cta={{ href: "/login?next=%2Fmanga-list", label: "Sign in" }}
            />
          ) : (
            <ShelfView
              entries={entries}
              loading={loading}
              error={error}
              shelfTotal={overallTotal}
              hasMore={hasMore}
              query={debouncedQuery}
              view={view}
              reduce={reduce}
              onLoadMore={() => setPage((p) => p + 1)}
              onIncrement={incrementChapter}
              onStatus={changeStatus}
              onRemove={removeEntry}
              onClearQuery={() => setQuery("")}
              onShowAll={() => {
                setTab("ALL");
                setType("ALL");
                setPage(1);
              }}
              onRetry={reload}
            />
          )}
        </div>

        {/* Sticky mini-toolbar */}
        <AnimatePresence>
          {authenticated && stickyShow && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ top: headerH }}
              className="fixed inset-x-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-md"
            >
              <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:px-6">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                  My Manga List
                </span>
                <ListSearch
                  value={query}
                  onChange={setQuery}
                  className="min-w-0 flex-1"
                />
                <ViewToggle view={view} onChange={chooseView} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center md:bottom-8"
          >
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm shadow-2xl backdrop-blur">
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
