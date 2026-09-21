import { NEWS_DESK } from "@/lib/news-desk";

export const revalidate = 43200;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const now = Date.now();
  const within48h = NEWS_DESK.filter((n) => {
    const t = new Date(n.publishedAt).getTime();
    return !isNaN(t) && now - t <= 48 * 3600 * 1000;
  });

  const items = within48h
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items
  .map(
    (n) => `  <url>
    <loc>${escapeXml(`${BASE_URL}/news/desk/${n.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>ZyniVerse</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(n.publishedAt).toISOString().slice(0, 19)}+00:00</news:publication_date>
      <news:title>${escapeXml(n.title)}</news:title>
    </news:news>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=43200",
    },
  });
}