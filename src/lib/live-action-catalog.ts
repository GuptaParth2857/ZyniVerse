import { prisma } from "./prisma";
import { searchMedia, type Media } from "./anilist";
import { LIVE_ACTION_ANIME, type LiveActionAnime } from "./live-action-anime";

export interface DiscoveredLiveAction {
  id: string;
  title: string;
  type: "series" | "movie";
  status: "available" | "upcoming" | "cancelled";
  releaseYear: number;
  posterUrl?: string;
  description: string;
  wikipediaUrl?: string;
  wikipediaPageId?: number;
  source: string;
  anilistId?: number;
  anilistRating?: number;
  anilistEpisodes?: number;
  anilistSourceStatus?: string;
  anilistGenres?: string[];
  lastEnrichedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveActionCatalogCache {
  version: number;
  lastUpdated: string;
  entries: DiscoveredLiveAction[];
}

const CACHE_KEY = "live-action-catalog";
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_UA = "ZyniVerse/1.0 (https://zyverse.in; live-action catalog sync)";
const ANILIST_ENRICH_BATCH = 20;
const WIKI_BATCH_SIZE = 20;

const FALLBACK_POSTERS: Record<string, string> = {
  "scooby-doo-origins": "https://upload.wikimedia.org/wikipedia/en/5/53/Scooby-Doo.png",
};

const CATEGORIES: { category: string; type: "movie" | "series"; source: string }[] = [
  { category: "Category:Live-action films based on manga", type: "movie", source: "wikipedia:manga-film" },
  { category: "Category:Live-action television shows based on animated series", type: "series", source: "wikipedia:animated-tv" },
];

const EXCLUDE_TITLE = /\((unproduced|cancelled|canceled|upcoming)[^)]*\)/i;

export function normalizeTitle(t: string): string {
  return (t || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function stripSuffix(title: string): string {
  return (title || "").replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function slugify(title: string): string {
  const base = (title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base || `la-${Date.now()}`;
}

function extractYear(text: string): number | undefined {
  if (!text) return undefined;
  const contextual = /(?:live-action|premiered|released|first aired|first airdate|started broadcasting)[^.]{0,80}?((?:19|20)\d{2})/i.exec(text);
  if (contextual) return parseInt(contextual[1], 10);
  const m = /(?:^|\D)((?:19|20)\d{2})(?:\D|$)/.exec(text);
  return m ? parseInt(m[1], 10) : undefined;
}

function deriveStatus(year: number, anilistStatus?: string): "available" | "upcoming" {
  if (anilistStatus === "NOT_YET_RELEASED") return "upcoming";
  if (year > new Date().getFullYear()) return "upcoming";
  return "available";
}

async function fetchCategoryMembers(category: string): Promise<string[]> {
  const titles: string[] = [];
  let cmcontinue: string | undefined;
  let attempts = 0;
  do {
    const params = new URLSearchParams({
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmlimit: "500",
      cmtype: "page",
      format: "json",
    });
    if (cmcontinue) params.set("cmcontinue", cmcontinue);
    const res = await fetch(`${WIKI_API}?${params}`, { headers: { "User-Agent": WIKI_UA } });
    if (!res.ok) break;
    const json = (await res.json()) as {
      query?: { categorymembers: { title: string }[] };
      continue?: { cmcontinue: string };
    };
    for (const m of json.query?.categorymembers || []) titles.push(m.title);
    cmcontinue = json.continue?.cmcontinue;
    attempts++;
  } while (cmcontinue && attempts < 20);
  return titles;
}

interface WikiPageInfo {
  pageid?: number;
  thumbnail?: { source: string };
  extract?: string;
  finalTitle?: string;
}

async function fetchWikipediaBatch(rawTitles: string[]): Promise<Map<string, WikiPageInfo>> {
  const result = new Map<string, WikiPageInfo>();
  for (let i = 0; i < rawTitles.length; i += WIKI_BATCH_SIZE) {
    const chunk = rawTitles.slice(i, i + WIKI_BATCH_SIZE);
    const params = new URLSearchParams({
      action: "query",
      prop: "pageimages|extracts",
      format: "json",
      piprop: "thumbnail",
      pithumbsize: "600",
      pilicense: "any",
      pilimit: "max",
      exintro: "1",
      explaintext: "1",
      exlimit: "max",
      redirects: "1",
      titles: chunk.join("|"),
    });
    const res = await fetch(`${WIKI_API}?${params}`, { headers: { "User-Agent": WIKI_UA } });
    if (!res.ok) continue;
    const json = (await res.json()) as {
      query?: {
        pages?: Record<string, { pageid?: number; title: string; thumbnail?: { source: string }; extract?: string; missing?: string }>;
        normalized?: { from: string; to: string }[];
        redirects?: { from: string; to: string }[];
      };
    };
    const pagesByTitle = new Map<string, { pageid?: number; title: string; thumbnail?: { source: string }; extract?: string; missing?: string }>();
    for (const key of Object.keys(json.query?.pages || {})) {
      const page = json.query!.pages![key];
      pagesByTitle.set(page.title.toLowerCase(), page);
    }
    const normalized = new Map((json.query?.normalized || []).map((n) => [n.from.toLowerCase(), n.to]));
    const redirects = new Map((json.query?.redirects || []).map((r) => [r.from.toLowerCase(), r.to]));
    for (const c of chunk) {
      let cur = c;
      const norm = normalized.get(c.toLowerCase());
      if (norm) cur = norm;
      const redir = redirects.get(cur.toLowerCase());
      if (redir) cur = redir;
      const page = pagesByTitle.get(cur.toLowerCase());
      if (page && !page.missing) {
        result.set(c, {
          pageid: page.pageid,
          thumbnail: page.thumbnail ? { ...page.thumbnail, source: page.thumbnail.source.split("?")[0] } : page.thumbnail,
          extract: page.extract,
          finalTitle: page.title,
        });
      }
    }
  }
  return result;
}

function scoreMedia(media: Media, query: string): number {
  const q = query.toLowerCase();
  const titles = [media.title?.english, media.title?.romaji, media.title?.userPreferred, media.title?.native]
    .filter(Boolean)
    .map((t) => (t as string).toLowerCase());
  let score = 0;
  for (const t of titles) {
    if (t === q) score = Math.max(score, 100);
    else if (t.includes(q)) score = Math.max(score, 60);
    else if (q.includes(t) && t.length > 4) score = Math.max(score, 40);
  }
  if (media.popularity) score += Math.min(media.popularity / 1000, 10);
  return score;
}

async function enrichWithAnilist(title: string): Promise<Partial<DiscoveredLiveAction> | null> {
  try {
    const query = title.split(" (")[0];
    const result = await searchMedia({ search: query, type: "ANIME", perPage: 5, sort: "POPULARITY_DESC" });
    let best: Media | null = null;
    let bestScore = 0;
    for (const m of result.media) {
      const s = scoreMedia(m, title);
      if (s > bestScore) {
        bestScore = s;
        best = m;
      }
    }
    if (!best || bestScore < 40) return null;
    return {
      anilistId: best.id,
      anilistRating: best.averageScore || undefined,
      anilistEpisodes: best.episodes || undefined,
      anilistSourceStatus: best.status || undefined,
      anilistGenres: best.genres || [],
    };
  } catch {
    return null;
  }
}

async function getLiveActionCatalog(): Promise<DiscoveredLiveAction[]> {
  try {
    const row = await prisma.epgCache.findFirst({ where: { channelId: CACHE_KEY } });
    if (!row) return [];
    const cache = row.data as unknown as LiveActionCatalogCache;
    if (cache.version !== 1) return [];
    return cache.entries || [];
  } catch {
    return [];
  }
}

async function saveCatalog(cache: LiveActionCatalogCache): Promise<void> {
  try {
    await prisma.epgCache.upsert({
      where: { channelId: CACHE_KEY },
      update: { data: JSON.parse(JSON.stringify(cache)) },
      create: { channelId: CACHE_KEY, data: JSON.parse(JSON.stringify(cache)) },
    });
  } catch (error) {
    console.error("[live-action-catalog] Error saving cache:", error);
  }
}

export async function syncLiveActionCatalog(): Promise<{ total: number; added: number; enriched: number }> {
  const existing = await getLiveActionCatalog();
  const byNorm = new Map(existing.map((e) => [normalizeTitle(e.title), e]));
  const staticNorms = new Set<string>();
  for (const a of LIVE_ACTION_ANIME) {
    staticNorms.add(normalizeTitle(a.title));
    if (a.japaneseTitle) staticNorms.add(normalizeTitle(a.japaneseTitle));
  }

  const discoveredRaw = new Map<string, { title: string; type: "movie" | "series"; source: string }>();
  for (const cfg of CATEGORIES) {
    const members = await fetchCategoryMembers(cfg.category);
    for (const title of members) {
      if (EXCLUDE_TITLE.test(title)) continue;
      if (/^list of /i.test(title)) continue;
      if (staticNorms.has(normalizeTitle(title))) continue;
      if (staticNorms.has(normalizeTitle(stripSuffix(title)))) continue;
      discoveredRaw.set(normalizeTitle(title), { title, type: cfg.type, source: cfg.source });
    }
  }

  const now = new Date().toISOString();
  const fresh = new Map<string, DiscoveredLiveAction>();
  let added = 0;

  for (const norm of discoveredRaw.keys()) {
    const spec = discoveredRaw.get(norm)!;
    const prev = byNorm.get(norm);
    if (prev) {
      fresh.set(norm, prev);
    } else {
      fresh.set(norm, {
        id: slugify(spec.title),
        title: spec.title,
        type: spec.type,
        status: "available",
        releaseYear: 0,
        description: "",
        source: spec.source,
        createdAt: now,
        updatedAt: now,
      });
      added++;
    }
  }

  const usedIds = new Set(LIVE_ACTION_ANIME.map((a) => a.id));
  for (const e of fresh.values()) {
    let id = e.id || slugify(e.title);
    if (usedIds.has(id)) {
      let n = 2;
      while (usedIds.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    e.id = id;
    usedIds.add(id);
  }

  const needsWiki = [...fresh.values()].filter((e) => !e.wikipediaPageId || !e.description || !e.posterUrl || (e.posterUrl && e.posterUrl.includes("?")));
  const wikiMap = await fetchWikipediaBatch(needsWiki.map((e) => e.title));
  for (const e of fresh.values()) {
    const info = wikiMap.get(e.title);
    if (!info) continue;
    const year = extractYear(info.extract ?? "");
    if (info.thumbnail?.source) e.posterUrl = info.thumbnail.source.split("?")[0];
    e.description = (info.extract || e.description).slice(0, 400);
    e.wikipediaPageId = info.pageid || e.wikipediaPageId;
    if (info.finalTitle) {
      e.wikipediaUrl = `https://en.wikipedia.org/wiki/${info.finalTitle.replace(/ /g, "_")}`;
    }
    e.releaseYear = year || e.releaseYear;
    e.status = deriveStatus(e.releaseYear, undefined);
    e.updatedAt = now;
  }

  for (const e of fresh.values()) {
    if (!e.posterUrl && FALLBACK_POSTERS[e.id]) e.posterUrl = FALLBACK_POSTERS[e.id];
  }

  let enriched = 0;
  const anilistQueue = [...fresh.values()].filter((e) => !e.anilistId);
  for (const e of anilistQueue.slice(0, ANILIST_ENRICH_BATCH)) {
    const match = await enrichWithAnilist(e.title);
    if (match) {
      Object.assign(e, match);
      e.lastEnrichedAt = now;
      e.updatedAt = now;
      e.status = deriveStatus(e.releaseYear, match.anilistSourceStatus);
      enriched++;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  await saveCatalog({ version: 1, lastUpdated: now, entries: [...fresh.values()] });
  return { total: fresh.size, added, enriched };
}

export async function getLiveActionCatalogEntries(): Promise<DiscoveredLiveAction[]> {
  return getLiveActionCatalog();
}

export function catalogToLiveAction(e: DiscoveredLiveAction): LiveActionAnime {
  return {
    id: e.id,
    title: e.title,
    type: e.type,
    status: e.status,
    releaseYear: e.releaseYear || 0,
    platforms: [],
    languages: [],
    genres: e.anilistGenres || [],
    rating: e.anilistRating ? Math.round(e.anilistRating / 10) : 0,
    popularity: 0,
    description: e.description || "No description available yet.",
    basedOn: "",
    posterUrl: e.posterUrl,
  };
}
