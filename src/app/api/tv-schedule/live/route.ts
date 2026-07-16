import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchLiveStreamingSchedules } from "@/lib/streaming-live";
import { TV_CHANNELS, getDayName, CHANNEL_SCHEDULES } from "@/lib/tv-channels";

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

export async function GET() {
  try {
    const allDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // 1. Read EPG cache from Supabase (fast — single DB query)
    const epgRows = await prisma.epgCache.findMany();
    const epgMap = new Map(epgRows.map((r) => [r.channelId, r.data as unknown as Record<string, LiveScheduleEntry[]>]));

    const tvSchedules: ChannelLiveSchedule[] = [];

    // 2. TV channels from cached EPG
    const epgChannelIds = [
      "cn", "sony_yay", "hungama", "super_hungama", "pogo", "nick",
      "nick_jr", "sonic", "discovery_kids", "disney_channel",
      "disney_junior", "epic_kids", "animax",
    ];

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

    // 3. Streaming channels from hardcoded schedules
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

    // 4. Get live streaming schedules from AniList
    let liveStreaming: Awaited<ReturnType<typeof fetchLiveStreamingSchedules>> = [];
    try {
      liveStreaming = await fetchLiveStreamingSchedules();
    } catch {
      // AniList may be rate-limited
    }

    // 5. Merge live AniList data into streaming channel schedules
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

function calculateEndTime(start: string, durationMin: number): string {
  const [h, m] = start.split(":").map(Number);
  const totalMin = h * 60 + m + durationMin;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
}
