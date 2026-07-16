import { type TimeSlot } from "./tv-channels";

const JIOTV_EPG_BASE = "https://jiotvapi.cdn.jio.com/apis/v1.3/getepg/get";

// Channel ID -> JioTV channel ID (Hindi variants)
const JIOTV_CHANNEL_MAP: Record<string, number> = {
  cn: 816,
  sony_yay: 872,
  hungama: 1391,
  super_hungama: 1392,
  pogo: 559,
  nick: 545,
  nick_jr: 548,
  sonic: 815,
  discovery_kids: 554,
  disney_channel: 1373,
  disney_junior: 1374,
  epic_kids: 3385,
  animax: 2258,
};

interface JiotvEpgEntry {
  showname: string;
  description: string;
  startEpoch: number;
  endEpoch: number;
  episode_num: number;
  showCategory: string;
  episodePoster: string;
  channel_id: number;
  assets?: {
    originalProgram?: { url: string };
    originalEpisode?: { url: string };
  };
}

interface JiotvEpgResponse {
  epg: JiotvEpgEntry[];
  channel_id: number;
  channel_name: string;
  logoUrl: string;
  serverDate: string;
}

const cache = new Map<string, { data: JiotvEpgResponse; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

function getDayNameFromDate(date: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
}

function epochToIstHHMM(epochMs: number): string {
  const d = new Date(epochMs);
  const istMs = d.getTime() + (5.5 * 60 * 60 * 1000) + (d.getTimezoneOffset() * 60 * 1000);
  const ist = new Date(istMs);
  return `${ist.getHours().toString().padStart(2, "0")}:${ist.getMinutes().toString().padStart(2, "0")}`;
}

async function fetchJiotvEpg(channelId: number, offset: number): Promise<JiotvEpgResponse | null> {
  const key = `${channelId}_${offset}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const res = await fetch(
      `${JIOTV_EPG_BASE}?offset=${offset}&channel_id=${channelId}&langId=6`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data: JiotvEpgResponse = await res.json();
    cache.set(key, { data, ts: Date.now() });
    return data;
  } catch {
    return null;
  }
}

function entryToSlot(e: JiotvEpgEntry): TimeSlot {
  return {
    show: e.showname,
    start: epochToIstHHMM(e.startEpoch),
    end: epochToIstHHMM(e.endEpoch),
    duration: Math.round((e.endEpoch - e.startEpoch) / 60000),
    description: e.description || undefined,
  };
}

export async function fetchAllEpgSchedules(): Promise<
  { channelId: string; days: Record<string, TimeSlot[]> }[]
> {
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const entries = Object.entries(JIOTV_CHANNEL_MAP);
  const results: { channelId: string; days: Record<string, TimeSlot[]> }[] = [];

  // Batch 4 channels at a time to avoid rate limiting
  const BATCH_SIZE = 4;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async ([channelId, jiotvId]) => {
        const dayGroups: Record<string, TimeSlot[]> = {};
        for (const d of allDays) dayGroups[d] = [];

        const offsets = [-6, -5, -4, -3, -2, -1, 0];
        const responses = await Promise.allSettled(
          offsets.map((o) => fetchJiotvEpg(jiotvId, o))
        );

        for (const r of responses) {
          const resp = r.status === "fulfilled" ? r.value : null;
          if (!resp?.epg) continue;
          for (const entry of resp.epg) {
            const dayName = getDayNameFromDate(new Date(entry.startEpoch));
            if (dayGroups[dayName]) {
              dayGroups[dayName].push(entryToSlot(entry));
            }
          }
        }

        for (const d of allDays) {
          dayGroups[d].sort((a, b) => a.start.localeCompare(b.start));
        }

        return { channelId, days: dayGroups };
      })
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }
  }

  return results;
}

export function getEpgChannelIds(): string[] {
  return Object.keys(JIOTV_CHANNEL_MAP);
}
