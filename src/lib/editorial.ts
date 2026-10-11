import { prisma } from "@/lib/prisma";
import { DUBBED_ANIME_STATIC, type DubAnimeEntry } from "@/lib/data/dubbed-static";
import {
  THEATRICAL_RELEASES,
  normalizeTheatricalStatus,
  type TheatricalRelease,
} from "@/lib/theatrical-releases";

/**
 * Editorial content that used to live in hardcoded `src/lib/*.ts` arrays.
 *
 * Reads prefer the `EditorialEntry` table (so an admin can add/edit/unpublish an
 * entry without a redeploy) and fall back to the bundled static arrays whenever
 * the table is empty or unreachable — the site never regresses to an empty page.
 */
export type EditorialKind = "dubbed" | "theatrical";

export interface EditorialBundle<T> {
  entries: T[];
  /** ISO (YYYY-MM-DD) date of the latest DB update, or null when serving the static fallback. */
  lastUpdated: string | null;
}

// The hub API routes are `force-dynamic`, so cache the DB read briefly per
// server instance instead of hitting Postgres on every request.
const TTL_MS = 5 * 60 * 1000;

type Slot<T> = { at: number; value: EditorialBundle<T> } | null;
const cache = new Map<EditorialKind, Slot<unknown>>();

async function readFromDb<T>(kind: EditorialKind): Promise<EditorialBundle<T> | null> {
  const rows = await prisma.editorialEntry.findMany({
    where: { kind, isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { data: true, updatedAt: true },
  });
  if (!rows.length) return null;

  let latest = rows[0].updatedAt;
  for (const row of rows) {
    if (row.updatedAt > latest) latest = row.updatedAt;
  }
  return {
    entries: rows.map((row) => row.data as unknown as T),
    lastUpdated: latest.toISOString().slice(0, 10),
  };
}

async function getEditorial<T>(
  kind: EditorialKind,
  fallback: readonly T[],
  transform?: (entries: T[]) => T[]
): Promise<EditorialBundle<T>> {
  const cached = cache.get(kind) as Slot<T>;
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;

  let bundle: EditorialBundle<T> | null = null;
  try {
    bundle = await readFromDb<T>(kind);
  } catch (error) {
    console.error(`[editorial] failed to read "${kind}" from the database`, error);
  }
  const value: EditorialBundle<T> = bundle ?? {
    entries: transform ? transform([...fallback]) : [...fallback],
    lastUpdated: null,
  };
  cache.set(kind, { at: Date.now(), value } as Slot<unknown>);
  return value;
}

/** Bust the per-instance cache — call after an admin create/update/delete. */
export function invalidateEditorial(kind?: EditorialKind) {
  if (kind) cache.delete(kind);
  else cache.clear();
}

export function getDubbedEntries() {
  return getEditorial<DubAnimeEntry>("dubbed", DUBBED_ANIME_STATIC);
}

export function getTheatricalEntries() {
  return getEditorial<TheatricalRelease>("theatrical", THEATRICAL_RELEASES, normalizeTheatricalStatus);
}
