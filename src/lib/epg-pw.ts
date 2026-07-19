import { type TimeSlot } from "./tv-channels";

const EPG_PW_BASE = "https://epg.pw/api/epg.json";

// Our channel IDs -> epg.pw channel IDs (Indian feeds)
const EPG_PW_MAP: Record<string, number> = {
  cn: 543449,
  sony_yay: 543317,
  hungama: 543181,
  super_hungama: 543103,
  pogo: 543393,
  nick: 543090,
  nick_jr: 543502,
  sonic: 543391,
  discovery_kids: 543485,
  disney_channel: 543433,
  disney_junior: 543448,
};

interface EpgPwEntry {
  title: string;
  desc?: string;
  start_date: string;
}

interface EpgPwResponse {
  epg_list: EpgPwEntry[];
  name?: string;
  country?: string;
  error_message?: string;
}

function getDayNameFromDate(d: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}

function istDateToHHMM(isoString: string): string {
  const d = new Date(isoString);
  const istMs = d.getTime() + (5.5 * 60 * 60 * 1000) + (d.getTimezoneOffset() * 60 * 1000);
  const ist = new Date(istMs);
  return `${ist.getHours().toString().padStart(2, "0")}:${ist.getMinutes().toString().padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}${m}${day}`;
}

async function fetchEpgPwDay(channelId: number, date: Date): Promise<EpgPwEntry[]> {
  const dateStr = formatDate(date);
  const url = `${EPG_PW_BASE}?channel_id=${channelId}&lang=en&date=${dateStr}&timezone=Asia%2FKolkata`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data: EpgPwResponse = await res.json();
    if (data.error_message || !data.epg_list) return [];
    return data.epg_list;
  } catch {
    return [];
  }
}

function entryToSlot(entry: EpgPwEntry, nextEntry?: EpgPwEntry): TimeSlot {
  const start = istDateToHHMM(entry.start_date);

  let end: string;
  if (nextEntry) {
    end = istDateToHHMM(nextEntry.start_date);
  } else {
    // Calculate end as start + 30 min (default slot)
    const [h, m] = start.split(":").map(Number);
    const totalMin = h * 60 + m + 30;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    end = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
  }

  // Clean up title (remove HTML entities, extra whitespace)
  const show = entry.title
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    show,
    start,
    end,
    duration: 30,
    description: entry.desc || undefined,
  };
}

export async function fetchAllEpgFromPw(): Promise<
  { channelId: string; days: Record<string, TimeSlot[]> }[]
> {
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const entries = Object.entries(EPG_PW_MAP);
  const results: { channelId: string; days: Record<string, TimeSlot[]> }[] = [];

  // Calculate dates for the past 7 days (Mon-Sun)
  const now = new Date();
  const dates: Date[] = [];
  for (let i = -6; i <= 0; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  // Batch 3 channels at a time (epg.pw is lighter than JioTV)
  const BATCH_SIZE = 3;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async ([channelId, epgPwId]) => {
        const dayGroups: Record<string, TimeSlot[]> = {};
        for (const d of allDays) dayGroups[d] = [];

        // Fetch each day
        const dayResponses = await Promise.allSettled(
          dates.map(async (date) => {
            const entries = await fetchEpgPwDay(epgPwId, date);
            return { date, entries };
          })
        );

        for (const r of dayResponses) {
          if (r.status !== "fulfilled") continue;
          const { date, entries: dayEntries } = r.value;
          if (!dayEntries.length) continue;

          const dayName = getDayNameFromDate(date);
          if (!dayGroups[dayName]) continue;

          // Sort by start_date
          dayEntries.sort((a, b) => a.start_date.localeCompare(b.start_date));

          // Convert to TimeSlots
          for (let j = 0; j < dayEntries.length; j++) {
            dayGroups[dayName].push(entryToSlot(dayEntries[j], dayEntries[j + 1]));
          }
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

export function getEpgPwChannelIds(): string[] {
  return Object.keys(EPG_PW_MAP);
}
