import { NextRequest, NextResponse } from "next/server";
import { TV_CHANNELS, getScheduleForChannel, getDayName, getNext7Days } from "@/lib/tv-channels";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const channel = searchParams.get("channel");
    const day = searchParams.get("day") || getDayName();
    const search = searchParams.get("search")?.toLowerCase().trim();
    const type = searchParams.get("type") as "tv" | "youtube" | null;

    if (channel) {
      const ch = TV_CHANNELS[channel];
      if (!ch) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
      const schedule = getScheduleForChannel(channel, day);
      return NextResponse.json({ channel: ch, day, schedule });
    }

    let channels = Object.values(TV_CHANNELS);

    if (type) {
      channels = channels.filter((ch) => ch.type === type);
    }

    const allSchedules = channels.map((ch) => {
      const schedule = getScheduleForChannel(ch.id, day);
      if (search && schedule) {
        const filteredSlots = schedule.slots.filter((slot) =>
          slot.show.toLowerCase().includes(search)
        );
        return { channel: ch, schedule: { ...schedule, slots: filteredSlots } };
      }
      return { channel: ch, schedule };
    });

    return NextResponse.json({ day, channels: allSchedules, availableDays: getNext7Days() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
