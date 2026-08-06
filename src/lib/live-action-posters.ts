import { prisma } from "./prisma";
import { logError } from "@/lib/logger";

const WIKI_EN = "https://en.wikipedia.org/w/api.php";
const WIKI_JA = "https://ja.wikipedia.org/w/api.php";
const UA = "ZyniVersePosterSync/1.0 (https://zyverse.in)";

export interface PosterConfig {
  entryId: string;
  queries: Array<{ title: string; lang?: "en" | "ja" }>;
  directFile?: string;
}

export const POSTER_CONFIGS: PosterConfig[] = [
  { entryId: "look-back-la", queries: [{ title: "Look Back (2026 film)" }], directFile: "File:Look Back (2026) poster.jpg" },
  { entryId: "kingdom-5th-film", queries: [{ title: "Kingdom 5: The Clash of Souls" }] },
  { entryId: "gundam-live-action", queries: [{ title: "Gundam (film)" }] },
  { entryId: "voltron-live-action", queries: [{ title: "Voltron (2027 film)" }, { title: "Voltron (2026 film)" }] },
  { entryId: "one-piece-la-s3", queries: [{ title: "One Piece (2023 TV series)" }] },
  { entryId: "naruto-live-action", queries: [{ title: "Naruto (2027 film)" }] },
  { entryId: "my-hero-academia-film", queries: [{ title: "My Hero Academia (film)" }] },
  { entryId: "sakamoto-days-film", queries: [{ title: "Sakamoto Days (film)" }] },
  { entryId: "dragon-ball-live-action", queries: [{ title: "Dragon Ball (2027 film)" }] },
  { entryId: "your-name-live-action", queries: [{ title: "Your Name (2026 film)" }, { title: "Your Name (live-action film)" }] },
  { entryId: "one-punch-man-netflix", queries: [{ title: "One Punch Man (film)" }] },
  { entryId: "solo-leveling-live-action", queries: [{ title: "Solo Leveling (TV series)" }] },
  { entryId: "blue-lock-la", queries: [{ title: "Blue Lock (film)" }, { title: "Blue Lock (2027 film)" }] },
  { entryId: "spy-x-family-live-action", queries: [{ title: "Spy × Family (film)" }, { title: "Spy x Family (film)" }] },
  { entryId: "detective-pikachu-2", queries: [{ title: "Detective Pikachu 2 (film)" }] },
  { entryId: "bleach-thousand-year-war-film", queries: [{ title: "Bleach: Thousand-Year Blood War" }] },
];

export interface PosterInfo {
  page: string;
  file?: string;
  url: string;
  updatedAt: string;
}

export interface PosterCache {
  version: number;
  lastUpdated: string;
  posters: Record<string, PosterInfo>;
}

const CACHE_KEY = "live-action-posters";

const DEFAULT_CACHE: PosterCache = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  posters: {},
};

async function wikiFetch(url: string): Promise<any> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Wikipedia ${res.status} for ${url}`);
  return res.json();
}

function cleanUrl(url?: string): string {
  return (url || "").split("?")[0];
}

interface PageResult {
  title: string;
  missing: boolean;
  thumbnail?: string;
  files: string[];
}

async function fetchPages(api: string, titles: string[]): Promise<Map<string, PageResult>> {
  const map = new Map<string, PageResult>();
  const CHUNK = 20;
  for (let i = 0; i < titles.length; i += CHUNK) {
    const chunk = titles.slice(i, i + CHUNK);
    const uri = `${api}?action=query&format=json&prop=pageimages|images&imlimit=30&piprop=thumbnail&pithumbsize=600&redirects=1&titles=${encodeURIComponent(chunk.join("|"))}`;
    const data = await wikiFetch(uri);
    const redirects = new Map((data.query?.redirects || []).map((r: any) => [r.from, r.to]));
    for (const page of Object.values(data.query?.pages || {})) {
      const p = page as any;
      const resolvedTitle = redirects.get(p.title) || p.title;
      if (p.missing || typeof p.missing !== "undefined") {
        map.set(resolvedTitle, { title: resolvedTitle, missing: true, files: [] });
      } else {
        map.set(resolvedTitle, {
          title: resolvedTitle,
          missing: false,
          thumbnail: p.thumbnail?.source ? cleanUrl(p.thumbnail.source) : undefined,
          files: (p.images || []).map((i: any) => i.title),
        });
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return map;
}

async function fetchFileThumbs(api: string, files: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const CHUNK = 20;
  for (let i = 0; i < files.length; i += CHUNK) {
    const chunk = files.slice(i, i + CHUNK);
    const uri = `${api}?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=600&titles=${encodeURIComponent(chunk.join("|"))}`;
    const data = await wikiFetch(uri);
    for (const page of Object.values(data.query?.pages || {})) {
      const p = page as any;
      const url = cleanUrl(p.imageinfo?.[0]?.thumburl);
      if (url) map.set(p.title, url);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return map;
}

function pickPosterFile(files: string[]): string | undefined {
  return files.find((f) => !/logo|icon|flag|svg/i.test(f) && /poster|ポスター|\.(jpe?g|png|webp)$/i.test(f));
}

export async function getPosterCache(): Promise<PosterCache> {
  try {
    const row = await prisma.epgCache.findFirst({ where: { channelId: CACHE_KEY } });
    if (!row) return DEFAULT_CACHE;
    const cache = row.data as unknown as PosterCache;
    if (cache.version !== 1) return DEFAULT_CACHE;
    return cache;
  } catch (error) {
    console.error("[posters] Error reading poster cache:", error);
    return DEFAULT_CACHE;
  }
}

async function savePosterCache(cache: PosterCache): Promise<void> {
  try {
    await prisma.epgCache.upsert({
      where: { channelId: CACHE_KEY },
      update: { data: JSON.parse(JSON.stringify(cache)) },
      create: { channelId: CACHE_KEY, data: JSON.parse(JSON.stringify(cache)) },
    });
  } catch (error) {
    console.error("[posters] Error saving poster cache:", error);
  }
}

export interface SyncResult {
  entryId: string;
  matched: boolean;
  page?: string;
  file?: string;
  url?: string;
}

export async function syncLiveActionPosters(): Promise<{ results: SyncResult[]; errors: string[] }> {
  const results: SyncResult[] = [];
  const errors: string[] = [];

  const byLang: Record<string, string[]> = { en: [], ja: [] };
  for (const config of POSTER_CONFIGS) {
    for (const query of config.queries) {
      const lang = query.lang || "en";
      if (!byLang[lang].includes(query.title)) byLang[lang].push(query.title);
    }
  }

  const enApi = WIKI_EN;
  const jaApi = WIKI_JA;

  const resolved = new Map<string, PosterInfo>();

  try {
    const [enPages, jaPages] = await Promise.all([
      fetchPages(enApi, byLang.en),
      fetchPages(jaApi, byLang.ja),
    ]);

    const thumbHits = new Set<string>();

    for (const config of POSTER_CONFIGS) {
      for (const query of config.queries) {
        const lang = query.lang || "en";
        const pages = lang === "ja" ? jaPages : enPages;
        const page = pages.get(query.title);
        if (!page || page.missing) continue;

        if (page.thumbnail) {
          resolved.set(config.entryId, { page: page.title, url: page.thumbnail, updatedAt: new Date().toISOString() });
          break;
        }

        const poster = pickPosterFile(page.files);
        if (poster) {
          resolved.set(config.entryId, {
            page: page.title,
            file: poster,
            url: "pending:" + poster,
            updatedAt: new Date().toISOString(),
          });
          thumbHits.add(poster);
          break;
        }
      }
    }

    if (thumbHits.size > 0) {
      const thumbUrls = await fetchFileThumbs(enApi, Array.from(thumbHits));
      for (const config of POSTER_CONFIGS) {
        const info = resolved.get(config.entryId);
        if (info && info.url.startsWith("pending:")) {
          const file = info.url.slice(8);
          const url = thumbUrls.get(file);
          if (url) info.url = url;
          else resolved.delete(config.entryId);
        }
      }
    }

    const directFiles = POSTER_CONFIGS.filter((c) => c.directFile && !resolved.has(c.entryId)).map((c) => c.directFile as string);
    if (directFiles.length > 0) {
      const directThumbs = await fetchFileThumbs(enApi, directFiles);
      for (const config of POSTER_CONFIGS) {
        if (config.directFile && !resolved.has(config.entryId)) {
          const url = directThumbs.get(config.directFile);
          if (url) resolved.set(config.entryId, { page: config.directFile, file: config.directFile, url, updatedAt: new Date().toISOString() });
        }
      }
    }
  } catch (error) {
    logError(error);
    errors.push(`batch: ${String(error)}`);
  }

  const existing = await getPosterCache();
  const posters = { ...existing.posters };

  for (const config of POSTER_CONFIGS) {
    const info = resolved.get(config.entryId);
    if (info) {
      posters[config.entryId] = info;
      results.push({ entryId: config.entryId, matched: true, page: info.page, file: info.file, url: info.url });
    } else {
      delete posters[config.entryId];
      results.push({ entryId: config.entryId, matched: false });
    }
  }

  await savePosterCache({
    version: 1,
    lastUpdated: new Date().toISOString(),
    posters,
  });

  return { results, errors };
}
