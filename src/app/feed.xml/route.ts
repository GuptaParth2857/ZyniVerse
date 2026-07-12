import { getTrending } from "@/lib/anilist";
import { bestTitle } from "@/lib/anilist";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  let items = "";

  try {
    const trending = await getTrending(20);
    for (const m of trending) {
      const title = bestTitle(m.title);
      const desc = (m.description || "").replace(/<[^>]*>/g, "").slice(0, 200);
      items += `
    <item>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(desc)}</description>
      <link>${baseUrl}/anime/${m.id}</link>
      <guid>${baseUrl}/anime/${m.id}</guid>
      <pubDate>${m.startDate?.year ? new Date(m.startDate.year, (m.startDate.month || 1) - 1).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`;
    }
  } catch {}

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ZyniVerse — Trending Anime</title>
    <description>Latest trending anime on ZyniVerse</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
