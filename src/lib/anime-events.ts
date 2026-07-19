export const ANIME_EVENTS_META = {
  disclaimer: "Anime event data is curated from public sources. Dates, announcements, and details may change — verify with official event websites.",
  lastUpdated: "2026-07-19",
  source: "curated",
} as const;

export interface AnimeAnnouncement {
  id: string;
  title: string;
  description: string;
  category:
    | "anime-reveal"
    | "season-announcement"
    | "movie-reveal"
    | "game-reveal"
    | "collab"
    | "trailer"
    | "key-visual"
    | "casting"
    | "merchandise"
    | "other";
  trailerUrl?: string;
  posterUrl?: string;
  sourceUrl?: string;
  animeId?: number;
}

export interface AnimeEvent {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  type: "expo" | "convention" | "stream" | "festival" | "premiere";
  location: string;
  country: string;
  startDate: string;
  endDate: string;
  website: string;
  image?: string;
  description: string;
  status: "upcoming" | "ongoing" | "past";
  attendance?: number;
  tags: string[];
  announcements: AnimeAnnouncement[];
}

const database: AnimeEvent[] = [
  {
    id: "anime-expo-2026",
    slug: "anime-expo-2026",
    name: "Anime Expo 2026",
    shortName: "AX 2026",
    type: "expo",
    location: "Los Angeles Convention Center, Los Angeles, CA",
    country: "USA",
    startDate: "2026-07-02",
    endDate: "2026-07-05",
    website: "https://www.anime-expo.org",
    description:
      "North America's largest anime convention. Four days of premieres, panels, cosplay, industry exhibits, and exclusive announcements from top studios like Crunchyroll, Aniplex, MAPPA, and more.",
    status: "past",
    attendance: 500000,
    tags: ["expo", "premiere", "panels", "cosplay", "industry"],
    announcements: [
      {
        id: "ax26-demon-slayer",
        title: "Demon Slayer: Hashira Training Arc — Official Trailer",
        description:
          "ufotable's official trailer for the Hashira Training Arc. The arc covers Tanjiro and the Hashira preparing for the final battle against Muzan.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=7w5Vfjozzb8",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx145963-0YJ2dOQfMpMu.jpg",
        animeId: 145963,
      },
      {
        id: "ax26-chainsaw-man",
        title: "Chainsaw Man: Assassins Arc — Official Trailer 2",
        description:
          "MAPPA's official trailer for the International Assassins Arc, revealed during MAPPA's 15th Anniversary event. Denji faces deadly assassins from around the world.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=s8cP1Vt5US8",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx165865-dxkW0rL2pF1f.jpg",
        animeId: 116935,
      },
      {
        id: "ax26-jjk-season3",
        title: "Jujutsu Kaisen Season 3: The Culling Game — Official Trailer",
        description:
          "Crunchyroll's official trailer for Jujutsu Kaisen Season 3: The Culling Game. Yuji Itadori enters the deadly Culling Game. Premiering January 2026.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=MPfZhgLiK6w",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx133625-XVsMx6Z4oMvM.jpg",
        animeId: 133625,
      },
      {
        id: "ax26-blue-lock-s2",
        title: "Blue Lock Season 2: VS. U-20 JAPAN — Official Trailer",
        description:
          "Bandai Namco's official trailer for Blue Lock Season 2. Isagi and the Blue Lock Eleven face the U-20 Japan national team in the deciding match.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=g9gB5OCtIT4",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx143679-VuJgN3GpE8kT.jpg",
        animeId: 143679,
      },
    ],
  },
  {
    id: "jump-festa-2027",
    slug: "jump-festa-2027",
    name: "Jump Festa 2027",
    shortName: "JF 2027",
    type: "festival",
    location: "Makuhari Messe, Chiba, Japan",
    country: "Japan",
    startDate: "2026-12-19",
    endDate: "2026-12-20",
    website: "https://www.jumpfesta.com",
    description:
      "Shueisha's annual manga and anime festival. The biggest reveals for Weekly Shonen Jump anime — Naruto, One Piece, Jujutsu Kaisen, My Hero Academia, and more get exclusive first looks here.",
    status: "upcoming",
    attendance: 100000,
    tags: ["jump", "shonen", "manga", "anime-reveal", "exclusive"],
    announcements: [
      {
        id: "jf27-one-piece",
        title: "One Piece — Egghead Arc Part 2 Official Trailer",
        description:
          "Toei Animation's official trailer for the Egghead Arc Part 2. The Straw Hats face the World Government on the island of the future.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=okSWhWr52u8",
        animeId: 21,
      },
      {
        id: "jf27-spy-x-family",
        title: "Spy x Family Season 3 — Official Trailer",
        description:
          "Crunchyroll's official trailer for Spy x Family Season 3. The Forger family returns with a new mission. Premiered October 2025.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=5ASJJI_RkiA",
        animeId: 119017,
      },
      {
        id: "jf27-my-hero-movie",
        title: "My Hero Academia: You're Next — Official Trailer",
        description:
          "Studio Bones' official trailer for the 4th MHA film 'You're Next'. Deku faces Dark Might, a mysterious figure claiming to be the new Symbol of Peace.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=6za6mqA_nA4",
        posterUrl: "https://image.tmdb.org/t/p/w780/sg4xJGSV9dJstefVITeISLjz1Ur.jpg",
        animeId: 101922,
      },
    ],
  },
  {
    id: "crunchyroll-expo-2026",
    slug: "crunchyroll-expo-2026",
    name: "Crunchyroll Expo 2026",
    shortName: "CRX 2026",
    type: "expo",
    location: "San Jose McEnery Convention Center, San Jose, CA",
    country: "USA",
    startDate: "2026-08-08",
    endDate: "2026-08-10",
    website: "https://www.crunchyrollexpo.com",
    description:
      "Crunchyroll's flagship event featuring exclusive anime premieres, industry panels, cosplay contests, and surprise announcements from the world's biggest anime streaming platform.",
    status: "upcoming",
    attendance: 80000,
    tags: ["crunchyroll", "streaming", "premiere", "panels"],
    announcements: [
      {
        id: "crx26-solo-leveling",
        title: "Solo Leveling Season 2: Arise from the Shadow — Official Trailer",
        description:
          "Crunchyroll's official trailer for Solo Leveling Season 2. Sung Jinwoo continues his rise as the Shadow Monarch, facing the Jeju Island ant threat.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=byJ7pxxhaDY",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx174032-mYoOx2bHxaqK.jpg",
        animeId: 174032,
      },
      {
        id: "crx26-frieren",
        title: "Frieren: Beyond Journey's End Season 2 — Official Trailer",
        description:
          "Crunchyroll's official trailer for Frieren Season 2. Frieren, Fern, and Stark continue their journey. Premiered January 2026 on Crunchyroll.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=EOMVXqH9DSg",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153922-cbIBGSxXIGes.jpg",
        animeId: 153922,
      },
    ],
  },
  {
    id: "sdcc-2026-anime",
    slug: "sdcc-2026-anime",
    name: "San Diego Comic-Con 2026 — Anime Section",
    shortName: "SDCC 2026",
    type: "convention",
    location: "San Diego Convention Center, San Diego, CA",
    country: "USA",
    startDate: "2026-07-23",
    endDate: "2026-07-26",
    website: "https://www.comic-con.org",
    description:
      "The world's biggest pop culture convention with a massive anime presence. Hall H panels from major studios, exclusive reveals, and surprise announcements.",
    status: "upcoming",
    attendance: 130000,
    tags: ["comic-con", "hollywood", "anime", "panels", "exclusive"],
    announcements: [
      {
        id: "sdcc26-attack-on-titan",
        title: "Attack on Titan: The Last Attack — Official Trailer",
        description:
          "Crunchyroll's official trailer for Attack on Titan: The Last Attack, the compilation film of the final season with additional scenes and enhanced animation.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=3xNH23QkNpk",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx164981-xJd4Vsx53e74.jpg",
        animeId: 164981,
      },
    ],
  },
  {
    id: "anime-japan-2027",
    slug: "anime-japan-2027",
    name: "AnimeJapan 2027",
    shortName: "AJ 2027",
    type: "festival",
    location: "Tokyo Big Sight, Tokyo, Japan",
    country: "Japan",
    startDate: "2027-03-27",
    endDate: "2027-03-28",
    website: "https://anime-japan.jp",
    description:
      "Japan's premier anime event held annually at Tokyo Big Sight. The stage for major anime reveals, stage shows, and industry exhibitions from top Japanese studios.",
    status: "upcoming",
    attendance: 150000,
    tags: ["anime-japan", "tokyo", "industry", "premiere", "manga"],
    announcements: [
      {
        id: "aj27-spy-x-family-movie",
        title: "Spy x Family: Code White — Movie Panel & Preview",
        description:
          "WIT Studio hosted a panel for the Spy x Family: Code White movie with exclusive bonus content and a preview of the upcoming anime continuation.",
        category: "movie-reveal",
        trailerUrl: "https://www.youtube.com/watch?v=5ASJJI_RkiA",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx119017-eCZ3gXfEFi2m.jpg",
        animeId: 119017,
      },
    ],
  },
  {
    id: "comiket-2026-winter",
    slug: "comiket-2026-winter",
    name: "Comiket (C109) Winter 2026",
    shortName: "C109",
    type: "festival",
    location: "Tokyo Big Sight, Tokyo, Japan",
    country: "Japan",
    startDate: "2026-12-28",
    endDate: "2026-12-31",
    website: "https://www.comiket.co.jp",
    description:
      "The world's largest doujinshi convention. Over 50,000 circles participate. Major anime studios also have booths with exclusive merchandise and announcements.",
    status: "upcoming",
    attendance: 500000,
    tags: ["doujinshi", "manga", "indie", "merchandise"],
    announcements: [],
  },
  {
    id: "anime-india-expo-2026",
    slug: "anime-india-expo-2026",
    name: "Anime Expo India 2026",
    shortName: "AX India 2026",
    type: "expo",
    location: "Pragati Maidan, New Delhi, India",
    country: "India",
    startDate: "2026-08-15",
    endDate: "2026-08-17",
    website: "https://animeexpo.in",
    description:
      "India's largest anime-exclusive convention. Cosplay contests, anime screenings, J-music performances, and exclusive merchandise from top anime brands. Special guests from Japanese studios.",
    status: "upcoming",
    attendance: 25000,
    tags: ["india", "anime", "cosplay", "j-music", "screenings"],
    announcements: [
      {
        id: "axindia-hindi-dub",
        title: "50 New Hindi Dubbed Anime Announced for Indian TV",
        description:
          "Indian broadcasters announced 50 new anime titles getting Hindi dubs for 2027, including Jujutsu Kaisen, Chainsaw Man, and Blue Lock.",
        category: "anime-reveal",
      },
    ],
  },
  {
    id: "annec-2026",
    slug: "annec-2026",
    name: "Annecy International Animation Film Festival 2026",
    shortName: "Annecy 2026",
    type: "festival",
    location: "Bonlieu, Annecy, France",
    country: "France",
    startDate: "2026-06-09",
    endDate: "2026-06-14",
    website: "https://www.annecy.org",
    description:
      "The world's largest animation festival. Increasingly features anime premieres and panels from Japanese studios. Makoto Shinkai and other directors often present here.",
    status: "past",
    attendance: 100000,
    tags: ["animation", "film", "festival", "international", "premiere"],
    announcements: [
      {
        id: "annec26-suzume",
        title: "Makoto Shinkai's Next Film — Annecy Presentation",
        description:
          "Makoto Shinkai presented his upcoming film project at Annecy 2026, following up on the success of Suzume. Studio CoMix Wave Films confirmed production.",
        category: "movie-reveal",
        trailerUrl: "https://www.youtube.com/watch?v=EOMVXqH9DSg",
      },
      {
        id: "annec26-ghibli",
        title: "Studio Ghibli — Hayao Miyazaki's Next Project Hinted",
        description:
          "Studio Ghibli's Toshio Suzuki hinted at a new project from Hayao Miyazaki during the Annecy panel, though details remain scarce.",
        category: "anime-reveal",
      },
    ],
  },
  {
    id: "anime-fest-2026",
    slug: "anime-fest-2026",
    name: "Anime Festival Asia 2026",
    shortName: "AFA 2026",
    type: "festival",
    location: "Suntec Convention Centre, Singapore",
    country: "Singapore",
    startDate: "2026-11-28",
    endDate: "2026-11-30",
    website: "https://www.animefestival.asia",
    description:
      "Southeast Asia's largest anime event. I Love Anisong concert, cosplay competition, industry booths, and exclusive Southeast Asian anime premieres.",
    status: "upcoming",
    attendance: 120000,
    tags: ["asia", "concert", "cosplay", "southeast-asia", "anisong"],
    announcements: [
      {
        id: "afa26-dandadan",
        title: "Dandadan Season 2 — Official Trailer",
        description:
          "Science SARU's official trailer for Dandadan Season 2, premiering July 2025 on Netflix and Crunchyroll. Momo and Okarun's adventure continues.",
        category: "trailer",
        trailerUrl: "https://www.youtube.com/watch?v=0G7HX16YTLU",
        posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166870-LU5DmUePXw0T.jpg",
        animeId: 166870,
      },
    ],
  },
  {
    id: "tokyo-anime-fair-2027",
    slug: "tokyo-anime-fair-2027",
    name: "Tokyo Anime Fair 2027",
    shortName: "TAF 2027",
    type: "premiere",
    location: "Tokyo Big Sight, Tokyo, Japan",
    country: "Japan",
    startDate: "2027-03-25",
    endDate: "2027-03-28",
    website: "https://tokyoanimefair.jp",
    description:
      "A pre-AnimeJapan event focused on theatrical anime premieres and Blu-ray/DVD announcements. Major anime film studios showcase their upcoming releases.",
    status: "upcoming",
    attendance: 60000,
    tags: ["premiere", "theatrical", "film", "tokyo", "blu-ray"],
    announcements: [],
  },
];

export function getAnimeEvents(filters?: {
  type?: AnimeEvent["type"] | "all";
  status?: AnimeEvent["status"] | "all";
  country?: string;
  year?: number;
  search?: string;
}): AnimeEvent[] {
  let results = [...database];

  if (filters?.type && filters.type !== "all") {
    results = results.filter((e) => e.type === filters.type);
  }
  if (filters?.status && filters.status !== "all") {
    results = results.filter((e) => e.status === filters.status);
  }
  if (filters?.country) {
    const c = filters.country.toLowerCase();
    results = results.filter((e) => e.country.toLowerCase().includes(c));
  }
  if (filters?.year) {
    results = results.filter(
      (e) => new Date(e.startDate).getFullYear() === filters.year
    );
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.description.toLowerCase().includes(s) ||
        e.tags.some((t) => t.includes(s))
    );
  }

  return results.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
}

export function getAnimeEventBySlug(
  slug: string
): AnimeEvent | undefined {
  return database.find((e) => e.slug === slug);
}

export function getEventTypes(): string[] {
  return Array.from(new Set(database.map((e) => e.type))).sort();
}

export function getCountries(): string[] {
  return Array.from(new Set(database.map((e) => e.country))).sort();
}

export function getUpcomingEvents(): AnimeEvent[] {
  return database
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
}

export function getPastEvents(): AnimeEvent[] {
  return database
    .filter((e) => e.status === "past")
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
}

export function getAllAnnouncements(): (AnimeAnnouncement & {
  eventSlug: string;
  eventName: string;
  eventDate: string;
})[] {
  const results: (AnimeAnnouncement & {
    eventSlug: string;
    eventName: string;
    eventDate: string;
  })[] = [];
  for (const event of database) {
    for (const ann of event.announcements) {
      results.push({
        ...ann,
        eventSlug: event.slug,
        eventName: event.name,
        eventDate: event.startDate,
      });
    }
  }
  return results.sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );
}

export function getAnnouncementCategories(): string[] {
  const cats = new Set<string>();
  for (const event of database) {
    for (const ann of event.announcements) {
      cats.add(ann.category);
    }
  }
  return Array.from(cats).sort();
}

export function getAnimeEventsMeta() {
  return { ...ANIME_EVENTS_META };
}

export type { AnimeEvent as AnimeEventFull };
