import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { registerAniListCache, type AniListCacheAdapter } from "./anilist";

const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_PAYLOAD_CHARS = 50;
const MAX_PAYLOAD_BYTES = 32 * 1024;
const MAX_CACHE_ROWS = 10_000;
const PRUNE_PROBABILITY = 0.2;
/**
 * Minimum gap between two prunes on the same instance.
 *
 * The prune is a maintenance job, not part of the request. Running it on a
 * fraction of every `persist()` meant that during a crawl storm — when many
 * anime pages are persisted at once — a single instance fired dozens of prune
 * bursts, each one several slow round trips to the database. That is exactly
 * the load that pushed the connection pool into checkout timeouts, so the
 * prune is now both rate-limited and off the request path.
 */
const PRUNE_MIN_INTERVAL_MS = 5 * 60 * 1000;

let lastPruneAt = 0;

async function pruneAniListCache(): Promise<void> {
  try {
    lastPruneAt = Date.now();

    // Deterministic age-based prune (skip nothing old)
    const cutoff = new Date(Date.now() - MAX_CACHE_AGE_MS);
    await prisma.aniListCache.deleteMany({ where: { updatedAt: { lt: cutoff } } });

    // Hard row cap: if we exceed MAX_CACHE_ROWS, evict the oldest rows
    // so the cache can never bloat the DB (keeps Supabase under quota).
    // Done as one statement instead of count -> findMany -> deleteMany:
    // the row cap only ever removes a handful of rows, so the extra
    // round trips cost more than the delete itself.
    await prisma.$executeRawUnsafe(
      `DELETE FROM "AniListCache" WHERE "key" IN (
         SELECT "key" FROM "AniListCache" ORDER BY "updatedAt" ASC
         LIMIT GREATEST((SELECT COUNT(*) FROM "AniListCache") - $1, 0)
       )`,
      MAX_CACHE_ROWS
    );
  } catch (error) {
    console.error("Failed to prune AniList cache:", error);
  }
}

/**
 * Schedule a prune without blocking the caller.
 *
 * Pruning is best-effort housekeeping: it must never add latency to a page
 * render or to a cache write, and it must never reject into the caller.
 */
function schedulePrune(): void {
  if (Math.random() >= PRUNE_PROBABILITY) return;
  if (Date.now() - lastPruneAt < PRUNE_MIN_INTERVAL_MS) return;
  void pruneAniListCache();
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function isUsablePayload(data: unknown): boolean {
  if (data === null || data === undefined) return false;
  try {
    const len = JSON.stringify(data).length;
    return len >= MIN_PAYLOAD_CHARS && len <= MAX_PAYLOAD_BYTES;
  } catch {
    return false;
  }
}

export const anilistCacheAdapter: AniListCacheAdapter = {
  async persist(key, data) {
    if (!isUsablePayload(data)) return;
    const hash = hashKey(key);
    await prisma.aniListCache.upsert({
      where: { key: hash },
      create: { key: hash, data: data as Prisma.InputJsonValue },
      update: { data: data as Prisma.InputJsonValue },
    });
    // Pruning is housekeeping — it must not add latency to the write path.
    schedulePrune();
  },
  async load(key) {
    const hash = hashKey(key);
    const row = await prisma.aniListCache.findUnique({ where: { key: hash } });
    if (!row) return null;
    if (Date.now() - new Date(row.updatedAt).getTime() > MAX_CACHE_AGE_MS) return null;
    return row.data;
  },
};

registerAniListCache(anilistCacheAdapter);
