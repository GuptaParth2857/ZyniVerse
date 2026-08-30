import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";

export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `sitemap fetch failed: ${res.status}` }, { status: 502 });
    }
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/loc>/g)].map((m) => m[1]);
    if (urls.length === 0) {
      return NextResponse.json({ error: "no urls found in sitemap" }, { status: 500 });
    }
    await submitToIndexNow(urls);
    return NextResponse.json({ ok: true, submitted: urls.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}