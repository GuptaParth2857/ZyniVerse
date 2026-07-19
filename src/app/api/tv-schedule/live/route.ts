import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchLiveStreamingSchedules } from "@/lib/streaming-live";
import { TV_CHANNELS, getDayName, CHANNEL_SCHEDULES } from "@/lib/tv-channels";
import { scrapeAllChannels, EPGSchedule_MAP } from "@/lib/epg-scraper";
import { Prisma } from "@prisma/client";

export const revalidate = 1800;

interface LiveScheduleEntry {
  show: string;
  start: string;
  end: string;
  duration: number;
  description?: string;
  episode?: number;
  coverImage?: string;
  isLive?: boolean;
}

interface ChannelLiveSchedule {
  channelId: string;
  channelName: string;
  channelColor: string;
  channelLogo?: string;
  channelType: "tv" | "youtube";
  days: Record<string, LiveScheduleEntry[]>;
}

function calculateEndTime(start: string, durationMin: number): string {
  const [h, m] = start.split(":").map(Number);
  const totalMin = h * 60 + m + durationMin;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
}

function isCacheStale(
  epgMap: Map<string, Record<string, LiveScheduleEntry[]>>,
  channelIds: string[],
  timestamps: Map<string, Date>,
  maxAgeMs: number = 6 * 60 * 60 * 1000,
): boolean {
  const now = Date.now();
  for (const id of channelIds) {
    const data = epgMap.get(id);
    const ts = timestamps.get(id);
    const hasData = data && Object.values(data).some((day) => Array.isArray(day) && day.length > 0);
    if (!hasData) return true;
    if (ts && now - ts.getTime() > maxAgeMs) return true;
  }
  return false;
}

async function scrapeAndCache(): Promise<Map<string, Record<string, LiveScheduleEntry[]>>> {
  const scraped = await scrapeAllChannels();
  const epgMap = new Map<string, Record<string, LiveScheduleEntry[]>>();

  for (const [channelId, daySchedule] of Object.entries(scraped)) {
    const days: Record<string, LiveScheduleEntry[]> = {};
    for (const [day, entries] of Object.entries(daySchedule)) {
      days[day] = entries.map((e) => ({
        show: e.show,
        start: e.start,
        end: e.end,
        duration: e.duration,
      }));
    }
    epgMap.set(channelId, days);

    try {
      await prisma.epgCache.upsert({
        where: { channelId },
        update: { data: days as unknown as Prisma.InputJsonValue, updatedAt: new Date() },
        create: { channelId, data: days as unknown as Prisma.InputJsonValue },
      });
    } catch {
      // DB write failed, continue with in-memory data
    }
  }

  return epgMap;
}

export async function GET() {
  try {
    const allDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const epgChannelIds = [
      "cn", "sony_yay", "hungama", "super_hungama", "pogo", "nick",
      "nick_jr", "discovery_kids", "disney_channel",
      "disney_junior", "epic_kids",
    ];

    let epgRows: { channelId: string; data: unknown; updatedAt: Date }[] = [];
    try {
      epgRows = await prisma.epgCache.findMany();
    } catch {
      // DB read failed, continue with empty cache
    }
    let epgMap = new Map(epgRows.map((r) => [r.channelId, r.data as unknown as Record<string, LiveScheduleEntry[]>]));
    const timestamps = new Map(epgRows.map((r) => [r.channelId, r.updatedAt]));

    const cacheStale = isCacheStale(epgMap, epgChannelIds.filter((id) => EPGSchedule_MAP[id]), timestamps);
    if (cacheStale) {
      try {
        epgMap = await scrapeAndCache();
      } catch {
        // scrape failed, continue with empty cache
      }
    }

    const tvSchedules: ChannelLiveSchedule[] = [];

    for (const channelId of epgChannelIds) {
      const channel = TV_CHANNELS[channelId];
      if (!channel) continue;

      const cachedDays = epgMap.get(channelId) || {};
      const days: Record<string, LiveScheduleEntry[]> = {};
      for (const dayName of allDayNames) {
        days[dayName] = (cachedDays[dayName] || []) as LiveScheduleEntry[];
      }

      tvSchedules.push({
        channelId,
        channelName: channel.name,
        channelColor: channel.color,
        channelLogo: channel.logoUrl,
        channelType: channel.type,
        days,
      });
    }

    for (const cs of CHANNEL_SCHEDULES) {
      const channel = TV_CHANNELS[cs.channelId];
      if (!channel) continue;

      const days: Record<string, LiveScheduleEntry[]> = {};
      for (const ds of cs.schedules) {
        days[ds.day] = ds.slots.map((s) => ({
          show: s.show, start: s.start, end: s.end,
          duration: s.duration, description: s.description,
        }));
      }

      tvSchedules.push({
        channelId: cs.channelId,
        channelName: channel.name,
        channelColor: channel.color,
        channelLogo: channel.logoUrl,
        channelType: channel.type,
        days,
      });
    }

    let liveStreaming: Awaited<ReturnType<typeof fetchLiveStreamingSchedules>> = [];
    try {
      liveStreaming = await fetchLiveStreamingSchedules();
    } catch {
      // AniList may be rate-limited
    }

    for (const ls of liveStreaming) {
      const existing = tvSchedules.find((s) => s.channelId === ls.platformId);
      if (existing) {
        for (const [day, shows] of Object.entries(ls.shows)) {
          if (!existing.days[day]) existing.days[day] = [];
          for (const show of shows) {
            const alreadyExists = existing.days[day].some(
              (s) =>
                s.show.toLowerCase().includes(show.title.toLowerCase()) ||
                show.title.toLowerCase().includes(s.show.toLowerCase())
            );
            if (!alreadyExists) {
              existing.days[day].push({
                show: show.title,
                start: show.airTime,
                end: calculateEndTime(show.airTime, 24),
                duration: 24,
                description: `Live from AniList - Episode ${show.episode}`,
                episode: show.episode,
                coverImage: show.coverImage,
                isLive: true,
              });
            }
          }
          existing.days[day].sort((a, b) => a.start.localeCompare(b.start));
        }
      }
    }

    const today = getDayName();

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      today,
      channels: tvSchedules,
      liveAiringTotal: liveStreaming.reduce(
        (acc, ls) => acc + Object.values(ls.shows).reduce((a, d) => a + d.length, 0),
        0
      ),
    });
  } catch (error) {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      today: new Date().toLocaleDateString("en-US", { weekday: "long" }),
      channels: [],
      liveAiringTotal: 0,
      error: error instanceof Error ? error.message : "Failed to fetch",
    });
  }
}
