export interface CharacterVoteStats {
  totalVotes: number;
  voterCount: number;
}

// Client-side batcher for character vote totals.
//
// The anime detail page mounts one CharacterVoteWidget per character (~25), and
// React runs all of their effects in the same commit. A microtask coalesces
// those reads into a single request to /api/characters/vote?ids=... instead of
// ~25 separate round-trips per page view, which is the biggest per-view
// Function Duration sink on that page.
const statsCache = new Map<number, CharacterVoteStats>();
const pending = new Map<number, Array<(value: CharacterVoteStats) => void>>();
let flushScheduled = false;

const EMPTY: CharacterVoteStats = { totalVotes: 0, voterCount: 0 };

function flush(): void {
  flushScheduled = false;
  const batch = new Map(pending);
  pending.clear();
  const ids = [...batch.keys()];

  fetch(`/api/characters/vote?ids=${ids.join(",")}`)
    .then((r) => r.json())
    .then((data: { votes?: Record<string, CharacterVoteStats> }) => {
      const rows = data?.votes || {};
      for (const id of ids) {
        const value = rows[String(id)] || EMPTY;
        statsCache.set(id, value);
        batch.get(id)?.forEach((resolve) => resolve(value));
      }
    })
    .catch(() => {
      // Don't cache a failed batch — a later mount should retry.
      for (const id of ids) batch.get(id)?.forEach((resolve) => resolve(EMPTY));
    });
}

export function loadCharacterVoteStats(characterId: number): Promise<CharacterVoteStats> {
  const cached = statsCache.get(characterId);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const waiters = pending.get(characterId) ?? [];
    waiters.push(resolve);
    pending.set(characterId, waiters);
    if (!flushScheduled) {
      flushScheduled = true;
      queueMicrotask(flush);
    }
  });
}

export function setCharacterVoteStats(characterId: number, stats: CharacterVoteStats): void {
  statsCache.set(characterId, stats);
}
