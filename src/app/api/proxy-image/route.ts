import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const ALLOWED_HOSTS = [
  "s4.anilist.co",
  "cdn.myanimelist.net",
  "img.anili.st",
  "i.ytimg.com",
  "upload.wikimedia.org",
];

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "ZyniVerse/1.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
