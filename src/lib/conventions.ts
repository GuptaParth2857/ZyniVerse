import { prisma } from "@/lib/prisma";

export interface Convention {
  id: string;
  name: string;
  shortName: string | null;
  city: string;
  state: string;
  venue: string;
  startDate: string;
  endDate: string;
  website: string;
  ticketUrl: string | null;
  image: string | null;
  description: string;
  estimatedAttendance: number | null;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  organizers: string[];
  tags: string[];
}

export async function getConventions(filters?: {
  city?: string;
  state?: string;
  status?: "upcoming" | "past" | "ongoing" | "all";
  month?: number;
  year?: number;
}): Promise<Convention[]> {
  const where: Record<string, unknown> = { isPublic: true };

  if (filters?.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }
  if (filters?.state) {
    where.state = { contains: filters.state, mode: "insensitive" };
  }
  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters?.month !== undefined || filters?.year !== undefined) {
    const AND: Record<string, unknown>[] = [];
    if (filters?.month !== undefined) {
      AND.push({
        startDate: {
          gte: new Date(`${new Date().getFullYear()}-${String(filters.month).padStart(2, "0")}-01`),
          lt: new Date(`${new Date().getFullYear()}-${String(filters.month + 1 > 12 ? 1 : filters.month + 1).padStart(2, "0")}-01`),
        },
      });
    }
    if (filters?.year !== undefined) {
      AND.push({
        startDate: {
          gte: new Date(`${filters.year}-01-01`),
          lt: new Date(`${filters.year + 1}-01-01`),
        },
      });
    }
    if (AND.length > 0) where.AND = AND;
  }

  const results = await prisma.convention.findMany({
    where,
    orderBy: { startDate: "asc" },
  });

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    shortName: r.shortName,
    city: r.city,
    state: r.state,
    venue: r.venue,
    startDate: r.startDate.toISOString().split("T")[0],
    endDate: r.endDate.toISOString().split("T")[0],
    website: r.website,
    ticketUrl: r.ticketUrl,
    image: r.image,
    description: r.description,
    estimatedAttendance: r.estimatedAttendance,
    status: r.status as Convention["status"],
    organizers: r.organizers,
    tags: r.tags,
  }));
}

export async function getConventionById(id: string): Promise<Convention | null> {
  const result = await prisma.convention.findUnique({ where: { id } });
  if (!result) return null;
  return {
    id: result.id,
    name: result.name,
    shortName: result.shortName,
    city: result.city,
    state: result.state,
    venue: result.venue,
    startDate: result.startDate.toISOString().split("T")[0],
    endDate: result.endDate.toISOString().split("T")[0],
    website: result.website,
    ticketUrl: result.ticketUrl,
    image: result.image,
    description: result.description,
    estimatedAttendance: result.estimatedAttendance,
    status: result.status as Convention["status"],
    organizers: result.organizers,
    tags: result.tags,
  };
}

export async function getCities(): Promise<string[]> {
  const results = await prisma.convention.findMany({
    where: { isPublic: true },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return results.map((r) => r.city);
}

export async function getStates(): Promise<string[]> {
  const results = await prisma.convention.findMany({
    where: { isPublic: true },
    select: { state: true },
    distinct: ["state"],
    orderBy: { state: "asc" },
  });
  return results.map((r) => r.state);
}
