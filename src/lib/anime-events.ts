import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const ANIME_EVENTS_META = {
  disclaimer: "Anime event data is curated from public sources. Dates, announcements, and details may change — verify with official event websites.",
  lastUpdated: new Date().toISOString().split("T")[0],
  source: "curated",
} as const;

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
    status: e.status as AnimeEvent["status"],
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
  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
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

  const results = await prisma.animeEvent.findMany({
    where,
    include: { announcements: true },
    orderBy: { startDate: "desc" },
  });

  return results.map(mapEvent);
}

export async function getAnimeEventBySlug(
  slug: string
): Promise<AnimeEvent | undefined> {
  const result = await prisma.animeEvent.findUnique({
    where: { slug },
    include: { announcements: true },
  });
  if (!result) return undefined;
  return mapEvent(result);
}

export async function getEventTypes(): Promise<string[]> {
  const results = await prisma.animeEvent.findMany({
    select: { type: true },
    distinct: ["type"],
    orderBy: { type: "asc" },
  });
  return results.map((r) => r.type);
}

export async function getCountries(): Promise<string[]> {
  const results = await prisma.animeEvent.findMany({
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" },
  });
  return results.map((r) => r.country);
}

export async function getUpcomingEvents(): Promise<AnimeEvent[]> {
  const results = await prisma.animeEvent.findMany({
    where: { status: "upcoming" },
    include: { announcements: true },
    orderBy: { startDate: "asc" },
  });
  return results.map(mapEvent);
}

export async function getPastEvents(): Promise<AnimeEvent[]> {
  const results = await prisma.animeEvent.findMany({
    where: { status: "past" },
    include: { announcements: true },
    orderBy: { startDate: "desc" },
  });
  return results.map(mapEvent);
}

export async function getAllAnnouncements(): Promise<(AnimeAnnouncement & {
  eventSlug: string;
  eventName: string;
  eventDate: string;
})[]> {
  const results = await prisma.animeAnnouncement.findMany({
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

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
  const count = await prisma.animeEvent.count();
  return {
    ...ANIME_EVENTS_META,
    totalEvents: count,
  };
}

export type { AnimeEvent as AnimeEventFull };
