export interface RegionalDubEntry {
  title: string;
  englishTitle?: string;
  anilistId?: number;
  language: "HINDI" | "TAMIL" | "TELUGU";
  status: "Available" | "Coming Soon";
  source: string;
  sourceUrl?: string;
  episodes?: string;
}

export const REGIONAL_DUBS: RegionalDubEntry[] = [
  // ── HINDI ──
  { title: "Demon Slayer: Kimetsu no Yaiba", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "55+" },
  { title: "Demon Slayer: Mugen Train", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "Movie" },
  { title: "Jujutsu Kaisen", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Jujutsu Kaisen Season 2", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "23" },
  { title: "Attack on Titan", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "75+" },
  { title: "Attack on Titan: Final Season", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "28" },
  { title: "One Piece", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "1000+" },
  { title: "Spy x Family", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "25" },
  { title: "Spy x Family Season 2", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Chainsaw Man", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Solo Leveling", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Solo Leveling Season 2: Arise from the Shadow", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "13" },
  { title: "Dragon Ball Super", language: "HINDI", status: "Available", source: "Netflix", episodes: "131" },
  { title: "My Hero Academia", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "113+" },
  { title: "Death Note", language: "HINDI", status: "Available", source: "Netflix", episodes: "37" },
  { title: "Naruto", language: "HINDI", status: "Available", source: "Netflix", episodes: "220" },
  { title: "Naruto Shippuden", language: "HINDI", status: "Available", source: "Netflix", episodes: "500" },
  { title: "Boruto: Naruto Next Generations", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "200+" },
  { title: "Tokyo Revengers", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Vinland Saga", language: "HINDI", status: "Available", source: "Netflix", episodes: "24" },
  { title: "Kaguya-sama: Love Is War", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Oshi no Ko", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "11" },
  { title: "Kaiju No. 8", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Dandadan", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Mashle: Magic and Muscles", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Frieren: Beyond Journey's End", language: "HINDI", status: "Coming Soon", source: "Crunchyroll" },
  { title: "Re:ZERO -Starting Life in Another World-", language: "HINDI", status: "Coming Soon", source: "Crunchyroll" },
  { title: "Blue Lock", language: "HINDI", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Haikyuu!!", language: "HINDI", status: "Available", source: "Netflix", episodes: "75+" },
  { title: "Pokémon Horizons", language: "HINDI", status: "Available", source: "Netflix", episodes: "40+" },

  // ── TAMIL ──
  { title: "Demon Slayer: Kimetsu no Yaiba", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "55+" },
  { title: "Jujutsu Kaisen", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Jujutsu Kaisen Season 2", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "23" },
  { title: "Attack on Titan", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "75+" },
  { title: "Spy x Family", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "25" },
  { title: "Chainsaw Man", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Solo Leveling", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Solo Leveling Season 2: Arise from the Shadow", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "13" },
  { title: "My Hero Academia", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "113+" },
  { title: "Death Note", language: "TAMIL", status: "Available", source: "Netflix", episodes: "37" },
  { title: "Tokyo Revengers", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Vinland Saga", language: "TAMIL", status: "Available", source: "Netflix", episodes: "24" },
  { title: "Kaiju No. 8", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Dandadan", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Blue Lock", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Oshi no Ko", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "11" },
  { title: "Dragon Ball Super", language: "TAMIL", status: "Available", source: "Netflix", episodes: "131" },
  { title: "Frieren: Beyond Journey's End", language: "TAMIL", status: "Coming Soon", source: "Crunchyroll" },
  { title: "Mashle: Magic and Muscles", language: "TAMIL", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "One Piece", language: "TAMIL", status: "Coming Soon", source: "Crunchyroll" },

  // ── TELUGU ──
  { title: "Demon Slayer: Kimetsu no Yaiba", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "55+" },
  { title: "Jujutsu Kaisen", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Jujutsu Kaisen Season 2", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "23" },
  { title: "Attack on Titan", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "75+" },
  { title: "Spy x Family", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "25" },
  { title: "Chainsaw Man", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Solo Leveling", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Solo Leveling Season 2: Arise from the Shadow", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "13" },
  { title: "My Hero Academia", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "113+" },
  { title: "Death Note", language: "TELUGU", status: "Available", source: "Netflix", episodes: "37" },
  { title: "Tokyo Revengers", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Kaiju No. 8", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Dandadan", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "Blue Lock", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "24" },
  { title: "Oshi no Ko", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "11" },
  { title: "Dragon Ball Super", language: "TELUGU", status: "Available", source: "Netflix", episodes: "131" },
  { title: "Vinland Saga", language: "TELUGU", status: "Available", source: "Netflix", episodes: "24" },
  { title: "Frieren: Beyond Journey's End", language: "TELUGU", status: "Coming Soon", source: "Crunchyroll" },
  { title: "Mashle: Magic and Muscles", language: "TELUGU", status: "Available", source: "Crunchyroll", episodes: "12" },
  { title: "One Piece", language: "TELUGU", status: "Coming Soon", source: "Crunchyroll" },
];

export function getRegionalDubs(language?: "HINDI" | "TAMIL" | "TELUGU"): RegionalDubEntry[] {
  return language
    ? REGIONAL_DUBS.filter((d) => d.language === language)
    : [...REGIONAL_DUBS];
}

export function getRegionalDubsByStatus(language: "HINDI" | "TAMIL" | "TELUGU", status: "Available" | "Coming Soon") {
  return REGIONAL_DUBS.filter((d) => d.language === language && d.status === status);
}
