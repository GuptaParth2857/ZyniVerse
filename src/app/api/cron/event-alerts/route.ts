import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeEventStatus } from "@/lib/anime-events";

export const revalidate = 0;
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

function fmt(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const results: { task: string; status: number; detail: string }[] = [];

  const candidates: { title: string; body: string; link: string }[] = [];

  // 1. Newly announced events (added to DB in the last 24h)
  const newEvents = await prisma.animeEvent.findMany({
    where: { createdAt: { gte: new Date(now.getTime() - DAY_MS) } },
    select: { id: true, slug: true, name: true, shortName: true, location: true, startDate: true, endDate: true },
  });
  for (const e of newEvents) {
    if (computeEventStatus(e.startDate, e.endDate) === "past") continue;
    const label = e.shortName || e.name;
    candidates.push({
      title: `New event announced: ${label} (${e.location})`,
      body: `${fmt(e.startDate)} - ${fmt(e.endDate)}`,
      link: `/events/${e.slug}`,
    });
  }
  results.push({ task: "new-events", status: 200, detail: `${newEvents.length} found` });

  // 2. Events starting within the next 3 days
  const soonEvents = await prisma.animeEvent.findMany({
    where: { startDate: { gte: today, lt: new Date(today.getTime() + 3 * DAY_MS) } },
    select: { id: true, slug: true, name: true, shortName: true, location: true, startDate: true, endDate: true },
  });
  for (const e of soonEvents) {
    if (computeEventStatus(e.startDate, e.endDate) !== "upcoming") continue;
    const startDay = new Date(e.startDate.getFullYear(), e.startDate.getMonth(), e.startDate.getDate());
    const daysLeft = Math.round((startDay.getTime() - today.getTime()) / DAY_MS);
    const label = e.shortName || e.name;
    if (daysLeft === 0) {
      candidates.push({
        title: `Starts today: ${label} in ${e.location}`,
        body: `Runs ${fmt(e.startDate)} - ${fmt(e.endDate)}`,
        link: `/events/${e.slug}`,
      });
    } else {
      candidates.push({
        title: `${label} starts in ${daysLeft} day${daysLeft > 1 ? "s" : ""} (${e.location})`,
        body: `${fmt(e.startDate)} - ${fmt(e.endDate)}`,
        link: `/events/${e.slug}`,
      });
    }
  }
  results.push({ task: "upcoming-events", status: 200, detail: `${soonEvents.length} found` });

  // 3. Events ending today
  const endingEvents = await prisma.animeEvent.findMany({
    where: { endDate: { gte: today, lt: new Date(today.getTime() + DAY_MS) } },
    select: { id: true, slug: true, name: true, shortName: true, location: true, startDate: true, endDate: true },
  });
  for (const e of endingEvents) {
    if (computeEventStatus(e.startDate, e.endDate) !== "ongoing") continue;
    const label = e.shortName || e.name;
    candidates.push({
      title: `Last day today: ${label} (${e.location})`,
      body: `Ends ${fmt(e.endDate)}`,
      link: `/events/${e.slug}`,
    });
  }
  results.push({ task: "ending-events", status: 200, detail: `${endingEvents.length} found` });

  // 4. Dedup: skip alerts already sent for the same event + type (titles are unique per event)
  const titles = candidates.map((c) => c.title);
  const sent = titles.length
    ? await prisma.notification.findMany({
        where: { type: "EVENT", title: { in: titles } },
        select: { title: true },
      })
    : [];
  const sentSet = new Set(sent.map((n) => n.title));
  const toSend = candidates.filter((c) => !sentSet.has(c.title));

  // 5. Fan out to all registered users
  const users = await prisma.user.findMany({ select: { id: true } });
  let created = 0;
  if (toSend.length > 0 && users.length > 0) {
    const payload = toSend.flatMap((c) =>
      users.map((u) => ({
        userId: u.id,
        type: "EVENT" as const,
        title: c.title,
        body: c.body,
        link: c.link,
      }))
    );
    const res = await prisma.notification.createMany({ data: payload });
    created = res.count;
  }

  results.push({
    task: "event-alerts",
    status: 200,
    detail: `alerts=${toSend.length} users=${users.length} notifications=${created}`,
  });

  return NextResponse.json({ ok: true, results });
}
