// Refresh EpgCache using INTV Schedule CDN API
// Run: node scripts/refresh-epg.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const INTV_MAP = {
  cn: "cartoon-network",
  sony_yay: "sony-yay",
  hungama: "hungama",
  super_hungama: "super-hungama",
  pogo: "pogo",
  nick: "nick",
  nick_jr: "nick-junior",
  discovery_kids: "discovery-kids",
  disney_channel: "disney-channel",
  disney_junior: "disney-junior",
  epic_kids: "epic-kids",
};

function parseDuration(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  return e > s ? e - s : (1440 - s) + e;
}

async function fetchChannel(channelId, slug) {
  const result = {};
  for (const day of DAYS_OF_WEEK) result[day] = [];

  const res = await fetch(`https://cdn.intvschedule.com/schedule/${slug}.json`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return result;

  const data = await res.json();
  const schedule = data.schedule;
  if (!schedule) return result;

  for (const period of ["today", "tomorrow"]) {
    const dayData = schedule[period];
    if (!dayData?.programs) continue;

    const parsed = new Date(dayData.date);
    if (isNaN(parsed.getTime())) continue;
    const dayName = DAYS_OF_WEEK[parsed.getDay()];
    if (!result[dayName]) continue;

    for (const prog of dayData.programs) {
      if (!prog.s || !prog.e) continue;
      result[dayName].push({
        show: prog.n || "Unknown",
        start: prog.s,
        end: prog.e,
        duration: parseDuration(prog.s, prog.e),
        description: prog.d || undefined,
      });
    }
  }

  for (const day of DAYS_OF_WEEK) {
    result[day].sort((a, b) => a.start.localeCompare(b.start));
  }
  return result;
}

async function main() {
  const entries = Object.entries(INTV_MAP);
  let totalCached = 0;

  for (let i = 0; i < entries.length; i += 4) {
    const batch = entries.slice(i, i + 4);
    const results = await Promise.allSettled(
      batch.map(async ([channelId, slug]) => {
        const schedule = await fetchChannel(channelId, slug);
        const total = Object.values(schedule).reduce((a, d) => a + d.length, 0);
        if (total > 0) {
          await prisma.epgCache.upsert({
            where: { channelId },
            update: { data: schedule, updatedAt: new Date() },
            create: { channelId, data: schedule },
          });
          console.log(`✅ ${channelId}: ${total} slots`);
          return total;
        }
        console.log(`⚠️  ${channelId}: no data`);
        return 0;
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") totalCached += r.value;
    }
    if (i + 4 < entries.length) await new Promise((r) => setTimeout(r, 200));
  }

  await prisma.$disconnect();
  console.log(`\nDone! ${totalCached} total slots across ${entries.length} channels.`);
}

main().catch(e => { console.error(e); process.exit(1); });
