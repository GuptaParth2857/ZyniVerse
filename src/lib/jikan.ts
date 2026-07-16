const BASE_URL = "https://api.jikan.moe/v4";
const USER_AGENT = "ZyniVerse/1.0 (https://zyverse.in)";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000;

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

let lastRequestTime = 0;
const MIN_INTERVAL = 350;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const wait = MIN_INTERVAL - (now - lastRequestTime);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastRequestTime = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: { large_image_url: string; image_url: string };
  };
  type: string | null;
  year: number | null;
  episodes: number | null;
  status: string | null;
}

export interface JikanCharacter {
  mal_id: number;
  name: string;
  images: {
    jpg: { image_url: string };
  };
  anime: { anime: { mal_id: number; title: string } }[];
}

interface JikanResponse<T> {
  data: T[];
  pagination: { last_visible_page: number; has_next_page: boolean };
}

export async function searchAnime(query: string): Promise<JikanAnime[]> {
  if (!query.trim()) return [];
  const cacheKey = `anime:${query.toLowerCase()}`;
  const cached = getFromCache<JikanAnime[]>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=8`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await rateLimitedFetch(url);
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return [];
      const body: JikanResponse<JikanAnime> = await res.json();
      setCache(cacheKey, body.data);
      return body.data;
    } catch {
      if (attempt === 2) return [];
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return [];
}

export async function searchCharacter(query: string): Promise<JikanCharacter[]> {
  if (!query.trim()) return [];
  const cacheKey = `char:${query.toLowerCase()}`;
  const cached = getFromCache<JikanCharacter[]>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/characters?q=${encodeURIComponent(query)}&limit=8`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await rateLimitedFetch(url);
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return [];
      const body: JikanResponse<JikanCharacter> = await res.json();
      setCache(cacheKey, body.data);
      return body.data;
    } catch {
      if (attempt === 2) return [];
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return [];
}

export function getJikanCacheStats(): { size: number } {
  return { size: cache.size };
}
