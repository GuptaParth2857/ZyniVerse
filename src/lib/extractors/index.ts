import type { ExtractedMedia, VideoSource } from "./base";

export type { VideoSource, ExtractedMedia } from "./base";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function cleanUrl(raw: string): string {
  return raw.replace(/\\\//g, "/").replace(/^\/\//, "https://").trim();
}

function qualify(raw: string, base: string): string | null {
  try {
    if (raw.startsWith("http")) return cleanUrl(raw);
    return new URL(raw, base).href;
  } catch {
    return null;
  }
}

function isNoise(u: string): boolean {
  return (
    u.includes("blank") ||
    u.includes("placeholder") ||
    u.includes("transparent") ||
    u.includes("\.mp4\.svg")
  );
}

function isVideoUrl(u: string): boolean {
  const clean = u.toLowerCase();
  return (
    clean.includes(".m3u8") ||
    clean.includes(".mp4") ||
    clean.includes(".mpd") ||
    clean.includes(".webm") ||
    clean.includes(".ogg") ||
    clean.includes(".mov")
  );
}

function pickFormat(u: string): "hls" | "mp4" | "dash" {
  const clean = u.toLowerCase();
  if (clean.includes(".m3u8")) return "hls";
  if (clean.includes(".mpd")) return "dash";
  return "mp4";
}

function srcToSources(u: string, base?: string): VideoSource[] {
  const qualified = base ? qualify(u, base) : cleanUrl(u);
  if (!qualified || !isVideoUrl(qualified) || isNoise(qualified)) return [];
  return [{ url: qualified, quality: "default", format: pickFormat(qualified) }];
}

function dedupe(sources: VideoSource[]): VideoSource[] {
  const seen = new Set<string>();
  const out: VideoSource[] = [];
  for (const s of sources) {
    if (seen.has(s.url)) continue;
    seen.add(s.url);
    out.push(s);
  }
  return out;
}

async function fetchHtml(url: string, referer?: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      ...(referer ? { Referer: referer } : {}),
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  return res.text();
}

// Pure-generic page scraping: parse any HTML/JS player we can from the given URL.
async function extractFromHtml(html: string, baseUrl: string): Promise<ExtractedMedia | null> {
  const sources: VideoSource[] = [];

  // 1. Explicit video/iframe/embed src attributes (src= and data-src=)
  const attrPatterns = [
    /<(?:video|iframe|embed|source|video-player)[^>]*(?:data-src|src)\s*=\s*["']([^"']+)["'][^>]*>/gi,
    /<(?:video|embed|source)[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of attrPatterns) {
    const matches = [...html.matchAll(pattern)];
    for (const m of matches) {
      const qualified = qualify(m[1], baseUrl);
      if (qualified && isVideoUrl(qualified) && !isNoise(qualified)) {
        sources.push({ url: qualified, quality: "default", format: pickFormat(qualified) });
      }
    }
  }

  // 2. JS config strings (jwplayer, plyr, videojs, etc.)
  const jsPatterns = [
    /(?:file|src|source|url|video|hls)\s*:\s*["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4|webm|mpd|ogg)[^"'\s\\]*)["']/gi,
    /["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4|webm|mpd|ogg)[^"'\s\\]*)["']/gi,
  ];

  for (const pattern of jsPatterns) {
    const matches = [...html.matchAll(pattern)];
    for (const m of matches) {
      const qualified = cleanUrl(m[1]);
      if (isVideoUrl(qualified) && !isNoise(qualified)) {
        sources.push({ url: qualified, quality: "default", format: pickFormat(qualified) });
      }
    }
  }

  // 3. Plain URLs in the page body
  const urlPattern = /https?:\/\/[^"'\s<>\\]+\.(?:m3u8|mp4|webm|mpd|ogg)(?:\?[^"'\s<>\\]*)?/gi;
  const matches = [...html.matchAll(urlPattern)];
  for (const m of matches) {
    const qualified = cleanUrl(m[0]);
    if (isVideoUrl(qualified) && !isNoise(qualified)) {
      sources.push({ url: qualified, quality: "default", format: pickFormat(qualified) });
    }
  }

  const cleaned = dedupe(sources);
  if (cleaned.length > 0) {
    // Prefer HLS when available
    const ordered = [...cleaned].sort((a, b) =>
      b.format === "hls" ? 1 : b.format === "dash" ? 0 : -1
    );
    return { sources: ordered, source: "generic" };
  }

  // 4. No direct sources — chase the first iframe (up to 2 levels)
  const firstIframe = html.match(/<(?:iframe|embed)[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/i);
  if (firstIframe) {
    const embedUrl = qualify(firstIframe[1], baseUrl);
    if (embedUrl) {
      try {
        const embedHtml = await fetchHtml(embedUrl, baseUrl);
        if (embedHtml.length < 1_000_000) {
          const deep = await extractFromHtml(embedHtml, embedUrl);
          if (deep) return { ...deep, embedUrl };
        }
      } catch {
        void 0;
      }
    }
  }

  return null;
}

async function genericExtract(url: string): Promise<ExtractedMedia> {
  const html = await fetchHtml(url);

  // If the URL itself is a video file, use it directly
  if (isVideoUrl(url)) {
    return { sources: srcToSources(url), source: "generic" };
  }

  const result = await extractFromHtml(html, url);
  if (result) return result;

  throw new Error(
    "Could not extract video URL from this page. Try copying the direct video link instead."
  );
}

export async function extractMediaUrl(url: string): Promise<ExtractedMedia> {
  return genericExtract(url);
}