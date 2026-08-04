import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { registerAniListCache, type AniListCacheAdapter } from "./anilist";

const MAX_CACHE_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const MIN_PAYLOAD_CHARS = 50;
const PRUNE_PROBABILITY = 0.02;

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function isUsablePayload(data: unknown): boolean {
  if (data === null || data === undefined) return false;
  try {
    return JSON.stringify(data).length >= MIN_PAYLOAD_CHARS;
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
      await prisma.aniListCache.deleteMany({
        where: { updatedAt: { lt: new Date(Date.now() - MAX_CACHE_AGE_MS) } },
      });
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
