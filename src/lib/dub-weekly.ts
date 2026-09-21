import { nextAiringAt, formatIST } from "@/lib/indian-dub-schedule";

export type DubChannel =
  | "Muse India (YouTube)"
  | "Ani-One India (YouTube)"
  | "Crunchyroll"
  | "Anime Times"
  | "SonyLIV"
  | "JioHotstar"
  | "Cartoon Network"
  | "ETV Bal Bharat";

export interface WeeklyDubEntry {
  channel: DubChannel;
  show: string;
  link: string;
  schedule: string;
  note: string;
  onDemand?: boolean;
}

export const CHANNELS: readonly DubChannel[] = [
  "Muse India (YouTube)",
  "Ani-One India (YouTube)",
  "Crunchyroll",
  "Anime Times",
  "SonyLIV",
  "JioHotstar",
  "Cartoon Network",
  "ETV Bal Bharat",
];

export function channelSlug(channel: DubChannel): string {
  return channel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/g, "");
}

export const DUB_WEEKLY: WeeklyDubEntry[] = [
  {
    channel: "Muse India (YouTube)",
    show: "Welcome to Demon School! Iruma-kun — Season 3 Hindi Dub",
    link: "/indian-dubs",
    schedule: "Daily at 8:30 PM IST",
    note: "Fresh Hindi episode every day during the Season 3 rollout.",
  },
  {
    channel: "Muse India (YouTube)",
    show: "Attack on Titan — Hindi / Tamil / Telugu re-dub",
    link: "/indian-dubs/attack-on-titan-hindi-dub",
    schedule: "Seasonal rollout — new episode daily per season",
    note: "A separate fresh Muse dub (new cast), running season by season.",
  },
  {
    channel: "Ani-One India (YouTube)",
    show: "Bleach: Thousand-Year Blood War — The Calamity (Hindi)",
    link: "/watch-order/bleach",
    schedule: "Episode 1 out — finale part rolling out",
    note: "The final TYBW part streams free in Hindi on Ani-One India.",
  },
  {
    channel: "Crunchyroll",
    show: "Mushoku Tensei: Jobless Reincarnation — Season 3 Hindi Dub",
    link: "/indian-dubs",
    schedule: "Sundays at 4:30 PM IST",
    note: "New Hindi episode every Sunday during the airing season.",
  },
  {
    channel: "Crunchyroll",
    show: "One Piece — Egghead Arc Hindi / Tamil / Telugu",
    link: "/indian-dubs/one-piece-hindi-dub",
    schedule: "Mondays at 1:30 AM IST",
    note: "Large dub batches drop on Mondays during each arc rollout.",
  },
  {
    channel: "Crunchyroll",
    show: "Naruto: Shippuden — Hindi / Tamil / Telugu rollout",
    link: "/indian-dubs/naruto-shippuden-hindi-dub",
    schedule: "Batched rollout in progress",
    note: "The full 500-episode run arrives in batches from July 2026.",
  },
  {
    channel: "Crunchyroll",
    show: "Fullmetal Alchemist: Brotherhood — Hindi / Tamil / Telugu",
    link: "/indian-dubs/fullmetal-alchemist-brotherhood-hindi-dub",
    schedule: "Batches every ~3 weeks (July–October 2026)",
    note: "All 64 episodes dubbed; released in batches to extend the window.",
  },
  {
    channel: "Crunchyroll",
    show: "Jujutsu Kaisen — Hindi & Tamil",
    link: "/indian-dubs/jujutsu-kaisen-hindi-dub",
    schedule: "On demand",
    note: "Both seasons (47 episodes) complete in Hindi and Tamil.",
    onDemand: true,
  },
  {
    channel: "Crunchyroll",
    show: "Frieren: Beyond Journey's End — Hindi / Tamil / Telugu",
    link: "/indian-dubs/frieren-hindi-dub",
    schedule: "On demand",
    note: "Both seasons (56 episodes) fully dubbed in all three languages.",
    onDemand: true,
  },
  {
    channel: "Crunchyroll",
    show: "Solo Leveling — Hindi / Tamil / Telugu",
    link: "/indian-dubs/solo-leveling-hindi-dub",
    schedule: "On demand",
    note: "25 episodes across two seasons, all three languages.",
    onDemand: true,
  },
  {
    channel: "Anime Times",
    show: "Death Note — Hindi / Tamil / Telugu",
    link: "/indian-dubs/death-note-hindi-dub",
    schedule: "On demand",
    note: "Complete 37-episode run on the Prime Video anime channel.",
    onDemand: true,
  },
  {
    channel: "SonyLIV",
    show: "Dragon Ball Super — Hindi / Tamil / Telugu",
    link: "/indian-dubs/dragon-ball-super-hindi-dub",
    schedule: "On demand",
    note: "All 131 episodes, fully dubbed, streaming now.",
    onDemand: true,
  },
];

export function nextScheduled(entry: WeeklyDubEntry): { next: Date; formatted: string } | null {
  const ts = nextAiringAt(entry.schedule);
  if (ts == null) return null;
  const next = new Date(ts);
  return { next, formatted: formatIST(ts) };
}

export function getThisWeekRange(): { start: string; end: string; label: string } {
  const IST_OFFSET_MS = 5.5 * 3600 * 1000;
  const now = Date.now();
  const istMs = now + IST_OFFSET_MS;
  const dayMs = Math.floor(istMs / 86400000) * 86400000;
  const ist = new Date(istMs);
  const todayIdx = (ist.getUTCDay() + 6) % 7; // Monday = 0
  const mondayMs = dayMs - todayIdx * 86400000;
  const sundayMs = mondayMs + 6 * 86400000;

  const fmt = (istWallMs: number): string => {
    const d = new Date(istWallMs - IST_OFFSET_MS);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };
  const start = fmt(mondayMs);
  const end = fmt(sundayMs);
  return { start, end, label: `${start} – ${end}` };
}

export const CHANNEL_SLUGS: Record<DubChannel, string> = {
  "Muse India (YouTube)": "muse-india",
  "Ani-One India (YouTube)": "ani-one-india",
  Crunchyroll: "crunchyroll",
  "Anime Times": "anime-times",
  SonyLIV: "sonyliv",
  JioHotstar: "jiohotstar",
  "Cartoon Network": "cartoon-network",
  "ETV Bal Bharat": "etv-bal-bharat",
};

export function entriesForChannel(channel: DubChannel): WeeklyDubEntry[] {
  return DUB_WEEKLY.filter((e) => e.channel === channel);
}