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

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d

interface CacheEntry {
  data: ArrayBuffer;
  type: string;
  expires: number;
}

// In-memory cache — avoids hammering upstream CDNs (which rate-limit
// hotlinking) on repeated/first loads, including in dev where Next's
// fetch cache is disabled.
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<{ data: ArrayBuffer; type: string }>>();

// Simple upstream concurrency limiter so cold bursts (e.g. a page with
// 20+ posters) don't trigger upstream rate limits.
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

async function fetchUpstream(url: string): Promise<{ data: ArrayBuffer; type: string }> {
  await acquire();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ZyniVerse/1.0" },
      next: { revalidate: TTL_MS / 1000 },
    });
    if (!res.ok) {
      throw new Error(`Upstream ${res.status} for ${url}`);
    }
    const type = res.headers.get("content-type") || "image/jpeg";
    const data = await res.arrayBuffer();
    return { data, type };
  } finally {
    release();
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

    const now = Date.now();
    const cached = cache.get(url);
      if (cached && cached.expires > now) {
      return new NextResponse(cached.data, {
        status: 200,
        headers: {
          "Content-Type": cached.type,
          "Access-Control-Allow-Origin": "*",
          // Poster/cover URLs are content-hashed upstream, so long-lived
          // edge caching is safe and keeps image bytes off Functions.
          "Cache-Control":
            "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=604800, immutable",
        },
      });
    }

    // Deduplicate concurrent requests for the same URL.
    let pending = inflight.get(url);
    if (!pending) {
      pending = fetchUpstream(url).then(
        (result) => {
          cache.set(url, { data: result.data, type: result.type, expires: now + TTL_MS });
          return result;
        },
        (err) => {
          inflight.delete(url);
          throw err;
        }
      );
      inflight.set(url, pending);
    }
    const { data, type } = await pending;
    inflight.delete(url);

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control":
          "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=604800, immutable",
      },
    });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
}
