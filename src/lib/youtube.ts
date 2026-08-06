import { logError } from "@/lib/logger";
import type { PodcastEpisode } from "@/lib/podcast-data";

const API_KEY = process.env.YOUTUBE_API_KEY;
const ENDPOINT = "https://www.googleapis.com/youtube/v3";

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL = 12 * 60 * 60 * 1000;

const SEARCH_QUERIES: { key: string; label: string; q: string; extra?: string }[] = [
  { key: "anime", label: "Anime", q: "anime podcast" },
  { key: "seasonal", label: "Seasonal", q: "anime season preview review podcast" },
  { key: "voice-actors", label: "Voice Actors", q: "anime voice actor interview podcast" },
  { key: "staff", label: "Staff", q: "anime director interview podcast" },
  { key: "studio", label: "Studio", q: "anime studio interview podcast" },
  { key: "creators", label: "Creators", q: "mangaka author anime creator interview podcast" },
  { key: "manga", label: "Manga", q: "manga news review podcast" },
  { key: "industry", label: "Industry", q: "anime industry news podcast" },
  { key: "hindi", label: "Hindi", q: "hindi anime podcast", extra: "relevanceLanguage=hi&regionCode=IN" },
];

interface YouTubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    channelId?: string;
    channelTitle?: string;
  };
}

function getFromCache(key: string): unknown | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  responseCache.set(key, { data, timestamp: Date.now() });
}

async function fetchJson(path: string): Promise<{ items?: unknown[] }> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${ENDPOINT}${path}${sep}key=${API_KEY}`, {
    next: { revalidate: 12 * 60 * 60 },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API request failed (${res.status}) ${body.slice(0, 250)}`);
  }
  return res.json();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'");
}

function parseDurationSeconds(iso?: string): number | null {
  if (!iso) return null;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return (m[1] ? parseInt(m[1], 10) * 3600 : 0) + (m[2] ? parseInt(m[2], 10) * 60 : 0) + (m[3] ? parseInt(m[3], 10) : 0);
}

function formatDuration(iso?: string): string {
  if (!iso) return "--:--";
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return "--:--";
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const s = m[3] ? parseInt(m[3], 10) : 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(min)}:${pad(s)}` : `${pad(min)}:${pad(s)}`;
}

function detectLanguage(title: string, description: string, channel: string): "en" | "hi" | "both" {
  const text = `${title} ${description} ${channel}`;
  const hasHindi =
    /[\u0900-\u097F]/.test(text) ||
    /\b(hindi|hindustani|india|indian)\b/i.test(text);
  if (!hasHindi) return "en";
  return /[A-Za-z]{3,}/.test(text) ? "both" : "hi";
}

const TAG_KEYWORDS = [
  "review",
  "preview",
  "interview",
  "studio",
  "director",
  "hindi",
  "dub",
  "voice actor",
  "season",
  "anime",
  "podcast",
  "manga",
  "news",
];

function deriveTags(title: string, categoryLabel: string): string[] {
  const t = title.toLowerCase();
  const found = TAG_KEYWORDS.filter((k) => t.includes(k));
  return Array.from(new Set([categoryLabel, ...found])).slice(0, 6);
}

async function searchCategory(c: (typeof SEARCH_QUERIES)[number]): Promise<YouTubeSearchItem[]> {
  const extra = c.extra ? `&${c.extra}` : "";
  const data = await fetchJson(`/search?part=snippet&type=video&maxResults=25&q=${encodeURIComponent(c.q)}${extra}`);
  return (data.items || []) as YouTubeSearchItem[];
}

async function fetchDurations(ids: string[]): Promise<Map<string, string>> {
  const durations = new Map<string, string>();
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const data = await fetchJson(`/videos?part=contentDetails&id=${encodeURIComponent(chunk.join(","))}`);
    for (const item of data.items || []) {
      const v = item as { id?: string; contentDetails?: { duration?: string } };
      if (v.id) durations.set(v.id, v.contentDetails?.duration || "");
    }
  }
  return durations;
}

interface SearchEntry {
  item: YouTubeSearchItem;
  label: string;
}

async function processItems(entries: SearchEntry[]): Promise<PodcastEpisode[]> {
  const byId = new Map<string, PodcastEpisode>();
  for (const { item, label } of entries) {
    const videoId = item.id?.videoId;
    if (!videoId || byId.has(videoId)) continue;
    const s = item.snippet || {};
    const title = decodeEntities(s.title || "Untitled");
    const description = decodeEntities(s.description || "");
    byId.set(videoId, {
      id: `yt-${videoId}`,
      title,
      description: description.slice(0, 300),
      duration: "",
      publishDate: s.publishedAt ? new Date(s.publishedAt).toISOString().slice(0, 10) : "",
      youtubeId: videoId,
      channel: decodeEntities(s.channelTitle || "YouTube"),
      channelUrl: s.channelId ? `https://www.youtube.com/channel/${s.channelId}` : "https://www.youtube.com",
      tags: deriveTags(title, label),
      language: detectLanguage(title, description, s.channelTitle || ""),
    });
  }

  const ids = [...byId.keys()];
  const durations = await fetchDurations(ids);
  return [...byId.values()]
    .map((ep) => ({ ...ep, duration: formatDuration(durations.get(ep.youtubeId)) }))
    .filter((ep) => {
      const secs = parseDurationSeconds(durations.get(ep.youtubeId));
      return secs === null || secs >= 90;
    })
    .sort((a, b) => (b.publishDate || "").localeCompare(a.publishDate || ""));
}

export async function getYouTubePodcasts(): Promise<PodcastEpisode[]> {
  if (!API_KEY) return [];
  const cacheKey = "youtube-podcasts";
  const cached = getFromCache(cacheKey);
  if (cached) return cached as PodcastEpisode[];

  try {
    const collected: SearchEntry[] = [];
    for (const c of SEARCH_QUERIES) {
      for (const item of await searchCategory(c)) collected.push({ item, label: c.label });
    }
    const episodes = await processItems(collected);
    const top = episodes.slice(0, 100);
    setCache(cacheKey, top);
    return top;
  } catch (e) {
    logError(e, "youtube-podcasts");
    const err = e as { message?: string; status?: number };
    throw new Error(`[DIAG] youtube-podcasts failed: ${err.status ?? ""} ${err.message ?? e}`);
  }
}

const searchCache = new Map<string, { data: PodcastEpisode[]; timestamp: number }>();
const SEARCH_CACHE_TTL = 60 * 60 * 1000;

export async function searchYouTubePodcasts(query: string): Promise<PodcastEpisode[]> {
  if (!API_KEY) return [];
  const q = query.trim();
  if (!q) return [];
  const cacheKey = `search-${q.toLowerCase()}`;
  const entry = searchCache.get(cacheKey);
  if (entry && Date.now() - entry.timestamp < SEARCH_CACHE_TTL) return entry.data;

  try {
    const data = await fetchJson(
      `/search?part=snippet&type=video&maxResults=25&q=${encodeURIComponent(`${q} anime podcast`)}`
    );
    const items = (data.items || []) as YouTubeSearchItem[];
    const episodes = await processItems(items.map((item) => ({ item, label: "Search" })));
    searchCache.set(cacheKey, { data: episodes, timestamp: Date.now() });
    return episodes;
  } catch (e) {
    logError(e, "youtube-podcast-search");
    return [];
  }
}
