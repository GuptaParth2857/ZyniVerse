/**
 * Reads and queries the semantic index that lives in the existing `AiCache`
 * table.
 *
 * ## Why `AiCache` and not a new table
 *
 * `AiCache` is `{ key @unique, kind, response, createdAt }` with an index on
 * `(kind, createdAt)`. A document embedding is an immutable, content-addressed
 * blob keyed by a hash of the text that produced it - which is exactly the shape
 * of a cache entry. Reusing the table means the index itself still ships without
 * a migration; the pgvector *mirror* (see below) is the one thing that does need
 * one, and it is written as `20261009090000_add_doc_embedding` and applied only
 * when a database owner runs it.
 *
 * ## What this costs at today's scale
 *
 * The corpus is 28 documents / ~0.3MB of vectors, so one query is ~21k
 * multiply-adds - microseconds. Scanning is not the bottleneck, so it stays the
 * default read path until the `20261009090000_add_doc_embedding` migration
 * (which also creates the `vector` extension) has been applied. `pgvectorEnabled()`
 * probes for it, and once it is true `searchSemantic` switches to a pgvector KNN
 * query over the `DocEmbedding` mirror table - an approximate index scan (HNSW)
 * instead of streaming the whole corpus into the JS runtime. Until the migration
 * is applied nothing changes: the scan path is the fallback, not the other way
 * around.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bestTitle, getMediaBatch } from "@/lib/anilist";
import {
  buildEmbedInput,
  cosine,
  contentHash,
  EMBED_DIMS,
  EMBED_MODEL,
  embedText,
  docEmbedKey,
  MIN_SIMILARITY,
  queryEmbedKey,
} from "@/lib/embeddings";

export type Source = "wiki" | "blog" | "forum" | "review" | "tags" | "clip" | "moment" | "award";

export const SOURCES: Source[] = ["wiki", "blog", "forum", "review", "tags", "clip", "moment", "award"];

/**
 * Human-facing label per source, shared by the API and the filter row so the two
 * cannot drift.
 */
export const SOURCE_LABEL: Record<Source, string> = {
  wiki: "Wiki",
  blog: "Blog",
  forum: "Forum",
  review: "Reviews",
  tags: "Community tags",
  clip: "Clips",
  moment: "Moments",
  award: "Awards",
};

/**
 * Narrowing guard for values arriving from the query string.
 *
 * Derived from `SOURCES` rather than written out. Hardcoding the list here is
 * what let the index grow to eight sources while `?sources=award` was still
 * rejected as invalid - the filter and the index disagreed, and the code that
 * disagreed was the validation.
 */
export function isSource(v: string | null): v is Source {
  return v !== null && (SOURCES as string[]).includes(v);
}

/** What one source contributes to the index, before it is embedded. */
export interface SourceDoc {
  id: string;
  title: string;
  href: string;
  body: string;
  tags: string;
}

export interface SemanticDoc {
  id: string;
  source: Source;
  title: string;
  href: string;
  snippet: string;
  tags: string;
  vector: number[];
}

interface StoredRow {
  id: string;
  source: Source;
  title: string;
  href: string;
  snippet: string;
  tags: string;
  v: number[];
  dims: number;
  model: string;
}

const KIND = (source: Source) => `embed:doc:${source}`;
const QUERY_KIND = "embed:q";

/** Index TTL. Vectors are immutable per content hash, so this only trades a little freshness for memory. */
const INDEX_TTL_MS = 10 * 60 * 1000;
const cache = new Map<Source, { at: number; docs: SemanticDoc[] }>();

function plain(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_>`~\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function snippet(body: string, max = 180): string {
  const text = plain(body);
  if (text.length <= max) return text;
  // Cut on a space so the excerpt never ends mid-word.
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}â€¦`;
}

/** The text that actually gets embedded, kept in one place so embed and re-embed agree. */
export function embeddableText(doc: { title: string; body: string; tags?: string }): string {
  return buildEmbedInput(doc);
}

export async function sourceDocuments(source: Source): Promise<SourceDoc[]> {
  if (source === "wiki") {
    const rows = await prisma.wikiPage.findMany({
      where: { isPublished: true },
      select: { slug: true, title: true, content: true, summary: true, tags: true },
    });
    return rows.map((r) => ({
      id: r.slug,
      title: r.title,
      href: `/wiki/${r.slug}`,
      body: r.summary ? `${r.summary}\n\n${r.content}` : r.content,
      tags: r.tags ?? "",
    }));
  }
  if (source === "blog") {
    const rows = await prisma.blogPost.findMany({
      where: { isDraft: false, isDeleted: false },
      select: { slug: true, title: true, content: true, excerpt: true, tags: true },
    });
    return rows.map((r) => ({
      id: r.slug,
      title: r.title,
      href: `/blog/${r.slug}`,
      body: r.excerpt ? `${r.excerpt}\n\n${r.content}` : r.content,
      tags: r.tags ?? "",
    }));
  }
  if (source === "forum") {
    const rows = await prisma.forumThread.findMany({
      where: { isDeleted: false },
      select: { id: true, slug: true, title: true, content: true },
    });
    return rows.map((r) => ({
      // Slug stays the cache identity (readable and stable); the href uses the
      // primary key, because `/forum/thread/[id]` is what every other link in the
      // codebase points at - the segment is named [id] even though the route
      // accepts a slug in that slot elsewhere.
      id: r.slug,
      title: r.title,
      href: `/forum/thread/${r.id}`,
      body: r.content,
      tags: "",
    }));
  }
  return structuredDocuments(source);
}

/**
 * Media titles for the sources that only store an AniList id.
 *
 * Batched, because the alternative - one request per row - meant 84 community-tag
 * rows would spend 84 of AniList's 30-requests-per-minute budget on titles alone,
 * starving every other route on the site. Cached, because the same media id shows
 * up under several tags and re-requesting it is what turned this into a problem.
 *
 * Bounded, because a map that only ever grows is a leak wearing a cache's
 * clothes. AniList media titles are immutable, so nothing here needs to expire -
 * it only has to stop being unbounded. Evicting the oldest insertions is fine:
 * a miss costs one batched request, not a wrong answer.
 *
 * A lookup failure degrades to `Anime #id` rather than dropping the document. A
 * result with an ugly title is recoverable; a silently missing row is not.
 */
const titleCache = new Map<number, string>();
const TITLE_CACHE_MAX = 2_000;

function rememberTitle(id: number, title: string): void {
  // Re-insert so the key moves to the end of the insertion order, which is what
  // makes the eviction below actually least-recently-used rather than
  // first-in-first-out.
  titleCache.delete(id);
  titleCache.set(id, title);
  if (titleCache.size > TITLE_CACHE_MAX) {
    const oldest = titleCache.keys().next();
    if (!oldest.done) titleCache.delete(oldest.value);
  }
}

async function mediaTitles(ids: readonly number[]): Promise<Map<number, string>> {
  const wanted = [...new Set(ids)].filter((id) => !titleCache.has(id));
  // `getMediaBatch` caps at perPage 50, so chunk rather than silently truncate.
  for (let i = 0; i < wanted.length; i += 50) {
    const chunk = wanted.slice(i, i + 50);
    try {
      for (const m of await getMediaBatch(chunk)) {
        const title = bestTitle(m.title);
        if (title) rememberTitle(m.id, title);
      }
    } catch {
      // Fall through to the `#id` fallback below.
    }
  }
  const out = new Map<number, string>();
  for (const id of new Set(ids)) out.set(id, titleCache.get(id) ?? `Anime #${id}`);
  return out;
}

/**
 * Sources built out of structured rows rather than authored prose.
 *
 * The original three covered only wiki/blog/forum - 28 documents, which is the
 * entire editorial content of the site. Anything outside that narrow set
 * ("what does the community think of...", "what won anime of the year") had
 * nothing to match against, so the page read as broken rather than small. These
 * five come from tables that were already populated and already linked from the
 * UI, so they cost one backfill rather than new content.
 *
 * Each row is rendered into a short sentence rather than embedded as bare fields,
 * because the embedder sees text: "long-running" against a media id carries no more
 * meaning than `tag:long-running` against `mediaId:21` would, and the surrounding
 * words are what let it match a question phrased in English.
 */
async function structuredDocuments(source: Source): Promise<SourceDoc[]> {
  if (source === "review") {
    const rows = await prisma.review.findMany({
      select: { id: true, mediaId: true, rating: true, comment: true },
      orderBy: { createdAt: "desc" },
    });
    const titles = await mediaTitles(rows.map((r) => r.mediaId));
    return rows.map((r) => ({
      id: `review-${r.id}`,
      title: `Review of ${titles.get(r.mediaId)}`,
      href: `/anime/${r.mediaId}`,
      body: `${titles.get(r.mediaId)} â€” rated ${r.rating} out of 10. ${r.comment}`.trim(),
      tags: "review",
    }));
  }

  if (source === "tags") {
    const rows = await prisma.communityTag.findMany({
      where: { isApproved: true },
      select: { id: true, mediaId: true, tag: true, score: true },
      orderBy: { score: "desc" },
    });
    const titles = await mediaTitles(rows.map((r) => r.mediaId));
    return rows.map((r) => ({
      id: `tag-${r.id}`,
      title: `${titles.get(r.mediaId)} â€” ${r.tag}`,
      href: `/anime/${r.mediaId}`,
      body: `Fans describe ${titles.get(r.mediaId)} as ${r.tag}. ${r.score} people agreed with that description.`,
      tags: r.tag,
    }));
  }

  if (source === "clip") {
    const rows = await prisma.sceneClip.findMany({
      select: { id: true, title: true, description: true, mediaTitle: true, tags: true },
    });
    return rows.map((r) => ({
      id: `clip-${r.id}`,
      // No `/clips/[id]` route exists - only the gallery - so these link to the
      // gallery rather than to a URL that would 404.
      title: r.title,
      href: "/clips",
      body: `${r.description ?? ""}${r.mediaTitle ? ` From ${r.mediaTitle}.` : ""}`.trim(),
      tags: r.tags ?? "",
    }));
  }

  if (source === "moment") {
    const rows = await prisma.moment.findMany({
      where: { isPublic: true },
      select: { id: true, animeTitle: true, quote: true, character: true },
    });
    return rows.map((r) => ({
      id: `moment-${r.id}`,
      title: `${r.animeTitle ?? "Moment"}${r.character ? ` â€” ${r.character}` : ""}`,
      href: `/moments/${r.id}`,
      body: r.quote,
      tags: r.character ?? "",
    }));
  }

  if (source === "award") {
    const rows = await prisma.externalAward.findMany({
      select: { id: true, year: true, category: true, winner: true, platform: true },
      orderBy: [{ year: "desc" }, { category: "asc" }],
    });
    return rows.map((r) => ({
      id: `award-${r.id}`,
      title: `${r.category} (${r.year}) â€” ${r.winner}`,
      href: `/awards/${r.year}`,
      body: `${r.winner} won ${r.category} in ${r.year}${r.platform ? ` (${r.platform})` : ""}.`,
      tags: r.category,
    }));
  }

  return [];
}

/**
 * Persist one document's embedding.
 *
 * The row key contains the content hash, so an edit produces a *new* row rather
 * than mutating the old one. `pruneStale()` cleans up the superseded rows; the
 * read path already ignores anything but the newest hash per id.
 */
export async function storeEmbedding(
  source: Source,
  doc: { id: string; title: string; href: string; body: string; tags: string }
): Promise<boolean> {
  const text = embeddableText(doc);
  if (!text.trim()) return false;

  const row: StoredRow = {
    id: doc.id,
    source,
    title: doc.title,
    href: doc.href,
    snippet: snippet(doc.body),
    tags: doc.tags ?? "",
    v: [],
    dims: EMBED_DIMS,
    model: "gemini-embedding-001",
  };

  // Already covered by a row for this exact content? Skip the API call.
  const existing = await prisma.aiCache.findUnique({
    where: { key: docEmbedKey(source, doc.id, contentHash(text)) },
  });
  if (existing) {
    cache.delete(source);
    invalidatePgvectorMirror();
    return true;
  }

  const vector = await embedText(text);
  if (!vector) return false;
  row.v = vector;

  await prisma.aiCache.upsert({
    where: { key: docEmbedKey(source, doc.id, contentHash(text)) },
    update: { response: JSON.stringify(row) },
    create: { key: docEmbedKey(source, doc.id, contentHash(text)), kind: KIND(source), response: JSON.stringify(row) },
  });

  cache.delete(source);
  invalidatePgvectorMirror();
  return true;
}

/**
 * Delete embedding rows for documents that no longer exist or whose content no
 * longer matches. Without this every edit would leave an orphan row behind and
 * the corpus would grow without bound.
 */
export async function pruneStale(source: Source): Promise<number> {
  const docs = await sourceDocuments(source);
  // The key a live document *should* have, given its current content.
  const live = new Map(
    docs.map((d) => [d.id, docEmbedKey(source, d.id, contentHash(embeddableText(d)))])
  );

  const rows = await prisma.aiCache.findMany({
    where: { kind: KIND(source) },
    // Newest first, so the survivor per id is the most recent row.
    orderBy: { createdAt: "desc" },
    select: { key: true, response: true },
  });

  const kept = new Set<string>();
  const dead: string[] = [];

  for (const row of rows) {
    let parsed: StoredRow | null = null;
    try {
      parsed = JSON.parse(row.response) as StoredRow;
    } catch {
      dead.push(row.key);
      continue;
    }

    const id = parsed?.id;
    if (!id || parsed.dims !== EMBED_DIMS || !Array.isArray(parsed.v) || parsed.v.length !== EMBED_DIMS) {
      dead.push(row.key);
      continue;
    }
    // Keep a row only if it is the current key for a document that still exists,
    // and only one such row per id.
    if (live.get(id) !== row.key || kept.has(id)) dead.push(row.key);
    else kept.add(id);
  }

  if (dead.length > 0) {
    await prisma.aiCache.deleteMany({ where: { key: { in: dead } } });
  }
  cache.delete(source);
  invalidatePgvectorMirror();
  return dead.length;
}

/** Load every current vector for a source, newest-wins per document id. */
export async function loadIndex(source: Source): Promise<SemanticDoc[]> {
  const hit = cache.get(source);
  if (hit && Date.now() - hit.at < INDEX_TTL_MS) return hit.docs;

  const rows = await prisma.aiCache.findMany({
    where: { kind: KIND(source) },
    orderBy: { createdAt: "desc" },
    select: { response: true },
  });

  const byId = new Map<string, SemanticDoc>();
  for (const row of rows) {
    let parsed: StoredRow;
    try {
      parsed = JSON.parse(row.response) as StoredRow;
    } catch {
      continue;
    }
    if (!parsed?.id || parsed.dims !== EMBED_DIMS) continue;
    if (!Array.isArray(parsed.v) || parsed.v.length !== EMBED_DIMS) continue;
    if (byId.has(parsed.id)) continue; // newest wins, list is newest-first
    byId.set(parsed.id, {
      id: parsed.id,
      source: parsed.source ?? source,
      title: parsed.title || "Untitled",
      href: parsed.href || "#",
      snippet: parsed.snippet || "",
      tags: parsed.tags || "",
      vector: parsed.v,
    });
  }

  const docs = [...byId.values()];
  cache.set(source, { at: Date.now(), docs });
  return docs;
}

/** Query vector, memoised in `AiCache` so repeated identical searches are free. */
export async function embedQuery(text: string): Promise<number[] | null> {
  const key = queryEmbedKey(text);
  const cached = await prisma.aiCache.findUnique({ where: { key } });
  if (cached) {
    try {
      const parsed = JSON.parse(cached.response) as { v?: number[] };
      if (Array.isArray(parsed.v) && parsed.v.length === EMBED_DIMS) return parsed.v;
    } catch {
      /* fall through and re-embed */
    }
  }

  const vector = await embedText(text);
  if (!vector) return null;
  await prisma.aiCache.upsert({
    where: { key },
    update: { response: JSON.stringify({ v: vector }) },
    create: { key, kind: QUERY_KIND, response: JSON.stringify({ v: vector }) },
  });
  return vector;
}

export interface SemanticHit {
  id: string;
  source: Source;
  title: string;
  href: string;
  snippet: string;
  tags: string;
  score: number;
}

export interface SemanticResult {
  hits: SemanticHit[];
  scanned: number;
  /** True when results came from a lexical fallback because embeddings were unavailable. */
  degraded: boolean;
  reason?: string;
  /** Which engine answered: the pgvector mirror or the in-memory scan. */
  engine?: "pgvector" | "scan";
}

/** The shape the keyword fallback needs: no vector, just text to match on. */
interface LexicalDoc {
  id: string;
  source: Source;
  title: string;
  href: string;
  snippet: string;
  tags: string;
}

/**
 * Lexical fallback, used when Gemini is unreachable or nothing is embedded yet.
 *
 * This is not a stub: a degraded answer labelled as degraded is far more useful
 * than an error, because keyword search still finds exact titles that a fuzzy
 * semantic score would rank below vaguely-related prose.
 */
function lexicalFallback(docs: readonly LexicalDoc[], query: string, limit: number): SemanticHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (terms.length === 0) return [];

  return docs
    .map((d) => {
      const title = d.title.toLowerCase();
      const body = `${d.title} ${d.tags} ${d.snippet}`.toLowerCase();
      // Title hits are worth more than body hits: someone typing "Ring of
      // Power" wants that page, not every page that mentions it once.
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 2;
        if (body.includes(t)) score += 1;
      }
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.d.id < b.d.id ? -1 : 1))
    .slice(0, limit)
    .map(({ d, score }) => ({ ...d, score: Math.min(1, score / (terms.length * 2)) }));
}

/**
 * Rank documents by meaning, optionally restricted to certain sources.
 *
 * Degrades to lexical search rather than failing: the endpoint should still be
 * useful on a cold cache, during a Gemini outage, or on a corpus nobody has
 * backfilled yet.
 */
export async function searchSemantic(
  query: string,
  opts: { sources?: Source[]; limit?: number; minScore?: number } = {}
): Promise<SemanticResult> {
  const sources = opts.sources?.length ? opts.sources : SOURCES;
  const limit = Math.min(Math.max(opts.limit ?? 12, 1), 50);
  const minScore = opts.minScore ?? MIN_SIMILARITY;

  // pgvector fast path: only reachable once the DocEmbedding migration has been
  // applied (see the module comment). Anything that could go wrong - the table
  // being empty, the embed provider being down, a SQL hiccup - falls through to
  // the scan path below rather than 500-ing, because the scan path already owns
  // every degradation story from keyword fallback to "nothing embedded yet".
  if (await pgvectorEnabled()) {
    try {
      const result = await searchSemanticPgIndex(query, { sources, limit, minScore });
      // An empty mirror means nothing has been embedded at all; the scan path's
      // "search the live tables by keyword" fallback is the better answer there.
      if (result.scanned > 0) return result;
    } catch {
      // fall through to the scan path
    }
  }

  const loaded = await Promise.all(sources.map((s) => loadIndex(s)));
  const docs = loaded.flat();
  const scanned = docs.length;

  if (scanned === 0) {
    // Nothing embedded yet: search the live tables by keyword so the endpoint
    // is still useful on a cold cache, rather than reporting an empty index.
    const all: LexicalDoc[] = (
      await Promise.all(
        SOURCES.map(async (s) =>
          (await sourceDocuments(s)).map((d) => ({
            id: d.id,
            source: s,
            title: d.title,
            href: d.href,
            snippet: snippet(d.body),
            tags: d.tags,
          }))
        )
      )
    ).flat();
    return {
      hits: lexicalFallback(all, query, limit),
      scanned: 0,
      degraded: true,
      reason: "Nothing is embedded yet. Run `npm run embed:content` to build the index.",
      engine: "scan",
    };
  }

  const qv = await embedQuery(query);
  if (!qv) {
    return {
      hits: lexicalFallback(docs, query, limit),
      scanned,
      degraded: true,
      reason: "Gemini embeddings are unavailable right now, so these are keyword matches.",
      engine: "scan",
    };
  }

  const scored = docs
    .map((d) => ({ item: d, score: cosine(qv, d.vector) }))
    .filter((s) => s.score >= minScore)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.item.id < b.item.id ? -1 : 1))
    .slice(0, limit);

  return { hits: scored.map(({ item, score }) => ({ ...item, score })), scanned, degraded: false, engine: "scan" };
}

// ── pgvector mirror ──────────────────────────────────────────────────────────
//
// `AiCache` stays the source of truth for the index; `DocEmbedding` is a mirrored
// copy stored as real `vector(768)` columns so Postgres can answer a query with
// an approximate KNN index scan instead of streaming every embedding into the JS
// runtime. Everything here is optional at runtime: if the migration has not been
// applied (or the `vector` extension is missing) `pgvectorEnabled()` probes to
// false and `searchSemantic` uses the scan path above, unchanged.
//
// The mirror is a pure projection of `AiCache`. `syncPgvectorOnce()` rebuilds it
// by replaying the same content-addressed rows (newest-wins per document, the
// same rule `loadIndex` uses) and then deletes rows whose document no longer
// exists - it cannot drift from the cache, only lag it.
//
// The rebuild upserts in batches of `UPSERT_CHUNK` rows (`INSERT ... VALUES
// (...),(...) ... ON CONFLICT`) rather than one statement per row. The old
// per-row loop cost one round-trip per document - measured at ~50s for a
// 281-row corpus on a pooled connection - so batching cuts hundreds of TLS
// round-trips down to a handful. `Prisma.join` keeps every column parameterised,
// which sidesteps the multi-column array inference the per-row loop also avoided.

/** TTL for the pgvector "is it live yet" probe. */
const PG_PROBE_TTL_MS = 60_000;
/** How long a mirror nothing has touched can go without a rebuild. */
const MIRROR_SYNC_TTL_MS = 10 * 60 * 1000;
/** Rows per batched upsert during a mirror rebuild. */
const UPSERT_CHUNK = 50;

let pgProbe: { at: number; ok: boolean } | null = null;
let mirrorDirty = true; // a fresh process never trusts a mirror it has not seen
let lastMirrorSyncAt = 0;

/** Set when AiCache rows change, so the mirror rebuilds on the next query. */
export function invalidatePgvectorMirror(): void {
  mirrorDirty = true;
}

/**
 * Test-only seam: forget every TTL cache and staleness flag in this module, so a
 * test can start from a cold process without waiting out the probe/index/mirror
 * TTLs. Does not touch the database.
 */
export function resetSemanticCachesForTests(): void {
  pgProbe = null;
  mirrorDirty = true;
  lastMirrorSyncAt = 0;
  cache.clear();
}

/**
 * True when the `DocEmbedding` table - and therefore the `vector` extension it
 * depends on - is live in this database. Short-cached, so an install that has
 * not applied the migration does not pay a probe query per request; once the
 * migration is applied the app flips to the pgvector path within one probe TTL.
 */
export async function pgvectorEnabled(): Promise<boolean> {
  if (pgProbe && Date.now() - pgProbe.at < PG_PROBE_TTL_MS) return pgProbe.ok;
  try {
    await prisma.$queryRaw`SELECT "docId" FROM "DocEmbedding" LIMIT 1`;
    pgProbe = { at: Date.now(), ok: true };
  } catch {
    pgProbe = { at: Date.now(), ok: false };
  }
  return pgProbe.ok;
}

/**
 * A vector in the bracket form Postgres parses (`[0.1,0.2,…]`), bound as text
 * and cast to `vector` in the query. The JS side already normalises every vector
 * it stores, so these are unit-length and pgvector's cosine distance `<=>` is
 * exactly `1 - cosine(query, doc)`.
 */
export function vectorLiteral(v: readonly number[]): string {
  return `[${Array.from(v).join(",")}]`;
}

/** The rows a KNN query reads back from the mirror table. */
interface MirrorRow {
  source: string;
  id: string;
  title: string;
  href: string;
  snippet: string;
  tags: string;
  score: number;
}

/**
 * Mirror the current `AiCache` index into `DocEmbedding`, then prune mirror rows
 * whose document no longer exists in the cache. Returns the number of rows
 * written. The caller is responsible for having checked `pgvectorEnabled()`.
 */
async function syncPgvectorOnce(): Promise<number> {
  const docsBySource = new Map<Source, SemanticDoc[]>();
  let written = 0;

  for (const source of SOURCES) {
    const docs = await loadIndex(source);
    docsBySource.set(source, docs);
    for (let i = 0; i < docs.length; i += UPSERT_CHUNK) {
      const chunk = docs.slice(i, i + UPSERT_CHUNK);
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "DocEmbedding" (
          "source", "docId", "title", "href", "snippet", "tags",
          "model", "dims", "embedding", "createdAt", "updatedAt"
        ) VALUES ${Prisma.join(
          chunk.map(
            (doc) => Prisma.sql`(
              ${source}, ${doc.id}, ${doc.title}, ${doc.href}, ${doc.snippet}, ${doc.tags},
              ${EMBED_MODEL}, ${EMBED_DIMS}::int, ${vectorLiteral(doc.vector)}::vector, now(), now()
            )`
          )
        )}
        ON CONFLICT ("source", "docId") DO UPDATE SET
          "title" = EXCLUDED."title",
          "href" = EXCLUDED."href",
          "snippet" = EXCLUDED."snippet",
          "tags" = EXCLUDED."tags",
          "model" = EXCLUDED."model",
          "dims" = EXCLUDED."dims",
          "embedding" = EXCLUDED."embedding",
          "updatedAt" = now()
      `);
      written += chunk.length;
    }
  }

  const live = new Set<string>();
  for (const [source, docs] of docsBySource) {
    for (const doc of docs) live.add(`${source}\u0000${doc.id}`);
  }
  const existing = await prisma.$queryRaw<Array<{ source: string; docId: string }>>`
    SELECT "source", "docId" FROM "DocEmbedding"
  `;
  const dead = existing.filter((row) => !live.has(`${row.source}\u0000${row.docId}`));
  if (dead.length > 0) {
    // Composite IN over unnest: a JS-built tuple list cannot be parameterised
    // safely, and NUL cannot appear in a Postgres text column, so this phrasing
    // stays unambiguous even for exotic ids.
    await prisma.$executeRaw`
      DELETE FROM "DocEmbedding"
      WHERE ("source", "docId") IN (
        SELECT * FROM unnest(${dead.map((r) => r.source)}::text[], ${dead.map((r) => r.docId)}::text[])
      )
    `;
  }

  lastMirrorSyncAt = Date.now();
  mirrorDirty = false;
  return written;
}

/** Sync unless one ran recently and the cache has not changed since. */
async function ensureMirrorSynced(): Promise<void> {
  if (!mirrorDirty && Date.now() - lastMirrorSyncAt < MIRROR_SYNC_TTL_MS) return;
  await syncPgvectorOnce();
}

/**
 * Force a mirror rebuild regardless of staleness. Used by
 * `npm run embed:content` after it has written the AiCache rows, so the pgvector
 * mirror is ready for the next search even if nothing queries it in between.
 * No-op when the migration has not been applied.
 */
export async function syncPgvectorNow(): Promise<number> {
  if (!(await pgvectorEnabled())) return 0;
  return syncPgvectorOnce();
}

/**
 * Answer a query from the pgvector mirror with an HNSW cosine-similarity scan.
 * Throws on anything the caller should recover from (embed provider down, the
 * table dropped mid-request, …); `searchSemantic` catches and uses the scan
 * path, which owns every fallback story.
 */
async function searchSemanticPgIndex(
  query: string,
  opts: { sources: Source[]; limit: number; minScore: number }
): Promise<SemanticResult> {
  await ensureMirrorSynced();

  const qv = await embedQuery(query);
  if (!qv) throw new Error("pgvector search: query embedding unavailable");

  const rows = await prisma.$queryRaw<MirrorRow[]>`
    WITH q AS (SELECT ${vectorLiteral(qv)}::vector AS v)
    SELECT "source", "docId" AS "id", "title", "href", "snippet", "tags",
           (1 - ("embedding" <=> q.v)) AS "score"
    FROM "DocEmbedding" CROSS JOIN q
    WHERE "source" = ANY(${opts.sources}::text[])
      AND "embedding" IS NOT NULL
      AND (1 - ("embedding" <=> q.v)) >= ${opts.minScore}
    ORDER BY ("embedding" <=> q.v) ASC, "docId" ASC, "source" ASC
    LIMIT ${opts.limit}::int;
  `;

  const counts = await prisma.$queryRaw<Array<{ n: number | bigint }>>`
    SELECT count(*)::int AS n FROM "DocEmbedding" WHERE "source" = ANY(${opts.sources}::text[])
  `;

  return {
    hits: rows.map((r) => ({
      id: r.id,
      source: r.source as Source,
      title: r.title,
      href: r.href,
      snippet: r.snippet,
      tags: r.tags,
      score: Math.max(0, Math.min(1, Number(r.score) || 0)),
    })),
    // Same meaning as the scan path: how many index rows the requested sources
    // hold. HNSW may have examined a subset of these; the count is the honest
    // scale of the search universe.
    scanned: Number(counts[0]?.n ?? 0),
    degraded: false,
    engine: "pgvector",
  };
}