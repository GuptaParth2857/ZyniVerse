import { getAiringSchedule, type AiringScheduleEntry } from "./anilist";

const IST_OFFSET = 5.5 * 60 * 60;

interface LiveShow {
  title: string;
  englishTitle?: string;
  episode: number;
  airTime: string;
  day: string;
  coverImage?: string;
  totalEpisodes?: number;
}

interface PlatformSchedule {
  platformId: string;
  shows: Record<string, LiveShow[]>;
}

function timestampToIST(airingAt: number): string {
  const ist = new Date((airingAt + IST_OFFSET) * 1000);
  const h = ist.getUTCHours().toString().padStart(2, "0");
  const m = ist.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function getDayOfWeek(airingAt: number): string {
  const d = new Date(airingAt * 1000);
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}

function titleBest(media: { title: { romaji?: string; english?: string } }): string {
  return media.title.english || media.title.romaji || "Unknown";
}

// Auto-detect platform from AniList externalLinks URLs
const URL_PLATFORM_MAP: { patterns: string[]; platforms: string[] }[] = [
  { patterns: ["crunchyroll.com"], platforms: ["crunchyroll"] },
  { patterns: ["netflix.com"], platforms: ["netflix_anime"] },
  { patterns: ["primevideo.com", "amazon.com"], platforms: ["prime_video"] },
  { patterns: ["youtube.com"], platforms: ["muse_asia", "muse_india"] },
  { patterns: ["sonyliv.com"], platforms: ["sony_liv"] },
  { patterns: ["hotstar.com", "jiohotstar.com"], platforms: ["jio_hotstar"] },
];

function detectPlatformsFromLinks(externalLinks?: { url: string }[]): string[] {
  if (!externalLinks) return [];
  const platforms = new Set<string>();
  for (const link of externalLinks) {
    const url = link.url.toLowerCase();
    for (const mapping of URL_PLATFORM_MAP) {
      if (mapping.patterns.some((p) => url.includes(p))) {
        mapping.platforms.forEach((p) => platforms.add(p));
      }
    }
  }
  return Array.from(platforms);
}

// Fallback manual platform map for shows where AniList doesn't have streaming links
const MANUAL_PLATFORM_MAP: Record<string, string[]> = {
  // Sony LIV (Crunchyroll add-on) - shows with Hindi dubs
  "liar game cour 2": ["sony_liv"],
  "grand blue dreaming s3": ["sony_liv"],
  // JioHotstar - library content (Hindi/Tamil/Telugu dubs)
  "demon slayer": ["jio_hotstar"],
  "my hero academia": ["jio_hotstar"],
  "jujutsu kaisen": ["jio_hotstar"],
  "haikyu!!": ["jio_hotstar"],
  "mob psycho 100": ["jio_hotstar"],
  "cells at work!": ["jio_hotstar"],
  "welcome to demon school! iruma-kun": ["jio_hotstar"],
  "bofuri": ["jio_hotstar"],
  "bleach: thousand-year blood war": ["jio_hotstar"],
  "spy x family": ["jio_hotstar"],
  "assassination classroom": ["jio_hotstar"],
  "mushoku tensei": ["jio_hotstar"],
  "sword art online": ["jio_hotstar"],
  "tokyo revengers": ["jio_hotstar"],
  "goblin slayer": ["jio_hotstar"],
  "the god of high school": ["jio_hotstar"],
  "jojo's bizarre adventure": ["jio_hotstar"],
  "campfire cooking in another world": ["jio_hotstar"],
  "junji ito collection": ["jio_hotstar"],
  "idaten jump": ["jio_hotstar"],
  "reborn to master the blade": ["jio_hotstar"],
  "cells at work! code black": ["jio_hotstar"],
  "my hero academia: vigilantes": ["jio_hotstar"],
};

// Platform IDs that are streaming (not linear TV)
const STREAMING_PLATFORMS = [
  "crunchyroll",
  "netflix_anime",
  "prime_video",
  "muse_asia",
  "muse_india",
  "sony_liv",
  "jio_hotstar",
];

export async function fetchLiveStreamingSchedules(): Promise<PlatformSchedule[]> {
  const now = Math.floor(Date.now() / 1000);
  const weekEnd = now + 7 * 24 * 60 * 60;

  const entries = await getAiringSchedule(now, weekEnd);

  // Group by platform
  const platformShows: Record<string, Record<string, LiveShow[]>> = {};
  for (const pid of STREAMING_PLATFORMS) {
    platformShows[pid] = {};
  }

  for (const entry of entries) {
    const title = titleBest(entry.media);
    const titleLower = title.toLowerCase();
    const day = getDayOfWeek(entry.airingAt);
    const airTime = timestampToIST(entry.airingAt);

    const show: LiveShow = {
      title,
      englishTitle: entry.media.title.english || undefined,
      episode: entry.episode,
      airTime,
      day,
      coverImage: entry.media.coverImage?.large || undefined,
      totalEpisodes: entry.media.episodes || undefined,
    };

    // Auto-detect platforms from AniList externalLinks
    let platforms = detectPlatformsFromLinks(entry.media.externalLinks);

    // Fallback to manual map if no platforms detected
    if (platforms.length === 0) {
      for (const [key, manualPlatforms] of Object.entries(MANUAL_PLATFORM_MAP)) {
        if (titleLower.includes(key) || key.includes(titleLower)) {
          platforms = manualPlatforms;
          break;
        }
      }
    }

    for (const pid of platforms) {
      if (platformShows[pid]) {
        if (!platformShows[pid][day]) platformShows[pid][day] = [];
        const exists = platformShows[pid][day].some(
          (s) => s.title === show.title && s.episode === show.episode
        );
        if (!exists) {
          platformShows[pid][day].push(show);
        }
      }
    }
  }

  // Sort each platform's shows by air time
  const result: PlatformSchedule[] = [];
  for (const [platformId, shows] of Object.entries(platformShows)) {
    for (const day of Object.keys(shows)) {
      shows[day].sort((a, b) => a.airTime.localeCompare(b.airTime));
    }
    result.push({ platformId, shows });
  }

  return result;
}
