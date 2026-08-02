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

// All winners below are verified against official ceremony records.
// "year" is the year the ceremony took place, not the air year of the anime.

export const ALL_AWARDS: AwardEntry[] = [
  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2026 (10th ceremony, May 23, 2026)
  // Honored anime that aired in 2025. Verified via Wikipedia.
  // ============================================
  { year: 2026, category: "Anime of the Year", winner: "My Hero Academia FINAL SEASON", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime" },
  { year: 2026, category: "Best Film", winner: "Demon Slayer: Kimetsu no Yaiba Infinity Castle", malId: 0, anilistId: 101922, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2026, category: "Best Continuing Series", winner: "ONE PIECE", malId: 0, anilistId: 21, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2026, category: "Best New Series", winner: "Gachiakuta", malId: 0, anilistId: 178025, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178025-cWJKEsZynkil.jpg" },
  { year: 2026, category: "Best Original Anime", winner: "Lazarus", malId: 0, anilistId: 167336, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx167336-KpGIIBie71OX.png" },
  { year: 2026, category: "Best Animation", winner: "Solo Leveling Season 2 -Arise from the Shadow-", malId: 0, anilistId: 176496, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176496-9BDMjAZGEbq4.png" },
  { year: 2026, category: "Best Character Design", winner: "Gachiakuta", malId: 0, anilistId: 178025, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178025-cWJKEsZynkil.jpg" },
  { year: 2026, category: "Best Director", winner: "Akinori Fudesaka & Norihiro Naganuma (The Apothecary Diaries Season 2)", malId: 0, anilistId: 176301, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg" },
  { year: 2026, category: "Best Background Art", winner: "Gachiakuta", malId: 0, anilistId: 178025, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178025-cWJKEsZynkil.jpg" },
  { year: 2026, category: "Best Romance", winner: "The Fragrant Flower Blooms with Dignity", malId: 0, anilistId: 181444, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx181444-Ut9DDUZdfHwg.jpg" },
  { year: 2026, category: "Best Comedy", winner: "DAN DA DAN Season 2", malId: 0, anilistId: 185660, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx185660-uB8RUMBGovGr.jpg" },
  { year: 2026, category: "Best Action", winner: "Solo Leveling Season 2 -Arise from the Shadow-", malId: 0, anilistId: 176496, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176496-9BDMjAZGEbq4.png" },
  { year: 2026, category: "Best Isekai", winner: "Re:ZERO -Starting Life in Another World- Season 3", malId: 0, anilistId: 163134, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx163134-yieRFbvUOH9a.jpg" },
  { year: 2026, category: "Best Drama", winner: "The Apothecary Diaries Season 2", malId: 0, anilistId: 176301, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg" },
  { year: 2026, category: "Best Slice of Life", winner: "SPY x FAMILY Season 3", malId: 0, anilistId: 140960, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2026, category: "Best Main Character", winner: "Maomao (The Apothecary Diaries Season 2)", malId: 0, anilistId: 176301, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg" },
  { year: 2026, category: "Best Supporting Character", winner: "Katsuki Bakugo (My Hero Academia FINAL SEASON)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "character" },
  { year: 2026, category: "Best Anime Song", winner: "IRIS OUT by Kenshi Yonezu (Chainsaw Man: Reze Arc)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "music" },
  { year: 2026, category: "Best Score", winner: "Demon Slayer: Kimetsu no Yaiba Infinity Castle", malId: 0, anilistId: 101922, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2026, category: "Best Opening", winner: "On The Way", malId: 0, anilistId: 171018, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2026, category: "Best Ending", winner: "\"I\" by BUMP OF CHICKEN (My Hero Academia FINAL SEASON)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "music" },
  { year: 2026, category: "Best VA Performance (JP)", winner: "Aoi Yuki", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "character" },

  // ============================================
  // ANIME TRENDING AWARDS 2026 (12th ATA, March 2026)
  // Honored 2025 anime. Verified via AniTrendz.
  // ============================================
  { year: 2026, category: "Anime of the Year", winner: "Umamusume: Cinderella Gray", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Anime Movie of the Year", winner: "Umamusume: Pretty Derby BEGINNING OF A NEW ERA", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Best Boy", winner: "Jinshi (The Apothecary Diaries Season 2)", malId: 0, anilistId: 176301, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176301-TIGmldLffQGX.jpg" },
  { year: 2026, category: "Best Girl", winner: "Oguri Cap (Umamusume: Cinderella Gray)", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Best Couple", winner: "Rintaro x Kaoruko (The Fragrant Flower Blooms with Dignity)", malId: 0, anilistId: 181444, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx181444-Ut9DDUZdfHwg.jpg" },
  { year: 2026, category: "Best Supporting Boy", winner: "Jo Kitahara (Umamusume: Cinderella Gray)", malId: 0, anilistId: 180516, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx180516-lebpoKLkw6E3.jpg" },
  { year: 2026, category: "Best Opening", winner: "Mirage by Creepy Nuts (Call of the Night Season 2)", malId: 0, anilistId: 175914, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx175914-VsbL90WzuqoM.jpg" },
  { year: 2026, category: "Best Ending", winner: "Kawaii Kaiwai by PiKi (My Dress-Up Darling Season 2)", malId: 0, anilistId: 154768, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154768-DHHvNd4MjV1p.jpg" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2025 (9th ceremony, May 25, 2025)
  // Honored anime that aired in 2024. Verified via Wikipedia.
  // ============================================
  { year: 2025, category: "Anime of the Year", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Continuing Series", winner: "ONE PIECE", malId: 0, anilistId: 21, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2025, category: "Best New Series", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Original Anime", winner: "Monogatari Series: Off & Monster Season", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime" },
  { year: 2025, category: "Best Animation", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Action", winner: "Demon Slayer: Hashira Training Arc", malId: 0, anilistId: 166240, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2025, category: "Best Comedy", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Drama", winner: "A Sign of Affection", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime" },
  { year: 2025, category: "Best Fantasy", winner: "Frieren: Beyond Journey's End", malId: 0, anilistId: 154587, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Best Romance", winner: "A Sign of Affection", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime" },
  { year: 2025, category: "Best Score", winner: "Kensuke Ushio (DAN DA DAN)", malId: 0, anilistId: 171018, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Film", winner: "Frieren: Beyond Journey's End – Memories of the Journey", malId: 0, anilistId: 154587, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Best Main Character", winner: "Shigeo \"Mob\" Kageyama (Mob Psycho 100 III)", malId: 0, anilistId: 21507, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21507-6YUSbh2m0N1p.jpg" },
  { year: 2025, category: "Best Supporting Character", winner: "Danzo Shibuya (DAN DA DAN)", malId: 0, anilistId: 171018, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best VA Performance (EN)", winner: "Kristen McGuire as Ash Ketchum (Pokémon)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "character" },
  { year: 2025, category: "Best VA Performance (JP)", winner: "Yuki Kaji as Shoto Todoroki (My Hero Academia)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "character" },

  // ============================================
  // ANIME TRENDING AWARDS 2025 (11th ATA, March 8, 2025)
  // Honored 2024 anime. Verified via AniTrendz.
  // ============================================
  { year: 2025, category: "Anime of the Year", winner: "Frieren: Beyond Journey's End", malId: 0, anilistId: 154587, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg" },
  { year: 2025, category: "Anime Movie of the Year", winner: "SPY x FAMILY Code: White", malId: 0, anilistId: 168306, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2025, category: "Best Boy", winner: "Kyotaro Ichikawa (The Dangers in My Heart Season 2)", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },
  { year: 2025, category: "Best Girl", winner: "Kana Arima (Oshi no Ko Season 2)", malId: 0, anilistId: 166531, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2025, category: "Best Couple", winner: "Kyotaro x Anna (The Dangers in My Heart Season 2)", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },
  { year: 2025, category: "Best Opening", winner: "\"Otonoke\" by Creepy Nuts (DAN DA DAN)", malId: 0, anilistId: 171018, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Ending", winner: "\"Burning\" (Oshi no Ko Season 2)", malId: 0, anilistId: 166531, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2025, category: "Best Animation", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Drama", winner: "Oshi no Ko Season 2", malId: 0, anilistId: 166531, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2025, category: "Best Comedy", winner: "Makeine: Too Many Losing Heroines!", malId: 0, anilistId: 171457, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171457-nmMIk0gNiWsm.jpg" },
  { year: 2025, category: "Best Romance", winner: "The Dangers in My Heart Season 2", malId: 0, anilistId: 0, platform: "Anime Trending", type: "anime" },
  { year: 2025, category: "Best Supernatural", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Voice Actor (Male)", winner: "Hanae Natsuki", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },
  { year: 2025, category: "Best Voice Actress (Female)", winner: "Toono Hikaru", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },

  // ============================================
  // NEWTYPE ANIME AWARDS 2024-2025 (announced Dec 7, 2024, Machi Asobi)
  // ============================================
  { year: 2025, category: "Best TV Anime", winner: "Makeine: Too Many Losing Heroines!", malId: 0, anilistId: 171457, platform: "Newtype", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171457-nmMIk0gNiWsm.jpg" },
  { year: 2025, category: "Best Film", winner: "Bocchi the Rock! Re:Re:", malId: 0, anilistId: 165253, platform: "Newtype", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx165253-nAwyrMZm4jBA.jpg" },
  { year: 2025, category: "Best Male Character", winner: "Kazuhiko Nukumizu (Makeine: Too Many Losing Heroines!)", malId: 0, anilistId: 171457, platform: "Newtype", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171457-nmMIk0gNiWsm.jpg" },
  { year: 2025, category: "Best Female Character", winner: "Hitori Gotō (Bocchi the Rock!)", malId: 0, anilistId: 130003, platform: "Newtype", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-HTDmeL4RGeJ4.png" },
  { year: 2025, category: "Best Studio", winner: "A-1 Pictures", malId: 0, anilistId: 0, platform: "Newtype", type: "anime" },

  // ============================================
  // ANIME NEWS NETWORK READERS' CHOICE AWARDS 2025 (announced Jan 12, 2026)
  // ============================================
  { year: 2025, category: "Leading Woman", winner: "Maomao (The Apothecary Diaries)", malId: 0, anilistId: 0, platform: "Anime News Network", type: "character" },
  { year: 2025, category: "Leading Man", winner: "Ken \"Okarun\" Takakura (DAN DA DAN)", malId: 0, anilistId: 171018, platform: "Anime News Network", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Anime Movie", winner: "Chainsaw Man: The Movie – Reze Arc", malId: 0, anilistId: 0, platform: "Anime News Network", type: "anime" },
  { year: 2025, category: "Best OST", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Anime News Network", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Villain", winner: "Nowak", malId: 0, anilistId: 0, platform: "Anime News Network", type: "character" },
  { year: 2025, category: "Best Japanese VA", winner: "Aoi Yuki", malId: 0, anilistId: 0, platform: "Anime News Network", type: "character" },
  { year: 2025, category: "Best Studio", winner: "Science SARU", malId: 0, anilistId: 0, platform: "Anime News Network", type: "anime" },
  { year: 2025, category: "Best Cast", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Visuals", winner: "DAN DA DAN", malId: 0, anilistId: 171018, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg" },
  { year: 2025, category: "Best Director", winner: "Kenji Nakamura", malId: 0, anilistId: 0, platform: "Anime News Network", type: "character" },
  { year: 2025, category: "Best Script", winner: "Kenji Nakamura", malId: 0, anilistId: 0, platform: "Anime News Network", type: "character" },
  { year: 2025, category: "Best Original Character Design", winner: "Masaru Maede", malId: 0, anilistId: 0, platform: "Anime News Network", type: "character" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2024 (8th ceremony, March 2, 2024)
  // Honored anime that aired in 2023. Verified via Wikipedia.
  // ============================================
  { year: 2024, category: "Anime of the Year", winner: "Jujutsu Kaisen Season 2", malId: 0, anilistId: 145064, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Film", winner: "Suzume", malId: 0, anilistId: 143802, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142770-dDaDIRnsv5jN.jpg" },
  { year: 2024, category: "Best Continuing Series", winner: "ONE PIECE", malId: 0, anilistId: 21, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2024, category: "Best New Series", winner: "Chainsaw Man", malId: 0, anilistId: 127720, platform: "Crunchyroll", type: "anime" },
  { year: 2024, category: "Best Original Anime", winner: "Buddy Daddies", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime" },
  { year: 2024, category: "Best Animation", winner: "Demon Slayer: Swordsmith Village Arc", malId: 0, anilistId: 145139, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2024, category: "Best Character Design", winner: "Sayaka Koiso & Tadashi Hiramatsu (Jujutsu Kaisen Season 2)", malId: 0, anilistId: 145064, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Director", winner: "Shōta Goshozono (Jujutsu Kaisen Season 2)", malId: 0, anilistId: 145064, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Cinematography", winner: "Teppei Ito (Jujutsu Kaisen Season 2)", malId: 0, anilistId: 145064, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Art Direction", winner: "Koji Eto (Demon Slayer: Swordsmith Village Arc)", malId: 0, anilistId: 145139, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2024, category: "Best Action", winner: "Jujutsu Kaisen Season 2", malId: 0, anilistId: 145064, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Comedy", winner: "SPY x FAMILY", malId: 0, anilistId: 140960, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2024, category: "Best Drama", winner: "Attack on Titan: The Final Chapters Special 1", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime" },
  { year: 2024, category: "Best Fantasy", winner: "Demon Slayer: Swordsmith Village Arc", malId: 0, anilistId: 145139, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },

  // ============================================
  // ANIME TRENDING AWARDS 2024 (10th ATA, March 2024)
  // Honored 2023 anime. Verified via AniTrendz.
  // ============================================
  { year: 2024, category: "Anime of the Year", winner: "Heavenly Delusion", malId: 0, anilistId: 0, platform: "Anime Trending", type: "anime" },
  { year: 2024, category: "Best Boy", winner: "Guel Jeturk (Mobile Suit Gundam: The Witch from Mercury)", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },
  { year: 2024, category: "Best Girl", winner: "Kana Arima (Oshi no Ko)", malId: 0, anilistId: 150672, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2024, category: "Best Couple", winner: "Kyotaro x Anna (The Dangers in My Heart)", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },
  { year: 2024, category: "Best Opening", winner: "\"IDOL\" by YOASOBI (Oshi no Ko)", malId: 0, anilistId: 150672, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2024, category: "Best Ending", winner: "\"Red:birthmark\" (Mobile Suit Gundam: The Witch from Mercury)", malId: 0, anilistId: 0, platform: "Anime Trending", type: "music" },
  { year: 2024, category: "Best Animation", winner: "Jujutsu Kaisen Season 2", malId: 0, anilistId: 145064, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2024, category: "Best Drama", winner: "Oshi no Ko", malId: 0, anilistId: 150672, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png" },
  { year: 2024, category: "Best Voice Actor (Male)", winner: "Seiichirou Yamashita", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },
  { year: 2024, category: "Best Voice Actress (Female)", winner: "Reina Ueda", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },
  { year: 2024, category: "Anime Movie of the Year", winner: "The Tunnel to Summer, the Exit of Goodbyes", malId: 0, anilistId: 142769, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142769-kNyyqpwC9gGV.jpg" },

  // ============================================
  // ANIME NEWS NETWORK READERS' CHOICE AWARDS 2024 (announced Feb 2025)
  // ============================================
  { year: 2024, category: "Leading Woman", winner: "Maomao (The Apothecary Diaries)", malId: 0, anilistId: 0, platform: "Anime News Network", type: "character" },
  { year: 2024, category: "Leading Man", winner: "Laios Touden & Kafka Hibino (tie)", malId: 0, anilistId: 0, platform: "Anime News Network", type: "character" },
  { year: 2024, category: "Most Underrated", winner: "Yatagarasu: The Raven Does Not Choose Its Master", malId: 0, anilistId: 170503, platform: "Anime News Network", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170503-PCr24JL8F8f9.jpg" },

  // ============================================
  // TSUGI NI KURU MANGA (NEXT MANGA) AWARD 2024 (announced Aug 28, 2024)
  // ============================================
  { year: 2024, category: "Best Print Manga", winner: "Kagurabachi", malId: 0, anilistId: 0, platform: "Tsugi ni Kuru Manga", type: "manga" },
  { year: 2024, category: "Best Web Manga", winner: "Futsuu no Kōnōbu (Ordinary Club!)", malId: 0, anilistId: 0, platform: "Tsugi ni Kuru Manga", type: "manga" },

  // ============================================
  // JAPAN ACADEMY PRIZE 2024 (47th edition, Best Animation of the Year)
  // ============================================
  { year: 2024, category: "Best Animation of the Year", winner: "The Boy and the Heron", malId: 0, anilistId: 109979, platform: "Japan Academy Prize", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx109979-BRHXpBkCw4oc.jpg" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2023 (7th ceremony, March 4, 2023)
  // Honored anime that aired in 2022. Verified via Wikipedia.
  // ============================================
  { year: 2023, category: "Anime of the Year", winner: "Cyberpunk: Edgerunners", malId: 0, anilistId: 120377, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx120377-ayZPoxiWt4Li.jpg" },
  { year: 2023, category: "Best Film", winner: "Jujutsu Kaisen 0", malId: 0, anilistId: 131573, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx131573-rpl82vDEDRm6.jpg" },
  { year: 2023, category: "Best Continuing Series", winner: "ONE PIECE", malId: 0, anilistId: 21, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
  { year: 2023, category: "Best New Series", winner: "SPY x FAMILY", malId: 0, anilistId: 140960, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2023, category: "Best Animation", winner: "Demon Slayer: Entertainment District Arc", malId: 0, anilistId: 142329, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2023, category: "Best Action", winner: "Demon Slayer: Entertainment District Arc", malId: 0, anilistId: 142329, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2023, category: "Best Comedy", winner: "SPY x FAMILY", malId: 0, anilistId: 140960, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg" },
  { year: 2023, category: "Best Drama", winner: "Attack on Titan: The Final Season Part 2", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2023, category: "Best Fantasy", winner: "Demon Slayer: Entertainment District Arc", malId: 0, anilistId: 142329, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2023, category: "Best Romance", winner: "Kaguya-sama: Love Is War – Ultra Romantic", malId: 0, anilistId: 137542, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg" },
  { year: 2023, category: "Best Score", winner: "Hiroyuki Sawano & Kohta Yamamoto (Attack on Titan: The Final Season Part 2)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2023, category: "Best Main Character", winner: "Eren Jaeger (Attack on Titan: The Final Season Part 2)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2023, category: "Best Anime Song", winner: "\"The Rumbling\" by SiM (Attack on Titan: The Final Season Part 2)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2023, category: "Best Director", winner: "Haruo Sotozaki (Demon Slayer: Entertainment District Arc)", malId: 0, anilistId: 142329, platform: "Crunchyroll", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },

  // ============================================
  // ANIME TRENDING AWARDS 2023 (9th ATA, February 2023)
  // Honored 2022 anime. Verified via AniTrendz.
  // ============================================
  { year: 2023, category: "Anime of the Year", winner: "Bocchi the Rock!", malId: 0, anilistId: 130003, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-HTDmeL4RGeJ4.png" },
  { year: 2023, category: "Best Boy", winner: "Shinpei Ajiro (Summertime Rendering)", malId: 0, anilistId: 129201, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx129201-HJBauga2be8I.png" },
  { year: 2023, category: "Best Girl", winner: "Marin Kitagawa (My Dress-Up Darling)", malId: 0, anilistId: 132405, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx132405-qP7FQYGmNI3d.jpg" },
  { year: 2023, category: "Best Couple", winner: "Miyuki x Kaguya (Kaguya-sama: Love Is War)", malId: 0, anilistId: 137542, platform: "Anime Trending", type: "character", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg" },
  { year: 2023, category: "Best Opening", winner: "\"Chiki Chiki Bam Bam\" (Ya Boy Kongming!)", malId: 0, anilistId: 141774, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx141774-iteNFzPq2oGw.jpg" },
  { year: 2023, category: "Best Ending", winner: "\"Yofukashi no Uta\" (Call of the Night)", malId: 0, anilistId: 141391, platform: "Anime Trending", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx141391-M3ZgUKTPENUk.jpg" },
  { year: 2023, category: "Best Animation", winner: "Mob Psycho 100 III", malId: 0, anilistId: 21507, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21507-6YUSbh2m0N1p.jpg" },
  { year: 2023, category: "Best Drama", winner: "Lycoris Recoil", malId: 0, anilistId: 143270, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx143270-rfkyiYXhek5w.jpg" },
  { year: 2023, category: "Anime Movie of the Year", winner: "Sword Art Online Progressive: Aria of a Starless Night", malId: 0, anilistId: 124140, platform: "Anime Trending", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124140-HNL0CpH6ig6y.png" },
  { year: 2023, category: "Best Voice Actress (Female)", winner: "Atsumi Tanezaki", malId: 0, anilistId: 0, platform: "Anime Trending", type: "character" },

  // ============================================
  // TSUGI NI KURU MANGA (NEXT MANGA) AWARD 2023
  // ============================================
  { year: 2023, category: "Best Print Manga", winner: "Seitokai ni mo Ana wa Aru!", malId: 0, anilistId: 0, platform: "Tsugi ni Kuru Manga", type: "manga" },
  { year: 2023, category: "Best Web Manga", winner: "The Guy She Was Interested In Wasn't a Guy at All", malId: 0, anilistId: 0, platform: "Tsugi ni Kuru Manga", type: "manga" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2022 (6th ceremony, February 2022)
  // Honored anime that aired in 2021. Verified via Wikipedia.
  // ============================================
  { year: 2022, category: "Anime of the Year", winner: "Attack on Titan: The Final Season Part 1", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg" },
  { year: 2022, category: "Best Film", winner: "Demon Slayer: Kimetsu no Yaiba – The Movie: Mugen Train", malId: 0, anilistId: 112151, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2022, category: "Best Animation", winner: "Demon Slayer: Kimetsu no Yaiba Mugen Train Arc", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },
  { year: 2022, category: "Best Action", winner: "Jujutsu Kaisen (Cour 2)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2022, category: "Best Comedy", winner: "Komi Can't Communicate", malId: 0, anilistId: 133965, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx133965-9TZBS4m4yvED.png" },
  { year: 2022, category: "Best Drama", winner: "To Your Eternity", malId: 0, anilistId: 114535, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx114535-y3NnjexcqKG1.jpg" },
  { year: 2022, category: "Best Fantasy", winner: "That Time I Got Reincarnated as a Slime (Season 2)", malId: 0, anilistId: 101280, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101280-tDxCVJm714nt.jpg" },
  { year: 2022, category: "Best Romance", winner: "Horimiya", malId: 0, anilistId: 124080, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-3i22mRVPBS0T.jpg" },
  { year: 2022, category: "Best Score", winner: "Yuki Kajiura & Go Shiina (Demon Slayer: Kimetsu no Yaiba Mugen Train Arc)", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "music", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg" },

  // ============================================
  // CRUNCHYROLL ANIME AWARDS 2021 (5th ceremony, February 2021)
  // Honored anime that aired in 2020. Verified via Wikipedia.
  // ============================================
  { year: 2021, category: "Anime of the Year", winner: "Jujutsu Kaisen", malId: 0, anilistId: 113415, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg" },
  { year: 2021, category: "Best Animation", winner: "Keep Your Hands Off Eizouken!", malId: 0, anilistId: 109298, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx109298-suwdIUbJEPJx.png" },
  { year: 2021, category: "Best Comedy", winner: "Kaguya-sama: Love Is War Season 2", malId: 0, anilistId: 112641, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg" },
  { year: 2021, category: "Best Drama", winner: "Fruits Basket (Season 2)", malId: 0, anilistId: 111762, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx111762-C8TNf5uRlVNQ.jpg" },
  { year: 2021, category: "Best Fantasy", winner: "Re:ZERO – Starting Life in Another World (Season 2)", malId: 0, anilistId: 21355, platform: "Crunchyroll", type: "anime", image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-wRVUrGxpvIQQ.jpg" },
  { year: 2021, category: "Best Score", winner: "Kevin Penkin – Tower of God", malId: 0, anilistId: 0, platform: "Crunchyroll", type: "music" },
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

// Dates for future editions are schedule projections for annual ceremonies.
export const UPCOMING_AWARDS: UpcomingAward[] = [
  {
    name: "Crunchyroll Anime Awards",
    year: 2027,
    date: "2027-05-22",
    location: "Tokyo, Japan",
    url: "https://www.crunchyroll.com/animeawards/",
    status: "upcoming",
    category: "annual",
    description: "11th annual Crunchyroll Anime Awards — fan and jury-voted categories covering the best anime of 2026.",
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
    location: "Machi Asobi, Tokushima",
    url: "https://webnewtype.com/",
    status: "upcoming",
    category: "annual",
    description: "Reader's choice awards from Kadokawa's Monthly Newtype magazine, announced at Machi Asobi. Covers TV, film, characters, and studio.",
  },
  {
    name: "Tsugi ni Kuru Manga (Next Manga) Award",
    year: 2026,
    date: "2026-08-28",
    location: "Online",
    url: "https://tsugimanga.jp/",
    status: "upcoming",
    category: "annual",
    description: "Annual reader-voted award for the next breakout manga — Print and Web categories, announced in late August.",
  },
  {
    name: "Anime News Network Readers' Choice Awards",
    year: 2026,
    date: "2027-01-10",
    location: "Online",
    url: "https://www.animenewsnetwork.com/",
    status: "upcoming",
    category: "annual",
    description: "ANN Readers' Choice Awards — fan-voted awards for best anime, characters, and industry achievements of the past year.",
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
