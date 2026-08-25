import RssParser from "rss-parser";

const parser = new RssParser({
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent"],
    ],
  },
});

export type RssFeed = Awaited<ReturnType<typeof parser.parseString>>;

export async function fetchRss(url: string): Promise<RssFeed> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ZyniVerse/1.0; +https://zyverse.in)" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`RSS fetch failed ${res.status}: ${url}`);
  return parser.parseString(await res.text());
}
