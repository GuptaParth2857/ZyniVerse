import { NextResponse } from "next/server";
import { fetchLiveStreamingSchedules } from "@/lib/streaming-live";
import {
  CHANNEL_SCHEDULES,
  TV_CHANNELS,
  getDayName,
  type TimeSlot,
} from "@/lib/tv-channels";

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
    // 1. Get hardcoded schedules for TV channels
    const tvSchedules: ChannelLiveSchedule[] = CHANNEL_SCHEDULES.map((cs) => {
      const channel = TV_CHANNELS[cs.channelId];
      if (!channel) return null;

      const days: Record<string, LiveScheduleEntry[]> = {};
      for (const ds of cs.schedules) {
        days[ds.day] = ds.slots.map((s: TimeSlot) => ({
          show: s.show,
          start: s.start,
          end: s.end,
          duration: s.duration,
          description: s.description,
        }));
      }

      return {
        channelId: cs.channelId,
        channelName: channel.name,
        channelColor: channel.color,
        channelLogo: channel.logoUrl,
        channelType: channel.type,
        days,
      };
    }).filter(Boolean) as ChannelLiveSchedule[];

    // 2. Get live streaming schedules from AniList
    const liveStreaming = await fetchLiveStreamingSchedules();

    // 3. Merge live data into streaming channel schedules
    for (const ls of liveStreaming) {
      const existing = tvSchedules.find((s) => s.channelId === ls.platformId);
      if (existing) {
        // Merge: for each day, add live shows that aren't already in hardcoded schedule
        for (const [day, shows] of Object.entries(ls.shows)) {
          if (!existing.days[day]) existing.days[day] = [];
          for (const show of shows) {
            const alreadyExists = existing.days[day].some(
              (s) => s.show.toLowerCase().includes(show.title.toLowerCase()) ||
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
          // Sort by air time
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
    const message = error instanceof Error ? error.message : "Failed to fetch live schedule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function calculateEndTime(start: string, durationMin: number): string {
  const [h, m] = start.split(":").map(Number);
  const totalMin = h * 60 + m + durationMin;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
}
