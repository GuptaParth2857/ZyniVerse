import { prisma } from "@/lib/prisma";
import { detectBot, describeBot, type BotInfo, type BotKind } from "@/lib/bot-detect";
import { maybePruneBotCounters } from "@/lib/db-prune";

/**
 * Crawler/bot hit counters, stored in the existing `SiteCounter` key/value
 * table so no schema migration is needed (the analytics feature owns that
 * table already — see `incrementPageViewCounter` in src/lib/analytics.ts).
 *
 * Key layout (all share the `bot:` prefix so the admin view can read them with
 * a single startsWith scan):
 *
 *   bot:day:<yyyy-mm-dd utc>:<botId>   → hits that day
 *   bot:path:<botId>:<path>            → all-time hits for that path
 *   bot:country:<cc>:<botId>           → all-time hits from that country
 *
 * Counts are absolute, so totals come from summing the day keys — there is no
 * separate all-time key to drift out of sync.
 */

const DAY_PREFIX = "bot:day:";
const PATH_PREFIX = "bot:path:";
const COUNTRY_PREFIX = "bot:country:";
export const BOT_KEY_PREFIX = "bot:";

/** Chart window for the admin view. */
export const BOT_TREND_DAYS = 14;

export function utcDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Collapse query strings/fragments and clamp length so one route can't fan out. */
export function normalizeBotPath(raw: string | null | undefined): string {
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const clean = withSlash.split("?")[0].split("#")[0];
  if (!clean || clean === "/") return "/";
  // Keep numeric ids and slugs distinct but bounded.
  return clean.slice(0, 120);
}

/**
 * Record one crawler hit. Returns the matched bot (or null for human traffic).
 * Never throws: this runs from `event.waitUntil()` in the Proxy, where a
 * rejection would surface as an unhandled promise rejection.
 */
export async function recordBotHit(params: {
  userAgent?: string | null;
  path?: string | null;
  country?: string | null;
}): Promise<BotInfo | null> {
  const bot = detectBot(params.userAgent ?? null);
  if (!bot) return null;

  const dayKey = `${DAY_PREFIX}${utcDayKey()}:${bot.id}`;
  const pathKey = `${PATH_PREFIX}${bot.id}:${normalizeBotPath(params.path)}`;
  const country = (params.country || "").toUpperCase().slice(0, 2);

  const ops = [
    prisma.siteCounter.upsert({
      where: { key: dayKey },
      update: { value: { increment: 1 } },
      create: { key: dayKey, value: BigInt(1) },
    }),
    prisma.siteCounter.upsert({
      where: { key: pathKey },
      update: { value: { increment: 1 } },
      create: { key: pathKey, value: BigInt(1) },
    }),
  ];

  if (country.length === 2) {
    const countryKey = `${COUNTRY_PREFIX}${country}:${bot.id}`;
    ops.push(
      prisma.siteCounter.upsert({
        where: { key: countryKey },
        update: { value: { increment: 1 } },
        create: { key: countryKey, value: BigInt(1) },
      })
    );
  }

  try {
    // One round trip for all upserts — this path is hit by every crawler
    // request, so extra latency here is wasted money.
    await prisma.$transaction(ops);
  } catch (error) {
    console.error("Failed to record bot hit:", error);
  }

  // The `bot:*` counter keys grow by one per (bot, path) pair and are only
  // cleaned by the db-prune cron. That cron silently stopped running for five
  // days, so this opportunistic prune keeps the table bounded regardless.
  maybePruneBotCounters();

  return bot;
}

export interface BotSummary {
  id: string;
  kind: BotKind;
  vendor: string;
  total: number;
  today: number;
  last7: number;
  lastSeenDay: string | null;
  /** Zero-filled series for the trend chart window. */
  daily: Array<{ date: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
}

export interface BotStats {
  generatedAt: string;
  trendDays: number;
  totals: {
    hits: number;
    hitsToday: number;
    hits7: number;
    uniqueBots: number;
    /** AI answer/search crawlers — the ones robots.ts allows on purpose. */
    aiSearchHits: number;
    /** Training crawlers that robots.txt opts out — hits here are "ignored robots.txt". */
    aiTrainingHits: number;
    searchEngineHits: number;
  };
  daily: Array<{ date: string; count: number }>;
  kindTotals: Array<{ kind: BotKind; count: number }>;
  bots: BotSummary[];
}

function lastNDays(days: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    out.push(utcDayKey(d));
  }
  return out;
}

function topEntries(map: Map<string, number> | undefined, take: number) {
  if (!map) return [];
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, take)
    .map(([key, count]) => ({ key, count }));
}

export async function getBotStats(days: number = BOT_TREND_DAYS): Promise<BotStats> {
  const window = lastNDays(days);
  const todayKey = window[window.length - 1];
  const last7Set = new Set(window.slice(-7));

  const empty: BotStats = {
    generatedAt: new Date().toISOString(),
    trendDays: days,
    totals: {
      hits: 0,
      hitsToday: 0,
      hits7: 0,
      uniqueBots: 0,
      aiSearchHits: 0,
      aiTrainingHits: 0,
      searchEngineHits: 0,
    },
    daily: window.map((date) => ({ date, count: 0 })),
    kindTotals: [],
    bots: [],
  };

  let rows: Array<{ key: string; value: bigint }> = [];
  try {
    rows = await prisma.siteCounter.findMany({
      where: { key: { startsWith: BOT_KEY_PREFIX } },
      select: { key: true, value: true },
      orderBy: { key: "asc" },
      take: 100_000,
    });
  } catch (error) {
    console.error("Failed to load bot stats:", error);
    return empty;
  }

  const dayMap = new Map<string, Map<string, number>>();
  const pathMap = new Map<string, Map<string, number>>();
  const countryMap = new Map<string, Map<string, number>>();

  const bump = (target: Map<string, Map<string, number>>, botId: string, field: string, value: number) => {
    let inner = target.get(botId);
    if (!inner) {
      inner = new Map();
      target.set(botId, inner);
    }
    inner.set(field, (inner.get(field) || 0) + value);
  };

  for (const row of rows) {
    const value = Number(row.value);
    if (!Number.isFinite(value) || value <= 0) continue;

    if (row.key.startsWith(DAY_PREFIX)) {
      const rest = row.key.slice(DAY_PREFIX.length);
      const sep = rest.indexOf(":");
      if (sep <= 0) continue;
      const date = rest.slice(0, sep);
      const botId = rest.slice(sep + 1);
      if (!botId) continue;
      bump(dayMap, botId, date, value);
    } else if (row.key.startsWith(PATH_PREFIX)) {
      const rest = row.key.slice(PATH_PREFIX.length);
      const sep = rest.indexOf(":");
      if (sep <= 0) continue;
      const botId = rest.slice(0, sep);
      const path = rest.slice(sep + 1) || "/";
      bump(pathMap, botId, path, value);
    } else if (row.key.startsWith(COUNTRY_PREFIX)) {
      const rest = row.key.slice(COUNTRY_PREFIX.length);
      const sep = rest.indexOf(":");
      if (sep <= 0) continue;
      const country = rest.slice(0, sep) || "??";
      const botId = rest.slice(sep + 1);
      if (!botId) continue;
      bump(countryMap, botId, country, value);
    }
  }

  const overallDaily = new Map(window.map((d) => [d, 0]));
  const kindTotals = new Map<BotKind, number>();
  const bots: BotSummary[] = [];

  for (const [botId, byDay] of dayMap) {
    const meta = describeBot(botId);
    let total = 0;
    let today = 0;
    let last7 = 0;
    let lastSeenDay: string | null = null;

    for (const [date, count] of byDay) {
      total += count;
      if (date === todayKey) today += count;
      if (last7Set.has(date)) last7 += count;
      if (!lastSeenDay || date > lastSeenDay) lastSeenDay = date;
    }

    const daily = window.map((date) => {
      const count = byDay.get(date) || 0;
      overallDaily.set(date, (overallDaily.get(date) || 0) + count);
      return { date, count };
    });

    kindTotals.set(meta.kind, (kindTotals.get(meta.kind) || 0) + total);

    bots.push({
      id: botId,
      kind: meta.kind,
      vendor: meta.vendor,
      total,
      today,
      last7,
      lastSeenDay,
      daily,
      topPaths: topEntries(pathMap.get(botId), 8).map((e) => ({ path: e.key, count: e.count })),
      countries: topEntries(countryMap.get(botId), 5).map((e) => ({ country: e.key, count: e.count })),
    });
  }

  bots.sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));

  const sum = (kinds: BotKind[]) => kinds.reduce((acc, k) => acc + (kindTotals.get(k) || 0), 0);
  const hits = bots.reduce((acc, b) => acc + b.total, 0);
  const hits7 = bots.reduce((acc, b) => acc + b.last7, 0);

  return {
    generatedAt: new Date().toISOString(),
    trendDays: days,
    totals: {
      hits,
      hitsToday: bots.reduce((acc, b) => acc + b.today, 0),
      hits7,
      uniqueBots: bots.length,
      aiSearchHits: sum(["ai-search"]),
      aiTrainingHits: sum(["ai-training"]),
      searchEngineHits: sum(["search"]),
    },
    daily: window.map((date) => ({ date, count: overallDaily.get(date) || 0 })),
    kindTotals: Array.from(kindTotals.entries())
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => b.count - a.count),
    bots,
  };
}

/** Wipe every bot counter (admin "reset" action). Counters only — no user data. */
export async function resetBotStats(): Promise<number> {
  const result = await prisma.siteCounter.deleteMany({ where: { key: { startsWith: BOT_KEY_PREFIX } } });
  return result.count;
}
