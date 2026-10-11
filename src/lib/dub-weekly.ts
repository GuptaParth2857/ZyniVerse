import { getDubFeeds } from "@/lib/dub-feeds";

export type DubChannel =
  | "Muse India (YouTube)"
  | "Ani-One India (YouTube)"
  | "Crunchyroll";

export interface LiveDubEntry {
  channel: DubChannel;
  show: string;
  language: string;
  /** ISO 8601 publish time from the source feed (real). */
  published: string;
  url: string;
  thumbnail: string | null;
}

export const CHANNELS: readonly DubChannel[] = [
  "Muse India (YouTube)",
  "Ani-One India (YouTube)",
  "Crunchyroll",
];

export const CHANNEL_SLUGS: Record<DubChannel, string> = {
  "Muse India (YouTube)": "muse-india",
  "Ani-One India (YouTube)": "ani-one-india",
  Crunchyroll: "crunchyroll",
};

export function channelSlug(channel: DubChannel): string {
  return CHANNEL_SLUGS[channel];
}

/** Maps dub-feeds source ids to the channel labels used on this page. */
const FEED_TO_CHANNEL: Record<string, DubChannel> = {
  "muse-india": "Muse India (YouTube)",
  "ani-one-india": "Ani-One India (YouTube)",
};

function cleanTitle(raw: string): string {
  return raw
    .replace(/[⟪⟫【】\[\]()]/g, " ")
    .replace(/\b(hindi|tamil|telugu|kannada|malayalam|marathi|bengali)\s*dub(?:bed)?\b/gi, " ")
    .replace(/\b(?:en|jp|english|japanese)\s*(?:sub|dub)\b/gi, " ")
    .replace(/\|\s*muse\s*(?:in|india)\b/gi, " ")
    .replace(/\bani-?one(?:\s+india)?\b/gi, " ")
    .replace(/\bmuse\s*(?:in|india)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[-–—]\s*$/g, "")
    .trim();
}

/**
 * Returns real Hindi/Tamil/Telugu dub uploads pulled live from the official
 * Muse India and Ani-One India YouTube feeds (see src/lib/dub-feeds.ts).
 *
 * Crunchyroll does not expose a machine-readable dub schedule, so it returns
 * no entries — callers should show an honest "no live feed" state instead of
 * inventing a schedule.
 */
export async function getLiveDubWeekly(channel?: DubChannel): Promise<LiveDubEntry[]> {
  const feeds = await getDubFeeds();
  const out: LiveDubEntry[] = [];

  for (const src of feeds.sources) {
    const ch = FEED_TO_CHANNEL[src.id];
    if (!ch || !src.ok) continue;
    if (channel && channel !== ch) continue;

    for (const e of src.entries) {
      out.push({
        channel: ch,
        show: cleanTitle(e.title) || e.title,
        language: e.language,
        published: e.published,
        url: e.url,
        thumbnail: e.thumbnail,
      });
    }
  }

  return out.sort((a, b) => b.published.localeCompare(a.published));
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
