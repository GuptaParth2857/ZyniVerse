export interface TvChannel {
  id: string;
  name: string;
  shortName: string;
  color: string;
  region: string;
  website: string;
  dthNumbers?: string;
  type: "tv" | "youtube";
  subscriberCount?: string;
  logoUrl?: string;
}

export interface TimeSlot {
  show: string;
  start: string;
  end: string;
  duration: number;
  description?: string;
}

export interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

export interface ChannelSchedule {
  channelId: string;
  schedules: DaySchedule[];
}

export interface TvAnimeEntry {
  id: string;
  title: string;
  englishTitle?: string;
  malId?: number;
  episodes?: number;
  status?: string;
  genres?: string[];
  channel?: string;
  airTime?: string;
  image?: string;
}

export const TV_ANIME_SCHEDULE: TvAnimeEntry[] = [];

// Non-AniList shows that need static posters (Indian cartoons, etc.)
const STATIC_POSTERS: Record<string, string> = {
  "Shin Chan": "https://upload.wikimedia.org/wikipedia/en/0/0b/Shin-chan_%28Japanese_logo%29.svg",
  "Shin-chan": "https://upload.wikimedia.org/wikipedia/en/0/0b/Shin-chan_%28Japanese_logo%29.svg",
  "Sinchan": "https://upload.wikimedia.org/wikipedia/en/0/0b/Shin-chan_%28Japanese_logo%29.svg",
  "Doraemon": "https://upload.wikimedia.org/wikipedia/en/b/b4/Doraemon_character.png",
  "Chhota Bheem": "https://upload.wikimedia.org/wikipedia/en/f/f9/Chhota_Bheem.jpg",
  "Motu Patlu": "https://upload.wikimedia.org/wikipedia/en/3/3b/Motu_Patlu.Jpg",
  "Taarak Mehta Ka Ooltah Chashmah": "https://upload.wikimedia.org/wikipedia/en/e/e2/Taarak_Mehta_Ka_Ooltah_Chashmah.jpg",
  "CID": "https://upload.wikimedia.org/wikipedia/en/b/b5/CID_%28Indian_TV_series%29.png",
  "Bandbudh Aur Budbak": "https://upload.wikimedia.org/wikipedia/en/0/08/Bandbudh_Aur_Budbak_logo.jpg",
  "Lamput": "https://upload.wikimedia.org/wikipedia/commons/d/da/Lamput.png",
  "Kiteretsu": "https://upload.wikimedia.org/wikipedia/en/d/d2/KiteretsuDaihyakka-vol1.jpg",
  "Little Singham": "https://upload.wikimedia.org/wikipedia/en/2/23/Cop_Universe_logo.jpg",
  "Beyblade Burst": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21236-8B4fORbuUp6v.jpg",
  "Pokemon": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b527-t6dBVJ5OVcXK.png",
  "Pokémon": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b527-t6dBVJ5OVcXK.png",
  "Dragon Ball Z": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx813-ZhnFNOeCU5dQ.png",
  "Dragon Ball": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx813-ZhnFNOeCU5dQ.png",
  "Naruto": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20-dE6UHbFFg1A5.jpg",
  "One Piece": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg",
  "Detective Conan": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx235-MyYT7K3chBdO.jpg",
  "Case Closed": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx235-MyYT7K3chBdO.jpg",
};

// In-memory cache for AniList-fetched posters
const posterCache = new Map<string, string>();
const posterFetchErrors = new Set<string>();

export function getShowPoster(showName: string): string | undefined {
  // 1. Check in-memory cache
  if (posterCache.has(showName)) return posterCache.get(showName);
  // 2. Check static posters
  if (STATIC_POSTERS[showName]) return STATIC_POSTERS[showName];
  // 3. Fuzzy match static posters
  const lower = showName.toLowerCase().replace(/[:\-!]/g, "").replace(/\s+/g, " ").trim();
  for (const [key, val] of Object.entries(STATIC_POSTERS)) {
    const kLower = key.toLowerCase().replace(/[:\-!]/g, "").replace(/\s+/g, " ").trim();
    if (lower.includes(kLower) || kLower.includes(lower)) return val;
  }
  return undefined;
}

// Fetch poster from AniList API (with caching)
export async function fetchShowPoster(showName: string): Promise<string | null> {
  // Already cached
  if (posterCache.has(showName)) return posterCache.get(showName) || null;
  // Previously failed
  if (posterFetchErrors.has(showName)) return null;

  try {
    const { searchMedia } = await import("./anilist");
    const result = await searchMedia({ search: showName, type: "ANIME", perPage: 1 });
    const media = result.media?.[0];
    if (media?.coverImage?.large) {
      posterCache.set(showName, media.coverImage.large);
      return media.coverImage.large;
    }
    // Try with cleaned title (remove "S2", "S3", "(Hindi)" etc)
    const cleaned = showName.replace(/\s*S\d+\s*/g, "").replace(/\s*\(.*?\)\s*/g, "").trim();
    if (cleaned !== showName) {
      const result2 = await searchMedia({ search: cleaned, type: "ANIME", perPage: 1 });
      const media2 = result2.media?.[0];
      if (media2?.coverImage?.large) {
        posterCache.set(showName, media2.coverImage.large);
        return media2.coverImage.large;
      }
    }
    posterFetchErrors.add(showName);
    return null;
  } catch {
    posterFetchErrors.add(showName);
    return null;
  }
}

// Pre-fetch posters for all shows in a schedule (batch)
export async function prefetchShowPosters(showNames: string[]): Promise<void> {
  const unique = [...new Set(showNames)].filter((n) => !posterCache.has(n) && !posterFetchErrors.has(n));
  // Fetch in batches of 5 to respect AniList rate limits
  for (let i = 0; i < unique.length; i += 5) {
    const batch = unique.slice(i, i + 5);
    await Promise.all(batch.map((name) => fetchShowPoster(name)));
  }
}

export const TV_CHANNELS: Record<string, TvChannel> = {
  cn: {
    id: "cn",
    name: "Cartoon Network",
    shortName: "CN",
    color: "#4CAF50",
    region: "India",
    website: "https://www.cartoonnetwork.in",
    dthNumbers: "Tata Play 667, Airtel 666",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/250px-Cartoon_Network_2010_logo.svg.png",
  },
  sony_yay: {
    id: "sony_yay",
    name: "SONY YAY!",
    shortName: "YAY",
    color: "#FF4081",
    region: "India",
    website: "https://www.sonyyay.com",
    dthNumbers: "Tata Play 663, Airtel 665",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/SONY_YAY_2022_Logo.png/250px-SONY_YAY_2022_Logo.png",
  },
  hungama: {
    id: "hungama",
    name: "Hungama",
    shortName: "HG",
    color: "#FF6F00",
    region: "India",
    website: "https://www.hungama.com",
    dthNumbers: "Tata Play 655, Airtel 453",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Hungama_TV.svg/250px-Hungama_TV.svg.png",
  },
  super_hungama: {
    id: "super_hungama",
    name: "Super Hungama",
    shortName: "SH",
    color: "#FF9800",
    region: "India",
    website: "https://www.hungama.com",
    dthNumbers: "Tata Play 656",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Hungama_TV.svg/250px-Hungama_TV.svg.png",
  },
  pogo: {
    id: "pogo",
    name: "Pogo",
    shortName: "PO",
    color: "#2196F3",
    region: "India",
    website: "https://www.pogotv.in",
    dthNumbers: "Tata Play 660, Airtel 664",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/POGO-logo.svg/250px-POGO-logo.svg.png",
  },
  nick: {
    id: "nick",
    name: "Nickelodeon",
    shortName: "NK",
    color: "#FF5722",
    region: "India",
    website: "https://www.nickindia.com",
    dthNumbers: "Tata Play 662, Airtel 661",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Nickelodeon_2023_logo_%28outline%29.svg/250px-Nickelodeon_2023_logo_%28outline%29.svg.png",
  },
  nick_jr: {
    id: "nick_jr",
    name: "Nick Jr.",
    shortName: "NJ",
    color: "#FF9800",
    region: "India",
    website: "https://www.nickindia.com",
    dthNumbers: "Tata Play 661, Airtel 662",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nick_Jr._logo.svg/250px-Nick_Jr._logo.svg.png",
  },
  sonic: {
    id: "sonic",
    name: "Nickelodeon Sonic",
    shortName: "SN",
    color: "#E91E63",
    region: "India",
    website: "https://www.nickindia.com",
    dthNumbers: "Tata Play 663, Airtel 663",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Nickelodeon_Sonic_logo.svg/250px-Nickelodeon_Sonic_logo.svg.png",
  },
  disney_channel: {
    id: "disney_channel",
    name: "Disney Channel",
    shortName: "DC",
    color: "#1A73E8",
    region: "India",
    website: "https://www.hotstar.com",
    dthNumbers: "Tata Play 650, Airtel 650",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Disney_Channel_%282024%29_logo.svg/250px-Disney_Channel_%282024%29_logo.svg.png",
  },
  disney_junior: {
    id: "disney_junior",
    name: "Disney Junior",
    shortName: "DJ",
    color: "#4CAF50",
    region: "India",
    website: "https://www.hotstar.com",
    dthNumbers: "Tata Play 651, Airtel 651",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Disney_Junior_%282024%29_logo.svg/250px-Disney_Junior_%282024%29_logo.svg.png",
  },
  epic_kids: {
    id: "epic_kids",
    name: "EPIC Kids",
    shortName: "EPK",
    color: "#9C27B0",
    region: "India",
    website: "https://www.epicon.in",
    dthNumbers: "Tata Play 652",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Epic_TV_logo.svg/250px-Epic_TV_logo.svg.png",
  },
  animax: {
    id: "animax",
    name: "Animax",
    shortName: "AMX",
    color: "#F44336",
    region: "India",
    website: "https://www.sonyliv.com",
    dthNumbers: "Tata Play 665, Airtel 660",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Animax_2024_logo.svg/250px-Animax_2024_logo.svg.png",
  },
  discovery_kids: {
    id: "discovery_kids",
    name: "Discovery Kids",
    shortName: "DK",
    color: "#00BCD4",
    region: "India",
    website: "https://www.discoverykids.in",
    dthNumbers: "Tata Play 664",
    type: "tv",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Discovery_Kids_2021_2D_sin_wordmark.svg/250px-Discovery_Kids_2021_2D_sin_wordmark.svg.png",
  },
  sony_liv: {
    id: "sony_liv",
    name: "Sony LIV",
    shortName: "SLV",
    color: "#6C28D2",
    region: "India",
    website: "https://www.sonyliv.com",
    type: "youtube",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f7/SonyLIV_2020.png",
  },
  jio_hotstar: {
    id: "jio_hotstar",
    name: "JioHotstar",
    shortName: "JHS",
    color: "#005FA8",
    region: "India",
    website: "https://www.hotstar.com",
    type: "youtube",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/JioHotstar_logo.svg/250px-JioHotstar_logo.svg.png",
  },
  muse_asia: {
    id: "muse_asia",
    name: "Muse Asia",
    shortName: "MA",
    color: "#FF0000",
    region: "Asia",
    website: "https://www.youtube.com/@MuseAsia",
    type: "youtube",
    subscriberCount: "8.67M",
    logoUrl: "https://yt3.googleusercontent.com/g0wRRtSUd80WQcCUib0DWVK8CgUcjn_djL9Pg1sC875q9Hjf4CqTK3dvaLW3GBaAPtAXIUa6=s900-c-k-c0x00ffffff-no-rj",
  },
  muse_india: {
    id: "muse_india",
    name: "Muse India",
    shortName: "MI",
    color: "#E91E63",
    region: "India",
    website: "https://www.youtube.com/@MuseIndia",
    type: "youtube",
    subscriberCount: "1.2M",
    logoUrl: "https://yt3.googleusercontent.com/EhiAEsA972_jooWrHY8oLLDS1C9L84-YVNyKclXsNSKB2tYnUqqqi_O10JkcPd64EnaburVG=s900-c-k-c0x00ffffff-no-rj",
  },
  crunchyroll: {
    id: "crunchyroll",
    name: "Crunchyroll",
    shortName: "CR",
    color: "#F47521",
    region: "India",
    website: "https://www.crunchyroll.com",
    type: "youtube",
    subscriberCount: "15M+",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Crunchyroll_logo_2024.png/250px-Crunchyroll_logo_2024.png",
  },
  netflix_anime: {
    id: "netflix_anime",
    name: "Netflix Anime",
    shortName: "NX",
    color: "#E50914",
    region: "India",
    website: "https://www.netflix.com",
    type: "youtube",
    subscriberCount: "280M+ subs",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/250px-Netflix_2015_logo.svg.png",
  },
  prime_video: {
    id: "prime_video",
    name: "Prime Video Anime",
    shortName: "PV",
    color: "#00A8E1",
    region: "India",
    website: "https://www.primevideo.com",
    type: "youtube",
    subscriberCount: "200M+ subs",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Amazon_Prime_Video_example_screenshot.png/250px-Amazon_Prime_Video_example_screenshot.png",
  },
};

// TV channel schedules are fetched live from INTV Schedule CDN (see src/lib/epg.ts)
// No hardcoded schedules needed for TV channels — they use real-time EPG data

const MUSE_ASIA_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [
    { show: "KAIJU GIRL CARAMELISE", start: "19:00", end: "19:30", duration: 30, description: "New episode - Thursdays" },
    { show: "The Exiled Heavy Knight", start: "19:30", end: "20:00", duration: 30, description: "New episode - Thursdays" },
    { show: "BanG Dream! YUME INFINITA", start: "20:00", end: "20:30", duration: 30, description: "New episode - Thursdays" },
  ],
  Friday: [
    { show: "Draw This, Then Die!", start: "19:00", end: "19:30", duration: 30, description: "New episode - Fridays" },
    { show: "The Elusive Samurai S2", start: "19:30", end: "20:00", duration: 30, description: "Premiere - Friday Jul 17" },
  ],
  Saturday: [
    { show: "BLACK TORCH", start: "19:00", end: "19:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Skeleton Knight in Another World S2", start: "19:30", end: "20:00", duration: 30, description: "New episode - Saturdays" },
    { show: "GROW UP SHOW -Sunflower Circus-", start: "20:00", end: "20:30", duration: 30, description: "New episode - Saturdays" },
  ],
  Sunday: [
    { show: "Mushoku Tensei: Jobless Reincarnation S3", start: "10:00", end: "10:30", duration: 30, description: "New episode - Sundays" },
    { show: "The 100 Girlfriends S3", start: "10:30", end: "11:00", duration: 30, description: "New episode - Sundays" },
    { show: "The World's Strongest Rearguard", start: "11:00", end: "11:30", duration: 30, description: "New episode - Sundays" },
    { show: "The World Is Dancing", start: "21:30", end: "22:00", duration: 30, description: "New episode - Sundays 9:30PM GMT+8" },
  ],
};

const MUSE_INDIA_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [
    { show: "KAIJU GIRL CARAMELISE (Hindi Sub)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Thursdays" },
    { show: "The Exiled Heavy Knight (Hindi Sub)", start: "21:00", end: "21:30", duration: 30, description: "New episode - Thursdays" },
    { show: "BanG Dream! YUME INFINITA (Hindi Sub)", start: "21:30", end: "22:00", duration: 30, description: "New episode - Thursdays" },
  ],
  Friday: [
    { show: "Draw This, Then Die! (Hindi Sub)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Fridays" },
    { show: "The Elusive Samurai S2 (Hindi Sub)", start: "21:00", end: "21:30", duration: 30, description: "Premiere - Friday Jul 17" },
  ],
  Saturday: [
    { show: "BLACK TORCH (Hindi Sub)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Skeleton Knight in Another World S2 (Hindi Sub)", start: "21:00", end: "21:30", duration: 30, description: "New episode - Saturdays" },
    { show: "GROW UP SHOW (Hindi Sub)", start: "21:30", end: "22:00", duration: 30, description: "New episode - Saturdays" },
  ],
  Sunday: [
    { show: "Mushoku Tensei S3 (Hindi Sub)", start: "20:00", end: "20:30", duration: 30, description: "New episode - Sundays" },
    { show: "The 100 Girlfriends S3 (Hindi Sub)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Sundays" },
    { show: "The World's Strongest Rearguard (Hindi Sub)", start: "21:00", end: "21:30", duration: 30, description: "New episode - Sundays" },
  ],
};

const CRUNCHYROLL_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [
    { show: "Love Unseen Beneath the Clear Night Sky", start: "16:00", end: "16:30", duration: 30, description: "New episode - Mondays" },
    { show: "The Insipid Prince's Furtive Grab for The Throne", start: "16:30", end: "17:00", duration: 30, description: "New episode - Mondays" },
    { show: "Grand Blue Dreaming S3", start: "17:00", end: "17:30", duration: 30, description: "New episode - Mondays" },
    { show: "A Livid Lady's Guide to Getting Even", start: "18:00", end: "18:30", duration: 30, description: "New episode - Mondays" },
    { show: "LIAR GAME", start: "21:30", end: "22:00", duration: 30, description: "New episode - Mondays (9 AM PT)" },
  ],
  Tuesday: [
    { show: "The Oblivious Saint Can't Contain Her Power", start: "17:00", end: "17:30", duration: 30, description: "New episode - Tuesdays" },
    { show: "Yoroi-Shinden Samurai Troopers Part 2", start: "17:30", end: "18:00", duration: 30, description: "New episode - Tuesdays" },
    { show: "Victoria of Many Faces", start: "18:00", end: "18:30", duration: 30, description: "New episode - Tuesdays" },
    { show: "I Want to Love You Till Your Dying Day", start: "18:30", end: "19:00", duration: 30, description: "New episode - Tuesdays" },
    { show: "Young Ladies Don't Play Fighting Games", start: "19:00", end: "19:30", duration: 30, description: "New episode - Tuesdays" },
    { show: "Red River", start: "19:30", end: "20:00", duration: 30, description: "New episode - Tuesdays" },
  ],
  Wednesday: [
    { show: "Hana-Kimi Season 2", start: "16:30", end: "17:00", duration: 30, description: "New episode - Wednesdays" },
    { show: "The Villager of Level 999", start: "17:00", end: "17:30", duration: 30, description: "New episode - Wednesdays" },
    { show: "Clevatess S2", start: "17:30", end: "18:00", duration: 30, description: "New episode - Wednesdays" },
    { show: "Tomb Raider King", start: "18:00", end: "18:30", duration: 30, description: "New episode - Wednesdays" },
    { show: "Heroine? Saint? No, I'm an All-Works Maid!", start: "18:30", end: "19:00", duration: 30, description: "New episode - Wednesdays (10 PM JST)" },
    { show: "Re:ZERO S4", start: "19:00", end: "19:30", duration: 30, description: "New episode - Wednesdays (10 PM JST)" },
    { show: "Saga of Tanya the Evil II", start: "19:30", end: "20:00", duration: 30, description: "New episode - Wednesdays" },
    { show: "Trapped in a Dating Sim S2", start: "20:00", end: "20:30", duration: 30, description: "New episode - Wednesdays" },
  ],
  Thursday: [
    { show: "Bungo Stray Dogs WAN! 2", start: "14:30", end: "15:00", duration: 30, description: "New episode - Thursdays (6 PM JST)" },
    { show: "KAIJU GIRL CARAMELISE", start: "15:00", end: "15:30", duration: 30, description: "New episode - Thursdays (6:30 PM JST)" },
    { show: "The Exiled Heavy Knight", start: "15:30", end: "16:00", duration: 30, description: "New episode - Thursdays (7 PM JST)" },
    { show: "Dara-san of Reiwa", start: "16:00", end: "16:30", duration: 30, description: "New episode - Thursdays (7:30 PM JST)" },
    { show: "Crowned in a Hundred Days", start: "16:30", end: "17:00", duration: 30, description: "New episode - Thursdays (8 PM JST)" },
    { show: "From Overshadowed to Overpowered", start: "17:00", end: "17:30", duration: 30, description: "New episode - Thursdays" },
    { show: "BanG Dream! YUME INFINITA", start: "17:30", end: "18:00", duration: 30, description: "New episode - Thursdays" },
    { show: "Smoking Behind the Supermarket with You", start: "18:00", end: "18:30", duration: 30, description: "New episode - Thursdays" },
    { show: "MEBIUS DUST", start: "18:30", end: "19:00", duration: 30, description: "New episode - Thursdays" },
  ],
  Friday: [
    { show: "Sorry About My Little Brothers", start: "16:00", end: "16:30", duration: 30, description: "New episode - Fridays" },
    { show: "I Became a Legend After My 10 Year-Long Last Stand", start: "16:30", end: "17:00", duration: 30, description: "New episode - Fridays" },
    { show: "Draw This, Then Die!", start: "17:00", end: "17:30", duration: 30, description: "New episode - Fridays" },
    { show: "The Frontier Lord Begins with Zero Subjects", start: "17:30", end: "18:00", duration: 30, description: "New episode - Fridays" },
    { show: "The Elusive Samurai S2", start: "18:00", end: "18:30", duration: 30, description: "New episode - Fridays" },
    { show: "That Time I Got Reincarnated as a Slime S4", start: "20:30", end: "21:00", duration: 30, description: "New episode - Fridays (8 AM PT)" },
    { show: "RILAKKUMA", start: "21:00", end: "21:30", duration: 30, description: "New episode - Fridays (6 PM PT)" },
    { show: "The Drops of God", start: "21:30", end: "22:00", duration: 30, description: "New episode - Fridays (8:30 AM PT)" },
  ],
  Saturday: [
    { show: "Ascendance of a Bookworm", start: "15:00", end: "15:30", duration: 30, description: "New episode - Saturdays (2:30 AM PT)" },
    { show: "Welcome to Demon School! Iruma-kun S4", start: "15:55", end: "16:25", duration: 30, description: "New episode - Saturdays (3:25 AM PT)" },
    { show: "Detective Conan", start: "17:00", end: "17:30", duration: 30, description: "New episode - Saturdays (4:30 AM PT)" },
    { show: "BLACK TORCH", start: "18:30", end: "19:00", duration: 30, description: "New episode - Saturdays (10 PM JST)" },
    { show: "Skeleton Knight in Another World S2", start: "19:00", end: "19:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Jaadugar: A Witch in Mongolia", start: "20:00", end: "20:30", duration: 30, description: "New episode - Saturdays (11:30 PM JST)" },
    { show: "The Cat and the Dragon", start: "20:30", end: "21:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Magical Girl Lyrical Nanoha EXCEEDS", start: "21:00", end: "21:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Daemons of the Shadow Realm", start: "21:30", end: "22:00", duration: 30, description: "New episode - Saturdays (9 AM PT)" },
    { show: "The Ogre's Bride", start: "22:00", end: "22:30", duration: 30, description: "New episode - Saturdays" },
    { show: "GROW UP SHOW -Sunflower Circus-", start: "22:30", end: "23:00", duration: 30, description: "New episode - Saturdays" },
    { show: "The Duke's Son Claims He Won't Love Me Yet", start: "23:00", end: "23:30", duration: 30, description: "New episode - Saturdays" },
    { show: "Rich Girl Caretaker", start: "23:30", end: "00:00", duration: 30, description: "New episode - Saturdays" },
    { show: "Recommendations from Iwamoto-Senpai", start: "00:00", end: "00:30", duration: 30, description: "New episode - Sundays" },
    { show: "Hanaori-san Still Wants to Fight", start: "00:30", end: "01:00", duration: 30, description: "New episode - Sundays" },
  ],
  Sunday: [
    { show: "Star Detective Precure!", start: "06:00", end: "06:30", duration: 30, description: "New episode - Sundays (5:30 PM PT Sat)" },
    { show: "DIGIMON BEATBREAK", start: "06:30", end: "07:00", duration: 30, description: "New episode - Sundays (7 PM PT Sat)" },
    { show: "Mushoku Tensei: Jobless Reincarnation S3", start: "14:30", end: "15:00", duration: 30, description: "New episode - Sundays (6 PM JST)" },
    { show: "You and I Are Polar Opposites S2", start: "15:00", end: "15:30", duration: 30, description: "New episode - Sundays" },
    { show: "Goodbye, Lara", start: "15:30", end: "16:00", duration: 30, description: "New episode - Sundays" },
    { show: "Anime AzurLane: Slow Ahead! Season 2", start: "16:00", end: "16:30", duration: 30, description: "New episode - Sundays" },
    { show: "The World's Strongest Rearguard", start: "16:30", end: "17:00", duration: 30, description: "New episode - Sundays" },
    { show: "One Piece HEROINES", start: "17:00", end: "17:30", duration: 30, description: "New episode - Sundays" },
    { show: "Let's Go KAIKIGUMI", start: "17:30", end: "18:00", duration: 30, description: "New episode - Sundays" },
    { show: "Iron Wok Jan!", start: "18:00", end: "18:30", duration: 30, description: "New episode - Sundays" },
    { show: "The 100 Girlfriends S3", start: "18:30", end: "19:00", duration: 30, description: "New episode - Sundays" },
    { show: "Though I Am an Inept Villainess", start: "19:00", end: "19:30", duration: 30, description: "New episode - Sundays" },
    { show: "The Classroom of a Black Cat and a Witch", start: "20:30", end: "21:00", duration: 30, description: "New episode - Sundays (8 AM PT)" },
    { show: "ONE PIECE", start: "21:30", end: "22:00", duration: 30, description: "New episode - Sundays (9 AM PT)" },
    { show: "Case Closed", start: "22:00", end: "22:30", duration: 30, description: "New episode - Sundays" },
  ],
};

const NETFLIX_ANIME_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [
    { show: "Chainsmoker Cat", start: "18:00", end: "18:30", duration: 30, description: "New episode - Fridays (Netflix, from Jul 3)" },
  ],
  Saturday: [
    { show: "Daemons of the Shadow Realm", start: "18:00", end: "18:30", duration: 30, description: "New episode - Saturdays (Netflix, from Jul 4)" },
  ],
  Sunday: [
    { show: "Sparks of Tomorrow (KyoAni)", start: "18:00", end: "18:30", duration: 30, description: "New episode - Sundays (Netflix Original, from Jul 5)" },
    { show: "Akane-Banashi", start: "18:30", end: "19:00", duration: 30, description: "New episode - Sundays (Netflix simulcast)" },
  ],
};

const PRIME_VIDEO_ANIME_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [
    { show: "The Ghost in the Shell (Science SARU)", start: "20:30", end: "21:00", duration: 30, description: "New episode - Mondays 8:30PM IST (Prime Video exclusive)" },
  ],
  Tuesday: [],
  Wednesday: [
    { show: "From Old Country Bumpkin to Master Swordsman S2", start: "18:00", end: "18:30", duration: 30, description: "New episode - Wednesdays (Prime Video)" },
  ],
  Thursday: [],
  Friday: [],
  Saturday: [
    { show: "Magilumiere Magical Girls Inc. S2", start: "19:00", end: "19:30", duration: 30, description: "New episode - Saturdays (Prime Video)" },
  ],
  Sunday: [],
};

const JIO_HOTSTAR_WEEKLY: Record<string, TimeSlot[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function cloneScheduleForDay(day: string, template: DaySchedule): DaySchedule {
  return { day, slots: [...template.slots] };
}

// TV channel schedules are fetched live from INTV Schedule CDN (see src/lib/epg.ts)
// Only streaming platform schedules remain hardcoded here
export const CHANNEL_SCHEDULES: ChannelSchedule[] = [
  {
    channelId: "muse_asia",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: MUSE_ASIA_WEEKLY[d] || [] })),
  },
  {
    channelId: "muse_india",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: MUSE_INDIA_WEEKLY[d] || [] })),
  },
  {
    channelId: "crunchyroll",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: CRUNCHYROLL_WEEKLY[d] || [] })),
  },
  {
    channelId: "netflix_anime",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: NETFLIX_ANIME_WEEKLY[d] || [] })),
  },
  {
    channelId: "prime_video",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: PRIME_VIDEO_ANIME_WEEKLY[d] || [] })),
  },
  {
    channelId: "jio_hotstar",
    schedules: ALL_DAYS.map((d) => ({ day: d, slots: JIO_HOTSTAR_WEEKLY[d] || [] })),
  },
];

export function getScheduleForChannel(channelId: string, day?: string): DaySchedule | undefined {
  const channelSchedule = CHANNEL_SCHEDULES.find((cs) => cs.channelId === channelId);
  if (!channelSchedule) return undefined;
  const dayName = day || getDayName();
  return channelSchedule.schedules.find((s) => s.day === dayName);
}

export function getTodaySchedule(): { channel: TvChannel; slots: TimeSlot[] }[] {
  const today = getDayName();
  return CHANNEL_SCHEDULES.map((cs) => {
    const channel = TV_CHANNELS[cs.channelId];
    const schedule = cs.schedules.find((s) => s.day === today);
    return { channel, slots: schedule?.slots || [] };
  }).filter((item) => item.slots.length > 0);
}

export function getNowPlaying(): { channel: TvChannel; slot: TimeSlot }[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = getDayName();

  return CHANNEL_SCHEDULES.map((cs) => {
    const channel = TV_CHANNELS[cs.channelId];
    if (!channel) return null;

    const isStreaming = channel.type === "youtube";
    if (isStreaming) return null;

    const schedule = cs.schedules.find((s) => s.day === today);
    if (!schedule) return null;

    const currentSlot = schedule.slots.find((slot) => {
      const [startH, startM] = slot.start.split(":").map(Number);
      const [endH, endM] = slot.end.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      if (endMinutes === 0 && startMinutes > 0) {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      }
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });

    if (!currentSlot) return null;
    return { channel, slot: currentSlot };
  }).filter((item): item is { channel: TvChannel; slot: TimeSlot } => item !== null);
}

export function getDayName(date?: Date): string {
  const d = date || new Date();
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}

export function getNext7Days(): string[] {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = new Date().getDay();
  const result: string[] = [];
  for (let i = -6; i <= 0; i++) {
    result.push(days[(today + i + 7) % 7]);
  }
  return result;
}

export function findAnimeSchedule(title: string): { channelId: string; slots: TimeSlot[] }[] {
  if (!title) return [];
  const normalized = title.toLowerCase().trim();
  const results: { channelId: string; slots: TimeSlot[] }[] = [];

  for (const cs of CHANNEL_SCHEDULES) {
    const channel = TV_CHANNELS[cs.channelId];
    if (channel?.type === "youtube") continue;
    const todaySchedule = cs.schedules.find((s) => s.day === getDayName());
    if (!todaySchedule) continue;

    const matchingSlots = todaySchedule.slots.filter((slot) => {
      const slotLower = slot.show.toLowerCase();
      return slotLower.includes(normalized) || normalized.includes(slotLower);
    });

    if (matchingSlots.length > 0) {
      results.push({ channelId: cs.channelId, slots: matchingSlots });
    }
  }

  return results;
}
