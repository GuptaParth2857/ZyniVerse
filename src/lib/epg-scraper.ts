import { logError } from "@/lib/logger";
import { fetchAllEpgFromPw, EPG_PW_MAP } from "./epg-pw";

interface EpgScheduleEntry {
  show: string;
  start: string;
  end: string;
  duration: number;
  description?: string;
}

type DaySchedule = Record<string, EpgScheduleEntry[]>;

/**
 * Live EPG for linear-TV channels, sourced from epg.pw.
 *
 * epg.pw is free and reachable from datacenter IPs, so it is the single
 * source of truth here. This used to scrape cdn.intvschedule.com, but that
 * JSON endpoint now returns HTTP 404 for every channel — which silently
 * produced empty schedules for all Indian TV channels.
 */
export const EPGSchedule_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EPG_PW_MAP).map(([channelId, id]) => [channelId, String(id)]),
);

export { EPG_PW_MAP as EPG_CHANNEL_IDS };

export async function scrapeAllChannels(): Promise<Record<string, DaySchedule>> {
  const results: Record<string, DaySchedule> = {};
  try {
    const channels = await fetchAllEpgFromPw();
    for (const ch of channels) {
      if (!ch.channelId) continue;
      results[ch.channelId] = ch.days as DaySchedule;
    }
  } catch (e) {
    logError(e);
  }
  return results;
}
