interface EpgScheduleEntry {
  show: string;
  start: string;
  end: string;
  duration: number;
  description?: string;
}

type DaySchedule = Record<string, EpgScheduleEntry[]>;

const INTV_SCHEDULE_MAP: Record<string, string> = {
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

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  return endMin > startMin ? endMin - startMin : (1440 - startMin) + endMin;
}

export async function scrapeChannelSchedule(slug: string): Promise<DaySchedule> {
  const result: DaySchedule = {};
  for (const day of DAYS_OF_WEEK) result[day] = [];

  try {
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

      const dateStr = dayData.date;
      if (!dateStr) continue;

      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) continue;
      const dayName = DAYS_OF_WEEK[parsed.getDay()];
      if (!result[dayName]) continue;

      for (const prog of dayData.programs) {
        const start = prog.s;
        const end = prog.e;
        if (!start || !end) continue;

        result[dayName].push({
          show: prog.n || "Unknown",
          start,
          end,
          duration: parseDurationMinutes(start, end),
          description: prog.d || undefined,
        });
      }
    }

    for (const day of DAYS_OF_WEEK) {
      result[day].sort((a, b) => a.start.localeCompare(b.start));
    }
  } catch {}

  return result;
}

export async function scrapeAllChannels(): Promise<Record<string, DaySchedule>> {
  const results: Record<string, DaySchedule> = {};
  const entries = Object.entries(INTV_SCHEDULE_MAP);

  for (let i = 0; i < entries.length; i += 4) {
    const batch = entries.slice(i, i + 4);
    const batchResults = await Promise.allSettled(
      batch.map(async ([channelId, slug]) => {
        const schedule = await scrapeChannelSchedule(slug);
        return { channelId, schedule };
      })
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        results[r.value.channelId] = r.value.schedule;
      }
    }

    if (i + 4 < entries.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return results;
}

export { INTV_SCHEDULE_MAP as EPGSchedule_MAP };
