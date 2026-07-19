// Quick test: scrape all channels and report counts
// Run: node scripts/test-epg-scraper.mjs

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const EPGSchedule_MAP = {
  cn: "cartoon-network",
  sony_yay: "sony-yay",
  hungama: "hungama",
  super_hungama: "super-hungama",
  pogo: "pogo",
  nick: "nick",
  nick_jr: "nick-jr",
  discovery_kids: "discovery-kids",
  disney_channel: "disney-channel",
  disney_junior: "disney-junior",
  epic_kids: "epic-kids",
};

function getISTDate(isoString) {
  const d = new Date(isoString);
  const istMs = d.getTime() + (5.5 * 60 * 60 * 1000) + (d.getTimezoneOffset() * 60 * 1000);
  return new Date(istMs);
}

function formatHHMM(date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

async function scrapeChannel(slug) {
  const result = {};
  for (const day of DAYS_OF_WEEK) result[day] = [];

  const url = `https://www.epgschedule.com/channel/${slug}/`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return { result, error: `HTTP ${res.status}` };
  const html = await res.text();

  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      if (!data["@graph"]) continue;

      const tvChannel = data["@graph"].find((g) => g["@type"] === "TVChannel");
      if (!tvChannel?.hasPart || !Array.isArray(tvChannel.hasPart)) continue;

      for (const event of tvChannel.hasPart) {
        if (event["@type"] !== "BroadcastEvent") continue;
        if (!event.startDate || !event.endDate) continue;

        const startDate = getISTDate(event.startDate);
        const endDate = getISTDate(event.endDate);
        const dayName = DAYS_OF_WEEK[startDate.getDay()];
        if (!dayName || !result[dayName]) continue;

        const start = formatHHMM(startDate);
        const end = formatHHMM(endDate);
        const startMin = startDate.getHours() * 60 + startDate.getMinutes();
        const endMin = endDate.getHours() * 60 + endDate.getMinutes();
        const duration = endMin > startMin ? endMin - startMin : (1440 - startMin) + endMin;

        result[dayName].push({
          show: event.name || "Unknown",
          start, end, duration,
        });
      }
      break;
    } catch {}
  }

  for (const day of DAYS_OF_WEEK) {
    result[day].sort((a, b) => a.start.localeCompare(b.start));
  }
  return { result };
}

async function main() {
  console.log("Testing epgschedule.com JSON-LD scraper...\n");
  
  const entries = Object.entries(EPGSchedule_MAP);
  let allOk = true;

  for (let i = 0; i < entries.length; i += 3) {
    const batch = entries.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map(async ([channelId, slug]) => {
        const { result, error } = await scrapeChannel(slug);
        return { channelId, slug, result, error };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        const { channelId, slug, result, error } = r.value;
        if (error) {
          console.log(`❌ ${channelId} (${slug}): ${error}`);
          allOk = false;
        } else {
          const total = Object.values(result).reduce((a, d) => a + d.length, 0);
          const days = Object.entries(result).map(([day, shows]) => `${day.substring(0,3)}:${shows.length}`).join(" ");
          console.log(`✅ ${channelId} (${slug}): ${total} slots — ${days}`);
          if (total === 0) { console.log(`   ⚠️  ZERO SLOTS!`); allOk = false; }
        }
      }
    }

    if (i + 3 < entries.length) await new Promise((r) => setTimeout(r, 300));
  }

  console.log(allOk ? "\n🎉 All channels have data!" : "\n⚠️  Some channels had issues");
}

main().catch(e => { console.error(e); process.exit(1); });
