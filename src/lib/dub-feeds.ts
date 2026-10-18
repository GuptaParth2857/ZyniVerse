export type DubFeedEntry = {
  videoId: string;
  title: string;
  published: string;
  language: string;
  thumbnail: string | null;
  url: string;
};

export type DubFeedSource = {
  id: string;
  name: string;
  channelName: string;
  channelUrl: string;
  fetchedAt: string;
  ok: boolean;
  entries: DubFeedEntry[];
};

export type DubFeedsResult = {
  fetchedAt: string;
  sources: DubFeedSource[];
};

type SourceConfig = {
  id: string;
  name: string;
  channelName: string;
  channelUrl: string;
  feedUrl: string;
};

const TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES_PER_SOURCE = 8;

const SOURCES: SourceConfig[] = [
  {
    id: "muse-india",
    name: "Muse India",
    channelName: "Muse India",
    channelUrl: "https://www.youtube.com/channel/UCYYhAzgWuxPauRXdPpLAX3Q",
    feedUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCYYhAzgWuxPauRXdPpLAX3Q",
  },
  {
    id: "ani-one-india",
    name: "Ani-One India",
    channelName: "Ani-One India",
    channelUrl: "https://www.youtube.com/channel/UC67pLBZ_z4Gd46t6mW7uHjA",
    feedUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC67pLBZ_z4Gd46t6mW7uHjA",
  },
];

const DUB_LANG_RE = /\b(hindi|tamil|telugu|kannada|malayalam|marathi|bengali)\s*(?:dub(?:bed)?)\b/i;

const EXCLUDE_RE = /\b(behind[-\s]*the[-\s]*scenes|bts|sneak[-\s]*peek|trailer|teasers?|promo|announcement|celebration|coming[-\s]*free|special|livestream|concert|event|podcast|reaction|unboxing|making[-\s]*of)\b/i;

const LANG_MAP: Record<string, string> = {
  hindi: "Hindi",
  tamil: "Tamil",
  telugu: "Telugu",
  kannada: "Kannada",
  malayalam: "Malayalam",
  marathi: "Marathi",
  bengali: "Bengali",
};

type CacheEntry = { at: number; fetchedAt: string; entries: DubFeedEntry[] };
const cache = new Map<string, CacheEntry>();

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function languageFromTitle(title: string): string | null {
  const m = title.match(DUB_LANG_RE);
  return m ? (LANG_MAP[m[1].toLowerCase()] ?? null) : null;
}

function parseFeed(xml: string): DubFeedEntry[] {
  const blocks = xml.split(/<entry>/).slice(1);
  const entries: DubFeedEntry[] = [];

  for (const block of blocks) {
    const end = block.indexOf("</entry>");
    if (end === -1) continue;
    const entry = block.slice(0, end);

    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const rawTitle = entry.match(/<title>([^<]*)<\/title>/)?.[1];
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    const thumb = entry.match(/url="([^"]+)"/)?.[1];

    if (!videoId || !rawTitle || !published) continue;

    const title = decodeXmlEntities(rawTitle);
    const language = languageFromTitle(title);
    if (!language) continue;
    if (EXCLUDE_RE.test(title)) continue;

    entries.push({
      videoId,
      title,
      published,
      language,
      thumbnail: thumb ?? null,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }

  return entries.slice(0, MAX_ENTRIES_PER_SOURCE);
}

async function fetchSource(cfg: SourceConfig): Promise<DubFeedSource> {
  const now = Date.now();
  const hit = cache.get(cfg.id);
  if (hit && now - hit.at < TTL_MS) {
    return {
      id: cfg.id,
      name: cfg.name,
      channelName: cfg.channelName,
      channelUrl: cfg.channelUrl,
      fetchedAt: hit.fetchedAt,
      ok: true,
      entries: hit.entries,
    };
  }

  try {
    const res = await fetch(cfg.feedUrl, {
      // Was `cache: "no-store"`, which forced every route that reads dub feeds
      // (/hindi-dub-schedule/[channel], /indian-dubs) to render dynamically on
      // every request — so the page-level `revalidate` never applied and every
      // hit was a billed Node render. `next.revalidate` keeps the same ~30min
      // freshness while letting those pages become ISR/CDN-cacheable again.
      next: { revalidate: 1800 },
      headers: { "User-Agent": "ZyniVerse/1.0 (+https://zyverse.in)" },
    });
    if (!res.ok) throw new Error(`feed status ${res.status}`);
    const entries = parseFeed(await res.text());

    cache.set(cfg.id, { at: now, fetchedAt: new Date().toISOString(), entries });

    return {
      id: cfg.id,
      name: cfg.name,
      channelName: cfg.channelName,
      channelUrl: cfg.channelUrl,
      fetchedAt: cache.get(cfg.id)!.fetchedAt,
      ok: true,
      entries,
    };
  } catch {
    return {
      id: cfg.id,
      name: cfg.name,
      channelName: cfg.channelName,
      channelUrl: cfg.channelUrl,
      fetchedAt: new Date().toISOString(),
      ok: false,
      entries: [],
    };
  }
}

export async function getDubFeeds(): Promise<DubFeedsResult> {
  const sources = await Promise.all(SOURCES.map(fetchSource));
  return { fetchedAt: new Date().toISOString(), sources };
}