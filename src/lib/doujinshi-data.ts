export interface DoujinshiEntry {
  id: string;
  title: string;
  circle: string;
  artist: string;
  parody: string;
  tags: string[];
  description: string;
  pages: number;
  language: string;
  isTranslated: boolean;
  externalUrl: string;
  image?: string;
}

const DOUJINSHI: DoujinshiEntry[] = [
  {
    id: "touhou-01",
    title: "Eastern Wonderland ~ Touhou Sangetsusei",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["fantasy", "magic", "original"],
    description: "Original Touhou Project fan works exploring Gensokyo's mysteries through the lens of the Three Fairies of Light.",
    pages: 32,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/db2777/2563eb?text=Eastern%20Wonderland%20~%20Touhou...",
    externalUrl: "https://mangadex.org/title/abcdefg",
  },
  {
    id: "touhou-02",
    title: "Ghostly Field Club ~ Dr.Latency's Freak Report",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["mystery", "supernatural", "original"],
    description: "A collection of short stories set in the Touhou universe, following the eccentric Dr. Latency and his investigations.",
    pages: 28,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/0891b2/e11d48?text=Ghostly%20Field%20Club%20~%20Dr.Lat...",
    externalUrl: "https://mangadex.org/title/ghostly-field-club",
  },
  {
    id: "clamp-kafka",
    title: "Kafka",
    circle: "CLAMP",
    artist: "CLAMP",
    parody: "Original",
    tags: ["fantasy", "drama", "original"],
    description: "An early original work by the legendary CLAMP circle before they became professional manga artists. A dark fantasy tale.",
    pages: 48,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/e11d48/a855f7?text=Kafka",
    externalUrl: "https://mangadex.org/title/kafka-clamp",
  },
  {
    id: "clamp-shirahime",
    title: "Shirahime-Syo",
    circle: "CLAMP",
    artist: "CLAMP",
    parody: "Original",
    tags: ["fantasy", "snow", "mythology", "original"],
    description: "A CLAMP original doujinshi about a snow spirit and her journey through a mystical winter landscape.",
    pages: 36,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/9333ea/ef4444?text=Shirahime-Syo",
    externalUrl: "https://mangadex.org/title/shirahime-syo",
  },
  {
    id: "yoshitoki-01",
    title: "Koe no Katachi Prototype",
    circle: "Yoshitoki",
    artist: "Yoshitoki Oima",
    parody: "Original",
    tags: ["drama", "slice-of-life", "disability", "original"],
    description: "The original doujinshi prototype that later became the acclaimed manga and film 'A Silent Voice'. A raw, emotional story about bullying and redemption.",
    pages: 64,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/2563eb/6366f1?text=Koe%20no%20Katachi%20Prototype",
    externalUrl: "https://mangadex.org/title/koe-no-katachi-prototype",
  },
  {
    id: "kemono-friends-01",
    title: "Welcome to Japari Park!",
    circle: "Various",
    artist: "Mine Yoshizaki",
    parody: "Kemono Friends",
    tags: ["adventure", "friendship", "animals", "original"],
    description: "Official fan works set in the Kemono Friends universe, exploring the daily lives of Friends in Japari Park.",
    pages: 24,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/ef4444/f59e0b?text=Welcome%20to%20Japari%20Park!",
    externalUrl: "https://mangadex.org/title/welcome-to-japari-park",
  },
  {
    id: "original-01",
    title: "The Girl Who Leapt Through Time",
    circle: "Various",
    artist: "Yasutaka Tsutsui",
    parody: "Original",
    tags: ["sci-fi", "time-travel", "romance", "original"],
    description: "Original doujinshi adaptations of the classic time travel story.",
    pages: 40,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/0891b2/e11d48?text=The%20Girl%20Who%20Leapt%20Through%20...",
    externalUrl: "https://mangadex.org/title/the-girl-who-leapt-through-time",
  },
  {
    id: "original-02",
    title: "Voices of a Distant Star",
    circle: "Various",
    artist: "Makoto Shinkai",
    parody: "Original",
    tags: ["sci-fi", "romance", "drama", "original"],
    description: "Doujinshi adaptations of Makoto Shinkai's early works exploring love across space and time.",
    pages: 36,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/9333ea/ef4444?text=Voices%20of%20a%20Distant%20Star",
    externalUrl: "https://mangadex.org/title/voices-of-a-distant-star",
  },
  {
    id: "touhou-03",
    title: "Curiosities of Lotus Asia",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["comedy", "fantasy", "everyday", "original"],
    description: "A Touhou Project fan work following Rinnosuke Morichika and his oddities shop in the Human Village.",
    pages: 30,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/9333ea/ef4444?text=Curiosities%20of%20Lotus%20Asia",
    externalUrl: "https://mangadex.org/title/curiosities-of-lotus-asia",
  },
  {
    id: "touhou-04",
    title: "Eastern and Little Nature Deity",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["comedy", "fantasy", "nature", "original"],
    description: "Follow the mischievous Three Fairies of Light as they explore Gensokyo and cause chaos.",
    pages: 34,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/c026d3/059669?text=Eastern%20and%20Little%20Nature%20D...",
    externalUrl: "https://mangadex.org/title/eastern-and-little-nature-deity",
  },
  {
    id: "original-03",
    title: "5 Centimeters Per Second",
    circle: "Various",
    artist: "Makoto Shinkai",
    parody: "Original",
    tags: ["romance", "drama", "slice-of-life", "original"],
    description: "Doujinshi adaptation of Makoto Shinkai's film about distance, time, and the spaces between hearts.",
    pages: 44,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/c026d3/059669?text=5%20Centimeters%20Per%20Second",
    externalUrl: "https://mangadex.org/title/5-centimeters-per-second",
  },
  {
    id: "original-04",
    title: "The Place Promised in Our Early Days",
    circle: "Various",
    artist: "Makoto Shinkai",
    parody: "Original",
    tags: ["sci-fi", "romance", "drama", "original"],
    description: "A doujinshi exploring the themes of memory and parallel worlds from Shinkai's early masterpiece.",
    pages: 38,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/059669/06b6d4?text=The%20Place%20Promised%20in%20Our%20E...",
    externalUrl: "https://mangadex.org/title/the-place-promised-in-our-early-days",
  },
  {
    id: "touhou-05",
    title: "Silent Sinner in Blue",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["fantasy", "action", "moon", "original"],
    description: "An epic Touhou tale about the Lunarians and the inhabitants of Gensokyo, featuring the Watatsuki sisters.",
    pages: 42,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/059669/06b6d4?text=Silent%20Sinner%20in%20Blue",
    externalUrl: "https://mangadex.org/title/silent-sinner-in-blue",
  },
  {
    id: "touhou-06",
    title: "Inaba of the Moon and Inaba of the Earth",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["comedy", "fantasy", "rabbits", "original"],
    description: "A slice-of-life Touhou doujinshi following the two Inaba rabbits — Reisen Udongein Inaba and Tewi Inaba.",
    pages: 28,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/a21caf/9333ea?text=Inaba%20of%20the%20Moon%20and%20Inaba...",
    externalUrl: "https://mangadex.org/title/inaba-of-the-moon-and-inaba-of-the-earth",
  },
  {
    id: "original-05",
    title: "Children Who Chase Lost Voices",
    circle: "Various",
    artist: "Makoto Shinkai",
    parody: "Original",
    tags: ["fantasy", "adventure", "drama", "original"],
    description: "Doujinshi based on Shinkai's film about a young girl who discovers a hidden world beneath the earth.",
    pages: 48,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/a21caf/9333ea?text=Children%20Who%20Chase%20Lost%20Voices",
    externalUrl: "https://mangadex.org/title/children-who-chase-lost-voices",
  },
  {
    id: "touhou-07",
    title: "Eastern Judgement in the Sixtieth Year ~ Foul Detective Satori",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["mystery", "fantasy", "detective", "original"],
    description: "Satori Komeiji takes on the role of a detective in Gensokyo, solving supernatural mysteries.",
    pages: 36,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/e11d48/a855f7?text=Eastern%20Judgement%20in%20the%20Si...",
    externalUrl: "https://mangadex.org/title/foul-detective-satori",
  },
  {
    id: "original-06",
    title: "Garden of Words",
    circle: "Various",
    artist: "Makoto Shinkai",
    parody: "Original",
    tags: ["romance", "drama", "slice-of-life", "original"],
    description: "A doujinshi adaptation of the beautiful short film about a aspiring shoemaker and a mysterious woman.",
    pages: 32,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/e11d48/a855f7?text=Garden%20of%20Words",
    externalUrl: "https://mangadex.org/title/garden-of-words",
  },
  {
    id: "touhou-08",
    title: "Wild and Horned Hermit",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["fantasy", "comedy", "hermit", "original"],
    description: "Follow the hermit Kasen Ibaraki as she tries to live a peaceful life in Gensokyo, with mixed results.",
    pages: 40,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/0d9488/db2777?text=Wild%20and%20Horned%20Hermit",
    externalUrl: "https://mangadex.org/title/wild-and-horned-hermit",
  },
  {
    id: "original-07",
    title: "She and Her Cat",
    circle: "Various",
    artist: "Makoto Shinkai",
    parody: "Original",
    tags: ["slice-of-life", "animals", "drama", "original"],
    description: "A touching doujinshi adaptation of Shinkai's early short film, told from the perspective of a cat.",
    pages: 24,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/0d9488/db2777?text=She%20and%20Her%20Cat",
    externalUrl: "https://mangadex.org/title/she-and-her-cat",
  },
  {
    id: "kemono-friends-02",
    title: "Japari Park Survival Guide",
    circle: "Various",
    artist: "Mine Yoshizaki",
    parody: "Kemono Friends",
    tags: ["comedy", "education", "animals", "original"],
    description: "A humorous guide to surviving in Japari Park, featuring various Friends and their unique abilities.",
    pages: 26,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/7c3aed/0891b2?text=Japari%20Park%20Survival%20Guide",
    externalUrl: "https://mangadex.org/title/japari-park-survival-guide",
  },
  {
    id: "touhou-09",
    title: "Forbidden Scrollery",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["mystery", "fantasy", "library", "original"],
    description: "Kosuzu Motoori, a human bookseller in the Human Village, discovers forbidden books and the mysteries they contain.",
    pages: 44,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/6366f1/0d9488?text=Forbidden%20Scrollery",
    externalUrl: "https://mangadex.org/title/forbidden-scrollery",
  },
  {
    id: "original-08",
    title: "Cross Game Collection",
    circle: "Various",
    artist: "Mitsuru Adachi",
    parody: "Original",
    tags: ["sports", "romance", "slice-of-life", "original"],
    description: "Doujinshi collection inspired by the spirit of baseball and coming-of-age stories.",
    pages: 36,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/6366f1/0d9488?text=Cross%20Game%20Collection",
    externalUrl: "https://mangadex.org/title/cross-game-collection",
  },
  {
    id: "touhou-10",
    title: "Lotus Eaters",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["fantasy", "drama", "philosophical", "original"],
    description: "A contemplative Touhou doujinshi exploring themes of reality, dreams, and the nature of Gensokyo itself.",
    pages: 38,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/db2777/2563eb?text=Lotus%20Eaters",
    externalUrl: "https://mangadex.org/title/lotus-eaters",
  },
  {
    id: "original-09",
    title: "Voices from the Sea",
    circle: "Various",
    artist: "Various",
    parody: "Original",
    tags: ["drama", "ocean", "fantasy", "original"],
    description: "An original doujinshi anthology about the connection between humans and the ocean, featuring stories from multiple creators.",
    pages: 52,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/a855f7/7c3aed?text=Voices%20from%20the%20Sea",
    externalUrl: "https://mangadex.org/title/voices-from-the-sea",
  },
  {
    id: "kemono-friends-03",
    title: "Friends of the Savannah",
    circle: "Various",
    artist: "Mine Yoshizaki",
    parody: "Kemono Friends",
    tags: ["adventure", "education", "animals", "original"],
    description: "Follow the Friends of the Savannah region as they explore the grasslands and learn about each other's habitats.",
    pages: 28,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/2563eb/6366f1?text=Friends%20of%20the%20Savannah",
    externalUrl: "https://mangadex.org/title/friends-of-the-savannah",
  },
  {
    id: "original-10",
    title: "Starlight Memories",
    circle: "Various",
    artist: "Various",
    parody: "Original",
    tags: ["sci-fi", "romance", "space", "original"],
    description: "An original sci-fi romance doujinshi about two astronauts stranded on a distant planet who discover ancient alien technology.",
    pages: 44,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/0891b2/e11d48?text=Starlight%20Memories",
    externalUrl: "https://mangadex.org/title/starlight-memories",
  },
  {
    id: "touhou-11",
    title: "Doll Master's Dream",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["fantasy", "dolls", "magic", "original"],
    description: "Alice Margatroid's quest to create the perfect grimoire leads her on an adventure through Gensokyo's magical realms.",
    pages: 34,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/0891b2/e11d48?text=Doll%20Master's%20Dream",
    externalUrl: "https://mangadex.org/title/doll-masters-dream",
  },
  {
    id: "original-11",
    title: "The Music of the Spheres",
    circle: "Various",
    artist: "Various",
    parody: "Original",
    tags: ["music", "fantasy", "drama", "original"],
    description: "An original doujinshi anthology exploring the intersection of music and magic, featuring stories from up-and-coming artists.",
    pages: 48,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/9333ea/ef4444?text=The%20Music%20of%20the%20Spheres",
    externalUrl: "https://mangadex.org/title/the-music-of-the-spheres",
  },
  {
    id: "touhou-12",
    title: "Rainbow-Colored World",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["fantasy", "adventure", "color", "original"],
    description: "A vibrant Touhou doujinshi exploring the seven-colored world of Gensokyo through the eyes of its colorful residents.",
    pages: 30,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/9333ea/ef4444?text=Rainbow-Colored%20World",
    externalUrl: "https://mangadex.org/title/rainbow-colored-world",
  },
  {
    id: "original-12",
    title: "Clockwork Hearts",
    circle: "Various",
    artist: "Various",
    parody: "Original",
    tags: ["steampunk", "romance", "adventure", "original"],
    description: "An original steampunk doujinshi about a young mechanic who discovers a sentient clockwork doll in an abandoned workshop.",
    pages: 40,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/c026d3/059669?text=Clockwork%20Hearts",
    externalUrl: "https://mangadex.org/title/clockwork-hearts",
  },
  {
    id: "touhou-13",
    title: "Memorizable Gensokyo",
    circle: "Team Shanghai Alice",
    artist: "ZUN",
    parody: "Touhou Project",
    tags: ["comedy", "fantasy", "everyday", "original"],
    description: "A collection of short comedic vignettes showcasing everyday life in Gensokyo's most iconic locations.",
    pages: 26,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/c026d3/059669?text=Memorizable%20Gensokyo",
    externalUrl: "https://mangadex.org/title/memorizable-gensokyo",
  },
  {
    id: "original-13",
    title: "Wanderer's Journal",
    circle: "Various",
    artist: "Various",
    parody: "Original",
    tags: ["adventure", "fantasy", "travel", "original"],
    description: "An original doujinshi following a wandering artist as they travel through fantastical lands, documenting their journey.",
    pages: 36,
    language: "japanese",
    isTranslated: true,
    image: "https://placehold.co/400x560/059669/06b6d4?text=Wanderer's%20Journal",
    externalUrl: "https://mangadex.org/title/wanderers-journal",
  },
];

let mangadexCache: { data: DoujinshiEntry[]; timestamp: number } | null = null;
const MANGADEX_CACHE_TTL = 30 * 60 * 1000;
const MANGADEX_API = "https://api.mangadex.org";

async function fetchMangaDexTitle(mangaId: string): Promise<{ en?: string; ja?: string } | null> {
  try {
    const res = await fetch(`${MANGADEX_API}/manga/${mangaId}?includes[]=cover_art`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return data?.data?.attributes?.title || null;
  } catch { return null; }
}

async function fetchFromMangaDex(search?: string, limit = 30): Promise<DoujinshiEntry[]> {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
      "includes[]": "cover_art",
      "order[followedCount]": "desc",
    });
    params.append("contentRating[]", "safe");
    params.append("contentRating[]", "suggestive");
    if (search) params.set("title", search);

    const res = await fetch(`${MANGADEX_API}/manga?${params}`, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const mangaList: any[] = data?.data || [];
    if (mangaList.length === 0) return [];

    return mangaList.map((m: any) => {
      const attrs = m.attributes || {};
      const title = attrs.title?.en || Object.values(attrs.title || {})[0] || "Unknown";
      const desc = attrs.description?.en || "";
      const coverRel = (m.relationships || []).find((r: any) => r.type === "cover_art");
      const coverFileName = coverRel?.attributes?.fileName;
      const image = coverFileName ? `https://uploads.mangadex.org/covers/${m.id}/${coverFileName}.256.jpg` : "";
      const tags = (attrs.tags || []).map((t: any) => t.attributes?.name?.en || "").filter(Boolean);
      const circle = tags.find((t: string) => t.includes("Circle") || t.includes("Group")) || "Unknown Circle";

      return {
        id: `mangadex-${m.id}`,
        title,
        image,
        circle,
        artist: tags.find((t: string) => t.includes("Artist")) || "Unknown Artist",
        parody: tags.find((t: string) => t.includes("Parody")) || "Original",
        tags,
        description: desc.replace(/<[^>]*>/g, "").slice(0, 300),
        pages: 0,
        language: attrs.originalLanguage || "ja",
        isTranslated: attrs.originalLanguage !== "en",
        externalUrl: `https://mangadex.org/title/${m.id}`,
      };
    });
  } catch { return []; }
}

export async function getDynamicDoujinshi(search?: string, parody?: string, tag?: string): Promise<DoujinshiEntry[]> {
  let results = [...DOUJINSHI];

  if (search) {
    const q = search.toLowerCase();
    const staticMatches = DOUJINSHI.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.circle.toLowerCase().includes(q) ||
        d.artist.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
    results = [...staticMatches];

    try {
      const apiResults = await fetchFromMangaDex(search);
      const seenIds = new Set(results.map((d) => d.id));
      for (const api of apiResults) {
        if (!seenIds.has(api.id)) {
          results.push(api);
          seenIds.add(api.id);
        }
      }
    } catch {}
  } else {
    try {
      const apiResults = await fetchFromMangaDex();
      const seenIds = new Set(results.map((d) => d.id));
      for (const api of apiResults) {
        if (!seenIds.has(api.id)) {
          results.push(api);
          seenIds.add(api.id);
        }
      }
    } catch {}
  }

  if (parody) {
    const p = parody.toLowerCase();
    results = results.filter((d) => d.parody.toLowerCase() === p);
  }

  if (tag) {
    const t = tag.toLowerCase();
    results = results.filter((d) => d.tags.some((dt) => dt.toLowerCase().includes(t)));
  }

  return results;
}

export async function getDynamicDoujinshiById(id: string): Promise<DoujinshiEntry | undefined> {
  if (id.startsWith("mangadex-")) {
    const mangaId = id.replace("mangadex-", "");
    try {
      const res = await fetch(`${MANGADEX_API}/manga/${mangaId}?includes[]=cover_art,artist,author`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      const m = data?.data;
      if (m) {
        const attrs = m.attributes || {};
        const title = attrs.title?.en || Object.values(attrs.title || {})[0] || "Unknown";
        const desc = attrs.description?.en || "";
        const coverRel = (m.relationships || []).find((r: any) => r.type === "cover_art");
        const coverFileName = coverRel?.attributes?.fileName;
        const image = coverFileName ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}.512.jpg` : "";
        const tags = (attrs.tags || []).map((t: any) => t.attributes?.name?.en || "").filter(Boolean);
        return {
          id,
          title,
          circle: tags.find((t: string) => t.includes("Circle")) || "Unknown",
          artist: tags.find((t: string) => t.includes("Artist")) || "Unknown",
          parody: tags.find((t: string) => t.includes("Parody")) || "Original",
          tags,
          description: desc.replace(/<[^>]*>/g, "").slice(0, 500),
          pages: 0,
          language: attrs.originalLanguage || "ja",
          isTranslated: attrs.originalLanguage !== "en",
          externalUrl: `https://mangadex.org/title/${mangaId}`,
        };
      }
    } catch { return undefined; }
  }
  return DOUJINSHI.find((d) => d.id === id);
}

export function getDoujinshi(search?: string, parody?: string, tag?: string): DoujinshiEntry[] {
  let results = [...DOUJINSHI];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.circle.toLowerCase().includes(q) ||
        d.artist.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  }

  if (parody) {
    const p = parody.toLowerCase();
    results = results.filter((d) => d.parody.toLowerCase() === p);
  }

  if (tag) {
    const t = tag.toLowerCase();
    results = results.filter((d) => d.tags.some((tag) => tag.toLowerCase() === t));
  }

  return results;
}

export function getDoujinshiById(id: string): DoujinshiEntry | undefined {
  return DOUJINSHI.find((d) => d.id === id);
}

export function getParodies(): string[] {
  const parodies = new Set(DOUJINSHI.map((d) => d.parody));
  return Array.from(parodies).sort();
}

export function getCircles(): string[] {
  const circles = new Set(DOUJINSHI.map((d) => d.circle));
  return Array.from(circles).sort();
}
