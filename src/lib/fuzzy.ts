/**
 * Fuzzy matching for the command palette.
 *
 * Deliberately dependency-free and pure so it can be unit tested without a DOM
 * (see `src/__tests__/fuzzy.test.ts`). Everything here is synchronous and has
 * no React or Next imports, which keeps it usable from a server component, a
 * route handler, or a `useMemo` on every keystroke.
 *
 * The scoring model is the one cmdk-style palettes converge on: exact hits beat
 * prefixes, prefixes beat substrings, substrings beat subsequences, and within
 * each of those shorter (tighter) matches outrank longer ones. Subsequence
 * matching then rewards word-boundary starts and consecutive runs, because
 * "gt" should find "Guess the OST" and not "Nightmare Before Christmas".
 */

export interface FuzzyHit<T> {
  item: T;
  score: number;
  /** Character positions in the matched text, for highlighting. */
  indices: number[];
  /** Which of the candidate's searchable strings actually matched. */
  field: string;
}

export interface FuzzyOptions<T> {
  /**
   * Returns the searchable strings for an item. Each key is weighted: the first
   * is treated as the primary label, later ones as secondary hints (keywords,
   * path, category). Empty or whitespace-only strings are skipped.
   */
  fields: (item: T) => Record<string, string>;
  /** Weights per field key. Missing keys default to 1. */
  weights?: Record<string, number>;
  /** Drop anything scoring below this. Default 0. */
  threshold?: number;
  /** Cap the returned list. Default Infinity. */
  limit?: number;
}

/** Lowercase, strip diacritics, and collapse whitespace. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when `index` starts a word: beginning of string, or after a separator. */
function isBoundary(text: string, index: number): boolean {
  if (index <= 0) return true;
  return /[\s\-_/.:,|·]/.test(text[index - 1] ?? "");
}

export interface ScoredMatch {
  score: number;
  indices: number[];
}

/**
 * Score `query` against `text`. Returns `null` when the query's characters do
 * not all appear in order.
 *
 * The four tiers are spaced far apart (1000 / 800 / 600 / up to ~500) so a
 * genuine prefix match can never be outranked by a lucky subsequence.
 */
export function fuzzyScore(query: string, text: string): ScoredMatch | null {
  const q = normalize(query);
  const t = normalize(text);
  if (q.length === 0) return { score: 0, indices: [] };
  if (t.length === 0) return null;

  // Tier 1: exact.
  if (t === q) return { score: 1000, indices: range(q.length) };

  // Tier 2: prefix. Penalise length so "sea" prefers "Search" over
  // "Search everything anime related".
  if (t.startsWith(q)) {
    return { score: 800 - (t.length - q.length) * 0.4, indices: range(q.length) };
  }

  // Tier 3: substring, discounted by how early it starts.
  const at = t.indexOf(q);
  if (at > 0) {
    return { score: 600 - at * 1.5 - (t.length - q.length) * 0.3, indices: rangeAt(q.length, at) };
  }

  // Tier 4: subsequence. Try every start position for `cq[0]` and keep the best
  // result, so "gt" can still match "controls" even though the only boundary
  // `t` sits inside a word.
  //
  // `cq` drops the query's spaces. Users type them freely ("watch lst",
  // "top anime"), and a literal space can never appear inside "Watchlist", so
  // matching them would make the obvious query score zero. Spaces still count
  // indirectly, because `isBoundary` keeps rewarding matches that land on word
  // starts - which is exactly what the space was hinting at.
  const cq = q.replace(/\s+/g, "");
  let best: ScoredMatch | null = null;

  for (let start = 0; start < t.length; start++) {
    if (t[start] !== cq[0]) continue;

    const indices: number[] = [start];
    let score = 400;
    // Leading gap: starting mid-word is weaker than starting a word.
    score -= Math.min(start, 40) * 0.5;
    if (isBoundary(t, start)) score += 25;

    let cursor = start + 1;
    for (let qi = 1; qi < cq.length; qi++) {
      const want = cq[qi];
      let found = -1;

      // Prefer a boundary occurrence of this character even if it is further
      // away; "nht" should light up "night" not "ninety hertz".
      for (let i = cursor; i < t.length; i++) {
        if (t[i] === want && isBoundary(t, i)) {
          found = i;
          break;
        }
      }
      if (found === -1) {
        for (let i = cursor; i < t.length; i++) {
          if (t[i] === want) {
            found = i;
            break;
          }
        }
      }
      if (found === -1) {
        score = -Infinity;
        break;
      }

      // Adjacency bonus: consecutive characters are what a human means.
      if (found === cursor) score += 18;
      else score -= Math.min(found - cursor, 30) * 0.8;
      if (isBoundary(t, found)) score += 12;

      indices.push(found);
      cursor = found + 1;
    }

    if (score > -Infinity && (best === null || score > best.score)) {
      // Prefer the tightest target: a subsequence match in a short label is
      // far more likely to be what was meant than the same letters scattered
      // through a long one. Without this, "wl" ranks "Wallpapers" (w...l)
      // above "Watchlist" purely on luck.
      const penalty = (t.length - cq.length) * 0.6;
      best = { score: score - penalty, indices };
    }
  }

  return best;
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function rangeAt(n: number, offset: number): number[] {
  return Array.from({ length: n }, (_, i) => i + offset);
}

/**
 * Score every item against every one of its searchable fields and return the
 * best field's result. Results are sorted by score descending.
 */
export function fuzzySearch<T>(
  query: string,
  items: readonly T[],
  options: FuzzyOptions<T>
): Array<FuzzyHit<T>> {
  const { fields, weights, threshold = 0, limit = Infinity } = options;
  if (query.trim().length === 0) return [];

  const hits: Array<FuzzyHit<T>> = [];

  for (const item of items) {
    const candidate = fields(item);
    let best: FuzzyHit<T> | null = null;

    for (const [field, raw] of Object.entries(candidate)) {
      if (!raw) continue;
      const weight = weights?.[field] ?? 1;
      const result = fuzzyScore(query, raw);
      if (!result) continue;

      const weighted = result.score * weight;
      if (weighted <= threshold) continue;

      if (best === null || weighted > best.score) {
        best = { item, score: weighted, indices: result.indices, field };
      }
    }

    if (best) hits.push(best);
  }

  hits.sort((a, b) => b.score - a.score);
  return Number.isFinite(limit) ? hits.slice(0, limit) : hits;
}

/**
 * Split `text` into segments flagged with whether each character index is part
 * of `indices`, ready for rendering highlighted output.
 */
export function highlight(
  text: string,
  indices: readonly number[]
): Array<{ char: string; match: boolean }> {
  const marked = new Set(indices);
  return Array.from(text, (char, i) => ({ char, match: marked.has(i) }));
}