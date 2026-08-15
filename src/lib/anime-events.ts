import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ttlCache = new Map<string, { promise: Promise<unknown>; expiresAt: number }>();

async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = ttlCache.get(key);
  if (hit && hit.expiresAt > now) return hit.promise as Promise<T>;
  const promise = fn().catch((err) => {
    ttlCache.delete(key);
    throw err;
  });
  ttlCache.set(key, { promise, expiresAt: now + ttlSeconds * 1000 });
  return promise;
}

export const ANIME_EVENTS_META = {
  disclaimer: "Anime event data is curated from public sources. Dates, announcements, and details may change — verify with official event websites.",
  source: "curated",
} as const;

export function computeEventStatus(startDate: Date, endDate: Date): AnimeEvent["status"] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  if (endDay < today) return "past";
  if (startDay <= today) return "ongoing";
  return "upcoming";
}

export interface AnimeAnnouncement {
  id: string;
  title: string;
  description: string;
  category:
    | "anime-reveal"
    | "season-announcement"
    | "movie-reveal"
    | "game-reveal"
    | "collab"
    | "trailer"
    | "key-visual"
    | "casting"
    | "merchandise"
    | "other";
  trailerUrl?: string;
  posterUrl?: string;
  sourceUrl?: string;
  animeId?: number;
}

export interface AnimeEvent {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  type: "expo" | "convention" | "stream" | "festival" | "premiere";
  location: string;
  country: string;
  startDate: string;
  endDate: string;
  website: string;
  image?: string;
  description: string;
  status: "upcoming" | "ongoing" | "past";
  attendance?: number;
  tags: string[];
  announcements: AnimeAnnouncement[];
}

type AnimeEventRecord = Prisma.AnimeEventGetPayload<{ include: { announcements: true } }>;

function mapEvent(e: AnimeEventRecord): AnimeEvent {
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    shortName: e.shortName,
    type: e.type as AnimeEvent["type"],
    location: e.location,
    country: e.country,
    startDate: e.startDate instanceof Date ? e.startDate.toISOString().split("T")[0] : String(e.startDate),
    endDate: e.endDate instanceof Date ? e.endDate.toISOString().split("T")[0] : String(e.endDate),
    website: e.website,
    image: e.image ?? undefined,
    description: e.description,
    status: computeEventStatus(e.startDate, e.endDate),
    attendance: e.attendance ?? undefined,
    tags: e.tags ?? [],
    announcements: (e.announcements ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category as AnimeAnnouncement["category"],
      trailerUrl: a.trailerUrl ?? undefined,
      posterUrl: a.posterUrl ?? undefined,
      sourceUrl: a.sourceUrl ?? undefined,
      animeId: a.animeId ?? undefined,
    })),
  };
}

export async function getAnimeEvents(filters?: {
  type?: AnimeEvent["type"] | "all";
  status?: AnimeEvent["status"] | "all";
  country?: string;
  year?: number;
  search?: string;
}): Promise<AnimeEvent[]> {
  const where: Prisma.AnimeEventWhereInput = {};

  if (filters?.type && filters.type !== "all") {
    where.type = filters.type;
  }
  if (filters?.country) {
    where.country = { contains: filters.country, mode: "insensitive" };
  }
  if (filters?.year) {
    where.startDate = {
      gte: new Date(`${filters.year}-01-01`),
      lt: new Date(`${filters.year + 1}-01-01`),
    };
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { tags: { has: filters.search.toLowerCase() } },
    ];
  }

  const results = await cached("anime-events:" + JSON.stringify(filters ?? {}), 60, () =>
    prisma.animeEvent.findMany({
      where,
      include: { announcements: true },
      orderBy: { startDate: "desc" },
    })
  );

  let events = results.map(mapEvent);

  if (filters?.status && filters.status !== "all") {
    events = events.filter((e) => e.status === filters.status);
  }

  return events;
}

export async function getAnimeEventBySlug(
  slug: string
): Promise<AnimeEvent | undefined> {
  const result = await cached("anime-event:" + slug, 60, () =>
    prisma.animeEvent.findUnique({
      where: { slug },
      include: { announcements: true },
    })
  );
  if (!result) return undefined;
  return mapEvent(result);
}

export async function getEventTypes(): Promise<string[]> {
  const results = await cached("anime-events-types", 60, () =>
    prisma.animeEvent.findMany({
      select: { type: true },
      distinct: ["type"],
      orderBy: { type: "asc" },
    })
  );
  return results.map((r) => r.type);
}

export async function getCountries(): Promise<string[]> {
  const results = await cached("anime-events-countries", 60, () =>
    prisma.animeEvent.findMany({
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    })
  );
  return results.map((r) => r.country);
}

export async function getUpcomingEvents(): Promise<AnimeEvent[]> {
  const results = await cached("anime-events-upcoming", 60, () =>
    prisma.animeEvent.findMany({
      include: { announcements: true },
      orderBy: { startDate: "asc" },
    })
  );
  return results.map(mapEvent).filter((e) => e.status === "upcoming");
}

export async function getPastEvents(): Promise<AnimeEvent[]> {
  const results = await cached("anime-events-past", 60, () =>
    prisma.animeEvent.findMany({
      include: { announcements: true },
      orderBy: { startDate: "desc" },
    })
  );
  return results.map(mapEvent).filter((e) => e.status === "past");
}

export async function getAllAnnouncements(): Promise<(AnimeAnnouncement & {
  eventSlug: string;
  eventName: string;
  eventDate: string;
})[]> {
  const results = await cached("anime-events-announcements", 60, () =>
    prisma.animeAnnouncement.findMany({
      include: { event: true },
      orderBy: { createdAt: "desc" },
    })
  );

  return results.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category as AnimeAnnouncement["category"],
    trailerUrl: a.trailerUrl ?? undefined,
    posterUrl: a.posterUrl ?? undefined,
    sourceUrl: a.sourceUrl ?? undefined,
    animeId: a.animeId ?? undefined,
    eventSlug: a.event.slug,
    eventName: a.event.name,
    eventDate: a.event.startDate instanceof Date
      ? a.event.startDate.toISOString().split("T")[0]
      : String(a.event.startDate),
  }));
}

export async function getAnnouncementCategories(): Promise<string[]> {
  const results = await prisma.animeAnnouncement.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return results.map((r) => r.category);
}

export async function getAnimeEventsMeta() {
  const [count, lastUpdated] = await cached("anime-events-meta", 60, () =>
    Promise.all([
      prisma.animeEvent.count(),
      prisma.animeEvent.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ])
  );
  return {
    ...ANIME_EVENTS_META,
    totalEvents: count,
    lastUpdated: lastUpdated
      ? lastUpdated.updatedAt.toISOString().split("T")[0]
      : "N/A",
  };
}

export interface EventsPageData {
  events: AnimeEvent[];
  types: string[];
  countries: string[];
  upcoming: AnimeEvent[];
  announcements: (AnimeAnnouncement & {
    eventSlug: string;
    eventName: string;
    eventDate: string;
  })[];
  meta: {
    disclaimer: string;
    source: string;
    totalEvents: number;
    lastUpdated: string;
  };
}

export async function getEventsPageData(): Promise<EventsPageData> {
  return cached("events-page-data", 60, async () => {
    const [records, last] = await Promise.all([
      prisma.animeEvent.findMany({
        include: { announcements: true },
        orderBy: { startDate: "asc" },
      }),
      prisma.animeEvent.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

    const events = records.map(mapEvent);
    const types = [...new Set(events.map((e) => e.type))].sort();
    const countries = [...new Set(events.map((e) => e.country))].sort();
    const upcoming = events.filter((e) => e.status === "upcoming");
    const announcements = events
      .flatMap((e) =>
        (e.announcements ?? []).map((a) => ({
          ...a,
          eventSlug: e.slug,
          eventName: e.name,
          eventDate: e.startDate,
        }))
      )
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

    return {
      events,
      types,
      countries,
      upcoming,
      announcements,
      meta: {
        ...ANIME_EVENTS_META,
        totalEvents: events.length,
        lastUpdated: last ? last.updatedAt.toISOString().split("T")[0] : "N/A",
      },
    };
  });
}

export type { AnimeEvent as AnimeEventFull };
