export type MangaCadence = "weekly" | "biweekly" | "monthly" | "irregular" | "hiatus";

export interface MangaReleaseSeries {
  slug: string;
  title: string;
  romaji?: string;
  magazine: string;
  cadence: MangaCadence;
  releaseDay?: string; // e.g. "Sunday"
  releaseTimeIST?: string; // e.g. "12:15 PM"
  anilistId?: number;
  summary: string;
  platform: string;
  chaptersNote?: string;
  source: string; // e.g. "Manga Plus" / "Official announcement"
  updated: string;
}

export const MANGA_RELEASES: MangaReleaseSeries[] = [
  {
    slug: "one-piece",
    title: "One Piece",
    romaji: "Wan Pīsu",
    magazine: "Weekly Shonen Jump",
    cadence: "weekly",
    releaseDay: "Sunday",
    releaseTimeIST: "12:15 PM",
    anilistId: 21,
    summary:
      "The world's biggest manga. New chapters drop on Weekly Shonen Jump's Sunday slot and are free on Manga Plus the same day. Every week is a new chapter unless Jump announces a scheduled break.",
    platform: "Manga Plus",
    source: "Weekly Shonen Jump / Manga Plus",
    updated: "Ongoing",
  },
  {
    slug: "chainsaw-man",
    title: "Chainsaw Man",
    romaji: "Chainsaw Man",
    magazine: "Shueisha JUMP+",
    cadence: "irregular",
    releaseDay: "Wednesday",
    releaseTimeIST: "",
    anilistId: 40748,
    summary:
      "Tatsuki Fujimoto's modern classic. Part 3 rolls out on Shueisha's JUMP+ app — releases arrive in seasonal batches on the app when announced, so the date shifts instead of a fixed weekly slot.",
    platform: "Manga Plus",
    source: "JUMP+ / Manga Plus",
    chaptersNote: "Parts released in batches",
    updated: "Ongoing",
  },
  {
    slug: "solo-leveling-ragnarok",
    title: "Solo Leveling: Ragnarok",
    magazine: "Kakao Webtoon",
    cadence: "weekly",
    releaseDay: "Thursday",
    releaseTimeIST: "",
    anilistId: 160465,
    summary:
      "Manhwa sequel to Solo Leveling, following Sung Suho as he inherits the System. Chapters go up on Kakao Webtoon on a weekly slot.",
    platform: "Kakao Webtoon",
    source: "Kakao Webtoon",
    updated: "Ongoing",
  },
  {
    slug: "boruto-two-blue-vortex",
    title: "Boruto: Two Blue Vortex",
    romaji: "BORUTO-TWO BLUE VORTEX",
    magazine: "V Jump",
    cadence: "monthly",
    releaseDay: "21st of month",
    releaseTimeIST: "",
    anilistId: 176897,
    summary:
      "The sequel manga to Boruto: Naruto Next Generations, serialized in V Jump with a monthly chapter release.",
    platform: "Manga Plus",
    source: "V Jump / Manga Plus",
    updated: "Ongoing",
  },
  {
    slug: "spy-x-family",
    title: "Spy x Family",
    romaji: "Spy × Family",
    magazine: "Shueisha JUMP+",
    cadence: "biweekly",
    anilistId: 128345,
    summary:
      "The Forger family comedy by Tatsuya Endo serializes on JUMP+, usually with two chapters per month rather than every single week.",
    platform: "Manga Plus",
    source: "JUMP+ / Manga Plus",
    updated: "Ongoing",
  },
  {
    slug: "frieren",
    title: "Frieren: Beyond Journey's End",
    romaji: "Sousou no Frieren",
    magazine: "Weekly Shonen Sunday",
    cadence: "biweekly",
    anilistId: 154587,
    summary:
      "The award-winning fantasy by Kanehito Yamada and Tsukasa Abe serializes in Shogakukan's Weekly Shonen Sunday and updates roughly every two weeks.",
    platform: "VIZ / mag-servant",
    source: "Weekly Shonen Sunday",
    updated: "Ongoing",
  },
  {
    slug: "my-hero-academia",
    title: "My Hero Academia",
    romaji: "Boku no Hero Academia",
    magazine: "Weekly Shonen Jump",
    cadence: "hiatus",
    anilistId: 105333,
    summary:
      "The manga concluded its main run — no weekly chapters anymore. Expect spinoffs and side stories on anniversary dates only.",
    platform: "Manga Plus",
    source: "Official announcement",
    chaptersNote: "Main story concluded",
    updated: "Concluded",
  },
  {
    slug: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    romaji: "Jujutsu Kaisen",
    magazine: "Weekly Shonen Jump",
    cadence: "hiatus",
    anilistId: 113415,
    summary:
      "Gege Akutami's manga ended its serialization. No new chapters are being released — only anime content (S3) continues.",
    platform: "Manga Plus",
    source: "Official announcement",
    chaptersNote: "Manga concluded (2024)",
    updated: "Concluded",
  },
  {
    slug: "hunter-x-hunter",
    title: "Hunter x Hunter",
    romaji: "Hunter × Hunter",
    magazine: "Weekly Shonen Jump",
    cadence: "hiatus",
    releaseDay: "",
    anilistId: 11061,
    summary:
      "Yoshihiro Togashi's legendary series returns to Weekly Shonen Jump in unpredictable batches on hiatus. Keep an eye on the 'New chapters' shelf — we add it to the countdown the day the resumption is announced.",
    platform: "Manga Plus",
    source: "Weekly Shonen Jump / Manga Plus",
    chaptersNote: "Hiatus between batches",
    updated: "Ongoing (periodic)",
  },
];

export const RELEASE_DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export function nextReleaseTimeISO(s: MangaReleaseSeries): string | null {
  if (s.cadence === "hiatus" || !s.releaseDay) return null;
  const dayIdx = RELEASE_DAY_INDEX[s.releaseDay];
  if (dayIdx === undefined) return null;

  const timeMatch = s.releaseTimeIST?.match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i);
  const hours = timeMatch
    ? (parseInt(timeMatch[1], 10) % 12) + (timeMatch[3]?.toUpperCase() === "PM" ? 12 : 0)
    : 12;
  const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;

  // Compute in IST wall-clock, then convert back to an ISO UTC timestamp.
  const IST_OFFSET = 5.5 * 3600 * 1000;
  const now = Date.now();
  const istMs = now + IST_OFFSET;
  const istDayMs = Math.floor(istMs / 86400000) * 86400000;
  const todayIdx = new Date(istMs).getUTCDay();
  const diff = (dayIdx - todayIdx + 7) % 7;
  let finalDiff = diff;
  if (finalDiff === 0) {
    const targetToday = istDayMs + hours * 3600000 + minutes * 60000;
    if (targetToday < istMs) finalDiff = 7; // release already passed today
  }
  const targetIstMs = istDayMs + finalDiff * 86400000 + hours * 3600000 + minutes * 60000;
  return new Date(targetIstMs - IST_OFFSET).toISOString();
}

export function formatNextRelease(s: MangaReleaseSeries): string | null {
  const iso = nextReleaseTimeISO(s);
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getSeries(slug: string): MangaReleaseSeries | undefined {
  return MANGA_RELEASES.find((s) => s.slug === slug);
}

export function isReleasedToday(s: MangaReleaseSeries): boolean {
  if (s.cadence === "hiatus" || !s.releaseDay) return false;
  const IST_OFFSET = 5.5 * 3600 * 1000;
  const now = Date.now();
  const istMs = now + IST_OFFSET;
  const istDayMs = Math.floor(istMs / 86400000) * 86400000;
  const timeMatch = s.releaseTimeIST?.match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i);
  const hours = timeMatch
    ? (parseInt(timeMatch[1], 10) % 12) + (timeMatch[3]?.toUpperCase() === "PM" ? 12 : 0)
    : 12;
  const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;
  const targetToday = istDayMs + hours * 3600000 + minutes * 60000;
  const todayIdx = new Date(istMs).getUTCDay();
  return RELEASE_DAY_INDEX[s.releaseDay] === todayIdx && targetToday <= istMs;
}