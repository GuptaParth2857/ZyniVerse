import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * In-memory, single-flight cache for `EpgCache` JSON blobs.
 *
 * The EPG grid and the live-action caches are written on a cron cadence but
 * read on almost every render. Uncached, each read opens a Prisma connection.
 * On serverless `prisma.ts` forces `connection_limit=1`, so when many renders
 * run in parallel — most notably `next build` static generation — the
 * Supabase pooler is quickly saturated and waits exceed `pool_timeout=20s`,
 * producing `P2024` ("Timed out fetching a new connection from the connection
 * pool") log spam.
 *
 * Caching the parsed value per serverless instance for a short window keeps
 * repeated reads off the pool. Writers call {@link invalidateEpgJson} so the
 * instance that performed the write serves the fresh value immediately.
 */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

interface Slot {
  value: unknown;
  expiresAt: number;
}

const slots = new Map<string, Slot>();
const inflight = new Map<string, Promise<unknown>>();

export function invalidateEpgJson(channelId: string): void {
  slots.delete(channelId);
  inflight.delete(channelId);
}

function isPoolTimeout(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2024";
}

async function readWithRetry<T>(channelId: string, attempts = 3): Promise<T | null> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const row = await prisma.epgCache.findFirst({ where: { channelId } });
      return (row?.data ?? null) as T | null;
    } catch (error) {
      lastError = error;
      // Only a saturated pool is worth retrying; anything else is a real error.
      if (!isPoolTimeout(error) || attempt === attempts - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    }
  }
  throw lastError;
}

/**
 * Read an `EpgCache` JSON blob, memoized per process for `ttlMs`.
 * Returns `null` when the row is missing. Errors (including a final `P2024`
 * after retries) propagate so callers can fall back to their defaults.
 */
export async function getEpgJson<T>(channelId: string, ttlMs: number = DEFAULT_TTL_MS): Promise<T | null> {
  const now = Date.now();
  const slot = slots.get(channelId);
  if (slot && slot.expiresAt > now) return slot.value as T | null;

  // Collapse concurrent reads for the same key onto a single query.
  const existing = inflight.get(channelId);
  if (existing) return existing as Promise<T | null>;

  const promise = readWithRetry<T>(channelId).then((value) => {
    slots.set(channelId, { value, expiresAt: Date.now() + ttlMs });
    return value;
  });

  inflight.set(channelId, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(channelId);
  }
}
