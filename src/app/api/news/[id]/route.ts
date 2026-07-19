import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { getRSSNewsById } from "@/lib/news";
import { dedupedFetch } from "@/lib/wiki-cache";

async function fetchOGImage(url: string): Promise<string> {
  return dedupedFetch(`og:${url}`, async () => {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ZyniVerse/1.0)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return "";
      const html = await res.text();
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      return ogMatch ? ogMatch[1] : "";
    } catch {
      return "";
    }
  }, 60 * 60 * 1000);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const item = await getRSSNewsById(decodedId);
  if (!item) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  let image = item.image;
  if (!image && item.url && !item.url.startsWith("/")) {
    image = await fetchOGImage(item.url);
  }

  return NextResponse.json({ item: { ...item, image } }, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
