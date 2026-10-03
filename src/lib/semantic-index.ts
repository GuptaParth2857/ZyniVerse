/**
 * Reads and queries the semantic index that lives in the existing `AiCache`
 * table.
 *
 * ## Why `AiCache` and not a new table
 *
 * `AiCache` is `{ key @unique, kind, response, createdAt }` with an index on
 * `(kind, createdAt)`. A document embedding is an immutable, content-addressed
 * blob keyed by a hash of the text that produced it - which is exactly the shape
 * of a cache entry. Reusing the table means this feature ships without a
 * migration, and migrations against the production database need an owner's
 * approval we do not have.
 *
 * ## What this costs at today's scale
 *
 * The corpus is 28 documents / ~0.3MB of vectors, so one query is ~21k
 * multiply-adds - microseconds. Scanning is not the bottleneck and adding
 * pgvector now would buy nothing measurable. A migration is included under
 * `prisma/migrations` for when the corpus is orders of magnitude larger; until
 * then a full scan is the correct amount of engineering.
 */

import { prisma } from "@/lib/prisma";
import {
  buildEmbedInput,
  cosine,
  contentHash,
  EMBED_DIMS,
  embedText,
  docEmbedKey,
  MIN_SIMILARITY,
  queryEmbedKey,
} from "@/lib/embeddings";

export type Source = "wiki" | "blog" | "forum";

export const SOURCES: Source[] = ["wiki", "blog", "forum"];

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
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** The text that actually gets embedded, kept in one place so embed and re-embed agree. */
export function embeddableText(doc: { title: string; body: string; tags?: string }): string {
  return buildEmbedInput(doc);
}

export async function sourceDocuments(
  source: Source
): Promise<Array<{ id: string; title: string; href: string; body: string; tags: string }>> {
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
    };
  }

  const qv = await embedQuery(query);
  if (!qv) {
    return {
      hits: lexicalFallback(docs, query, limit),
      scanned,
      degraded: true,
      reason: "Gemini embeddings are unavailable right now, so these are keyword matches.",
    };
  }

  const scored = docs
    .map((d) => ({ item: d, score: cosine(qv, d.vector) }))
    .filter((s) => s.score >= minScore)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.item.id < b.item.id ? -1 : 1))
    .slice(0, limit);

  return { hits: scored.map(({ item, score }) => ({ ...item, score })), scanned, degraded: false };
}