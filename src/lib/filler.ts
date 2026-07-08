const FILLER_JSON_URL = "https://github.com/AniraTeam/AniFiller/releases/latest/download/anifiller.json";

interface CacheEntry {
  data: FillerShow[];
  timestamp: number;
}

let fillerCache: CacheEntry | null = null;
const CACHE_TTL = 3600 * 1000;

export interface FillerEpisode {
  episode: number;
  title: string;
  type: "manga-canon" | "filler" | "mixed-manga" | "anime-canon";
  aired_date: string;
}

export interface FillerShow {
  slug: string;
  title: string;
  mappings: { anilist_id: number; mal_id: number };
  episodes: FillerEpisode[];
}

export async function getFillerData(): Promise<FillerShow[]> {
  if (fillerCache && Date.now() - fillerCache.timestamp < CACHE_TTL) {
    return fillerCache.data;
  }
  const res = await fetch(FILLER_JSON_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch filler data");
  const data: FillerShow[] = await res.json();
  fillerCache = { data, timestamp: Date.now() };
  return data;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function scrapeFillerFromSite(slug: string): Promise<FillerShow | null> {
  try {
    const res = await fetch(`https://www.animefillerlist.com/shows/${slug}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : slug;

    const episodeRegex = /<tr[^>]*>[\s\S]*?<td[^>]*class="[^"]*episode[^"]*"[^>]*>(\d+)<\/td>[\s\S]*?<td[^>]*class="[^"]*title[^"]*"[^>]*>([^<]*)<\/td>[\s\S]*?<td[^>]*class="[^"]*type[^"]*"[^>]*>([^<]*)<\/td>[\s\S]*?<td[^>]*class="[^"]*date[^"]*"[^>]*>([^<]*)<\/td>/gi;
    const episodes: FillerEpisode[] = [];
    let match;

    while ((match = episodeRegex.exec(html)) !== null) {
      const epNum = parseInt(match[1]);
      const epTitle = match[2].trim();
      const epType = match[3].trim().toLowerCase().replace(/\s+/g, "-");
      const epDate = match[4].trim();
      const typeMap: Record<string, "manga-canon" | "filler" | "mixed-manga" | "anime-canon"> = {
        "manga-canon": "manga-canon",
        "manga canon": "manga-canon",
        filler: "filler",
        "mixed-canon": "mixed-manga",
        "mixed-manga": "mixed-manga",
        "mixed canon": "mixed-manga",
        "anime-canon": "anime-canon",
        "anime canon": "anime-canon",
      };
      episodes.push({
        episode: epNum,
        title: epTitle || `Episode ${epNum}`,
        type: typeMap[epType] || "filler",
        aired_date: epDate,
      });
    }

    if (episodes.length === 0) return null;

    return {
      slug,
      title,
      mappings: { anilist_id: 0, mal_id: 0 },
      episodes,
    };
  } catch {
    return null;
  }
}

function computeQuickList(episodes: FillerEpisode[]): Record<string, string[]> {
  const grouped: Record<string, number[]> = {};
  for (const ep of episodes) {
    if (!grouped[ep.type]) grouped[ep.type] = [];
    grouped[ep.type].push(ep.episode);
  }
  const result: Record<string, string[]> = {};
  for (const [type, nums] of Object.entries(grouped)) {
    nums.sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = nums[0];
    let end = nums[0];
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === end + 1) {
        end = nums[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = nums[i];
        end = nums[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    result[type] = ranges;
  }
  return result;
}

export async function getFillerForAnime(anilistId: number, animeTitle?: string) {
  const all = await getFillerData();

  let show: FillerShow | null = all.find((s) => s.mappings.anilist_id === anilistId) || null;

  if (!show && animeTitle) {
    const slugs = [
      slugify(animeTitle),
      slugify(animeTitle.replace(/[^a-z0-9 ]/gi, "")),
    ];
    for (const s of slugs) {
      const scraped = await scrapeFillerFromSite(s);
      if (scraped) { show = scraped; break; }
    }
  }

  if (!show) return null;

  const total = show.episodes.length;
  const filler = show.episodes.filter((e) => e.type === "filler").length;
  const mangaCanon = show.episodes.filter((e) => e.type === "manga-canon").length;
  const animeCanon = show.episodes.filter((e) => e.type === "anime-canon").length;
  const mixed = show.episodes.filter((e) => e.type === "mixed-manga").length;

  return {
    slug: show.slug,
    title: show.title,
    total,
    filler,
    mangaCanon,
    animeCanon,
    mixed,
    fillerPercent: total > 0 ? Math.round((filler / total) * 100) : 0,
    episodes: show.episodes,
    quickList: computeQuickList(show.episodes),
  };
}

export async function getPopularFillerAnime(limit = 20) {
  const all = await getFillerData();
  const popularIds = [
    20, 1735, 21, 5114, 22319, 813, 16498, 11757, 23755,
    22147, 11061, 9253, 15335, 37521, 19815, 30276, 41467, 100, 150, 5116,
  ];
  const result: {
    id: number;
    title: string;
    slug: string;
    episodes: number;
    fillerPct: number;
    canonPct: number;
    mixedPct: number;
  }[] = [];
  for (const id of popularIds) {
    const show = all.find((s) => s.mappings.anilist_id === id);
    if (!show || show.episodes.length === 0) continue;
    const total = show.episodes.length;
    const filler = show.episodes.filter((e) => e.type === "filler").length;
    const mangaCanon = show.episodes.filter((e) => e.type === "manga-canon").length;
    const animeCanon = show.episodes.filter((e) => e.type === "anime-canon").length;
    const mixed = show.episodes.filter((e) => e.type === "mixed-manga").length;
    const canonTotal = mangaCanon + animeCanon;
    const fillerPct = total > 0 ? Math.round((filler / total) * 100) : 0;
    const canonPct = total > 0 ? Math.round((canonTotal / total) * 100) : 0;
    const mixedPct = total > 0 ? Math.round((mixed / total) * 100) : 0;
    result.push({ id, title: show.title, slug: show.slug, episodes: total, fillerPct, canonPct, mixedPct });
    if (result.length >= limit) break;
  }
  return result;
}

export function clearFillerCache(): void {
  fillerCache = null;
}

export type FillerResult = Awaited<ReturnType<typeof getFillerForAnime>>;
