import { NextResponse } from "next/server";
import { fetchLiveStreamingSchedules } from "@/lib/streaming-live";
import { TV_CHANNELS, getDayName, CHANNEL_SCHEDULES } from "@/lib/tv-channels";
import { fetchAllEpgSchedules, getEpgChannelIds } from "@/lib/epg";

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
    const epgChannelIds = new Set(getEpgChannelIds());

    // 1. Fetch live EPG data for TV channels from JioTV API (7-day schedule)
    let epgResults: { channelId: string; days: Record<string, { show: string; start: string; end: string; duration: number; description?: string }[]> }[] = [];
    try {
      epgResults = await fetchAllEpgSchedules();
    } catch {
      // EPG API may be down — continue without EPG data
    }
    const epgDaysMap = new Map(epgResults.map((r) => [r.channelId, r.days]));

    // 2. Build channel schedules — EPG data for TV channels, hardcoded for streaming
    const tvSchedules: ChannelLiveSchedule[] = [];
    const allDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // TV channels from JioTV EPG (full week data)
    for (const channelId of epgChannelIds) {
      const channel = TV_CHANNELS[channelId];
      if (!channel) continue;

      const epgDays = epgDaysMap.get(channelId) || {};
      const days: Record<string, LiveScheduleEntry[]> = {};

      for (const dayName of allDayNames) {
        days[dayName] = (epgDays[dayName] || []).map((s) => ({
          show: s.show, start: s.start, end: s.end,
          duration: s.duration, description: s.description,
        }));
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

    // Streaming channels from hardcoded schedules
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

    // 3. Get live streaming schedules from AniList
    let liveStreaming: Awaited<ReturnType<typeof fetchLiveStreamingSchedules>> = [];
    try {
      liveStreaming = await fetchLiveStreamingSchedules();
    } catch {
      // AniList may be rate-limited — continue without streaming data
    }

    // 4. Merge live AniList data into streaming channel schedules
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
