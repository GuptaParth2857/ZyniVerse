export interface MangaReaderSource {
  id: string;
  name: string;
  type: "official" | "fan";
  website: string;
  isLegal: boolean;
  isFree: boolean;
  languages: string[];
}

export interface MangaChapter {
  id: string;
  title: string;
  chapter: number;
  volume?: number;
  pages: number;
  source: string;
  language: string;
  url: string;
  isPaid: boolean;
}

export interface MangaPage {
  url: string;
  page: number;
  source: string;
}

export interface MangaDexManga {
  id: string;
  title: string;
  altTitles: string[];
  description: string;
  status: string;
  coverUrl?: string;
}

const SOURCES: MangaReaderSource[] = [
  {
    id: "mangadex",
    name: "MangaDex",
    type: "fan",
    website: "https://mangadex.org",
    isLegal: true,
    isFree: true,
    languages: ["en", "ja", "es", "pt", "fr", "de", "ru", "zh", "ko", "th", "vi", "id"],
  },
  {
    id: "mangaplus",
    name: "MangaPlus",
    type: "official",
    website: "https://mangaplus.shueisha.co.jp",
    isLegal: true,
    isFree: true,
    languages: ["en", "es", "th"],
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll Manga",
    type: "official",
    website: "https://www.crunchyroll.com/manga",
    isLegal: true,
    isFree: true,
    languages: ["en"],
  },
  {
    id: "comikey",
    name: "Comikey",
    type: "official",
    website: "https://comikey.com",
    isLegal: true,
    isFree: true,
    languages: ["en"],
  },
];

export function getSources(): MangaReaderSource[] {
  return SOURCES;
}

export function getSourcesForManga(title: string): MangaReaderSource[] {
  return SOURCES.filter((s) => {
    if (s.id === "mangadex") return true;
    if (s.id === "mangaplus") {
      const shueishaTitles = [
        "one piece", "my hero academia", "jujutsu kaisen", "chainsaw man",
        "dragon ball", "naruto", "boruto", "black clover", "hunter x hunter",
        "bleach", "demon slayer", "dr. stone", "haikyuu", "assassination classroom",
        "death note", "food wars", "the promised neverland", "yuuna and the haunted hot springs",
      ];
      return shueishaTitles.some((t) => title.toLowerCase().includes(t));
    }
    return true;
  });
}

export function getMangaDexSources(): MangaReaderSource[] {
  return SOURCES.filter((s) => s.id === "mangadex");
}

// MangaDex API helpers
export async function searchMangaDex(title: string): Promise<MangaDexManga[]> {
  try {
    const res = await fetch(
      `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=20&order[relevance]=desc`,
    );

    if (!res.ok) return [];

    const data = await res.json();
    const mangas: MangaDexManga[] = [];

    for (const item of data.data || []) {
      const titleAttr = item.attributes.title || {};
      const mainTitle = titleAttr.en || Object.values(titleAttr)[0] || "Unknown";

      const altTitles: string[] = [];
      for (const alt of item.attributes.altTitles || []) {
        const val = Object.values(alt as Record<string, string>)[0];
        if (val) altTitles.push(val);
      }

      const descObj = item.attributes.description || {};
      const description = descObj.en || Object.values(descObj)[0] || "";

      mangas.push({
        id: item.id,
        title: mainTitle,
        altTitles,
        description,
        status: item.attributes.status || "unknown",
      });
    }

    return mangas;
  } catch {
    return [];
  }
}

export async function getMangaDexChapters(mangaId: string, language = "en"): Promise<MangaChapter[]> {
  try {
    const limit = 500;
    const res = await fetch(
      `https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=${language}&limit=${limit}&order[chapter]=desc&contentRating[]=safe&contentRating[]=suggestive`,
    );

    if (!res.ok) return [];

    const data = await res.json();
    const chapters: MangaChapter[] = [];

    for (const item of data.data || []) {
      const attrs = item.attributes || {};
      const chapterNum = parseFloat(attrs.chapter) || 0;

      chapters.push({
        id: item.id,
        title: attrs.title || `Chapter ${chapterNum}`,
        chapter: chapterNum,
        volume: attrs.volume ? parseFloat(attrs.volume) : undefined,
        pages: 0,
        source: "mangadex",
        language: attrs.translatedLanguage || "en",
        url: `https://mangadex.org/chapter/${item.id}`,
        isPaid: false,
      });
    }

    return chapters;
  } catch {
    return [];
  }
}

export async function getMangaDexChapterPages(chapterId: string): Promise<MangaPage[]> {
  try {
    const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);

    if (!res.ok) return [];

    const data = await res.json();
    const baseUrl = data.baseUrl || "https://uploads.mangadex.org";
    const chapter = data.chapter || {};
    const hash = chapter.hash || "";
    const pages = chapter.data || [];

    return pages.map((filename: string, index: number) => ({
      url: `${baseUrl}/data/${hash}/${filename}`,
      page: index + 1,
      source: "mangadex",
    }));
  } catch {
    return [];
  }
}

export function getReadUrl(chapter: MangaChapter): string {
  if (chapter.source === "mangadex") {
    return chapter.url;
  }
  if (chapter.source === "mangaplus") {
    return `https://mangaplus.shueisha.co.jp/viewer/${chapter.id}`;
  }
  return chapter.url;
}
