export interface AwardEntry {
  year: number;
  category: string;
  winner: string;
  malId: number;
  anilistId?: number;
  image?: string;
  platform: string;
  type: "anime" | "manga" | "live-action" | "character" | "music";
}

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const ANIME_QUERY = `
  query ($year: Int) {
    Page(page: 1, perPage: 20) {
      media(seasonYear: $year, type: ANIME, isAdult: false, sort: SCORE_DESC, status: FINISHED) {
        id title { romaji english }
        coverImage { large }
        averageScore
        genres
        format
      }
    }
  }`;

let liveAwardsCache: { data: AwardEntry[]; timestamp: number } | null = null;
const LIVE_TTL = 6 * 60 * 60 * 1000;

async function fetchAnilistTopByYear(year: number) {
  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: ANIME_QUERY, variables: { year } }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    interface AnilistMedia { id: number; title?: { romaji?: string; english?: string }; coverImage?: { large?: string }; averageScore?: number; genres?: string[]; format?: string }
    return (data?.Page?.media || []).map((m: AnilistMedia) => ({
      id: m.id,
      title: m.title?.romaji || m.title?.english || "Unknown",
      image: m.coverImage?.large || "",
      score: m.averageScore || 0,
      genres: m.genres || [],
      format: m.format || "",
    }));
  } catch {
    return [];
  }
}

export async function getLiveAwards(): Promise<AwardEntry[]> {
  if (liveAwardsCache && Date.now() - liveAwardsCache.timestamp < LIVE_TTL) {
    return liveAwardsCache.data;
  }

  const currentYear = new Date().getFullYear();
  const results: AwardEntry[] = [];

  try {
    const topAnime = await fetchAnilistTopByYear(currentYear);
    if (topAnime.length > 0) {
      type AnilistAnime = { id: number; title: string; image: string; score: number; genres: string[]; format: string };
      const byGenre = (g: string) => topAnime.find((a: { genres?: string[] }) => a.genres?.includes(g));
      const byFormat = (f: string) => topAnime.find((a: { format?: string }) => a.format === f);

      const pick = (g: string): AnilistAnime | undefined => byGenre(g) as AnilistAnime | undefined;
      const pickFmt = (f: string): AnilistAnime | undefined => byFormat(f);
      const first = topAnime[0] as AnilistAnime | undefined;
      const second = topAnime[1] as AnilistAnime | undefined;
      if (first) results.push({ year: currentYear, category: "Anime of the Year", winner: first.title, malId: 0, anilistId: first.id, image: first.image, platform: "AniList Community", type: "anime" });
      if (pick("Action")) results.push({ year: currentYear, category: "Best Action", winner: pick("Action")!.title, malId: 0, anilistId: pick("Action")!.id, image: pick("Action")!.image, platform: "AniList Community", type: "anime" });
      if (pick("Romance")) results.push({ year: currentYear, category: "Best Romance", winner: pick("Romance")!.title, malId: 0, anilistId: pick("Romance")!.id, image: pick("Romance")!.image, platform: "AniList Community", type: "anime" });
      if (pick("Comedy")) results.push({ year: currentYear, category: "Best Comedy", winner: pick("Comedy")!.title, malId: 0, anilistId: pick("Comedy")!.id, image: pick("Comedy")!.image, platform: "AniList Community", type: "anime" });
      if (pick("Fantasy")) results.push({ year: currentYear, category: "Best Fantasy", winner: pick("Fantasy")!.title, malId: 0, anilistId: pick("Fantasy")!.id, image: pick("Fantasy")!.image, platform: "AniList Community", type: "anime" });
      if (pick("Drama")) results.push({ year: currentYear, category: "Best Drama", winner: pick("Drama")!.title, malId: 0, anilistId: pick("Drama")!.id, image: pick("Drama")!.image, platform: "AniList Community", type: "anime" });
      if (pickFmt("MOVIE")) results.push({ year: currentYear, category: "Best Movie", winner: pickFmt("MOVIE")!.title, malId: 0, anilistId: pickFmt("MOVIE")!.id, image: pickFmt("MOVIE")!.image, platform: "AniList Community", type: "anime" });
      if (second) results.push({ year: currentYear, category: "Best New Series", winner: second.title, malId: 0, anilistId: second.id, image: second.image, platform: "AniList Community", type: "anime" });
    }
  } catch {}

  if (results.length > 0) {
    liveAwardsCache = { data: results, timestamp: Date.now() };
  }
  return results;
}

export const ALL_AWARDS: AwardEntry[] = [
  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2025
  // ============================================
  { year: 2025, category: "Anime of the Year", winner: "Solo Leveling Season 2: Arise from the Shadow", malId: 176496, anilistId: 176496, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2025, category: "Best Animation", winner: "Demon Slayer: Infinity Castle", malId: 178788, anilistId: 178788, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2025, category: "Best Action", winner: "Solo Leveling Season 2", malId: 176496, anilistId: 176496, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2025, category: "Best Romance", winner: "Dandadan", malId: 171018, anilistId: 171018, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Comedy", winner: "Spy x Family Season 3", malId: 177937, anilistId: 177937, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2025, category: "Best Fantasy", winner: "Frieren: Beyond Journey's End Season 2", malId: 182255, anilistId: 182255, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Best Drama", winner: "Attack on Titan: The Last Attack", malId: 146984, anilistId: 146984, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2025, category: "Best Score", winner: "Frieren: Beyond Journey's End Season 2", malId: 182255, anilistId: 182255, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Best New Series", winner: "Dandadan", malId: 171018, anilistId: 171018, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Film", winner: "Demon Slayer: Infinity Castle", malId: 178788, anilistId: 178788, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2025, category: "Best Character Design", winner: "Frieren: Beyond Journey's End Season 2", malId: 182255, anilistId: 182255, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Best Director", winner: "Solo Leveling Season 2", malId: 176496, anilistId: 176496, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2025, category: "Best Opening", winner: "Solo Leveling Season 2 - WHITEOUT", malId: 176496, anilistId: 176496, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2025, category: "Best Ending", winner: "Dandadan - OVERNIGHT FANTASY", malId: 171018, anilistId: 171018, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best VA Performance (JP)", winner: "Reigo Kobayashi as Sung Jinwoo", malId: 176496, anilistId: 176496, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },

  // ============================================
  // ANIME TRENDING AWARDS 2025
  // ============================================
  { year: 2025, category: "Anime of the Year", winner: "Solo Leveling Season 2", malId: 151807, anilistId: 151807, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2025, category: "Best Boy", winner: "Sung Jinwoo - Solo Leveling Season 2", malId: 151807, anilistId: 151807, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2025, category: "Best Girl", winner: "Frieren - Frieren Season 2", malId: 170068, anilistId: 170068, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Best Animation", winner: "Demon Slayer: Infinity Castle", malId: 178788, anilistId: 178788, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2025, category: "Best Opening", winner: "Dandadan - OVERNIGHT FANTASY", malId: 171018, anilistId: 171018, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Drama", winner: "Attack on Titan: The Last Attack", malId: 146984, anilistId: 146984, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2025, category: "Best Couple", winner: "Okarun & Momo - Dandadan", malId: 171018, anilistId: 171018, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },

  // ============================================
  // MYANIMELIST (MAL) ANIME AWARDS 2025
  // ============================================
  { year: 2025, category: "Anime of the Year", winner: "Solo Leveling Season 2", malId: 151807, anilistId: 151807, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2025, category: "Best Animation", winner: "Demon Slayer: Infinity Castle", malId: 178788, anilistId: 178788, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2025, category: "Best Action", winner: "Solo Leveling Season 2", malId: 151807, anilistId: 151807, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2025, category: "Best Romance", winner: "Dandadan", malId: 171018, anilistId: 171018, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Comedy", winner: "Spy x Family Season 3", malId: 177937, anilistId: 177937, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2025, category: "Best Fantasy", winner: "Frieren: Beyond Journey's End Season 2", malId: 182255, anilistId: 182255, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Best Drama", winner: "Attack on Titan: The Last Attack", malId: 146984, anilistId: 146984, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2025, category: "Best Slice of Life", winner: "Bocchi the Rock! Season 2", malId: 148100, anilistId: 148100, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-HTDmeL4RGeJ4.png" },

  // ============================================
  // ANIME NEWS NETWORK (ANN) AWARDS 2025
  // ============================================
  { year: 2025, category: "Best Anime Series", winner: "Frieren: Beyond Journey's End Season 2", malId: 170068, anilistId: 170068, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Best New Series", winner: "Dandadan", malId: 171018, anilistId: 171018, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Film", winner: "Demon Slayer: Infinity Castle", malId: 178788, anilistId: 178788, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2025, category: "Best Continuing Series", winner: "One Piece", malId: 21, anilistId: 21, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },

  // ============================================
  // NEWTYPE ANIME AWARDS 2024 (announced Oct 2024)
  // anilistIds verified via AniList GraphQL API
  // ============================================
  { year: 2025, category: "Best TV Anime", winner: "Makeine: Too Many Losing Heroines!", malId: 161674, anilistId: 171457, platform: "Newtype", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171457-nmMIk0gNiWsm.jpg" },
  { year: 2025, category: "Best Film", winner: "Bocchi the Rock! Re:Re:", malId: 178197, anilistId: 165253, platform: "Newtype", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx165253-nAwyrMZm4jBA.jpg" },
  { year: 2025, category: "Best Male Character", winner: "Kazuhiko Nukumizu (Makeine: Too Many Losing Heroines!)", malId: 161674, anilistId: 171457, platform: "Newtype", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171457-nmMIk0gNiWsm.jpg" },
  { year: 2025, category: "Best Female Character", winner: "Hitori Gotō (Bocchi the Rock!)", malId: 130003, anilistId: 130003, platform: "Newtype", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-HTDmeL4RGeJ4.png" },
  { year: 2025, category: "Best Studio", winner: "A-1 Pictures", malId: 0, anilistId: 0, platform: "Newtype", type: "anime" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2026 (May 23, 2026)
  // anilistIds verified via AniList GraphQL API
  // ============================================
  { year: 2026, category: "Anime of the Year", winner: "My Hero Academia FINAL SEASON", malId: 60098, anilistId: 16498, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2026, category: "Best Film", winner: "Demon Slayer: Kimetsu no Yaiba Infinity Castle", malId: 59192, anilistId: 101922, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2026, category: "Best Continuing Series", winner: "ONE PIECE", malId: 21, anilistId: 21, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2026, category: "Best New Series", winner: "Gachiakuta", malId: 59062, anilistId: 178025, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178025-cWJKEsZynkil.jpg" },
  { year: 2026, category: "Best Original Anime", winner: "Lazarus", malId: 0, anilistId: 167336, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx167336-KpGIIBie71OX.png" },
  { year: 2026, category: "Best Animation", winner: "Solo Leveling Season 2 -Arise from the Shadow-", malId: 176496, anilistId: 176496, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176496-9BDMjAZGEbq4.png" },
  { year: 2026, category: "Best Character Design", winner: "Gachiakuta", malId: 59062, anilistId: 178025, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178025-cWJKEsZynkil.jpg" },
  { year: 2026, category: "Best Director", winner: "Akinori Fudesaka, Norihiro Naganuma (The Apothecary Diaries S2)", malId: 0, anilistId: 176301, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg" },
  { year: 2026, category: "Best Background Art", winner: "Gachiakuta", malId: 59062, anilistId: 178025, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178025-cWJKEsZynkil.jpg" },
  { year: 2026, category: "Best Romance", winner: "The Fragrant Flower Blooms with Dignity", malId: 0, anilistId: 181444, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx181444-Ut9DDUZdfHwg.jpg" },
  { year: 2026, category: "Best Comedy", winner: "DAN DA DAN Season 2", malId: 0, anilistId: 185660, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx185660-uB8RUMBGovGr.jpg" },
  { year: 2026, category: "Best Action", winner: "Solo Leveling Season 2 -Arise from the Shadow-", malId: 176496, anilistId: 176496, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176496-9BDMjAZGEbq4.png" },
  { year: 2026, category: "Best Isekai", winner: "Re:ZERO -Starting Life in Another World- Season 3", malId: 108632, anilistId: 163134, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx163134-yieRFbvUOH9a.jpg" },
  { year: 2026, category: "Best Drama", winner: "The Apothecary Diaries Season 2", malId: 0, anilistId: 176301, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg" },
  { year: 2026, category: "Best Slice of Life", winner: "SPY x FAMILY Season 3", malId: 140960, anilistId: 140960, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2026, category: "Best Main Character", winner: "Maomao (The Apothecary Diaries Season 2)", malId: 0, anilistId: 176301, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg" },
  { year: 2026, category: "Best Supporting Character", winner: "Katsuki Bakugo (My Hero Academia FINAL SEASON)", malId: 60098, anilistId: 16498, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2026, category: "Best Anime Song", winner: "IRIS OUT by Kenshi Yonezu (Chainsaw Man: Reze Arc)", malId: 0, anilistId: 171627, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171627-ZN9D7P46yHnw.png" },
  { year: 2026, category: "Best Score", winner: "Demon Slayer: Kimetsu no Yaiba Infinity Castle", malId: 59192, anilistId: 101922, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2026, category: "Best Opening", winner: "On The Way", malId: 0, anilistId: 16498, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2026, category: "Best Ending", winner: "I by BUMP OF CHICKEN (My Hero Academia FINAL SEASON)", malId: 60098, anilistId: 16498, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2026, category: "Best VA Performance (JP)", winner: "Aoi Yuki", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "character" },

  // ============================================
  // ANIME TRENDING AWARDS 2026 — 12th ATA (March 22, 2026) for 2025 anime
  // anilistIds verified via AniList GraphQL API
  // ============================================
  { year: 2026, category: "Anime of the Year", winner: "Umamusume: Cinderella Gray", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Anime Movie of the Year", winner: "Umamusume: Pretty Derby BEGINNING OF A NEW ERA", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Best Boy", winner: "Jinshi (The Apothecary Diaries S2)", malId: 0, anilistId: 176301, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg" },
  { year: 2026, category: "Best Girl", winner: "Oguri Cap (Umamusume: Cinderella Gray)", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Best Couple", winner: "Rintaro x Kaoruko (The Fragrant Flower Blooms with Dignity)", malId: 0, anilistId: 181444, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx181444-Ut9DDUZdfHwg.jpg" },
  { year: 2026, category: "Best Supporting Boy", winner: "Jo Kitahara (Umamusume: Cinderella Gray)", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Best Animation", winner: "Umamusume: Cinderella Gray", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Best Opening", winner: "Mirage by Creepy Nuts (Call of the Night Season 2)", malId: 0, anilistId: 175914, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx175914-VsbL90WzuqoM.jpg" },
  { year: 2026, category: "Best Ending", winner: "Kawaii Kaiwai by PiKi (My Dress-Up Darling S2)", malId: 0, anilistId: 154768, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154768-DHHvNd4MjV1p.jpg" },
  { year: 2026, category: "Best Adapted Screenplay", winner: "Umamusume: Cinderella Gray", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Best Character Design", winner: "Umamusume: Cinderella Gray", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },

  // ============================================
  // NEWTYPE ANIME AWARDS 2025 (announced Oct 2025, covers 2024-2025 anime)
  // anilistIds verified via AniList GraphQL API
  // ============================================
  { year: 2026, category: "Best TV Anime", winner: "Makeine: Too Many Losing Heroines!", malId: 161674, anilistId: 171457, platform: "Newtype", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171457-nmMIk0gNiWsm.jpg" },
  { year: 2026, category: "Best Film", winner: "Bocchi the Rock! Re:Re:", malId: 178197, anilistId: 165253, platform: "Newtype", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx165253-nAwyrMZm4jBA.jpg" },
  { year: 2026, category: "Best Male Character", winner: "Kazuhiko Nukumizu (Makeine: Too Many Losing Heroines!)", malId: 161674, anilistId: 171457, platform: "Newtype", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171457-nmMIk0gNiWsm.jpg" },
  { year: 2026, category: "Best Female Character", winner: "Hitori Gotō (Bocchi the Rock!)", malId: 130003, anilistId: 130003, platform: "Newtype", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-HTDmeL4RGeJ4.png" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2024
  // ============================================
  { year: 2024, category: "Anime of the Year", winner: "Jujutsu Kaisen Season 2", malId: 145064, anilistId: 145064, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Animation", winner: "Demon Slayer: Hashira Training Arc", malId: 166240, anilistId: 166240, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2024, category: "Best Action", winner: "Solo Leveling", malId: 151807, anilistId: 151807, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2024, category: "Best Romance", winner: "Oshi no Ko Season 2", malId: 166531, anilistId: 166531, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2024, category: "Best Comedy", winner: "KonoSuba: An Explosion on This Wonderful World!", malId: 150075, anilistId: 150075, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21202-mPOr80AEjUcZ.png" },
  { year: 2024, category: "Best Fantasy", winner: "Mushoku Tensei Season 2", malId: 146065, anilistId: 146065, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg" },
  { year: 2024, category: "Best Drama", winner: "Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best Score", winner: "Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best New Series", winner: "Solo Leveling", malId: 151807, anilistId: 151807, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2024, category: "Best Film", winner: "Spy x Family Code: White", malId: 168306, anilistId: 168306, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2023
  // ============================================
  { year: 2023, category: "Anime of the Year", winner: "Demon Slayer: Swordsmith Village Arc", malId: 145139, anilistId: 145139, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2023, category: "Best Animation", winner: "Demon Slayer: Swordsmith Village Arc", malId: 145139, anilistId: 145139, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2023, category: "Best Action", winner: "Jujutsu Kaisen Season 2", malId: 145064, anilistId: 145064, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2023, category: "Best Romance", winner: "Horimiya: The Missing Pieces", malId: 163132, anilistId: 163132, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-3i22mRVPBS0T.jpg" },
  { year: 2023, category: "Best Comedy", winner: "Spy x Family Season 2", malId: 158927, anilistId: 158927, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2023, category: "Best Fantasy", winner: "Mushoku Tensei Season 2", malId: 146065, anilistId: 146065, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg" },
  { year: 2023, category: "Best Drama", winner: "Vinland Saga Season 2", malId: 136430, anilistId: 136430, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-2fhDFPCuMNiz.jpg" },
  { year: 2023, category: "Best Score", winner: "Oshi no Ko", malId: 150672, anilistId: 150672, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2023, category: "Best New Series", winner: "Oshi no Ko", malId: 150672, anilistId: 150672, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2022
  // ============================================
  { year: 2022, category: "Anime of the Year", winner: "Demon Slayer: Entertainment District Arc", malId: 142329, anilistId: 142329, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2022, category: "Best Animation", winner: "Demon Slayer: Entertainment District Arc", malId: 142329, anilistId: 142329, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2022, category: "Best Action", winner: "Attack on Titan Final Season Part 2", malId: 131681, anilistId: 131681, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2022, category: "Best Romance", winner: "My Dress-Up Darling", malId: 132405, anilistId: 132405, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx132405-qP7FQYGmNI3d.jpg" },
  { year: 2022, category: "Best Comedy", winner: "Spy x Family", malId: 140960, anilistId: 140960, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2022, category: "Best Fantasy", winner: "Re:ZERO Season 2", malId: 108632, anilistId: 21355, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-wRVUrGxpvIQQ.jpg" },
  { year: 2022, category: "Best Drama", winner: "86 EIGHTY-SIX", malId: 116589, anilistId: 116589, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116589-KawXHB6sApFt.jpg" },
  { year: 2022, category: "Best Score", winner: "Spy x Family", malId: 140960, anilistId: 140960, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2022, category: "Best New Series", winner: "Spy x Family", malId: 140960, anilistId: 140960, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2021
  // ============================================
  { year: 2021, category: "Anime of the Year", winner: "Jujutsu Kaisen", malId: 113415, anilistId: 113415, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2021, category: "Best Animation", winner: "Demon Slayer: Mugen Train", malId: 112151, anilistId: 112151, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2021, category: "Best Action", winner: "Jujutsu Kaisen", malId: 113415, anilistId: 113415, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2021, category: "Best Romance", winner: "Horimiya", malId: 124080, anilistId: 124080, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-3i22mRVPBS0T.jpg" },
  { year: 2021, category: "Best Comedy", winner: "Kaguya-sama: Love is War Season 2", malId: 112641, anilistId: 112641, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg" },
  { year: 2021, category: "Best Fantasy", winner: "Re:ZERO Season 2", malId: 108632, anilistId: 21355, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-wRVUrGxpvIQQ.jpg" },
  { year: 2021, category: "Best Drama", winner: "86 EIGHTY-SIX", malId: 116589, anilistId: 116589, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116589-KawXHB6sApFt.jpg" },
  { year: 2021, category: "Best Score", winner: "Jujutsu Kaisen", malId: 113415, anilistId: 113415, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2021, category: "Best New Series", winner: "Jujutsu Kaisen", malId: 113415, anilistId: 113415, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },

  // ============================================
  // ANIME TRENDING AWARDS 2024
  // ============================================
  { year: 2024, category: "Anime of the Year", winner: "Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best Boy", winner: "Sung Jinwoo - Solo Leveling", malId: 151807, anilistId: 151807, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2024, category: "Best Girl", winner: "Frieren - Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best Couple", winner: "Lawrence & Holo - Spice & Wolf", malId: 154513, anilistId: 154513, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx2966-AEULMyYA9WKb.png" },
  { year: 2024, category: "Best Opening", winner: "SPECIALZ - Jujutsu Kaisen S2", malId: 145064, anilistId: 145064, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Ending", winner: "Haru no Hi - Frieren", malId: 170068, anilistId: 170068, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best Animation", winner: "Jujutsu Kaisen Season 2", malId: 145064, anilistId: 145064, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Voice Actor", winner: "Natsuki Hanae as Tanjiro Kamado", malId: 101922, anilistId: 101922, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2024, category: "Best Soundtrack", winner: "Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best Drama", winner: "Oshi no Ko Season 2", malId: 166531, anilistId: 166531, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },

  // ============================================
  // ANIME TRENDING AWARDS 2023
  // ============================================
  { year: 2023, category: "Anime of the Year", winner: "Oshi no Ko", malId: 150672, anilistId: 150672, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2023, category: "Best Boy", winner: "Kenma Kozume - Haikyuu!! FINAL", malId: 136512, anilistId: 136512, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20464-ooZUyBe4ptp9.png" },
  { year: 2023, category: "Best Girl", winner: "Ai Hoshino - Oshi no Ko", malId: 150672, anilistId: 150672, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2023, category: "Best Opening", winner: "IDOL - Oshi no Ko", malId: 150672, anilistId: 150672, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2023, category: "Best Animation", winner: "Demon Slayer: Swordsmith Village Arc", malId: 145139, anilistId: 145139, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2023, category: "Best Drama", winner: "Vinland Saga Season 2", malId: 136430, anilistId: 136430, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-2fhDFPCuMNiz.jpg" },

  // ============================================
  // MYANIMELIST (MAL) ANIME AWARDS 2024
  // ============================================
  { year: 2024, category: "Anime of the Year", winner: "Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best Animation", winner: "Demon Slayer: Hashira Training Arc", malId: 166240, anilistId: 166240, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2024, category: "Best Action", winner: "Jujutsu Kaisen Season 2", malId: 145064, anilistId: 145064, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Comedy", winner: "Kaguya-sama: Love is War - Ultra Romantic", malId: 137542, anilistId: 137542, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg" },
  { year: 2024, category: "Best Romance", winner: "Skip and Loafer", malId: 164962, anilistId: 164962, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx141911-o6Jwav7hRPPM.jpg" },
  { year: 2024, category: "Best Fantasy", winner: "Mushoku Tensei: Jobless Reincarnation Season 2", malId: 146065, anilistId: 146065, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg" },
  { year: 2024, category: "Best Drama", winner: "Violet Evergarden: The Movie", malId: 118872, anilistId: 118872, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-ubzq619ZA2E9.png" },
  { year: 2024, category: "Best Slice of Life", winner: "Bocchi the Rock!", malId: 148100, anilistId: 148100, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-HTDmeL4RGeJ4.png" },
  { year: 2024, category: "Best Suspense", winner: "Odd Taxi", malId: 130180, anilistId: 130180, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx128547-nNekWTKqmvEi.jpg" },

  // ============================================
  // MYANIMELIST (MAL) ANIME AWARDS 2023
  // ============================================
  { year: 2023, category: "Anime of the Year", winner: "Vinland Saga Season 2", malId: 136430, anilistId: 136430, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-2fhDFPCuMNiz.jpg" },
  { year: 2023, category: "Best Animation", winner: "Demon Slayer: Entertainment District Arc", malId: 142329, anilistId: 142329, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2023, category: "Best Action", winner: "Attack on Titan Final Season Part 2", malId: 131681, anilistId: 131681, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2023, category: "Best Drama", winner: "Vinland Saga Season 2", malId: 136430, anilistId: 136430, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-2fhDFPCuMNiz.jpg" },
  { year: 2023, category: "Best Comedy", winner: "Kaguya-sama: Love is War - Ultra Romantic", malId: 137542, anilistId: 137542, platform: "MyAnimeList", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg" },

  // ============================================
  // ANIME NEWS NETWORK (ANN) AWARDS 2024
  // ============================================
  { year: 2024, category: "Best Anime Series", winner: "Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best New Series", winner: "Oshi no Ko", malId: 150672, anilistId: 150672, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2024, category: "Best Film", winner: "Suzume", malId: 143802, anilistId: 143802, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142770-dDaDIRnsv5jN.jpg" },
  { year: 2024, category: "Best Continuing Series", winner: "One Piece", malId: 21, anilistId: 21, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2024, category: "Best Score", winner: "Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },

  // ============================================
  // ANIME NEWS NETWORK (ANN) AWARDS 2023
  // ============================================
  { year: 2023, category: "Best Anime Series", winner: "Mob Psycho 100 III", malId: 147109, anilistId: 147109, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21507-6YUSbh2m0N1p.jpg" },
  { year: 2023, category: "Best New Series", winner: "Spy x Family", malId: 140960, anilistId: 140960, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2023, category: "Best Film", winner: "The Tunnel to Summer, the Exit of Goodbyes", malId: 151085, anilistId: 151085, platform: "Anime News Network", type: "anime" },

  // ============================================
  // NEWTYPE ANIME AWARDS 2024
  // ============================================
  { year: 2024, category: "Best TV Anime", winner: "Oshi no Ko Season 2", malId: 166531, anilistId: 166531, platform: "Newtype", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2024, category: "Best Male Character", winner: "Sung Jinwoo - Solo Leveling", malId: 151807, anilistId: 151807, platform: "Newtype", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },
  { year: 2024, category: "Best Female Character", winner: "Frieren - Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Newtype", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2024, category: "Best Film", winner: "Demon Slayer: Infinity Castle", malId: 178788, anilistId: 178788, platform: "Newtype", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2024, category: "Best Soundtrack", winner: "Frieren: Beyond Journey's End", malId: 170068, anilistId: 170068, platform: "Newtype", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },

  // ============================================
  // TSUGIMANGA AWARDS 2024 (Manga)
  // ============================================
  { year: 2024, category: "Best Manga", winner: "One Piece", malId: 21, anilistId: 21, platform: "Tsugi ni Kuru Manga", type: "manga", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2024, category: "Best New Manga", winner: "Dandadan", malId: 171018, anilistId: 171018, platform: "Tsugi ni Kuru Manga", type: "manga", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2024, category: "Best Web Manga", winner: "Solo Leveling", malId: 151807, anilistId: 151807, platform: "Tsugi ni Kuru Manga", type: "manga", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png" },

  // ============================================
  // TSUGIMANGA AWARDS 2023 (Manga)
  // ============================================
  { year: 2023, category: "Best Manga", winner: "Sousou no Frieren", malId: 170068, anilistId: 170068, platform: "Tsugi ni Kuru Manga", type: "manga", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2023, category: "Best New Manga", winner: "Oshi no Ko", malId: 150672, anilistId: 150672, platform: "Tsugi ni Kuru Manga", type: "manga", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },

  // ============================================
  // JAPAN ACADEMY PRIZE (ANIME) 2024
  // ============================================
  { year: 2024, category: "Best Animation", winner: "The Boy and the Heron", malId: 142667, anilistId: 142667, platform: "Japan Academy Prize", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx109979-BRHXpBkCw4oc.jpg" },

  // ============================================
  // SATURN AWARDS (ANIME) 2024
  // ============================================
  { year: 2024, category: "Best Anime Series", winner: "One Piece", malId: 21, anilistId: 21, platform: "Saturn Awards", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2024, category: "Best Anime Film", winner: "Spider-Man: Across the Spider-Verse (Anime Influence)", malId: 0, platform: "Saturn Awards", type: "anime" },

  // ============================================
  // HIDIVE / SENTAI AWARDS 2024
  // ============================================
  { year: 2024, category: "Best Dubbed Anime", winner: "Oshi no Ko", malId: 150672, anilistId: 150672, platform: "HIDIVE", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2024, category: "Best Dub Performance", winner: "Megumi Han as Ai Hoshino", malId: 150672, anilistId: 150672, platform: "HIDIVE", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },

  // ============================================
  // LIVE ACTION / JDRAMAS 2024
  // ============================================
  { year: 2024, category: "Best Live-Action Adaptation", winner: "One Piece (Netflix) Season 2", malId: 21, anilistId: 21, platform: "Anime Awards", type: "live-action", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2023, category: "Best Live-Action Adaptation", winner: "One Piece (Netflix)", malId: 21, anilistId: 21, platform: "Anime Awards", type: "live-action", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2024, category: "Best J-Drama", winner: "Shogun", malId: 0, platform: "Japan Academy Prize", type: "live-action" },
  { year: 2023, category: "Best Live-Action Film", winner: "One Piece Film: Red (Live-Action Announced)", malId: 21, anilistId: 21, platform: "Saturn Awards", type: "live-action", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
];

export const AWARD_YEARS = [...new Set(ALL_AWARDS.map((a) => a.year))].sort((a, b) => b - a);

export const AWARD_PLATFORMS = [...new Set(ALL_AWARDS.map((a) => a.platform))];

export const AWARD_TYPES = [...new Set(ALL_AWARDS.map((a) => a.type))];

export function getAwardsByYear(year: number): AwardEntry[] {
  return ALL_AWARDS.filter((a) => a.year === year);
}

export function getAwardsByPlatform(platform: string): AwardEntry[] {
  return ALL_AWARDS.filter((a) => a.platform === platform);
}

export function getAwardsByType(type: string): AwardEntry[] {
  return ALL_AWARDS.filter((a) => a.type === type);
}

export function getAwardsByFilters(year?: number, platform?: string, type?: string): AwardEntry[] {
  let filtered = ALL_AWARDS;
  if (year) filtered = filtered.filter((a) => a.year === year);
  if (platform) filtered = filtered.filter((a) => a.platform === platform);
  if (type) filtered = filtered.filter((a) => a.type === type);
  return filtered;
}

export interface UpcomingAward {
  name: string;
  year: number;
  date: string;
  location: string;
  url: string;
  status: "upcoming" | "live" | "completed";
  category: "annual" | "seasonal" | "film";
  description: string;
}

export const UPCOMING_AWARDS: UpcomingAward[] = [
  {
    name: "Crunchyroll Anime Awards",
    year: 2027,
    date: "2027-05-22",
    location: "Tokyo, Japan",
    url: "https://www.crunchyroll.com/animeawards/",
    status: "upcoming",
    category: "annual",
    description: "The largest global anime awards celebrating the best of Japanese animation. 32+ categories voted by fans and judges worldwide.",
  },
  {
    name: "Anime Trending Awards",
    year: 2027,
    date: "2027-03-21",
    location: "Online",
    url: "https://www.anitrendz.com/ata",
    status: "upcoming",
    category: "annual",
    description: "13th ATA — community-voted awards across 30+ categories including character, theme song, and aspect awards.",
  },
  {
    name: "Newtype Anime Awards",
    year: 2026,
    date: "2026-10-15",
    location: "Machi★Asobi, Tokushima",
    url: "https://webnewtype.com/",
    status: "upcoming",
    category: "annual",
    description: "Reader's choice awards from Kadokawa's Monthly Newtype magazine. Covers TV, film, characters, and studio.",
  },
  {
    name: "MyAnimeList Anime Awards",
    year: 2026,
    date: "2027-02-15",
    location: "Online",
    url: "https://myanimelist.net/anime/awards",
    status: "upcoming",
    category: "annual",
    description: "MAL community awards with jury and public voting across 20+ categories.",
  },
  {
    name: "Anime News Network Awards",
    year: 2026,
    date: "2027-01-10",
    location: "Online",
    url: "https://www.animenewsnetwork.com",
    status: "upcoming",
    category: "annual",
    description: "ANN Readers' Choice Awards — fan-voted awards for best anime, manga, and industry achievements.",
  },
  {
    name: "Tokyo Anime Award Festival (TAAF)",
    year: 2027,
    date: "2027-03-01",
    location: "Tokyo, Japan",
    url: "https://taaf.jp/",
    status: "upcoming",
    category: "annual",
    description: "Industry-juried awards celebrating anime artistry. Grand Prize, Individual Awards, and Fan Award categories.",
  },
  {
    name: "AnimeJapan",
    year: 2027,
    date: "2027-03-28",
    location: "Tokyo Big Sight, Tokyo",
    url: "https://animejapan.jp/",
    status: "upcoming",
    category: "annual",
    description: "Japan's largest anime event. Features industry panels, exclusive reveals, and fan-voted rankings.",
  },
  {
    name: "r/anime Awards",
    year: 2026,
    date: "2027-02-20",
    location: "Online (Reddit)",
    url: "https://www.reddit.com/r/anime/",
    status: "upcoming",
    category: "annual",
    description: "Reddit's r/anime community awards with jury and public winner categories across 30+ genres.",
  },
  {
    name: "AniList Community Awards",
    year: 2026,
    date: "2027-01-05",
    location: "Online",
    url: "https://anilist.co/",
    status: "upcoming",
    category: "annual",
    description: "AniList community-voted awards celebrating the best anime and manga of the year.",
  },
  {
    name: "Crunchyroll Anime Awards 2026",
    year: 2026,
    date: "2026-05-23",
    location: "Tokyo, Japan",
    url: "https://www.crunchyroll.com/animeawards/",
    status: "completed",
    category: "annual",
    description: "10th Annual Crunchyroll Anime Awards — My Hero Academia FINAL SEASON won Anime of the Year.",
  },
];
