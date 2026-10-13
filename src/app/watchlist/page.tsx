"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import {
  useWatchlist,
  LIST_STATUSES,
  LIST_STATUS_LABELS,
  type ListStatus,
  type WatchlistItem,
} from "@/components/WatchlistProvider";
import WatchlistItemCard from "@/components/WatchlistItemCard";
import { DynamicWatchlistCarousel3D as WatchlistCarousel3D } from "@/components/lazy";
import { PageTransition } from "@/components/PageTransition";
import ListImportExport from "@/components/ListImportExport";
import NativeBannerAd from "@/components/NativeBannerAd";

const STATUS_OPTIONS: { label: string; value: ListStatus }[] =
  LIST_STATUSES.map((value) => ({
    value,
    label: LIST_STATUS_LABELS[value],
  }));

const STATUS_ACCENT: Record<string, string> = {
  CURRENT: "var(--color-cyan)",
  COMPLETED: "#4ade80",
  PLANNING: "var(--color-violet)",
  PAUSED: "var(--color-amber)",
  DROPPED: "#f87171",
  REWATCHING: "var(--color-magenta)",
};

const STATUS_RANK: Record<string, number> = {
  CURRENT: 0,
  REWATCHING: 1,
  PLANNING: 2,
  PAUSED: 3,
  COMPLETED: 4,
  DROPPED: 5,
};

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* Ambient aurora blobs used behind the hero and empty state. */
function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-24 -top-28 h-64 w-64 rounded-full bg-[var(--color-magenta)]/25 blur-3xl" />
      <div className="absolute -right-20 -top-10 h-60 w-60 rounded-full bg-[var(--color-cyan)]/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[var(--color-violet)]/25 blur-3xl" />
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

function CompletionRing({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="watchlist-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-magenta)" />
            <stop offset="100%" stopColor="var(--color-cyan)" />
          </linearGradient>
        </defs>
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="6"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="url(#watchlist-ring)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * pct) / 100 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold">
          <AnimatedNumber value={pct} />%
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[var(--color-mute)]">
          done
        </span>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  accent: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-transparent text-black"
          : "border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
      }`}
    >
      {active && (
        <motion.span
          layoutId="watchlist-filter-pill"
          className="absolute inset-0 rounded-full"
          style={{ background: accent }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10">
        {children}
        <span className="ml-1.5 font-mono opacity-80">{count}</span>
      </span>
    </button>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
        active
          ? "bg-[var(--color-magenta)] text-black"
          : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function WatchlistSkeleton() {
  return (
    <div className="mt-8" role="status" aria-live="polite">
      <span className="sr-only">Loading your list…</span>
      <div className="flex gap-2 overflow-hidden pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-28 shrink-0 animate-pulse rounded-full bg-white/10"
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50"
          >
            <div className="aspect-[2/3] animate-pulse bg-white/5" />
            <div className="space-y-2 border-t border-white/5 p-3">
              <div className="h-3 w-3/4 rounded bg-white/10" />
              <div className="h-2 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  const {
    items,
    setStatusBulk,
    setProgress,
    getStatus,
    getProgress,
    getScore,
    toggle,
    isLoading,
  } = useWatchlist();
  const { status: authStatus } = useSession();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ListStatus>("COMPLETED");
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");
  const [filter, setFilter] = useState<"ALL" | ListStatus>("ALL");
  const [view, setView] = useState<"carousel" | "grid">("carousel");
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState("");
  const [listQuery, setListQuery] = useState("");
  const [sortBy, setSortBy] = useState<"RECENT" | "TITLE" | "SCORE" | "STATUS">(
    "RECENT",
  );
  const [randomPick, setRandomPick] = useState<WatchlistItem | null>(null);

  // Remember the user's preferred view across visits.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zyniverse_watchlist_view");
      if (saved === "grid" || saved === "carousel") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setView(saved);
      }
    } catch {}
  }, []);

  const chooseView = (next: "carousel" | "grid") => {
    setView(next);
    try {
      localStorage.setItem("zyniverse_watchlist_view", next);
    } catch {}
  };

  // Remove with a short undo window so a misclick is recoverable.
  const [undoItem, setUndoItem] = useState<WatchlistItem | null>(null);
  const undoTimer = useRef<number | null>(null);

  const removeWithUndo = (item: WatchlistItem) => {
    toggle(item);
    setUndoItem(item);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndoItem(null), 6000);
  };

  const undoRemove = () => {
    if (!undoItem) return;
    toggle(undoItem);
    setUndoItem(null);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
  };

  useEffect(
    () => () => {
      if (undoTimer.current) window.clearTimeout(undoTimer.current);
    },
    [],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) {
      const s = getStatus(i.id) || "PLANNING";
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [items, getStatus]);

  const topGenres = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items)
      for (const g of i.genres || []) c[g] = (c[g] || 0) + 1;
    return Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [items]);

  const filteredItems = useMemo(
    () =>
      filter === "ALL"
        ? items
        : items.filter((i) => (getStatus(i.id) || "PLANNING") === filter),
    [items, filter, getStatus],
  );

  // Status filter + in-list search + sort, derived in one pass.
  const visibleItems = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    const base = q
      ? filteredItems.filter((i) =>
          (i.title.english || i.title.romaji || i.title.userPreferred || "")
            .toLowerCase()
            .includes(q),
        )
      : filteredItems;
    const arr = [...base];
    if (sortBy === "TITLE") {
      arr.sort((a, b) =>
        (
          a.title.english ||
          a.title.romaji ||
          a.title.userPreferred ||
          ""
        ).localeCompare(
          b.title.english || b.title.romaji || b.title.userPreferred || "",
        ),
      );
    } else if (sortBy === "SCORE") {
      arr.sort((a, b) => (getScore(b.id) ?? -1) - (getScore(a.id) ?? -1));
    } else if (sortBy === "STATUS") {
      arr.sort(
        (a, b) =>
          (STATUS_RANK[getStatus(a.id) ?? ""] ?? 99) -
            (STATUS_RANK[getStatus(b.id) ?? ""] ?? 99) ||
          (a.title.english || a.title.romaji || "").localeCompare(
            b.title.english || b.title.romaji || "",
          ),
      );
    }
    return arr;
  }, [filteredItems, listQuery, sortBy, getScore, getStatus]);

  // In-progress current titles — the "jump back in" strip under the hero.
  const continueItems = useMemo(
    () =>
      items.filter(
        (i) =>
          getStatus(i.id) === "CURRENT" &&
          getProgress(i.id) > 0 &&
          (i.episodes ?? 0) > 0 &&
          getProgress(i.id) < (i.episodes ?? 0),
      ),
    [items, getStatus, getProgress],
  );

  const handleRandom = () => {
    if (visibleItems.length === 0) return;
    setRandomPick(
      visibleItems[Math.floor(Math.random() * visibleItems.length)],
    );
  };

  const stats = [
    { label: "Saved", value: items.length, accent: "var(--color-ink)" },
    {
      label: "Watching",
      value: counts.CURRENT || 0,
      accent: "var(--color-cyan)",
    },
    { label: "Completed", value: counts.COMPLETED || 0, accent: "#4ade80" },
    {
      label: "Planned",
      value: counts.PLANNING || 0,
      accent: "var(--color-violet)",
    },
  ];

  const changeFilter = (next: "ALL" | ListStatus) => {
    setFilter(next);
    setSelected(new Set());
  };

  const handleShare = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      return;
    }
    if (authStatus !== "authenticated") {
      setShareError("Sign in to share your card.");
      return;
    }
    setSharing(true);
    setShareError("");
    try {
      const res = await fetch("/api/share-list", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const url = `${window.location.origin}/list-share/${data.key}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url).catch(() => {});
    } catch {
      setShareError("Couldn't create share link. Try again.");
    } finally {
      setSharing(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (visibleItems.length > 0 && selected.size === visibleItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visibleItems.map((i) => i.id)));
    }
  };

  const applyBulkStatus = () => {
    if (selected.size === 0) return;
    // One batched request; pass each item's own type so manga stays MANGA.
    const updates = visibleItems
      .filter((item) => selected.has(item.id))
      .map((item) => ({
        mediaId: item.id,
        status: bulkStatus,
        type: item.type,
      }));
    setStatusBulk(updates);
    const count = updates.length;
    setSelected(new Set());
    setBulkMsg(
      `Updated ${count} item${count === 1 ? "" : "s"} to “${LIST_STATUS_LABELS[bulkStatus]}”.`,
    );
    window.setTimeout(() => setBulkMsg(""), 2500);
  };

  // Guests have no server list, so export straight from localStorage instead of
  // hitting /api/watchlist/export (which 401s without an account).
  const exportLocally = (format: "csv" | "json") => {
    const rows = items.map((i) => ({
      media_id: i.id,
      title:
        i.title.english ||
        i.title.romaji ||
        i.title.userPreferred ||
        `Anime #${i.id}`,
      type: i.type || "ANIME",
      status: (getStatus(i.id) || "PLANNING").toLowerCase(),
      episodes_watched: getProgress(i.id),
      total_episodes: i.episodes ?? 0,
      score: getScore(i.id),
      start_date: null,
      finish_date: null,
    }));
    if (format === "json") {
      triggerDownload(
        new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }),
        `zyniverse-watchlist-${Date.now()}.json`,
      );
      return;
    }
    const header =
      "anime_id,title,status,episodes_watched,total_episodes,score,start_date,finish_date";
    const lines = rows.map(
      (r) =>
        `${r.media_id},"${String(r.title).replace(/"/g, '""')}",${r.status},${r.episodes_watched},${r.total_episodes || ""},${r.score ?? ""},,`,
    );
    triggerDownload(
      new Blob([[header, ...lines].join("\n")], { type: "text/csv" }),
      `zyniverse-watchlist-${Date.now()}.csv`,
    );
  };

  const handleExport = async (format: "csv" | "json") => {
    setExporting(true);
    try {
      if (authStatus !== "authenticated") {
        exportLocally(format);
      } else {
        const res = await fetch(`/api/watchlist/export?format=${format}`);
        if (!res.ok) throw new Error("Export failed");
        const blob = await res.blob();
        triggerDownload(blob, `zyniverse-watchlist-${Date.now()}.${format}`);
      }
    } catch {
      alert("Export failed. Please try again.");
    }
    setExporting(false);
  };

  const activeStatuses = LIST_STATUSES.filter((s) => (counts[s] || 0) > 0);

  // While we don't yet know the list (session resolving, or a signed-in user's
  // cloud list still loading) show a skeleton — never the "empty" state, which
  // made the page look broken/blank for a few seconds.
  const showLoading =
    items.length === 0 && (authStatus === "loading" || isLoading);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-6 sm:p-8">
          <Aurora />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-cyan)]">
                Watch Tracker
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                <span className="neon-rgb-border inline-block rounded-xl px-4 py-1.5">
                  My List
                </span>
              </h1>
              <p className="mt-3 max-w-md text-sm text-[var(--color-mute)]">
                Saved items are synced to your account when logged in.
              </p>

              {topGenres.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                    Your vibe
                  </span>
                  {topGenres.map(([g, n]) => (
                    <span
                      key={g}
                      className="glass-badge text-[var(--color-ink)]"
                    >
                      {g} <span className="opacity-50">{n}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <CompletionRing
                  completed={counts.COMPLETED || 0}
                  total={items.length}
                />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="glass-card min-w-[92px] px-4 py-2.5 text-center"
                    >
                      <div className="glass-content">
                        <p
                          className="font-display text-2xl font-bold"
                          style={{ color: s.accent }}
                        >
                          <AnimatedNumber value={s.value} />
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                          {s.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showLoading ? (
          <WatchlistSkeleton />
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative mt-8 overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/40 px-6 py-20 text-center"
          >
            <Aurora />
            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)] text-3xl neon-rgb-border">
                📺
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold">
                Your list is empty
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-mute)]">
                Save anime or manga and they&apos;ll show up here — synced to
                your account when logged in.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/search"
                  className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105"
                >
                  Explore Anime
                </Link>
                <a
                  href="#transfer"
                  className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition-all hover:border-[var(--color-cyan)]"
                >
                  Import from MAL / AniList
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Continue watching — in-progress current titles, jump back in */}
            {continueItems.length > 0 && !showBulkToolbar && (
              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_var(--color-cyan)]" />
                    Continue Watching
                  </p>
                  <span className="text-[10px] font-mono text-[var(--color-mute)]">
                    {continueItems.length}
                  </span>
                </div>
                <div className="board-scroll flex gap-3 overflow-x-auto pb-2">
                  {continueItems.slice(0, 10).map((item) => {
                    const p = getProgress(item.id);
                    const total = item.episodes ?? 0;
                    const pct =
                      total > 0
                        ? Math.min(100, Math.round((p / total) * 100))
                        : 0;
                    const title =
                      item.title.english ||
                      item.title.romaji ||
                      item.title.userPreferred ||
                      `Anime #${item.id}`;
                    const cover =
                      item.coverImage?.large ||
                      item.coverImage?.extraLarge ||
                      "";
                    return (
                      <Link
                        key={item.id}
                        href={`/${item.type === "MANGA" ? "manga" : "anime"}/${item.id}`}
                        className="group relative w-32 shrink-0 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all hover:border-[var(--color-cyan)]/60"
                      >
                        <div className="relative aspect-[2/3] w-full">
                          {cover ? (
                            <Image
                              src={cover}
                              alt={title}
                              fill
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                              sizes="128px"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-2">
                            <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-white drop-shadow-lg">
                              {title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-2 py-1.5 text-[9px] font-mono text-[var(--color-mute)]">
                          <span>
                            EP {p}
                            {total ? `/${total}` : ""}
                          </span>
                          <span className="text-[var(--color-cyan)]">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/10">
                          <div
                            className="h-full bg-[var(--color-cyan)] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status filter tabs */}
            <div className="board-scroll mt-8 flex gap-2 overflow-x-auto pb-1">
              <FilterChip
                active={filter === "ALL"}
                onClick={() => changeFilter("ALL")}
                count={items.length}
                accent="var(--color-ink)"
              >
                All
              </FilterChip>
              {activeStatuses.map((s) => (
                <FilterChip
                  key={s}
                  active={filter === s}
                  onClick={() => changeFilter(s)}
                  count={counts[s] || 0}
                  accent={STATUS_ACCENT[s]}
                >
                  {LIST_STATUS_LABELS[s]}
                </FilterChip>
              ))}
            </div>

            {/* Action bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-2">
              <span className="px-1 text-sm text-[var(--color-mute)]">
                {visibleItems.length} item{visibleItems.length === 1 ? "" : "s"}
              </span>

              <div className="flex gap-0.5 rounded-lg border border-[var(--color-line)] p-0.5">
                <ViewButton
                  active={view === "carousel"}
                  onClick={() => chooseView("carousel")}
                  label="Carousel view"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 4v16M17 4v16" />
                  </svg>
                </ViewButton>
                <ViewButton
                  active={view === "grid"}
                  onClick={() => chooseView("grid")}
                  label="Grid view"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </ViewButton>
              </div>

              <div className="relative">
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
                  value={listQuery}
                  onChange={(e) => setListQuery(e.target.value)}
                  placeholder="Search list..."
                  aria-label="Search your list"
                  className="w-36 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] py-1.5 pl-8 pr-7 text-xs text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-mute)]/60 focus:border-[var(--color-cyan)] sm:w-44"
                />
                {listQuery && (
                  <button
                    type="button"
                    onClick={() => setListQuery("")}
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

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "RECENT" | "TITLE" | "SCORE" | "STATUS",
                  )
                }
                aria-label="Sort list"
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-2.5 py-1.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-cyan)]"
              >
                <option value="RECENT">Sort: Recent</option>
                <option value="TITLE">Sort: Title A-Z</option>
                <option value="SCORE">Sort: Highest score</option>
                <option value="STATUS">Sort: Status</option>
              </select>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandom}
                  disabled={visibleItems.length === 0}
                  title="Pick a random title from your list"
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition-all hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] disabled:opacity-40"
                >
                  Shuffle
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  disabled={exporting}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all disabled:opacity-50"
                >
                  {exporting ? "..." : "Export CSV"}
                </button>
                <button
                  onClick={() => handleExport("json")}
                  disabled={exporting}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all disabled:opacity-50"
                >
                  {exporting ? "..." : "Export JSON"}
                </button>

                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    shareUrl
                      ? "bg-emerald-500 text-black"
                      : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-text)] hover:border-[var(--color-cyan)]"
                  } disabled:opacity-50`}
                >
                  {sharing
                    ? "..."
                    : shareUrl
                      ? "✓ Link Copied"
                      : "🔗 Share Card"}
                </button>
                {shareUrl && (
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all"
                  >
                    Open Card ↗
                  </a>
                )}

                <button
                  onClick={() => {
                    setShowBulkToolbar(!showBulkToolbar);
                    if (showBulkToolbar) setSelected(new Set());
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    showBulkToolbar
                      ? "bg-[var(--color-magenta)] text-black"
                      : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-text)] hover:border-[var(--color-magenta)]"
                  }`}
                >
                  {showBulkToolbar ? "Cancel Edit" : "Bulk Edit"}
                </button>
              </div>
            </div>

            {shareError && (
              <p className="mt-2 text-xs text-amber-300">
                {shareError}
                {authStatus !== "authenticated" && (
                  <>
                    {" "}
                    <a
                      href="/login?next=%2Fwatchlist"
                      className="underline hover:text-amber-200"
                    >
                      Sign in
                    </a>
                  </>
                )}
              </p>
            )}

            {/* Bulk Edit Toolbar */}
            {showBulkToolbar && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-magenta)]/30 bg-[var(--color-panel)] p-3 animate-slide-in-down">
                <button
                  onClick={selectAll}
                  className="rounded-lg bg-[var(--color-line)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-line)]/70 transition-all"
                >
                  {filteredItems.length > 0 &&
                  selected.size === filteredItems.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-xs text-[var(--color-mute)]">
                  {selected.size} selected
                </span>

                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as ListStatus)}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-1.5 text-xs text-[var(--color-text)] outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={applyBulkStatus}
                  disabled={selected.size === 0}
                  className="rounded-lg px-4 py-1.5 text-xs font-bold text-black transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  style={{ background: "var(--color-magenta)" }}
                >
                  Apply to {selected.size}
                </button>

                {bulkMsg && (
                  <span className="text-xs font-medium text-[var(--color-cyan)]">
                    {bulkMsg}
                  </span>
                )}
              </div>
            )}

            {/* Watchlist */}
            <div className="mt-6">
              {visibleItems.length === 0 ? (
                listQuery.trim() !== "" ? (
                  <div className="py-16 text-center">
                    <p className="text-sm text-[var(--color-mute)]">
                      No matches for{" "}
                      <span className="font-medium text-[var(--color-ink)]">
                        {listQuery.trim()}
                      </span>{" "}
                      in your list.
                    </p>
                    <button
                      onClick={() => setListQuery("")}
                      className="mt-3 rounded-full border border-[var(--color-line)] px-4 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-sm text-[var(--color-mute)]">
                      Nothing in this status yet.
                    </p>
                    <button
                      onClick={() => changeFilter("ALL")}
                      className="mt-3 rounded-full border border-[var(--color-line)] px-4 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all"
                    >
                      Show all
                    </button>
                  </div>
                )
              ) : showBulkToolbar ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleItems.map((item) => {
                    const isSelected = selected.has(item.id);
                    const title =
                      item.title.english ||
                      item.title.romaji ||
                      `Anime #${item.id}`;
                    const currentStatus = getStatus(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleSelect(item.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/10"
                            : "border-[var(--color-line)] bg-[var(--color-panel)] hover:border-[var(--color-line)]/70"
                        }`}
                      >
                        <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-line)]">
                          {item.coverImage?.large && (
                            <Image
                              src={item.coverImage.large}
                              alt=""
                              width={40}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {title}
                          </p>
                          {currentStatus && (
                            <p
                              className="mt-0.5 text-[10px]"
                              style={{
                                color:
                                  STATUS_ACCENT[currentStatus] ??
                                  "var(--color-cyan)",
                              }}
                            >
                              {LIST_STATUS_LABELS[currentStatus] ??
                                currentStatus}
                            </p>
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]" : "border-[var(--color-line)]"}`}
                        >
                          {isSelected && (
                            <span className="text-[10px] text-black font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : view === "carousel" ? (
                <WatchlistCarousel3D items={visibleItems} />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleItems.map((item, index) => (
                    <WatchlistItemCard
                      key={item.id}
                      index={index}
                      item={item}
                      status={getStatus(item.id)}
                      progress={getProgress(item.id)}
                      score={getScore(item.id)}
                      onProgress={(next) =>
                        setProgress(item.id, next, item.type)
                      }
                      onRemove={() => removeWithUndo(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div id="transfer" className="scroll-mt-24">
          <ListImportExport />
        </div>
        <div className="mx-auto max-w-7xl pb-6 mt-8">
          <NativeBannerAd />
        </div>
      </div>

      {randomPick && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setRandomPick(null)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-cyan)]">
              Need a pick? Watch this!
            </p>
            <div className="mt-4 flex gap-4">
              <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]">
                {randomPick.coverImage?.large ||
                randomPick.coverImage?.extraLarge ? (
                  <Image
                    src={
                      randomPick.coverImage.large ||
                      randomPick.coverImage.extraLarge ||
                      ""
                    }
                    alt={
                      randomPick.title.english ||
                      randomPick.title.romaji ||
                      "Watchlist item"
                    }
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] text-2xl opacity-40">
                    TV
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold leading-snug">
                  {randomPick.title.english ||
                    randomPick.title.romaji ||
                    randomPick.title.userPreferred ||
                    `Anime #${randomPick.id}`}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {randomPick.type && (
                    <span className="font-mono text-[10px] uppercase text-[var(--color-mute)]">
                      {randomPick.type}
                    </span>
                  )}
                  {randomPick.format && (
                    <span className="font-mono text-[10px] text-[var(--color-mute)]">
                      {randomPick.format}
                    </span>
                  )}
                  {randomPick.episodes ? (
                    <span className="font-mono text-[10px] text-[var(--color-mute)]">
                      {randomPick.episodes} ep
                    </span>
                  ) : null}
                </div>
                {randomPick.averageScore ? (
                  <p className="mt-1.5 font-mono text-[11px] text-[var(--color-cyan)]">
                    ★ {(randomPick.averageScore / 10).toFixed(1)}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Link
                href={`/${randomPick.type === "MANGA" ? "manga" : "anime"}/${randomPick.id}`}
                onClick={() => setRandomPick(null)}
                className="flex-1 rounded-lg bg-[var(--color-magenta)] px-4 py-2 text-center text-xs font-bold text-black transition-all hover:scale-[1.03]"
              >
                Watch now
              </Link>
              <button
                type="button"
                onClick={handleRandom}
                className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition-all hover:border-[var(--color-cyan)]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => setRandomPick(null)}
                aria-label="Close"
                className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-mute)] transition-all hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {undoItem && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-4 z-[120] flex justify-center px-4"
          role="status"
        >
          <div className="glass-card flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/90 px-4 py-2.5 shadow-lg backdrop-blur">
            <span className="text-sm text-[var(--color-mute)]">
              Removed{" "}
              <span className="text-[var(--color-ink)]">
                {undoItem.title.english ||
                  undoItem.title.romaji ||
                  undoItem.title.userPreferred ||
                  "item"}
              </span>
            </span>
            <button
              type="button"
              onClick={undoRemove}
              className="rounded-md border border-[var(--color-cyan)]/50 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/10"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => setUndoItem(null)}
              aria-label="Dismiss"
              className="text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </PageTransition>
  );
}
