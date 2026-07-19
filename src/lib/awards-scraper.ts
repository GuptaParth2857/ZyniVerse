import RssParser from "rss-parser";
import * as cheerio from "cheerio";

const rssParser = new RssParser();

export interface ScrapedAward {
  year: number;
  category: string;
  winner: string;
  platform: string;
  type: "anime" | "manga" | "live-action" | "character" | "music";
  image?: string;
  malId?: number;
  anilistId?: number;
  source?: string;
}

const AWARD_CATEGORY_MAP: Record<string, string> = {
  "anime of the year": "Anime of the Year",
  "best anime": "Anime of the Year",
  "best animation": "Best Animation",
  "best animated series": "Best Animation",
  "best action": "Best Action",
  "best romance": "Best Romance",
  "best comedy": "Best Comedy",
  "best fantasy": "Best Fantasy",
  "best drama": "Best Drama",
  "best slice of life": "Best Slice of Life",
  "best film": "Best Film",
  "best movie": "Best Film",
  "best new series": "Best New Series",
  "best continuing series": "Best Continuing Series",
  "best score": "Best Score",
  "best character design": "Best Character Design",
  "best director": "Best Director",
  "best opening": "Best Opening",
  "best ending": "Best Ending",
  "best va performance": "Best VA Performance",
  "best voice actor": "Best VA Performance",
  "best boy": "Best Boy",
  "best girl": "Best Girl",
  "best couple": "Best Couple",
  "best tv anime": "Best TV Anime",
  "best male character": "Best Male Character",
  "best female character": "Best Female Character",
  "best soundtrack": "Best Soundtrack",
  "best manga": "Best Manga",
  "best original anime": "Best Original Anime",
  "best isekai": "Best Isekai",
  "best background art": "Best Background Art",
  "best main character": "Best Main Character",
  "best supporting character": "Best Supporting Character",
  "best anime song": "Best Anime Song",
  "film of the year": "Best Film",
};

function normalizeCategory(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [key, val] of Object.entries(AWARD_CATEGORY_MAP)) {
    if (lower.includes(key)) return val;
  }
  return raw.trim();
}

function inferType(category: string, winner: string): ScrapedAward["type"] {
  const c = category.toLowerCase();
  const w = winner.toLowerCase();
  if (c.includes("va") || c.includes("voice") || c.includes("performance") || c.includes("boy") || c.includes("girl") || c.includes("couple") || c.includes("character") || w.includes("as ") || w.includes(" voice")) return "character";
  if (c.includes("opening") || c.includes("ending") || c.includes("soundtrack") || c.includes("music")) return "music";
  if (c.includes("manga")) return "manga";
  if (c.includes("film") || c.includes("movie")) return "anime";
  return "anime";
}

function inferYearFromTitle(title: string): number | null {
  const match = title.match(/(20[2-3]\d)/);
  return match ? parseInt(match[1], 10) : null;
}

export async function scrapeAnimeNewsNetwork(): Promise<ScrapedAward[]> {
  const awards: ScrapedAward[] = [];
  try {
    const feed = await rssParser.parseURL("https://www.animenewsnetwork.com/encyclopedia/rss.xml");
    for (const item of feed.items.slice(0, 50)) {
      const title = item.title || "";
      const lower = title.toLowerCase();
      if (!lower.includes("award") && !lower.includes("winner") && !lower.includes("best")) continue;
      const year = inferYearFromTitle(title) || new Date().getFullYear();
      awards.push({
        year,
        category: normalizeCategory(title),
        winner: title,
        platform: "Anime News Network",
        type: inferType(title, title),
        source: item.link || undefined,
      });
    }
  } catch (e) {
    console.error("ANN RSS scrape failed:", e);
  }
  return awards;
}

export async function scrapeMAL(): Promise<ScrapedAward[]> {
  const awards: ScrapedAward[] = [];
  try {
    const currentYear = new Date().getFullYear();
    for (const year of [currentYear, currentYear - 1]) {
      const url = `https://myanimelist.net/anime/awards/${year}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (ZyniVerse Awards Bot)" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      $(".award-item, .nomination, tr").each((_, el) => {
        const category = $(el).find(".award-title, td:first-child").text().trim();
        const winner = $(el).find(".anime-title, .nominee-title, td:nth-child(2) a").text().trim();
        if (!category || !winner) return;
        awards.push({
          year,
          category: normalizeCategory(category),
          winner,
          platform: "MyAnimeList",
          type: inferType(category, winner),
          source: url,
        });
      });
    }
  } catch (e) {
    console.error("MAL scrape failed:", e);
  }
  return awards;
}

export async function scrapeCrunchyroll(): Promise<ScrapedAward[]> {
  const awards: ScrapedAward[] = [];
  const currentYear = new Date().getFullYear();
  const urls = [
    `https://www.crunchyroll.com/news/latest/${currentYear}/3/2/anime-awards-${currentYear}-winners-list`,
    `https://www.crunchyroll.com/news/latest/${currentYear}/5/22/anime-awards-${currentYear}-winners-list`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (ZyniVerse Awards Bot)" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      const year = inferYearFromTitle(html) || currentYear;

      $("[class*='award'], [class*='winner'], h2, h3").each((_, el) => {
        const text = $(el).text().trim();
        if (!text.toLowerCase().includes("best") && !text.toLowerCase().includes("anime of") && !text.toLowerCase().includes("film of")) return;
        const winner = $(el).next().text().trim() || $(el).find("a").text().trim();
        if (!winner) return;
        awards.push({
          year,
          category: normalizeCategory(text),
          winner,
          platform: "Crunchyroll",
          type: inferType(text, winner),
          source: url,
        });
      });

      if (awards.length > 0) break;
    } catch (e) {
      console.error(`Crunchyroll scrape failed for ${url}:`, e);
    }
  }
  return awards;
}

export async function scrapeAnimeCorner(): Promise<ScrapedAward[]> {
  const awards: ScrapedAward[] = [];
  const currentYear = new Date().getFullYear();
  try {
    const url = `https://animecorner.me/crunchyroll-anime-awards-${currentYear}-winners-full-results-list/`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (ZyniVerse Awards Bot)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return awards;
    const html = await res.text();
    const $ = cheerio.load(html);

    const lines = html.split("\n");
    let currentCategory = "";
    for (const line of lines) {
      const text = line.replace(/<[^>]*>/g, "").trim();
      if (!text) continue;

      const lower = text.toLowerCase();
      if (lower.startsWith("**winner:**") || lower.startsWith("winner:")) {
        const winner = text.replace(/^\*?\*?Winner:\*?\*?\s*/i, "").trim().replace(/\*+/g, "");
        if (winner && currentCategory) {
          awards.push({
            year: currentYear,
            category: normalizeCategory(currentCategory),
            winner,
            platform: "Crunchyroll",
            type: inferType(currentCategory, winner),
            source: url,
          });
        }
      } else if (lower.startsWith("**") && lower.includes("anime of") || lower.startsWith("**") && lower.includes("best ")) {
        currentCategory = text.replace(/\*\*/g, "").trim();
      }
    }
  } catch (e) {
    console.error("Anime Corner scrape failed:", e);
  }
  return awards;
}

export async function scrapeAllSources(): Promise<{ awards: ScrapedAward[]; errors: string[] }> {
  const errors: string[] = [];
  const results = await Promise.allSettled([
    scrapeAnimeNewsNetwork(),
    scrapeMAL(),
    scrapeCrunchyroll(),
    scrapeAnimeCorner(),
  ]);

  const allAwards: ScrapedAward[] = [];
  const sources = ["ANN", "MAL", "Crunchyroll", "Anime Corner"];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      allAwards.push(...r.value);
    } else {
      errors.push(`${sources[i]}: ${r.reason}`);
    }
  });

  return { awards: allAwards, errors };
}

export interface ScrapedNominee {
  category: string;
  title: string;
  image?: string;
  malId?: number;
  anilistId?: number;
}

export async function scrapeCrunchyrollNominees(year: number): Promise<ScrapedNominee[]> {
  const nominees: ScrapedNominee[] = [];
  try {
    const url = `https://www.crunchyroll.com/news/latest/${year}/1/anime-awards-${year}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (ZyniVerse Awards Bot)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return nominees;
    const html = await res.text();
    const $ = cheerio.load(html);

    let currentCategory = "";
    $("[class*='award'], [class*='category'], h2, h3, h4").each((_, el) => {
      const text = $(el).text().trim();
      const lower = text.toLowerCase();
      if (lower.includes("best ") || lower.includes("anime of") || lower.includes("film of") || lower.includes("character")) {
        currentCategory = normalizeCategory(text);
      }
      if (currentCategory) {
        $(el).find("a, .nominee, [class*='nominee']").each((_, n) => {
          const title = $(n).text().trim();
          const image = $(n).find("img").attr("src") || undefined;
          if (title && title.length > 1 && title.length < 100) {
            nominees.push({
              category: currentCategory,
              title,
              image,
            });
          }
        });
      }
    });
  } catch (e) {
    console.error("Crunchyroll nominees scrape failed:", e);
  }
  return nominees;
}

export async function scrapeATANominees(year: number): Promise<ScrapedNominee[]> {
  const nominees: ScrapedNominee[] = [];
  try {
    const url = `https://www.anitrendz.com/ata-${year}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (ZyniVerse Awards Bot)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return nominees;
    const html = await res.text();
    const $ = cheerio.load(html);

    let currentCategory = "";
    $(".category-section, .award-category, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 3 && text.length < 80) {
        currentCategory = normalizeCategory(text);
      }
      $(el).find(".nominee-item, .candidate, li").each((_, n) => {
        const title = $(n).find(".title, .name, a").first().text().trim();
        const image = $(n).find("img").attr("src") || undefined;
        if (title && currentCategory) {
          nominees.push({ category: currentCategory, title, image });
        }
      });
    });
  } catch (e) {
    console.error("ATA nominees scrape failed:", e);
  }
  return nominees;
}

export async function scrapeAllNominees(year: number): Promise<{ nominees: ScrapedNominee[]; errors: string[] }> {
  const errors: string[] = [];
  const results = await Promise.allSettled([
    scrapeCrunchyrollNominees(year),
    scrapeATANominees(year),
  ]);

  const allNominees: ScrapedNominee[] = [];
  const sources = ["Crunchyroll", "Anime Trending"];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      allNominees.push(...r.value);
    } else {
      errors.push(`${sources[i]} nominees: ${r.reason}`);
    }
  });

  return { nominees: allNominees, errors };
}
