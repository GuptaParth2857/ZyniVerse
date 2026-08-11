"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

export type ListStatus = "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REWATCHING";

export interface WatchlistItem {
  id: number;
  title: { romaji?: string; english?: string; native?: string };
  coverImage: { extraLarge?: string; large?: string; color?: string };
  genres?: string[];
  status?: string;
  type?: string;
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
}

export interface SubScores {
  story?: number | null;
  art?: number | null;
  sound?: number | null;
  characters?: number | null;
  enjoyment?: number | null;
}

interface WatchlistCtx {
  items: WatchlistItem[];
  entries: ListEntryData[];
  isSaved: (id: number) => boolean;
  getStatus: (id: number) => string | null;
  toggle: (anime: WatchlistItem) => void;
  setStatus: (mediaId: number, status: ListStatus, type?: string) => void;
  getProgress: (mediaId: number) => number;
  getScore: (mediaId: number) => number | null;
  getSubScores: (mediaId: number) => SubScores;
  rate: (mediaId: number, score: number | null, type?: string, subScores?: SubScores) => number | null;
}

const WatchlistContext = createContext<WatchlistCtx | null>(null);
const STORAGE_KEY = "zyniverse_watchlist_v2";

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [, setHydrated] = useState(false);
  const [entries, setEntries] = useState<ListEntryData[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch (e) { logError(e); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          setEntries(data.items);
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { logError(e); }
  }, [items]);

  const syncToCloud = useCallback(async (entry: WatchlistItem, status: string) => {
    if (!session?.user?.id) return;
    const mediaType = entry.type === "MANGA" ? "MANGA" : "ANIME";
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", mediaId: entry.id, type: mediaType, status }),
      });
    } catch (e) { logError(e); }
  }, [session?.user?.id]);

  const isSaved = useCallback((id: number) => {
    return items.some((i) => i.id === id) || entries.some((e) => e.mediaId === id);
  }, [items, entries]);

  const getStatus = useCallback((id: number) => {
    const local = items.find((i) => i.id === id);
    if (local) return "CURRENT";
    const cloud = entries.find((e) => e.mediaId === id);
    return cloud?.status || null;
  }, [items, entries]);

  const toggle = useCallback((anime: WatchlistItem) => {
    const mediaType = anime.type === "MANGA" ? "MANGA" : "ANIME";
    setItems((prev) => {
      const exists = prev.some((i) => i.id === anime.id);
      if (exists) {
        if (session?.user?.id) {
          fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "remove", mediaId: anime.id, type: mediaType }),
          }).catch(() => {});
        }
        return prev.filter((i) => i.id !== anime.id);
      }
      syncToCloud(anime, "CURRENT");
      return [...prev, anime];
    });
  }, [session, syncToCloud]);

  const setStatus = useCallback((mediaId: number, status: ListStatus, type = "ANIME") => {
    if (session?.user?.id) {
      fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", mediaId, type, status }),
      }).catch(() => {});
    }
    setEntries((prev) => {
      const existing = prev.find((e) => e.mediaId === mediaId);
      if (existing) {
        return prev.map((e) => e.mediaId === mediaId ? { ...e, status } : e);
      }
      return [...prev, { mediaId, type, status, progress: 0, total: 0, score: null }];
    });
  }, [session]);

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
      fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rate", mediaId, type, score: computed, subScores }),
      }).catch(() => {});
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
  }, [session, computeScore]);

  const value = useMemo(
    () => ({ items, entries, isSaved, getStatus, toggle, setStatus, getProgress, getScore, getSubScores, rate }),
    [items, entries, isSaved, getStatus, toggle, setStatus, getProgress, getScore, getSubScores, rate]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
