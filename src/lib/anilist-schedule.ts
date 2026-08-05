import { getAiringSchedule, type AiringScheduleEntry } from "./anilist";
import type { TvAnimeEntry } from "./tv-channels";

const IST_OFFSET = 5.5 * 60 * 60;

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

export interface AiringAnime {
  id: number;
  title: string;
  englishTitle?: string;
  episode: number;
  airTime: string;
  day: string;
  coverImage?: string;
  genres?: string[];
  format?: string;
  totalEpisodes?: number;
}

export interface StreamingCalendarEntry {
  id: number;
  title: string;
  episode: number;
  platform: string;
  date: string;
  time: string;
  color?: string;
}

const PLATFORM_MAP: { match: string[]; name: string }[] = [
  { match: ["crunchyroll"], name: "Crunchyroll" },
  { match: ["netflix"], name: "Netflix" },
  { match: ["amazon"], name: "Amazon Prime" },
  { match: ["disney", "hotstar"], name: "JioHotstar" },
  { match: ["muse", "ani-one"], name: "Muse Asia" },
];

function platformFromLinks(links?: { url: string; site?: string }[]): string {
  const sites = (links ?? []).map((l) => `${l.site ?? ""} ${l.url}`.toLowerCase());
  for (const p of PLATFORM_MAP) {
    if (sites.some((s) => p.match.some((m) => s.includes(m)))) return p.name;
  }
  return "Streaming";
}

function formatISTTime(airingAt: number): string {
  const ist = new Date((airingAt + IST_OFFSET) * 1000);
  let h = ist.getUTCHours();
  const m = ist.getUTCMinutes().toString().padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix} IST`;
}

export async function fetchStreamingCalendarWeek(): Promise<StreamingCalendarEntry[]> {
  const now = Math.floor(Date.now() / 1000);
  const weekEnd = now + 7 * 24 * 60 * 60;
  const entries = await getAiringSchedule(now, weekEnd);

  return entries
    .filter(
      (e) =>
        !e.media.isAdult &&
        e.media.countryOfOrigin !== "CN" &&
        e.media.format === "TV"
    )
    .map((e) => ({
      id: e.media.id,
      title: titleBest(e.media),
      episode: e.episode,
      platform: platformFromLinks(e.media.externalLinks),
      date: getDayOfWeek(e.airingAt),
      time: formatISTTime(e.airingAt),
      color: e.media.coverImage?.color || undefined,
    }));
}

export async function fetchWeeklyAiringSchedule(): Promise<AiringAnime[]> {
  const now = Math.floor(Date.now() / 1000);
  const weekEnd = now + 7 * 24 * 60 * 60;
  const entries = await getAiringSchedule(now, weekEnd);

  return entries.map((e: AiringScheduleEntry) => ({
    id: e.media.id,
    title: titleBest(e.media),
    englishTitle: e.media.title.english || undefined,
    episode: e.episode,
    airTime: timestampToIST(e.airingAt),
    day: getDayOfWeek(e.airingAt),
    coverImage: e.media.coverImage?.large || undefined,
    genres: e.media.genres || undefined,
    format: e.media.format || undefined,
    totalEpisodes: e.media.episodes || undefined,
  }));
}

export async function fetchTvAnimeEntries(): Promise<TvAnimeEntry[]> {
  const schedule = await fetchWeeklyAiringSchedule();
  const seen = new Set<string>();

  return schedule
    .filter((entry) => {
      const key = `${entry.id}-${entry.day}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((entry) => ({
      id: `anilist-${entry.id}`,
      title: entry.title,
      englishTitle: entry.englishTitle,
      episodes: entry.totalEpisodes,
      status: "RELEASING",
      genres: entry.genres,
      channel: entry.format === "TV" ? "anilist-simulcast" : undefined,
      airTime: entry.airTime,
      image: entry.coverImage,
    }));
}
