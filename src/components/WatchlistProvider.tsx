"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

export type ListStatus = "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REWATCHING";

export const LIST_STATUSES = ["CURRENT", "PLANNING", "COMPLETED", "PAUSED", "DROPPED", "REWATCHING"] as const;

export const LIST_STATUS_LABELS: Record<string, string> = {
  CURRENT: "Currently Watching",
  PLANNING: "Plan to Watch",
  COMPLETED: "Completed",
  PAUSED: "On Hold",
  DROPPED: "Dropped",
  REWATCHING: "Rewatching",
};

export interface WatchlistItem {
  id: number;
  title: { romaji?: string; english?: string; native?: string; userPreferred?: string };
  coverImage: { extraLarge?: string; large?: string; color?: string };
  genres?: string[];
  /** Airing/release status of the media itself (e.g. RELEASING, FINISHED). */
  status?: string;
  /** The signed-in (or local) user's list status for this entry. */
  listStatus?: string;
  type?: string;
  format?: string;
  episodes?: number;
  averageScore?: number;
  nextAiringEpisode?: { airingAt: number; episode: number; timeUntilAiring: number } | null;
}

interface ListEntryData {
  mediaId: number;
  type: string;
  status: string;
  progress: number;
  total: number;
  score: number | null;
  scoreStory?: number | null;
  scoreArt?: number | null;
  scoreSound?: number | null;
  scoreCharacters?: number | null;
  scoreEnjoyment?: number | null;
  dropReason?: string | null;
}

export interface SubScores {
  story?: number | null;
  art?: number | null;
  sound?: number | null;
  characters?: number | null;
  enjoyment?: number | null;
}

interface BatchMedia {
  id: number;
  title: { romaji?: string; english?: string; native?: string; userPreferred?: string };
  coverImage: { extraLarge?: string; large?: string; color?: string };
  genres?: string[];
  type?: string;
  format?: string;
  status?: string;
  episodes?: number;
  averageScore?: number;
  nextAiringEpisode?: { airingAt: number; episode: number; timeUntilAiring: number } | null;
}

interface WatchlistCtx {
  items: WatchlistItem[];
  entries: ListEntryData[];
  isSaved: (id: number) => boolean;
  getStatus: (id: number) => string | null;
  toggle: (anime: WatchlistItem) => void;
  setStatus: (mediaId: number, status: ListStatus, type?: string, dropReason?: string) => void;
  setStatusBulk: (updates: { mediaId: number; status: ListStatus; type?: string }[]) => void;
  setProgress: (mediaId: number, progress: number, type?: string) => void;
  getProgress: (mediaId: number) => number;
  getScore: (mediaId: number) => number | null;
  getSubScores: (mediaId: number) => SubScores;
  rate: (mediaId: number, score: number | null, type?: string, subScores?: SubScores) => number | null;
  /** True while the signed-in user's cloud list is being fetched. */
  isLoading: boolean;
  /** Non-null when the last cloud write failed (shown as a global toast). */
  syncError: string | null;
  clearSyncError: () => void;
}

const WatchlistContext = createContext<WatchlistCtx | null>(null);
const STORAGE_KEY = "zyniverse_watchlist_v2";

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [, setHydrated] = useState(false);
  const [entries, setEntries] = useState<ListEntryData[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Single funnel for every cloud write so failures surface to the user
  // instead of vanishing into a silent `.catch()`.
  const postWatchlist = useCallback(async (body: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setSyncError(
          res.status === 429
            ? "Too many requests — cloud sync paused. Try again in a minute."
            : "Couldn't save to your account. Check your connection and try again."
        );
        return false;
      }
      setSyncError(null);
      return true;
    } catch (e) {
      logError(e);
      setSyncError("Couldn't reach ZyniVerse. Check your connection and try again.");
      return false;
    }
  }, []);

  // Auto-dismiss the error toast so it doesn't linger forever.
  useEffect(() => {
    if (!syncError) return;
    const t = window.setTimeout(() => setSyncError(null), 7000);
    return () => window.clearTimeout(t);
  }, [syncError]);

  const clearSyncError = useCallback(() => setSyncError(null), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: WatchlistItem[] = JSON.parse(raw);
        // Older builds stored the list status on `status` (which otherwise
        // holds the media's airing status). Migrate those entries.
        const normalized: WatchlistItem[] = Array.isArray(parsed)
          ? parsed.map((i) => {
              const legacy = LIST_STATUSES.includes(i.listStatus as ListStatus)
                ? i.listStatus
                : LIST_STATUSES.includes(i.status as ListStatus)
                  ? i.status
                  : undefined;
              return legacy && !i.listStatus ? { ...i, listStatus: legacy } : i;
            })
          : [];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(normalized);
      }
    } catch (e) { logError(e); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/watchlist");
        const data = await res.json();
        const cloudEntries: ListEntryData[] = Array.isArray(data?.items) ? data.items : [];
        if (cancelled) return;
        setEntries(cloudEntries);

        // Items saved before signing in live only in localStorage. Push them
        // to the account in one batched request so the list follows the user.
        let localItems: WatchlistItem[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) localItems = JSON.parse(raw) as WatchlistItem[];
        } catch (e) { logError(e); }

        const cloudIds = new Set(cloudEntries.map((e) => e.mediaId));
        const localOnly = Array.isArray(localItems) ? localItems.filter((i) => !cloudIds.has(i.id)) : [];
        if (localOnly.length > 0) {
          const updates = localOnly.map((i) => ({
            mediaId: i.id,
            status: (LIST_STATUSES.includes(i.listStatus as ListStatus) ? i.listStatus : "CURRENT") as ListStatus,
            type: i.type === "MANGA" ? "MANGA" : "ANIME",
          }));
          const sres = await fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "bulk", updates }),
          });
          if (cancelled) return;
          if (sres.ok) {
            // Treat the pushed items as cloud entries so the merge below keeps
            // the local list and the account in sync.
            for (const u of updates) {
              cloudEntries.push({ mediaId: u.mediaId, type: u.type, status: u.status, progress: 0, total: 0, score: null });
            }
          }
        }

        if (cloudEntries.length === 0) return;

        // Cloud entries only store media ids + progress, so fetch display
        // metadata. Without this a signed-in user's list is invisible on a
        // browser that has no local cache.
        //
        // These used to run sequentially (one round-trip per 50 ids) which
        // stacked latency for big lists. Fire every chunk in parallel and cap
        // each at 4s so one slow AniList hop can't stall the whole list.
        const ids = [...new Set(cloudEntries.map((e) => e.mediaId))];
        const chunks: number[][] = [];
        for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));
        const results = await Promise.all(
          chunks.map(async (chunk) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            try {
              const bres = await fetch("/api/anilist/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: chunk }),
                signal: controller.signal,
              });
              if (!bres.ok) return [] as BatchMedia[];
              const bdata = await bres.json();
              return (bdata.media || []) as BatchMedia[];
            } catch {
              return [] as BatchMedia[];
            } finally {
              clearTimeout(timer);
            }
          })
        );
        const meta = new Map<number, BatchMedia>();
        for (const arr of results) for (const m of arr) meta.set(m.id, m);
        if (cancelled) return;

        setItems((prev) => {
          const map = new Map(prev.map((i) => [i.id, i]));
          for (const entry of cloudEntries) {
            const m = meta.get(entry.mediaId);
            const existing = map.get(entry.mediaId);
            if (existing) {
              map.set(entry.mediaId, {
                ...existing,
                // Real metadata always wins over a placeholder cached by an
                // earlier failed fetch, so a polluted list self-heals instead
                // of showing "Anime #<id>" with no cover forever.
                title: m?.title ?? existing.title,
                coverImage: m?.coverImage ?? existing.coverImage,
                genres: m?.genres ?? existing.genres,
                listStatus: entry.status,
                status: m?.status ?? existing.status,
                type: m?.type ?? existing.type,
                format: m?.format ?? existing.format,
                episodes: m?.episodes ?? existing.episodes,
                averageScore: m?.averageScore ?? existing.averageScore,
                nextAiringEpisode: m?.nextAiringEpisode ?? existing.nextAiringEpisode ?? null,
              });
            } else {
              map.set(entry.mediaId, {
                id: entry.mediaId,
                title: m?.title ?? { romaji: `Anime #${entry.mediaId}` },
                coverImage: m?.coverImage ?? {},
                genres: m?.genres,
                listStatus: entry.status,
                status: m?.status,
                type: m?.type ?? entry.type,
                format: m?.format,
                episodes: m?.episodes,
                averageScore: m?.averageScore,
                nextAiringEpisode: m?.nextAiringEpisode ?? null,
              });
            }
          }
          return [...map.values()];
        });
      } catch (e) { logError(e); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { logError(e); }
  }, [items]);

  // Safety net for older/guest data: if an item is missing a real title or a
  // cover (e.g. a placeholder persisted by an earlier failed metadata fetch),
  // fetch its metadata and patch it in. Each id is attempted once so a flaky
  // AniList can't spin this into an endless refetch loop.
  const metaRepairAttempted = useRef<Set<number>>(new Set());
  useEffect(() => {
    const needs = items
      .filter((i) => {
        if (metaRepairAttempted.current.has(i.id)) return false;
        const t = i.title?.english || i.title?.romaji || i.title?.userPreferred;
        const hasTitle = !!t && !/^Anime #\d+$/.test(t);
        const hasCover = !!(i.coverImage?.large || i.coverImage?.extraLarge);
        return !hasTitle || !hasCover;
      })
      .map((i) => i.id);
    if (needs.length === 0) return;

    for (const id of needs) metaRepairAttempted.current.add(id);
    let cancelled = false;

    (async () => {
      const chunks: number[][] = [];
      for (let i = 0; i < needs.length; i += 50) chunks.push(needs.slice(i, i + 50));
      const results = await Promise.all(
        chunks.map(async (chunk) => {
          try {
            const bres = await fetch("/api/anilist/batch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: chunk }),
            });
            if (!bres.ok) return [] as BatchMedia[];
            const bdata = await bres.json();
            return (bdata.media || []) as BatchMedia[];
          } catch {
            return [] as BatchMedia[];
          }
        })
      );
      const meta = new Map<number, BatchMedia>();
      for (const arr of results) for (const m of arr) meta.set(m.id, m);

      // Nothing came back: clear the guard so a later attempt can retry.
      if (meta.size === 0) {
        for (const id of needs) metaRepairAttempted.current.delete(id);
        return;
      }
      if (cancelled) return;

      setItems((prev) =>
        prev.map((i) => {
          const m = meta.get(i.id);
          if (!m) return i;
          return {
            ...i,
            title: m.title ?? i.title,
            coverImage: m.coverImage ?? i.coverImage,
            genres: m.genres ?? i.genres,
            type: m.type ?? i.type,
            format: m.format ?? i.format,
            episodes: m.episodes ?? i.episodes,
            averageScore: m.averageScore ?? i.averageScore,
            status: m.status ?? i.status,
            nextAiringEpisode: m.nextAiringEpisode ?? i.nextAiringEpisode ?? null,
          };
        })
      );
    })();

    return () => { cancelled = true; };
  }, [items]);

  const syncToCloud = useCallback(async (entry: WatchlistItem, status: string) => {
    if (!session?.user?.id) return;
    const mediaType = entry.type === "MANGA" ? "MANGA" : "ANIME";
    await postWatchlist({ action: "add", mediaId: entry.id, type: mediaType, status });
  }, [session?.user?.id, postWatchlist]);

  const isSaved = useCallback((id: number) => {
    return items.some((i) => i.id === id) || entries.some((e) => e.mediaId === id);
  }, [items, entries]);

  const getStatus = useCallback((id: number) => {
    const local = items.find((i) => i.id === id);
    if (local?.listStatus) return local.listStatus;
    const cloud = entries.find((e) => e.mediaId === id);
    return cloud?.status || local?.listStatus || null;
  }, [items, entries]);

  const resolveType = useCallback((id: number, type?: string) => {
    if (type) return type;
    return items.find((i) => i.id === id)?.type === "MANGA" ? "MANGA" : "ANIME";
  }, [items]);

  const toggle = useCallback((anime: WatchlistItem) => {
    const mediaType = anime.type === "MANGA" ? "MANGA" : "ANIME";
    const exists = items.some((i) => i.id === anime.id);
    if (exists) {
      if (session?.user?.id) {
        void postWatchlist({ action: "remove", mediaId: anime.id, type: mediaType });
      }
      // Drop both the display item and the cloud entry so `isSaved` flips
      // back immediately instead of staying true until a reload.
      setItems((prev) => prev.filter((i) => i.id !== anime.id));
      setEntries((prev) => prev.filter((e) => e.mediaId !== anime.id));
      return;
    }
    syncToCloud(anime, "CURRENT");
    setItems((prev) => [...prev, { ...anime, listStatus: anime.listStatus ?? "CURRENT" }]);
  }, [items, session, syncToCloud, postWatchlist]);

  const setStatus = useCallback((mediaId: number, status: ListStatus, type?: string, dropReason?: string) => {
    const resolvedType = resolveType(mediaId, type);
    if (session?.user?.id) {
      void postWatchlist({ action: "add", mediaId, type: resolvedType, status, ...(dropReason ? { dropReason } : {}) });
    }
    // Update the rendered item too — otherwise bulk edit appears to do
    // nothing (list status is only shown from `items`).
    setItems((prev) => prev.map((i) => i.id === mediaId ? { ...i, listStatus: status } : i));
    setEntries((prev) => {
      const existing = prev.find((e) => e.mediaId === mediaId);
      if (existing) {
        return prev.map((e) => e.mediaId === mediaId ? { ...e, status, type: resolvedType, dropReason: status === "DROPPED" ? (dropReason ?? e.dropReason) : null } : e);
      }
      return [...prev, { mediaId, type: resolvedType, status, progress: 0, total: 0, score: null, dropReason: status === "DROPPED" ? dropReason : null }];
    });
  }, [session, resolveType, postWatchlist]);

  const setStatusBulk = useCallback((updates: { mediaId: number; status: ListStatus; type?: string }[]) => {
    if (updates.length === 0) return;
    const resolved = updates.map((u) => ({
      mediaId: u.mediaId,
      status: u.status,
      type: resolveType(u.mediaId, u.type),
    }));

    if (session?.user?.id) {
      // Single request — avoids tripping the 30/min API limit on big lists.
      void postWatchlist({ action: "bulk", updates: resolved });
    }

    const byId = new Map(resolved.map((u) => [u.mediaId, u]));
    setItems((prev) => prev.map((i) => (byId.has(i.id) ? { ...i, listStatus: byId.get(i.id)!.status } : i)));
    setEntries((prev) => {
      const next = [...prev];
      for (const u of resolved) {
        const idx = next.findIndex((e) => e.mediaId === u.mediaId);
        if (idx >= 0) {
          next[idx] = { ...next[idx], status: u.status, type: u.type, dropReason: u.status === "DROPPED" ? next[idx].dropReason : null };
        } else {
          next.push({ mediaId: u.mediaId, type: u.type, status: u.status, progress: 0, total: 0, score: null });
        }
      }
      return next;
    });
  }, [session, resolveType, postWatchlist]);

  const setProgress = useCallback((mediaId: number, progress: number, type?: string) => {
    const resolvedType = resolveType(mediaId, type);
    const next = Math.max(0, Math.floor(progress));
    const currentStatus = getStatus(mediaId) || "CURRENT";

    if (session?.user?.id) {
      void postWatchlist({ action: "edit", mediaId, type: resolvedType, progress: next, status: currentStatus });
    }

    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.mediaId === mediaId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], progress: next };
        return copy;
      }
      return [...prev, { mediaId, type: resolvedType, status: currentStatus, progress: next, total: 0, score: null }];
    });
  }, [session, resolveType, getStatus, postWatchlist]);

  const getProgress = useCallback((mediaId: number) => {
    const entry = entries.find((e) => e.mediaId === mediaId);
    return entry?.progress || 0;
  }, [entries]);

  const getScore = useCallback((mediaId: number) => {
    const entry = entries.find((e) => e.mediaId === mediaId);
    return entry?.score ?? null;
  }, [entries]);

  const getSubScores = useCallback((mediaId: number): SubScores => {
    const entry = entries.find((e) => e.mediaId === mediaId);
    if (!entry) return {};
    return {
      story: entry.scoreStory ?? null,
      art: entry.scoreArt ?? null,
      sound: entry.scoreSound ?? null,
      characters: entry.scoreCharacters ?? null,
      enjoyment: entry.scoreEnjoyment ?? null,
    };
  }, [entries]);

  const computeScore = useCallback((score: number | null, subScores?: SubScores): number | null => {
    const vals = [
      subScores?.story,
      subScores?.art,
      subScores?.sound,
      subScores?.characters,
      subScores?.enjoyment,
    ].filter((s): s is number => typeof s === "number" && s >= 1 && s <= 10);

    if (vals.length > 0) {
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      if (vals.length === 5) return avg;
      if (typeof score === "number" && score >= 1 && score <= 10) return score;
      return avg;
    }
    if (typeof score === "number" && score >= 1 && score <= 10) return score;
    return null;
  }, []);

  const rate = useCallback((mediaId: number, score: number | null, type = "ANIME", subScores?: SubScores): number | null => {
    const computed = computeScore(score, subScores);
    if (session?.user?.id) {
      void postWatchlist({ action: "rate", mediaId, type, score: computed, subScores });
    }
    setEntries((prev) => {
      const existing = prev.find((e) => e.mediaId === mediaId);
      const updated = {
        score: computed,
        scoreStory: subScores?.story ?? null,
        scoreArt: subScores?.art ?? null,
        scoreSound: subScores?.sound ?? null,
        scoreCharacters: subScores?.characters ?? null,
        scoreEnjoyment: subScores?.enjoyment ?? null,
      };
      if (existing) {
        return prev.map((e) => e.mediaId === mediaId ? { ...e, ...updated } : e);
      }
      return [...prev, { mediaId, type, status: "PLANNING", progress: 0, total: 0, ...updated }];
    });
    return computed;
  }, [session, computeScore, postWatchlist]);

  const value = useMemo(
    () => ({ items, entries, isSaved, getStatus, toggle, setStatus, setStatusBulk, setProgress, getProgress, getScore, getSubScores, rate, syncError, clearSyncError, isLoading }),
    [items, entries, isSaved, getStatus, toggle, setStatus, setStatusBulk, setProgress, getProgress, getScore, getSubScores, rate, syncError, clearSyncError, isLoading]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
      {syncError && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex justify-center px-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="glass-card pointer-events-auto flex items-center gap-3 rounded-xl border border-[var(--color-amber)]/50 bg-[var(--color-panel)]/90 px-4 py-2.5 shadow-lg backdrop-blur">
            <span aria-hidden className="text-[var(--color-amber)]">⚠</span>
            <span className="text-sm text-[var(--color-ink)]">{syncError}</span>
            <button
              type="button"
              onClick={clearSyncError}
              className="ml-1 rounded-md border border-[var(--color-line)] px-2 py-0.5 text-xs text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
