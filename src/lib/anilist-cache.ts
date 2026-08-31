import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { registerAniListCache, type AniListCacheAdapter } from "./anilist";

const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_PAYLOAD_CHARS = 50;
const MAX_PAYLOAD_BYTES = 32 * 1024;
const MAX_CACHE_ROWS = 10_000;
const PRUNE_PROBABILITY = 0.2;

async function pruneAniListCache(): Promise<void> {
  try {
    // Deterministic age-based prune (skip nothing old)
    const cutoff = new Date(Date.now() - MAX_CACHE_AGE_MS);
    await prisma.aniListCache.deleteMany({ where: { updatedAt: { lt: cutoff } } });

    // Hard row cap: if we exceed MAX_CACHE_ROWS, evict the oldest rows
    // so the cache can never bloat the DB (keeps Supabase under quota).
    const count = await prisma.aniListCache.count();
    const over = count - MAX_CACHE_ROWS;
    if (over > 0) {
      const oldest = await prisma.aniListCache.findMany({
        orderBy: { updatedAt: "asc" },
        take: over,
        select: { key: true },
      });
      if (oldest.length > 0) {
        await prisma.aniListCache.deleteMany({
          where: { key: { in: oldest.map((r) => r.key) } },
        });
      }
    }
  } catch (error) {
    console.error("Failed to prune AniList cache:", error);
  }
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
    if (Math.random() < PRUNE_PROBABILITY) {
      await pruneAniListCache();
    }
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
