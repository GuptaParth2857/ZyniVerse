import { dedupedFetch } from "./wiki-cache";

interface WikiAnimeData {
  title: string;
  description: string;
  imageUrl: string | null;
  bannerUrl: string | null;
  summary: string;
}

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string;
  publishedAt: string;
  user: { username: string; avatar: string | null };
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isExternal: boolean;
  url: string;
}

const WIKI_ARTICLE_CACHE_TTL = 60 * 60 * 1000;

const FEATURED_ANIME = [
  "Naruto", "Jujutsu Kaisen", "One Piece", "Demon Slayer",
  "Attack on Titan", "Dragon Ball", "Death Note", "Bleach",
  "My Hero Academia", "Sword Art Online", "Fullmetal Alchemist",
  "Hunter × Hunter", "One-Punch Man", "Chainsaw Man", "Spy × Family",
  "Mob Psycho 100", "Frieren: Beyond Journey's End", "Solo Leveling",
  "Code Geass", "Steins;Gate", "Cowboy Bebop", "Neon Genesis Evangelion",
  "Vinland Saga", "Tokyo Ghoul", "Haikyuu!!", "Slam Dunk",
  "Gintama", "Konosuba", "Re:Zero", "Mushoku Tensei",
  "Dandadan", "Blue Lock", "Oshi no Ko", "Made in Abyss",
  "Sakamoto Days", "Kaiju No. 8", "Wind Breaker", "Ranking of Kings",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "post";
}

function cleanExtract(text: string, maxLen = 500): string {
  let clean = text
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length > maxLen) {
    clean = clean.substring(0, maxLen).replace(/\s+\S*$/, "") + "...";
  }
  return clean;
}

export async function searchWikipediaAnime(query: string): Promise<string[]> {
  return dedupedFetch(
    `wiki:search:${query}`,
    async () => {
      try {
        const res = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " anime")}&srlimit=10&format=json&origin=*`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.query?.search || []).map((r: any) => r.title).filter(Boolean);
      } catch {
        return [];
      }
    },
    WIKI_ARTICLE_CACHE_TTL
  );
}

export async function fetchWikipediaArticle(title: string): Promise<WikiArticle | null> {
  return dedupedFetch(
    `wiki:article:${title}`,
    async () => {
      try {
        const [summaryRes, htmlRes] = await Promise.all([
          fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
            { signal: AbortSignal.timeout(5000) }
          ),
          fetch(
            `https://en.wikipedia.org/api/rest_v1/page/mobile-html/${encodeURIComponent(title)}`,
            { signal: AbortSignal.timeout(8000) }
          ),
        ]);

        if (!summaryRes.ok) return null;
        const summary = await summaryRes.json();

        let fullContent = summary.extract || "";
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          const textContent = html
            .replace(/<[^>]+>/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (textContent.length > fullContent.length) {
            fullContent = textContent;
          }
        }

        const description = summary.description || "Anime article from Wikipedia";
        const wikiUrl = summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
        const imageUrl = summary.originalimage?.source || summary.thumbnail?.source || null;

        const markdownContent = `# ${summary.title || title}\n\n*${description}*\n\n${cleanExtract(fullContent, 2000)}\n\n---\n\n*Source: [Wikipedia](${wikiUrl})*`;

        return {
          id: `wiki-${slugify(title)}`,
          title: `${summary.title || title} — Anime Guide`,
          slug: `wiki-${slugify(title)}`,
          excerpt: description,
          content: markdownContent,
          coverImage: imageUrl,
          tags: "anime,wikipedia,guide,encyclopedia",
          publishedAt: summary.timestamp || new Date().toISOString(),
          user: { username: "Wikipedia", avatar: "https://en.wikipedia.org/static/favicon/wikipedia.ico" },
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          isExternal: true,
          url: wikiUrl,
        };
      } catch {
        return null;
      }
    },
    WIKI_ARTICLE_CACHE_TTL
  );
}

export async function fetchWikipediaAnimeArticles(count = 8): Promise<WikiArticle[]> {
  return dedupedFetch(
    `wiki:featured:${count}`,
    async () => {
      const shuffled = [...FEATURED_ANIME].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);

      const articles = await Promise.all(
        selected.map(name => fetchWikipediaArticle(name))
      );

      return articles.filter((a): a is WikiArticle => a !== null);
    },
    WIKI_ARTICLE_CACHE_TTL
  );
}

export async function fetchWikipediaAnimeArticlesByTag(tag: string, count = 8): Promise<WikiArticle[]> {
  const searchMap: Record<string, string[]> = {
    "naruto": ["Naruto", "Naruto Shippuden", "Boruto"],
    "jujutsu kaisen": ["Jujutsu Kaisen", "Gojo Satoru", "Itadori Yuji"],
    "demon slayer": ["Demon Slayer: Kimetsu no Yaiba", "Tanjiro", "Muzan Kibutsuji"],
    "one piece": ["One Piece", "Monkey D. Luffy", "Roronoa Zoro"],
    "bleach": ["Bleach (manga)", "Ichigo Kurosaki", "Bleach: Thousand-Year Blood War"],
    "attack on titan": ["Attack on Titan", "Eren Yeager", "Titan (Attack on Titan)"],
    "dragon ball": ["Dragon Ball", "Goku", "Dragon Ball Z"],
  };

  const searchTerms = searchMap[tag.toLowerCase()] || [tag];
  const allNames = searchTerms.flatMap(s => FEATURED_ANIME.includes(s) ? [s] : [s]);

  return dedupedFetch(
    `wiki:tag:${tag}:${count}`,
    async () => {
      const articles = await Promise.all(
        allNames.slice(0, count).map(name => fetchWikipediaArticle(name))
      );
      return articles.filter((a): a is WikiArticle => a !== null);
    },
    WIKI_ARTICLE_CACHE_TTL
  );
}

export async function searchAndFetchWikipediaArticles(query: string, count = 6): Promise<WikiArticle[]> {
  return dedupedFetch(
    `wiki:search-articles:${query}:${count}`,
    async () => {
      const titles = await searchWikipediaAnime(query);
      if (titles.length === 0) return [];

      const articles = await Promise.all(
        titles.slice(0, count).map(title => fetchWikipediaArticle(title))
      );

      return articles.filter((a): a is WikiArticle => a !== null);
    },
    WIKI_ARTICLE_CACHE_TTL
  );
}

const ANIME_WIKI_MAP: Record<string, string> = {
  "naruto": "Naruto",
  "naruto shippuden": "Naruto Shippuden",
  "jujutsu kaisen": "Jujutsu Kaisen",
  "jjk": "Jujutsu Kaisen",
  "demon slayer": "Demon Slayer: Kimetsu no Yaiba",
  "kimetsu no yaiba": "Demon Slayer: Kimetsu no Yaiba",
  "one piece": "One Piece",
  "bleach": "Bleach (manga)",
  "attack on titan": "Attack on Titan",
  "shingeki no kyojin": "Attack on Titan",
  "dragon ball": "Dragon Ball",
  "my hero academia": "My Hero Academia",
  "boku no hero": "My Hero Academia",
  "death note": "Death Note",
  "fullmetal alchemist": "Fullmetal Alchemist",
  "fma": "Fullmetal Alchemist",
  "hunter x hunter": "Hunter × Hunter",
  "hxh": "Hunter × Hunter",
  "sword art online": "Sword Art Online",
  "sao": "Sword Art Online",
  "tokyo ghoul": "Tokyo Ghoul",
  "one punch man": "One-Punch Man",
  "opm": "One-Punch Man",
  "spy x family": "Spy × Family",
  "chainsaw man": "Chainsaw Man",
  "vinland saga": "Vinland Saga",
  "mob psycho": "Mob Psycho 100",
  "haikyuu": "Haikyuu!!",
  "slam dunk": "Slam Dunk (manga)",
  "cowboy bebop": "Cowboy Bebop",
  "evangelion": "Neon Genesis Evangelion",
  "gintama": "Gintama",
  "frieren": "Frieren: Beyond Journey's End",
  "solo leveling": "Solo Leveling",
  "blue lock": "Blue Lock",
  "oshi no ko": "Oshi no Ko",
  "bocchi the rock": "Bocchi the Rock!",
  "ranking of kings": "Ranking of Kings",
  "made in abyss": "Made in Abyss",
  "code geass": "Code Geass",
  "steins gate": "Steins;Gate",
  "re:zero": "Re:Zero",
  "konosuba": "KonoSuba",
  "mushoku tensei": "Mushoku Tensei",
  "dandadan": "Dandadan",
  "sakamoto days": "Sakamoto Days",
  "wind breaker": "Wind Breaker (manga)",
  "kaiju no 8": "Kaiju No. 8",
};

function normalizeAnimeName(input: string): string | null {
  const lower = input.toLowerCase().trim();
  if (ANIME_WIKI_MAP[lower]) return ANIME_WIKI_MAP[lower];
  for (const [key, val] of Object.entries(ANIME_WIKI_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export async function fetchAnimeFromWikipedia(animeName: string): Promise<WikiAnimeData | null> {
  const wikiName = normalizeAnimeName(animeName) || animeName;
  return fetchWikipediaArticle(wikiName).then(article => {
    if (!article) return null;
    return {
      title: article.title,
      description: article.excerpt,
      imageUrl: article.coverImage,
      bannerUrl: article.coverImage,
      summary: article.content,
    };
  });
}

export function extractAnimeFromTitle(title: string): string | null {
  const lower = title.toLowerCase();

  for (const [key, wikiName] of Object.entries(ANIME_WIKI_MAP)) {
    if (lower.includes(key)) return wikiName;
  }

  const patterns = [
    /(?:watch order|filler guide|arc guide|complete guide|beginners guide|streaming)[\s:]+(.+?)(?:\s*[\(:]|\s*\d{4}\s*$|\s*$)/i,
    /^(.+?)[\s:]+(?:watch order|filler guide|arc guide|complete guide|beginners guide|streaming)/i,
    /(?:top \d+ anime|best anime|anime for)[\s:]+(.+?)(?:\s*[\(:]|\s*$)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const extracted = match[1].trim().replace(/\d{4}$/, "").replace(/[:\-–|]/g, "").trim();
      if (extracted.length > 2 && extracted.length < 60) {
        return extracted.charAt(0).toUpperCase() + extracted.slice(1);
      }
    }
  }

  return null;
}
