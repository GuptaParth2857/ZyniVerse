import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const ALLOWED_HOSTS = [
  "s4.anilist.co",
  "cdn.myanimelist.net",
  "img.anili.st",
  "i.ytimg.com",
  "upload.wikimedia.org",
  "yt3.googleusercontent.com",
];

const CACHE_CONTROL =
  "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=604800, immutable";

// Simple upstream concurrency limiter.
let active = 0;
const queue: (() => void)[] = [];
const MAX_CONCURRENT = 2;

function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => queue.push(resolve));
}

function release() {
  active--;
  const next = queue.shift();
  if (next) {
    active++;
    next();
  }
}

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

    await acquire();
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "ZyniVerse/1.0" },
      });
      if (!res.ok) {
        return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 });
      }

      const type = res.headers.get("content-type") || "image/jpeg";

      // Stream the response instead of buffering into ArrayBuffer.
      // This keeps memory usage low and reduces Fast Origin Transfer.
      return new NextResponse(res.body, {
        status: 200,
        headers: {
          "Content-Type": type,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": CACHE_CONTROL,
        },
      });
    } finally {
      release();
    }
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
}
