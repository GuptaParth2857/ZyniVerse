const ANILIST_SEARCH = "https://graphql.anilist.co";

const SEARCH_QUERY = `
  query ($search: String) {
    Media(search: $search, type: ANIME) {
      id
      coverImage { large medium }
      title { romaji english }
    }
  }
`;

const TITLE_MAP: Record<string, string> = {
  "My Hero Academia FINAL SEASON": "My Hero Academia",
  "My Hero Academia": "My Hero Academia",
  "Demon Slayer: Kimetsu no Yaiba Infinity Castle": "Demon Slayer",
  "Demon Slayer: Infinity Castle": "Demon Slayer",
  "Solo Leveling Season 2 -Arise from the Shadow-": "Solo Leveling",
  "Solo Leveling Season 2": "Solo Leveling",
  "ONE PIECE": "One Piece",
  "Gachiakuta": "Gachiakuta",
  "Lazarus": "Lazarus",
  "The Fragrant Flower Blooms with Dignity": "The Fragrant Flower Blooms with Dignity",
  "DAN DA DAN Season 2": "DAN DA DAN",
  "DAN DA DAN": "DAN DA DAN",
  "Re:ZERO -Starting Life in Another World- Season 3": "Re:ZERO",
  "The Apothecary Diaries Season 2": "The Apothecary Diaries",
  "SPY x FAMILY Season 3": "SPY x FAMILY",
  "SPY x FAMILY": "SPY x FAMILY",
  "Umamusume: Cinderella Gray": "Umamusume: Cinderella Gray",
  "Umamusume: Pretty Derby BEGINNING OF A NEW ERA": "Umamusume: Pretty Derby",
  "Makeine: Too Many Losing Heroines!": "Makeine: Too Many Losing Heroines!",
  "Bocchi the Rock! Re:Re:": "Bocchi the Rock!",
  "Bocchi the Rock!": "Bocchi the Rock!",
  "Call of the Night Season 2": "Call of the Night",
  "My Dress-Up Darling Season 2": "My Dress-Up Darling",
  "Chainsaw Man: Reze Arc": "Chainsaw Man",
  "The Tunnel to Summer, the Exit of Goodbyes": "The Tunnel to Summer, the Exit of Goodbyes",
};

const SKIP_PATTERNS = [
  /^(Aoi Yuki|Reigo Kobayashi)/i,
  /^(Akinori Fudesaka|Norihiro Naganuma)/i,
  /^A-1 Pictures$/i,
  /^ufotable$/i,
  /^MAPPA$/i,
  /^WIT Studio$/i,
  /^Kyoto Animation$/i,
];

const imageCache = new Map<string, string | null>();
const CACHE_TTL = 24 * 60 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

function extractAnimeTitle(raw: string): string | null {
  if (SKIP_PATTERNS.some((p) => p.test(raw))) return null;

  if (TITLE_MAP[raw]) return TITLE_MAP[raw];

  const parenMatch = raw.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inside = parenMatch[1].trim();
    if (TITLE_MAP[inside]) return TITLE_MAP[inside];
    const cleaned = inside
      .replace(/\s*Season \d+/gi, "")
      .replace(/\s*S\d+/gi, "")
      .replace(/\s*FINAL SEASON/gi, "")
      .replace(/\s*:\s*(Reze Arc|Cour \d+|Part \d+)/gi, "")
      .trim();
    if (cleaned.length > 2) return cleaned;
  }

  if (/\b(by|as)\b/i.test(raw) && raw.includes("(")) {
    const beforeParen = raw.split("(")[0].trim();
    const parts = beforeParen.split(/\s+by\s+/i);
    if (parts.length > 1) return null;
  }

  if (/^(.+?)\s+by\s+/i.test(raw) && !raw.includes("(")) {
    return null;
  }

  let cleaned = raw
    .replace(/\s*-\s*Arise from the Shadow-?/gi, "")
    .replace(/\s*Season \d+/gi, "")
    .replace(/\s*S\d+/gi, "")
    .replace(/\s*FINAL SEASON/gi, "")
    .replace(/\s*:\s*(Kimetsu no Yaiba|Starting Life in Another World).*/gi, "")
    .replace(/\s*-\s*(Starting Life in Another World).*/gi, "")
    .replace(/\s*:\s*(Reze Arc|Cour \d+|Part \d+).*/gi, "")
    .replace(/\s*\(.*?\)/g, "")
    .replace(/\s*-\s*$/g, "")
    .replace(/^(IRIS OUT|On The Way|Mirage|Kawaii Kaiwai|OVERNIGHT FANTASY|I )\s*/i, "")
    .replace(/^.*?\bas\s+.*/i, "")
    .trim();

  if (cleaned.length < 2 || cleaned.length > 60) return null;

  if (TITLE_MAP[cleaned]) return TITLE_MAP[cleaned];

  return cleaned;
}

export async function resolveImage(title: string, malId?: number, anilistId?: number): Promise<string | null> {
  const cacheKey = `${title}_${malId || ""}_${anilistId || ""}`;

  const cachedAt = cacheTimestamps.get(cacheKey);
  if (cachedAt && Date.now() - cachedAt < CACHE_TTL) {
    return imageCache.get(cacheKey) || null;
  }

  if (anilistId && anilistId > 0) {
    try {
      const res = await fetch(ANILIST_SEARCH, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          query: `query ($id: Int) { Media(id: $id, type: ANIME) { coverImage { large } } }`,
          variables: { id: anilistId },
        }),
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      const img = data?.data?.Media?.coverImage?.large;
      if (img) {
        imageCache.set(cacheKey, img);
        cacheTimestamps.set(cacheKey, Date.now());
        return img;
      }
    } catch {}
  }

  const searchTerm = extractAnimeTitle(title);
  if (!searchTerm) {
    imageCache.set(cacheKey, null);
    cacheTimestamps.set(cacheKey, Date.now());
    return null;
  }

  try {
    const res = await fetch(ANILIST_SEARCH, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: searchTerm } }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const img = data?.data?.Media?.coverImage?.large || null;
    imageCache.set(cacheKey, img);
    cacheTimestamps.set(cacheKey, Date.now());
    return img;
  } catch {
    imageCache.set(cacheKey, null);
    cacheTimestamps.set(cacheKey, Date.now());
    return null;
  }
}

export async function resolveBatchImages(
  entries: { winner: string; malId?: number; anilistId?: number; image?: string }[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const needFetch = entries.filter((e) => !e.image);

  const batches = [];
  for (let i = 0; i < needFetch.length; i += 5) {
    batches.push(needFetch.slice(i, i + 5));
  }

  for (const batch of batches) {
    const promises = batch.map(async (entry) => {
      const img = await resolveImage(entry.winner, entry.malId, entry.anilistId);
      results.set(entry.winner, img);
    });
    await Promise.allSettled(promises);
  }

  return results;
}
