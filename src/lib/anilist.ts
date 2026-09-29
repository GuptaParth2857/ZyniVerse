const ENDPOINT = "https://graphql.anilist.co";
const USER_AGENT = "ZyniVerse/1.0 (https://zyverse.in)";

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

export interface AniListCacheAdapter {
  persist(key: string, data: unknown): Promise<void>;
  load(key: string): Promise<unknown | null>;
}

const GLOBAL_ADAPTER_KEY = "__zyniverse_anilist_cache_adapter__";

let cacheAdapter: AniListCacheAdapter | null = null;

function getActiveAdapter(): AniListCacheAdapter | null {
  const g = globalThis as Record<string, unknown>;
  return cacheAdapter ?? ((g[GLOBAL_ADAPTER_KEY] as AniListCacheAdapter | undefined) ?? null);
}

export function registerAniListCache(adapter: AniListCacheAdapter): void {
  cacheAdapter = adapter;
  (globalThis as Record<string, unknown>)[GLOBAL_ADAPTER_KEY] = adapter;
}

// `instrumentation.ts` registers the Prisma-backed cache, but `register()` does
// not run while `next build` prerenders pages. Without the adapter the build has
// no shared cache at all, so every one of the ~500 AniList-backed prerendered
// pages fires its own request from the same IP and AniList rate-limits the
// build into baking empty HTML. Load the adapter on demand on the fallback path
// so it is active during builds too. A dynamic import is used deliberately: the
// adapter module statically imports this one, so a static import would cycle.
async function ensureAdapter(): Promise<AniListCacheAdapter | null> {
  const existing = getActiveAdapter();
  if (existing) return existing;
  if (typeof window !== "undefined") return null;
  try {
    await import("./anilist-cache");
  } catch {
    // No database available (e.g. no DATABASE_URL). In-memory stale still works.
  }
  return getActiveAdapter();
}

// Failure is currently swallowed by callers that map it to `[]`, which is how an
// empty homepage got baked and served from the CDN without a single log line.
// Surface it so Vercel's logs actually show the rate limiting.
function logAnilistFailure(cacheKey: string, error: Error | null): void {
  const preview = cacheKey.length > 120 ? `${cacheKey.slice(0, 120)}…` : cacheKey;
  console.error(
    `[anilist] live fetch failed (${error?.message ?? "unknown error"}) — serving stale if available. query: ${preview}`,
  );
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

// How long a previous response may still be served once AniList becomes
// unreachable. AniList rate-limits at 30 req/min per IP and serverless egress
// IPs are shared, so a 429 during a build (hundreds of prerendered pages share
// one IP) is guaranteed rather than unlikely. That must degrade to "slightly
// stale data", never to a blank page baked into the static HTML.
const STALE_TTL = 24 * 60 * 60 * 1000;

// Expired entries are now retained for STALE_TTL instead of being dropped at
// 5 minutes, so the map holds far more keys than it used to. Cap it and evict
// the oldest entries so it cannot grow without bound across a long-lived server.
const MAX_CACHE_ENTRIES = 500;

// Degraded mode is tracked per query key, not per instance.
//
// It used to be one global `degradedUntil` timestamp for the whole lambda. A
// single 429 from AniList (which rate-limits per IP, and serverless egress IPs
// are shared) therefore froze live fetching for *every* query on that instance
// for 2 minutes. Because 21 of 27 pages are client-rendered, that surfaced as
// the entire site going blank at once.
const degradedUntilByKey = new Map<string, number>();
const DEGRADED_COOLDOWN_MS = 2 * 60 * 1000;
const MAX_DEGRADED_KEYS = 500;

export class AniListUnavailableError extends Error {
  constructor(cause?: string) {
    // Keep the upstream reason (rate limited / timeout / 5xx) in the message so
    // logs and the client's error banner say what actually happened, instead of
    // a flat "temporarily unavailable".
    super(cause ? `AniList is temporarily unavailable (${cause})` : "AniList is temporarily unavailable");
    this.name = "AniListUnavailableError";
  }
}

function isDegraded(key: string): boolean {
  const until = degradedUntilByKey.get(key);
  if (until === undefined) return false;
  if (Date.now() >= until) {
    degradedUntilByKey.delete(key);
    return false;
  }
  return true;
}

function enterDegradedMode(key: string): void {
  // This map is a circuit breaker, not storage. If it somehow grows past the
  // cap, reset it wholesale rather than tracking every key indefinitely.
  if (degradedUntilByKey.size >= MAX_DEGRADED_KEYS) degradedUntilByKey.clear();
  degradedUntilByKey.set(key, Date.now() + DEGRADED_COOLDOWN_MS);
}

function getCacheKey(query: string, variables: Record<string, unknown>): string {
  return `${query}|${JSON.stringify(variables)}`;
}

function getFromCache(key: string): unknown | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  // Expired entries are deliberately kept around for getStaleFromCache().
  if (Date.now() - entry.timestamp > CACHE_TTL) return null;
  return entry.data;
}

// Returns a past response regardless of freshness, so a failed refetch can be
// answered with the last known-good payload instead of nothing.
function getStaleFromCache(key: string): unknown | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > STALE_TTL) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    // Map preserves insertion order, so the first key is the oldest write.
    const oldest = responseCache.keys().next().value;
    if (oldest !== undefined) responseCache.delete(oldest);
  }
  responseCache.set(key, { data, timestamp: Date.now() });
}

export function clearAnilistCache(): void {
  responseCache.clear();
  // Degraded cooldowns are module state too. Without this, one test (or one
  // unlucky burst of traffic) leaves later callers in degraded mode with an
  // empty cache, and every subsequent request fails without ever touching the
  // network.
  degradedUntilByKey.clear();
}

export function getAnilistCacheStats(): { size: number } {
  return { size: responseCache.size };
}

const FETCH_TIMEOUT = 5_000;
const MAX_RETRIES = 2;

async function gql(query: string, variables: Record<string, unknown> = {}) {
  const cacheKey = getCacheKey(query, variables);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  let lastError: Error | null = null;

  if (!isDegraded(cacheKey)) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": USER_AGENT, Origin: "https://anilist.co", Referer: "https://anilist.co/" },
          body: JSON.stringify({ query, variables }),
          signal: controller.signal,
          cache: "force-cache",
          // Was 86400 (24h). That made a single rate-limited response stick
          // for a whole day, so an ISR revalidation would re-bake the empty
          // page from the 24h cache instead of retrying. Trending/discovery
          // data does not need day-long freshness.
          next: { revalidate: 1800 },
        });

        clearTimeout(timer);

        if (!res.ok) {
          if (res.status === 429) {
            // AniList rate limits per IP (~30 req/min). Serverless platforms
            // share egress IPs, so bursts can 429 even at modest traffic.
            // Ride out short Retry-After windows across attempts — transient.
            const raSec = Number(res.headers.get("retry-after") || 0);
            const waitMs = Math.min(Math.max(raSec, 2) * 1000, 6000);
            if (attempt < MAX_RETRIES && waitMs < FETCH_TIMEOUT) {
              await new Promise((r) => setTimeout(r, waitMs));
              continue;
            }
            enterDegradedMode(cacheKey);
            throw new Error("Rate limited by AniList — try again later.");
          }
          const body = await res.text().catch(() => "");
          if (attempt < MAX_RETRIES && res.status >= 500) {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }
          enterDegradedMode(cacheKey);
          throw new Error(`AniList request failed (${res.status}): ${body.slice(0, 200)}`);
        }

        const json = await res.json();
        if (json.errors) {
          const msg = json.errors[0]?.message || "AniList returned an error";
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 500));
            continue;
          }
          enterDegradedMode(cacheKey);
          throw new Error(msg);
        }

        setCache(cacheKey, json.data);
        const activeAdapter = getActiveAdapter();
        if (activeAdapter) {
          await activeAdapter.persist(cacheKey, json.data).catch(() => {});
        }
        return json.data;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (lastError.name === "AbortError") {
          lastError = new Error("AniList request timed out — try again.");
        }
        if (attempt >= MAX_RETRIES) {
          enterDegradedMode(cacheKey);
        }
        // Timeouts usually mean the network path is slow/dead — retry a hung
        // request at most once, then fail over to stale cache / degraded UI.
        const timeoutRetryable = lastError.name !== "AniList request timed out — try again." || attempt === 0;
        if (attempt < MAX_RETRIES && timeoutRetryable) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
      }
    }
  }

  // Everything below here is the failure path: the live fetch and all retries
  // are exhausted. Order matters — in-memory stale first (free), then the
  // persistent adapter (shared across processes and deploys), and only then give
  // up. Previously an in-memory expired entry was deleted outright, so this
  // path had nothing in memory to fall back on.
  logAnilistFailure(cacheKey, lastError);

  const inMemoryStale = getStaleFromCache(cacheKey);
  if (inMemoryStale !== null && inMemoryStale !== undefined) {
    return inMemoryStale;
  }

  const adapter = await ensureAdapter();
  if (adapter) {
    try {
      const stale = await adapter.load(cacheKey);
      if (stale !== null && stale !== undefined) {
        setCache(cacheKey, stale);
        return stale;
      }
    } catch {
      // ignore persistence errors
    }
  }

  if (isDegraded(cacheKey)) {
    // Thrown only after the persistent stale cache was tried above, so a
    // 5xx here means we genuinely have nothing. Routes wrap this into a
    // non-cacheable 503 (see anilistRoute) rather than letting it 500.
    // lastError carries the real reason (rate limited, timeout, 5xx).
    throw new AniListUnavailableError(lastError?.message);
  }

  throw lastError || new Error("AniList request failed");
}

const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native userPreferred }
  coverImage { extraLarge large medium color }
  bannerImage
  description(asHtml: false)
  type
  format
  status(version: 2)
  episodes
  duration
  chapters
  volumes
  countryOfOrigin
  isLicensed
  source(version: 2)
  genres
  averageScore
  meanScore
  popularity
  trending
  favourites
  tags { id name description category rank isGeneralSpoiler isMediaSpoiler isAdult }
  startDate { year month day }
  endDate { year month day }
  season
  seasonYear
  seasonInt
  studios(isMain: true) { nodes { id name isAnimationStudio } }
  trailer { id site thumbnail }
  siteUrl
  nextAiringEpisode { airingAt episode timeUntilAiring }
` as const;

export async function getTrending(perPage = 18) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getPopular(perPage = 18) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getUpcoming(perPage = 12) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getUpcomingPage(page = 1, perPage = 50) {
  const q = `query ($page: Int, $p: Int) { Page(page: $page, perPage: $p) { pageInfo { hasNextPage total } media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { page, p: perPage });
  return d.Page as { pageInfo: { hasNextPage: boolean; total: number }; media: Media[] };
}

export async function searchUpcoming(query: string, perPage = 50) {
  const q = `query ($s: String, $p: Int) { Page(page: 1, perPage: $p) { pageInfo { hasNextPage total } media(search: $s, type: ANIME, status: NOT_YET_RELEASED, isAdult: false, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { s: query, p: perPage });
  return d.Page as { pageInfo: { hasNextPage: boolean; total: number }; media: Media[] };
}

export async function getTopRated(perPage = 12) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: SCORE_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getMangaTrending(perPage = 18) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: TRENDING_DESC, type: MANGA, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getMangaPopular(perPage = 18) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: POPULARITY_DESC, type: MANGA, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getMangaTopRated(perPage = 12) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: SCORE_DESC, type: MANGA, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getLightNovelTrending(perPage = 24) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: TRENDING_DESC, type: MANGA, format: NOVEL, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getLightNovelPopular(perPage = 24) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: POPULARITY_DESC, type: MANGA, format: NOVEL, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getLightNovelTopRated(perPage = 24) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: SCORE_DESC, type: MANGA, format: NOVEL, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function searchMedia({ search = "", genre = null, tag = null, sort = "POPULARITY_DESC", type = "ANIME", page = 1, perPage = 24, format = null, season = null, seasonYear = null, status = null }: {
  search?: string; genre?: string | null; tag?: string | null; sort?: string; type?: string; page?: number; perPage?: number;
  format?: string | null; season?: string | null; seasonYear?: number | null; status?: string | null;
}) {
  const q = `
    query ($s: String, $g: String, $tag: String, $sort: [MediaSort], $t: MediaType, $p: Int, $pp: Int, $f: MediaFormat, $sn: MediaSeason, $sy: Int, $st: MediaStatus) {
      Page(page: $p, perPage: $pp) {
        pageInfo { hasNextPage total }
        media(search: $s, genre: $g, tag: $tag, sort: $sort, type: $t, isAdult: false, format: $f, season: $sn, seasonYear: $sy, status: $st) { ${MEDIA_FIELDS} }
      }
    }`;
  const rawVars: Record<string, unknown> = {
    s: search || null, g: genre || null, tag: tag || null, sort: [sort], t: type, p: page, pp: perPage,
    f: format || null, sn: season || null, sy: seasonYear || null, st: status || null,
  };
  const variables: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rawVars)) {
    if (v !== null && v !== undefined && v !== "") variables[k] = v;
  }
  const d = await gql(q, variables);
  return d.Page as { pageInfo: { hasNextPage: boolean; total: number }; media: Media[] };
}

export async function searchLightNovels(query: string, perPage = 20) {
  return searchMedia({ search: query, type: "MANGA", format: "NOVEL", perPage });
}

export async function getLightNovelDetail(id: number | string) {
  return getMangaDetailFull(id) as Promise<MediaMangaFull>;
}

const ANIME_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_FIELDS}
      characters(sort: ROLE, perPage: 50) {
        edges {
          role
          name
          voiceActors(language: JAPANESE) {
            id name { first middle last full native } languageV2 image { large medium }
          }
          voiceActorRoles(language: ENGLISH) {
            roleNotes dubGroup
            voiceActor { id name { first middle last full native } languageV2 image { large medium } }
          }
          node {
            id name { first middle last full native alternative } image { large medium }
            description(asHtml: false) gender dateOfBirth { year month day } age bloodType favourites siteUrl
          }
        }
      }
      staff(sort: ID, perPage: 20) {
        edges {
          role
          node {
            id name { first middle last full native } languageV2 image { large medium }
            primaryOccupations siteUrl favourites
          }
        }
      }
      externalLinks { id url site siteId type language color icon notes isDisabled }
      streamingEpisodes { title thumbnail url site }
      relations {
        edges {
          id relationType(version: 2)
          node {
            id idMal title { romaji english native userPreferred } coverImage { extraLarge large medium color }
            bannerImage format status episodes chapters volumes averageScore meanScore popularity type
            startDate { year month day } endDate { year month day } siteUrl
          }
        }
      }
      rankings { id rank type format year season allTime context }
      recommendations(sort: RATING_DESC, perPage: 12) {
        edges {
          node {
            id rating
            mediaRecommendation {
              id title { romaji english native } coverImage { extraLarge large medium } format
              episodes chapters volumes averageScore popularity type siteUrl
            }
          }
        }
      }
      stats { scoreDistribution { score amount } statusDistribution { status amount } }
      trending
      favourites
    }
  }
`;

const MANGA_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: MANGA) {
      ${MEDIA_FIELDS}
      characters(sort: ROLE, perPage: 30) {
        edges {
          role name
          node {
            id name { first middle last full native } image { large medium }
            description(asHtml: false) gender dateOfBirth { year month day } age bloodType
          }
        }
      }
      staff(sort: ID, perPage: 20) {
        edges {
          role
          node {
            id name { first middle last full native } image { large medium }
            primaryOccupations siteUrl favourites
          }
        }
      }
      externalLinks { id url site siteId type language color icon notes isDisabled }
      relations {
        edges {
          id relationType(version: 2)
          node {
            id idMal title { romaji english native userPreferred } coverImage { extraLarge large medium color }
            format status chapters volumes averageScore meanScore popularity type
            startDate { year month day } endDate { year month day } siteUrl
          }
        }
      }
      rankings { id rank type format year season allTime context }
      recommendations(sort: RATING_DESC, perPage: 12) {
        edges {
          node {
            id rating
            mediaRecommendation {
              id title { romaji english native } coverImage { extraLarge large medium } format
              chapters volumes averageScore popularity type siteUrl
            }
          }
        }
      }
      stats { scoreDistribution { score amount } statusDistribution { status amount } }
      favourites
    }
  }
`;

export async function getAnimeDetailFull(id: number | string) {
  const data = await gql(ANIME_DETAIL_QUERY, { id: Number(id) });
  return data.Media as MediaAnimeFull;
}

export async function getMangaDetailFull(id: number | string) {
  const data = await gql(MANGA_DETAIL_QUERY, { id: Number(id) });
  return data.Media as MediaMangaFull;
}

export async function getAnimeCharacters(id: number | string, page = 1, perPage = 25) {
  const base = Number(id);
  const pageSize = Math.min(Math.max(perPage, 1), 25);
  const q = `
    query ($id: Int, $p: Int, $pp: Int) {
      Media(id: $id) {
        id title { romaji english native userPreferred }
        coverImage { large medium color }
        characters(page: $p, perPage: $pp, sort: ROLE) {
          pageInfo { hasNextPage total }
          edges {
            role
            name
            voiceActors { id name { full } image { medium } languageV2 }
            node {
              id name { full native }
              image { large medium }
              favourites
            }
          }
        }
      }
    }`;
  const data = await gql(q, { id: base, p: page, pp: pageSize });
  const media = data.Media;
  return {
    id: media.id,
    title: media.title,
    coverImage: media.coverImage,
    pageInfo: media.characters?.pageInfo ?? { hasNextPage: false, total: 0 },
    edges: (media.characters?.edges as CharacterEdge[] | undefined) ?? [],
  } as {
    id: number;
    title: Media["title"];
    coverImage: Media["coverImage"];
    pageInfo: { hasNextPage: boolean; total: number };
    edges: CharacterEdge[];
  };
}

export async function getPopularCharacters(page = 1, perPage = 50) {
  const q = `
    query ($p: Int, $pp: Int) {
      Page(page: $p, perPage: $pp) {
        pageInfo { hasNextPage total }
        characters(sort: FAVOURITES_DESC) {
          id name { first middle last full native alternative }
          image { large medium }
          favourites
          media(sort: POPULARITY_DESC, perPage: 2) {
            edges {
              characterRole
              node {
                id title { romaji english native userPreferred }
                type coverImage { extraLarge large medium color } bannerImage
              }
            }
          }
        }
      }
    }`;
  const data = await gql(q, { p: page, pp: perPage });
  return data.Page as { pageInfo: { hasNextPage: boolean; total: number }; characters: CharacterBasic[] };
}

export interface CharacterTraitRaw {
  id: number;
  name: { full?: string; userPreferred?: string };
  image: { large?: string; medium?: string };
  gender?: string | null;
  age?: string | number | null;
  favourites?: number;
}

export async function getCharacterTraitsBatch(page = 1, perPage = 50) {
  const q = `
    query ($p: Int, $pp: Int) {
      Page(page: $p, perPage: $pp) {
        pageInfo { hasNextPage total }
        characters(sort: FAVOURITES_DESC) {
          id name { full userPreferred }
          image { large medium }
          gender age favourites
        }
      }
    }`;
  const data = await gql(q, { p: page, pp: perPage });
  return data.Page as { pageInfo: { hasNextPage: boolean; total: number }; characters: CharacterTraitRaw[] };
}

export async function getAnimeGallery(perPage = 24) {
  const q = `
    query ($pp: Int) {
      Page(page: 1, perPage: $pp) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          id title { romaji english native userPreferred }
          coverImage { extraLarge large medium color }
          averageScore favourites format episodes
          characters(perPage: 6, sort: ROLE) {
            edges {
              role name
              node { id name { full } image { medium } }
            }
          }
        }
      }
    }`;
  const data = await gql(q, { pp: perPage });
  return data.Page.media as AnimeWithCharacters[];
}

export async function getStaffBasic(id: number | string) {
  const q = `
    query ($id: Int) {
      Staff(id: $id) {
        id name { first middle last full native userPreferred }
        image { large medium }
        description(asHtml: false) gender favourites siteUrl
        dateOfBirth { year month day } age homeTown yearsActive
      }
    }`;
  const data = await gql(q, { id: Number(id) });
  if (!data.Staff) throw new Error("Staff not found");
  return data.Staff as StaffFull;
}

export async function getStaffMedia(id: number | string, perPage = 50) {
  const q = `
    query ($id: Int, $pp: Int) {
      Staff(id: $id) {
        staffMedia(perPage: $pp, sort: [POPULARITY_DESC]) {
          edges {
            staffRole
            node { id title { romaji english } coverImage { large color } type format episodes status meanScore startDate { year } }
          }
        }
        characterMedia(perPage: $pp, sort: [POPULARITY_DESC]) {
          edges {
            characterRole
            node { id title { romaji english } coverImage { large color } type format episodes status meanScore startDate { year } }
          }
        }
      }
    }`;
  const data = await gql(q, { id: Number(id), pp: perPage });
  type StaffMediaEdges = NonNullable<StaffFull["staffMedia"]>["edges"];
  const staffEdges: StaffMediaEdges = (data.Staff?.staffMedia?.edges || []) as StaffMediaEdges;
  const charEdges: StaffMediaEdges = (data.Staff?.characterMedia?.edges || []) as StaffMediaEdges;
  const seen = new Set<number>();
  const merged = [];
  for (const e of [...staffEdges, ...charEdges]) {
    if (!seen.has(e.node.id)) {
      seen.add(e.node.id);
      merged.push(e);
    }
  }
  return {
    pageInfo: { hasNextPage: false, total: merged.length },
    edges: merged,
  } as StaffFull["staffMedia"];
}

export async function searchCharacters(query: string, page = 1, perPage = 20) {
  const q = `
    query ($s: String, $p: Int, $pp: Int) {
      Page(page: $p, perPage: $pp) {
        pageInfo { total hasNextPage }
        characters(search: $s, sort: SEARCH_MATCH) {
          id name { full native userPreferred } image { large medium } gender favourites siteUrl
        }
      }
    }`;
  const data = await gql(q, { s: query, p: page, pp: perPage });
  return {
    page, perPage,
    total: data.Page.pageInfo.total,
    hasNextPage: data.Page.pageInfo.hasNextPage,
    results: data.Page.characters as CharacterBasic[],
  };
}

export async function searchStaff(query: string, page = 1, perPage = 20) {
  const q = `
    query ($s: String, $p: Int, $pp: Int) {
      Page(page: $p, perPage: $pp) {
        pageInfo { total hasNextPage }
        staff(search: $s, sort: SEARCH_MATCH) {
          id name { full native userPreferred } image { large medium } gender favourites siteUrl
        }
      }
    }`;
  const data = await gql(q, { s: query, p: page, pp: perPage });
  return {
    page, perPage,
    total: data.Page.pageInfo.total,
    hasNextPage: data.Page.pageInfo.hasNextPage,
    results: data.Page.staff as StaffBasic[],
  };
}

export async function getPopularStaff(perPage = 12) {
  const q = `
    query ($pp: Int) {
      Page(page: 1, perPage: $pp) {
        pageInfo { total hasNextPage }
        staff(sort: FAVOURITES_DESC) {
          id name { full native userPreferred } image { large medium } gender favourites siteUrl
        }
      }
    }`;
  const data = await gql(q, { pp: perPage });
  return data.Page.staff as StaffBasic[];
}

export async function getCharacter(id: number | string) {
  const q = `
    query ($id: Int) {
      Character(id: $id) {
        id name { first middle last full native alternative alternativeSpoiler userPreferred }
        image { large medium } description(asHtml: false)
        gender dateOfBirth { year month day } age bloodType siteUrl favourites
        media(sort: POPULARITY_DESC, perPage: 20) {
          edges {
            id characterRole
            voiceActors(language: JAPANESE) {
              id name { first middle last full native } languageV2 image { large medium }
            }
            voiceActorRoles(language: ENGLISH) {
              roleNotes dubGroup
              voiceActor { id name { first middle last full native } languageV2 image { large medium } }
            }
            node {
              id title { romaji english native userPreferred } coverImage { extraLarge large medium color }
              format type status episodes chapters volumes averageScore meanScore popularity
              startDate { year month day } siteUrl
            }
          }
        }
      }
    }`;
  const data = await gql(q, { id: Number(id) });
  return data.Character as CharacterFull;
}

export async function getSchedulePaginated(page = 1, perPage = 20) {
  const q = `
    query ($p: Int, $pp: Int) {
      Page(page: $p, perPage: $pp) {
        pageInfo { total hasNextPage }
        airingSchedules(notYetAired: true, sort: TIME) {
          episode airingAt timeUntilAiring
          media { ${MEDIA_FIELDS} }
        }
      }
    }`;
  const data = await gql(q, { p: page, pp: perPage });
  const results = data.Page.airingSchedules.map((item: AiringScheduleEntry) => ({
    ...item.media,
    nextEpisode: item.episode,
    airingAt: item.airingAt,
    timeUntilAiring: item.timeUntilAiring,
  }));
  return {
    page, perPage,
    total: data.Page.pageInfo.total,
    hasNextPage: data.Page.pageInfo.hasNextPage,
    results: results as Media[],
  };
}

export async function getAiringSchedule(fromSec: number, toSec: number) {
  const q = `
    query ($from: Int, $to: Int, $page: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo { hasNextPage }
        airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
          id episode airingAt
          media {
            id title { romaji english } coverImage { large color } format genres episodes popularity isAdult countryOfOrigin
            externalLinks { url site }
          }
        }
      }
    }`;
  let page = 1, hasNext = true;
  const all: AiringScheduleEntry[] = [];
  while (hasNext && page <= 6) {
    const data = await gql(q, { from: fromSec, to: toSec, page });
    if (!data?.Page?.airingSchedules) break;
    all.push(...data.Page.airingSchedules);
    hasNext = data.Page.pageInfo?.hasNextPage ?? false;
    page++;
  }
  return all;
}

export async function getSeasonal(year?: number, season?: string, perPage = 30) {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = now.getMonth() + 1;
  const s = season || (m <= 3 ? "WINTER" : m <= 6 ? "SPRING" : m <= 9 ? "SUMMER" : "FALL");
  const q = `
    query ($y: Int, $s: MediaSeason, $pp: Int) {
      Page(page: 1, perPage: $pp) {
        pageInfo { hasNextPage total }
        media(season: $s, seasonYear: $y, type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FIELDS} }
      }
    }`;
  const data = await gql(q, { y, s, pp: perPage });
  return data.Page as { pageInfo: { hasNextPage: boolean; total: number }; media: Media[] };
}

export async function getSeasonalManga(year?: number, _season?: string, perPage = 30) {
  const now = new Date();
  const y = year || now.getFullYear();
  // manga doesn't have seasons on AniList, use startDate range instead
  const q = `
    query ($y: Int, $y1: Int, $pp: Int) {
      Page(page: 1, perPage: $pp) {
        pageInfo { hasNextPage total }
        media(startDate_greater: [$y, 1, 1], startDate_lesser: [$y1, 1, 1], type: MANGA, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FIELDS} }
      }
    }`;
  const data = await gql(q, { y, y1: y + 1, pp: perPage });
  return data.Page as { pageInfo: { hasNextPage: boolean; total: number }; media: Media[] };
}

export async function getStudio(id: number) {
  const q = `
    query ($id: Int) {
      Studio(id: $id) {
        id name siteUrl isAnimationStudio favourites
        media(sort: POPULARITY_DESC, perPage: 50, isAdult: false) {
          nodes { ${MEDIA_FIELDS} }
          pageInfo { hasNextPage total }
        }
      }
    }`;
  const data = await gql(q, { id });
  return data.Studio as StudioFull;
}

export async function getAnimeByStudioName(name: string, page = 1, perPage = 20) {
  const q = `
    query ($name: String, $p: Int, $pp: Int) {
      Studio(search: $name) {
        id name isAnimationStudio siteUrl
        media(sort: POPULARITY_DESC, page: $p, perPage: $pp) {
          pageInfo { total hasNextPage }
          nodes { ${MEDIA_FIELDS} }
        }
      }
    }`;
  const data = await gql(q, { name, p: page, pp: perPage });
  const studio = data.Studio;
  if (!studio) throw new Error("Studio not found");
  return {
    studio: { id: studio.id, name: studio.name, isAnimationStudio: studio.isAnimationStudio, siteUrl: studio.siteUrl },
    page, perPage,
    total: studio.media.pageInfo.total,
    hasNextPage: studio.media.pageInfo.hasNextPage,
    results: studio.media.nodes as Media[],
  };
}

export async function getGenres() {
  const data = await gql(`query { GenreCollection }`);
  return data.GenreCollection as string[];
}

export async function getAllTags() {
  const data = await gql(`query { MediaTagCollection { name description category rank isGeneralSpoiler isMediaSpoiler isAdult } }`);
  return data.MediaTagCollection as Tag[];
}

export async function searchAll(query: string, page = 1, perPage = 12) {
  const q = `
    query ($s: String, $p: Int, $pp: Int) {
      anime: Page(page: $p, perPage: $pp) { media(search: $s, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } }
      manga: Page(page: $p, perPage: $pp) { media(search: $s, type: MANGA, isAdult: false) { ${MEDIA_FIELDS} } }
    }`;
  const data = await gql(q, { s: query, p: page, pp: perPage });
  return { anime: data.anime.media as Media[], manga: data.manga.media as Media[] };
}

export async function getSuggestions(query: string) {
  const q = `
    query ($s: String) {
      Page(page: 1, perPage: 8) {
        media(search: $s, type: ANIME, sort: SEARCH_MATCH) {
          id
          title { romaji english }
          coverImage { large }
          format
          status
          startDate { year }
          episodes
        }
      }
    }`;
  const data = await gql(q, { s: query });
  return data.Page.media.map((item: Media) => ({
    id: item.id,
    title: item.title.english || item.title.romaji,
    titleRomaji: item.title.romaji,
    poster: item.coverImage?.large,
    format: item.format,
    status: item.status,
    year: item.startDate?.year,
    episodes: item.episodes,
  })) as Suggestion[];
}

export interface UnifiedSuggestion {
  id: number;
  title: string;
  titleRomaji?: string | null;
  poster?: string | null;
  format: string | null;
  year: number | null;
  type: "ANIME" | "MANGA";
}

export async function getUnifiedSuggestions(query: string): Promise<{ anime: UnifiedSuggestion[]; manga: UnifiedSuggestion[] }> {
  const q = `
    query ($s: String) {
      anime: Page(page: 1, perPage: 6) {
        media(search: $s, type: ANIME, sort: SEARCH_MATCH, isAdult: false) {
          id
          title { romaji english }
          coverImage { large }
          format
          startDate { year }
        }
      }
      manga: Page(page: 1, perPage: 4) {
        media(search: $s, type: MANGA, sort: SEARCH_MATCH, isAdult: false) {
          id
          title { romaji english }
          coverImage { large }
          format
          startDate { year }
        }
      }
    }`;
  const data = await gql(q, { s: query });
  const map = (items: Media[], type: "ANIME" | "MANGA"): UnifiedSuggestion[] =>
    (items || []).map((item) => ({
      id: item.id,
      title: item.title.english || item.title.romaji || "",
      titleRomaji: item.title.romaji ?? null,
      poster: item.coverImage?.large ?? null,
      format: item.format ?? null,
      year: item.startDate?.year ?? null,
      type,
    }));
  return {
    anime: map(data.anime.media, "ANIME"),
    manga: map(data.manga.media, "MANGA"),
  };
}

export async function getAiringAnime(perPage = 50) {
  const q = `
    query ($pp: Int) {
      Page(page: 1, perPage: $pp) {
        media(status: RELEASING, sort: POPULARITY_DESC, type: ANIME) {
          id
          title { english romaji native }
          coverImage { large medium extraLarge }
          episodes
          nextAiringEpisode { episode airingAt timeUntilAiring }
          popularity
          trending
          genres
          season
          seasonYear
        }
      }
    }`;
  const d = await gql(q, { pp: perPage });
  return d.Page.media as Media[];
}

export async function getSpotlight() {
  const q = `query { Page(page: 1, perPage: 10) { media(sort: [TRENDING_DESC, POPULARITY_DESC], type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const data = await gql(q);
  return data.Page.media as Media[];
}

export interface HomepageData {
  trending: Media[];
  popular: Media[];
  upcoming: Media[];
  topRated: Media[];
}

/**
 * The homepage's four rails in one round trip.
 *
 * They used to be four separate `getTrending` / `getPopular` / `getUpcoming` /
 * `getTopRated` calls. Against a 30 req/min per-IP budget that is four times
 * the quota for a single page render, and the homepage is the most heavily
 * requested route on the site.
 */
export async function getHomepageData(
  counts: { trending?: number; popular?: number; upcoming?: number; topRated?: number } = {},
): Promise<HomepageData> {
  const trending = counts.trending ?? 24;
  const popular = counts.popular ?? 18;
  const upcoming = counts.upcoming ?? 12;
  const topRated = counts.topRated ?? 12;

  const q = `
    query ($trending: Int, $popular: Int, $upcoming: Int, $topRated: Int) {
      trending: Page(page: 1, perPage: $trending) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} }
      }
      popular: Page(page: 1, perPage: $popular) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} }
      }
      upcoming: Page(page: 1, perPage: $upcoming) {
        media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED, isAdult: false) { ${MEDIA_FIELDS} }
      }
      topRated: Page(page: 1, perPage: $topRated) {
        media(sort: SCORE_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} }
      }
    }`;

  const data = await gql(q, { trending, popular, upcoming, topRated });
  return {
    trending: (data.trending?.media ?? []) as Media[],
    popular: (data.popular?.media ?? []) as Media[],
    upcoming: (data.upcoming?.media ?? []) as Media[],
    topRated: (data.topRated?.media ?? []) as Media[],
  };
}

export async function getAnimeListFromAniList(username: string) {
  const q = `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ANIME) {
        lists {
          entries {
            id
            mediaId
            status
            score
            progress
            repeat
            startedAt { year month day }
            completedAt { year month day }
            media {
              id
              title { english romaji }
              coverImage { large }
              format
              episodes
            }
          }
        }
      }
    }`;
  const data = await gql(q, { userName: username });
  const lists: { entries: AniListEntry[] }[] = data.MediaListCollection?.lists || [];
  const entries: AniListEntry[] = [];
  for (const list of lists) {
    if (list.entries) entries.push(...list.entries);
  }
  return entries;
}

export function bestTitle(titleObj: { english?: string | null; romaji?: string | null; native?: string | null; userPreferred?: string | null } | null | undefined): string {
  return titleObj?.userPreferred || titleObj?.english || titleObj?.romaji || titleObj?.native || "Untitled";
}

// --- Types ---

export interface MediaTitle {
  romaji?: string; english?: string; native?: string; userPreferred?: string;
}

export interface Media {
  id: number;
  idMal?: number;
  title: MediaTitle;
  coverImage: { extraLarge?: string; large?: string; medium?: string; color?: string };
  bannerImage?: string;
  description?: string;
  type?: string;
  format?: string;
  status?: string;
  episodes?: number;
  duration?: number;
  chapters?: number;
  volumes?: number;
  countryOfOrigin?: string;
  isLicensed?: boolean;
  isAdult?: boolean;
  source?: string;
  genres?: string[];
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  trending?: number;
  favourites?: number;
  tags?: { id: number; name: string; description?: string; category?: string; rank: number; isGeneralSpoiler: boolean; isMediaSpoiler: boolean; isAdult: boolean }[];
  startDate?: { year?: number; month?: number; day?: number };
  endDate?: { year?: number; month?: number; day?: number };
  season?: string;
  seasonYear?: number;
  seasonInt?: number;
  studios?: { nodes: { id: number; name: string; isAnimationStudio?: boolean }[] };
  trailer?: { id: string; site: string; thumbnail?: string };
  siteUrl?: string;
  nextAiringEpisode?: { airingAt: number; episode: number; timeUntilAiring: number } | null;
}

export interface VoiceActor {
  id: number;
  name: { first?: string; middle?: string; last?: string; full?: string; native?: string };
  languageV2?: string;
  image: { large?: string; medium?: string };
}

export interface CharacterEdge {
  role: string;
  name?: string;
  voiceActors?: VoiceActor[];
  voiceActorRoles?: {
    roleNotes?: string;
    dubGroup?: string;
    voiceActor: VoiceActor;
  }[];
  node: {
    id: number;
    name: { first?: string; middle?: string; last?: string; full?: string; native?: string; alternative?: string[] };
    image: { large?: string; medium?: string };
    description?: string;
    gender?: string;
    dateOfBirth?: { year?: number; month?: number; day?: number };
    age?: string;
    bloodType?: string;
    favourites?: number;
    siteUrl?: string;
  };
}

export interface StaffEdge {
  role: string;
  node: {
    id: number;
    name: { first?: string; middle?: string; last?: string; full?: string; native?: string };
    languageV2?: string;
    image: { large?: string; medium?: string };
    primaryOccupations?: string[];
    siteUrl?: string;
    favourites?: number;
  };
}

export interface ExternalLink {
  id: number; url: string; site: string; siteId?: number;
  type?: string; language?: string; color?: string; icon?: string; notes?: string; isDisabled?: boolean;
}

export interface MediaAnimeFull extends Media {
  characters?: { edges: CharacterEdge[] };
  staff?: { edges: StaffEdge[] };
  externalLinks?: ExternalLink[];
  streamingEpisodes?: { title: string; thumbnail: string; url: string; site: string }[];
  relations?: {
    edges: {
      id: number; relationType: string;
      node: {
        id: number; idMal?: number; title: MediaTitle; coverImage: { extraLarge?: string; large?: string; medium?: string; color?: string };
        bannerImage?: string; format?: string; status?: string; episodes?: number; chapters?: number; volumes?: number;
        averageScore?: number; meanScore?: number; popularity?: number; type?: string;
        startDate?: { year?: number; month?: number; day?: number }; endDate?: { year?: number; month?: number; day?: number };
        siteUrl?: string;
      };
    }[];
  };
  rankings?: { id: number; rank: number; type: string; format?: string; year?: number; season?: string; allTime?: boolean; context: string }[];
  recommendations?: {
    edges: {
      node: {
        id: number; rating: number;
        mediaRecommendation: {
          id: number; title: MediaTitle; coverImage: { extraLarge?: string; large?: string; medium?: string };
          format?: string; episodes?: number; chapters?: number; volumes?: number; averageScore?: number; popularity?: number;
          type?: string; siteUrl?: string;
        };
      };
    }[];
  };
  stats?: { scoreDistribution: { score: number; amount: number }[]; statusDistribution: { status: string; amount: number }[] };
}

export interface MediaMangaFull extends Media {
  characters?: { edges: { role: string; name?: string; node: CharacterEdge["node"] }[] };
  staff?: { edges: StaffEdge[] };
  externalLinks?: ExternalLink[];
  relations?: MediaAnimeFull["relations"];
  rankings?: MediaAnimeFull["rankings"];
  recommendations?: MediaAnimeFull["recommendations"];
  stats?: MediaAnimeFull["stats"];
}

export interface CharacterFull {
  id: number;
  name: { first?: string; middle?: string; last?: string; full?: string; native?: string; alternative?: string[]; alternativeSpoiler?: string[]; userPreferred?: string };
  image: { large?: string; medium?: string };
  description?: string;
  gender?: string;
  dateOfBirth?: { year?: number; month?: number; day?: number };
  age?: string;
  bloodType?: string;
  siteUrl?: string;
  favourites?: number;
  media?: {
    edges: {
      id: number;
      characterRole: string;
      voiceActors?: VoiceActor[];
      voiceActorRoles?: { roleNotes?: string; dubGroup?: string; voiceActor: VoiceActor }[];
      node: {
        id: number; title: MediaTitle; coverImage: { extraLarge?: string; large?: string; medium?: string; color?: string };
        format?: string; type?: string; status?: string; episodes?: number; chapters?: number; volumes?: number;
        averageScore?: number; meanScore?: number; popularity?: number;
        startDate?: { year?: number; month?: number; day?: number }; siteUrl?: string;
      };
    }[];
  };
}

export interface CharacterBasic {
  id: number;
  name: { first?: string; middle?: string; last?: string; full?: string; native?: string; alternative?: string[]; userPreferred?: string };
  image: { large?: string; medium?: string };
  favourites?: number;
  media?: {
    edges: {
      characterRole: string;
      node: {
        id: number; title: MediaTitle; type?: string;
        coverImage: { extraLarge?: string; large?: string; medium?: string; color?: string };
        bannerImage?: string;
      };
    }[];
  };
}

export interface AnimeWithCharacters extends Media {
  characters?: {
    edges: {
      role: string; name?: string;
      node: { id: number; name: { full?: string }; image: { medium?: string } };
    }[];
  };
}

export interface AiringScheduleEntry {
  id: number; episode: number; airingAt: number; timeUntilAiring?: number;
  media: {
    id: number; title: { romaji?: string; english?: string };
    coverImage: { large?: string; color?: string }; format?: string; genres?: string[]; episodes?: number;
    popularity?: number; isAdult?: boolean; countryOfOrigin?: string;
    externalLinks?: { url: string; site?: string }[];
  };
}

export interface StudioFull {
  id: number;
  name: string;
  siteUrl?: string;
  isAnimationStudio?: boolean;
  favourites?: number;
  media: {
    nodes: Media[];
    pageInfo: { hasNextPage: boolean; total: number };
  };
}

export interface Suggestion {
  id: number;
  title: string;
  titleRomaji: string;
  poster?: string;
  format?: string;
  status?: string;
  year?: number;
  episodes?: number;
}

export interface Tag {
  name: string;
  description?: string;
  category?: string;
  rank: number;
  isGeneralSpoiler: boolean;
  isMediaSpoiler: boolean;
  isAdult: boolean;
}

export interface AniListEntry {
  id: number;
  mediaId: number;
  status: string;
  score: number;
  progress: number;
  repeat: number;
  startedAt: { year?: number; month?: number; day?: number } | null;
  completedAt: { year?: number; month?: number; day?: number } | null;
  media: {
    id: number;
    title: { english?: string; romaji?: string };
    coverImage: { large?: string };
    format?: string;
    episodes?: number;
  };
}

export interface StaffBasic {
  id: number;
  name: { first?: string; middle?: string; last?: string; full?: string; native?: string; userPreferred?: string };
  image: { large?: string; medium?: string };
  gender?: string;
  favourites?: number;
  siteUrl?: string;
}

export interface StaffFull {
  id: number;
  name: { first?: string; middle?: string; last?: string; full?: string; native?: string; userPreferred?: string };
  image: { large?: string; medium?: string };
  description?: string;
  gender?: string;
  favourites?: number;
  siteUrl?: string;
  dateOfBirth?: { year?: number; month?: number; day?: number };
  age?: string;
  homeTown?: string;
  yearsActive?: string;
  staffMedia?: {
    pageInfo: { hasNextPage: boolean; total: number };
    edges: {
      staffRole?: string;
      characterRole?: string;
        node: {
          id: number;
          title: MediaTitle;
          coverImage: { large?: string; color?: string };
          type?: string;
          format?: string;
          episodes?: number;
          status?: string;
          meanScore?: number;
          startDate?: { year?: number };
        };
    }[];
  };
}

export interface MediaBasic {
  id: number;
  title: MediaTitle;
  coverImage: { extraLarge?: string; large?: string; medium?: string; color?: string };
  type?: string;
  format?: string;
  status?: string;
  episodes?: number;
  averageScore?: number;
  genres?: string[];
  season?: string;
  nextAiringEpisode?: { airingAt: number; episode: number; timeUntilAiring: number } | null;
}

const MEDIA_BASIC_FIELDS = `
  id
  title { romaji english native userPreferred }
  coverImage { extraLarge large medium color }
  type
  format
  status(version: 2)
  episodes
  averageScore
  genres
  season
  nextAiringEpisode { airingAt episode timeUntilAiring }
` as const;

export async function getRecommendationsByGenres(genres: string[], perPage = 18): Promise<Media[]> {
  if (genres.length === 0) return [];
  const mainGenre = genres[0];
  const q = `
    query ($g: String, $pp: Int) {
      Page(page: 1, perPage: $pp) {
        media(genre: $g, sort: [TRENDING_DESC, POPULARITY_DESC], type: ANIME, isAdult: false) { ${MEDIA_FIELDS} }
      }
    }`;
  const d = await gql(q, { g: mainGenre, pp: perPage });
  return (d.Page.media as Media[]) || [];
}

export async function getMediaBatch(ids: number[]): Promise<MediaBasic[]> {
  if (ids.length === 0) return [];
  const uniqueIds = [...new Set(ids)];
  const q = `query ($ids: [Int]) { Page(page: 1, perPage: 50) { media(id_in: $ids, type: ANIME) { ${MEDIA_BASIC_FIELDS} } } }`;
  const d = await gql(q, { ids: uniqueIds });
  return (d.Page.media as MediaBasic[]) || [];
}
