type CacheEntry<T> = { data: T; expiresAt: number };

interface InflightPromise<T> {
  promise: Promise<T>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const inflight = new Map<string, InflightPromise<any>>();

const CACHE_TTL = 5 * 60 * 1000;
const INFLIGHT_TTL = 15_000;

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  cache.delete(key);
  return null;
}

export function setCache<T>(key: string, data: T, ttl = CACHE_TTL): void {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

export async function dedupedFetch<T>(key: string, fetcher: () => Promise<T>, ttl = CACHE_TTL): Promise<T> {
  const cached = getCached<T>(key);
  if (cached) return cached;

  const existing = inflight.get(key);
  if (existing && Date.now() - existing.timestamp < INFLIGHT_TTL) {
    return existing.promise;
  }

  const promise = fetcher().then((data) => {
    setCache(key, data, ttl);
    inflight.delete(key);
    return data;
  }).catch((err) => {
    inflight.delete(key);
    throw err;
  });

  inflight.set(key, { promise, timestamp: Date.now() });
  return promise;
}
