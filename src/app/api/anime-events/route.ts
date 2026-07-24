import { NextResponse } from "next/server";
import {
  getAnimeEvents,
  getEventTypes,
  getCountries,
  getAllAnnouncements,
  getUpcomingEvents,
} from "@/lib/anime-events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as any;
    const status = searchParams.get("status") as any;
    const country = searchParams.get("country") || undefined;
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
    const search = searchParams.get("search") || undefined;

    const events = await getAnimeEvents({ type, status, country, year, search });
    const types = await getEventTypes();
    const countries = await getCountries();

    return NextResponse.json({ events, types, countries });
  } catch (error) {
    console.error("Failed to fetch anime events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
