/**
 * Semantic search over ZyniVerse's own written content.
 *
 * ## Why the vectors are normalised here and not assumed to be
 *
 * `gemini-embedding-001` returns 3072-dimension vectors that already have unit
 * length, but the same model at `outputDimensionality: 768` comes back with a
 * norm of about 0.59. Truncated (Matryoshka) embeddings are NOT normalised, and
 * a dot product over them is not a cosine - it is scaled by a factor that has
 * nothing to do with similarity. Every vector this module stores and compares
 * therefore goes through `normalize()` on the way in, and `cosine()` divides by
 * both norms anyway so a mis-stored vector degrades instead of lying.
 *
 * ## Why pgvector is optional rather than required
 *
 * Measured against the live corpus the JS scan is effectively instant, so it
 * stays the default read path until `prisma/migrations/20261009090000_add_doc_embedding`
 * (which also creates the `vector` extension) has been applied. The search path
 * in `semantic-index.ts` probes for it via `pgvectorEnabled()` and switches to a
 * pgvector KNN query (`<=>`) against the `DocEmbedding` mirror table when it is
 * there; until then the in-memory scan is the fallback, not the other way around.
 */

import { createHash } from "crypto";
import { consumeScopedQuota, isGeminiConfigured } from "@/lib/gemini";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export const EMBED_MODEL = "gemini-embedding-001";
/**
 * 768 rather than the model's native 3072: storage drops from ~38KB to ~9.5KB
 * of JSON per document and query time drops 4x, and the Matryoshka property
 * means the leading 768 components are a faithful projection, not a sample.
 */
export const EMBED_DIMS = 768;

/**
 * Embeddings are far cheaper than generations, but a typeahead can fire dozens
 * of queries a minute, so they get their own budget rather than sharing the
 * 20/day chat allowance.
 */
export const EMBED_PER_USER_DAILY_LIMIT = 300;
export const EMBED_GLOBAL_DAILY_LIMIT = 20_000;
export const EMBED_SCOPE = "embed";

/**
 * Gemini truncates far past this, and a wiki page is not a summarisation
 * exercise - leading characters of a long article describe it better than a
 * token-limited slice of its middle. Clipping keeps embed cost flat and makes
 * cache keys stable as documents grow.
 */
export const MAX_EMBED_CHARS = 6000;

/** Below this, results are noise dressed up as answers. */
export const MIN_SIMILARITY = 0.35;

// ── pure vector helpers ───────────────────────────────────────────────────────

/**
 * Scale to unit length. A zero vector has no direction, so it is returned as
 * zeros rather than as NaN - a NaN here would silently poison every comparison
 * it takes part in.
 */
export function normalize(v: readonly number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum);
  if (norm === 0 || !Number.isFinite(norm)) return v.map(() => 0);
  const out = new Array<number>(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / norm;
  return out;
}

/**
 * Cosine similarity in [-1, 1].
 *
 * Dimensionality mismatch returns 0 rather than comparing a prefix: two vectors
 * of different widths describe different models, and treating the shorter as a
 * prefix would invent similarity between them.
 */
export function cosine(a: readonly number[], b: readonly number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  const sim = dot / (Math.sqrt(na) * Math.sqrt(nb));
  // Guard the boundary: floating point can push an identical pair to 1.0000002,
  // which would leak into the UI as a confidence percentage over 100.
  return Math.max(-1, Math.min(1, sim));
}

/** Deterministic content fingerprint. Case-sensitive: title case is meaning. */
export function contentHash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}

/**
 * Text handed to the embedder. Title is repeated so it carries weight, tags are
 * appended as keywords, and the body is clipped - all deterministic, so the same
 * document always produces the same cache key.
 */
export function buildEmbedInput(doc: { title: string; body: string; tags?: string }): string {
  const tags = (doc.tags ?? "")
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12)
    .join(", ");

  const head = tags ? `${doc.title}\nTags: ${tags}\n\n` : `${doc.title}\n\n`;
  const room = Math.max(0, MAX_EMBED_CHARS - head.length);
  return head + doc.body.slice(0, room);
}

/**
 * Bump whenever the shape of the stored row changes (added/renamed fields).
 *
 * The content hash deliberately covers only the text that was embedded, not the
 * row's metadata - so a fix to a stored `href` would otherwise leave every
 * already-indexed document pointing at the old URL forever, with no signal that
 * anything was stale. Versioning the shape makes that a normal reindex.
 */
export const EMBED_STORE_VERSION = 1;

/**
 * Cache key for a stored document embedding.
 *
 * The model and dimensionality are part of the key on purpose: they are both
 * baked into the vector's meaning, so reusing a 3072-dim vector after switching
 * to 768 (or after a model change) would compare incomparable numbers and return
 * confident nonsense.
 */
export function docEmbedKey(source: string, id: string, hash: string): string {
  return `embed:doc:v${EMBED_STORE_VERSION}:${source}:${id}:${hash}:${EMBED_MODEL}@${EMBED_DIMS}`;
}

/** Cache key for an embedded query. Case-insensitive, like the existing AI cache. */
export function queryEmbedKey(text: string): string {
  const norm = text.trim().toLowerCase().replace(/\s+/g, " ");
  return `embed:q:${EMBED_MODEL}@${EMBED_DIMS}:${contentHash(norm)}`;
}

// ── ranking ───────────────────────────────────────────────────────────────────

export interface Rankable {
  id: string;
  vector: readonly number[];
}

export interface Scored<T> {
  item: T;
  score: number;
}

/**
 * Rank candidates by similarity, dropping weak matches.
 *
 * Ties break on `id` so that two identical queries return results in the same
 * order. Without that, `Array.sort` stability would still usually hold, but the
 * order would depend on which rows the database happened to return first -
 * which is not something to leave to chance when results are paginated.
 */
export function rank<T extends Rankable>(
  query: readonly number[],
  items: readonly T[],
  limit = 20,
  minScore = MIN_SIMILARITY
): Scored<T>[] {
  return items
    .map((item) => ({ item, score: cosine(query, item.vector) }))
    .filter((s) => s.score >= minScore)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.item.id < b.item.id ? -1 : 1))
    .slice(0, limit);
}

// ── provider ──────────────────────────────────────────────────────────────────

export function isEmbeddingConfigured(): boolean {
  return isGeminiConfigured();
}

/**
 * Embed text, returning a unit-length vector of `EMBED_DIMS`.
 *
 * Returns null instead of throwing when Gemini is unreachable, so a search can
 * degrade to keyword matching rather than 500-ing. The caller is expected to
 * surface that it is running degraded.
 */
export async function embedText(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const input = text.slice(0, MAX_EMBED_CHARS);

  try {
    const res = await fetch(
      `${API_BASE}/models/${EMBED_MODEL}:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: `models/${EMBED_MODEL}`,
          content: { parts: [{ text: input }] },
          outputDimensionality: EMBED_DIMS,
        }),
      }
    );
    if (!res.ok) return null;

    const body = (await res.json()) as { embedding?: { values?: number[] } };
    const values = body.embedding?.values;
    if (!Array.isArray(values) || values.length === 0) return null;
    if (values.length !== EMBED_DIMS) {
      // A dimensionality change means every stored vector is stale. Failing
      // loudly here is better than silently comparing across widths.
      console.error(`[embeddings] expected ${EMBED_DIMS} dims, got ${values.length}`);
      return null;
    }
    return normalize(values);
  } catch {
    return null;
  }
}

export { consumeScopedQuota };