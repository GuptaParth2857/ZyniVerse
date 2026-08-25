import type { SiteExtractor, ExtractedMedia } from "./base";
import { gogoanimeExtractor } from "./gogoanime";
import { hianimeExtractor } from "./hianime";
import { sanjiExtractor } from "./sanji";
import { animeworldExtractor } from "./animeworld";

export type { VideoSource, ExtractedMedia } from "./base";

const extractors: SiteExtractor[] = [
  gogoanimeExtractor,
  hianimeExtractor,
  sanjiExtractor,
  animeworldExtractor,
];

// Generic fallback: try to find video URL from any page
async function genericExtract(url: string): Promise<ExtractedMedia> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);

  const html = await res.text();

  // Priority 1: HLS streams (best for watch party)
  const m3u8Patterns = [
    /(?:file|source|src|url)\s*[:=]\s*["'](https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)["']/gi,
    /(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/gi,
  ];

  for (const pattern of m3u8Patterns) {
    const matches = [...html.matchAll(pattern)];
    if (matches.length > 0) {
      const urls = [
        ...new Set(matches.map((m) => m[1].replace(/\\\//g, "/"))),
      ].filter((u) => !u.includes("test") && !u.includes("blank"));

      if (urls.length > 0) {
        return {
          sources: urls.map((u, i) => ({
            url: u,
            quality: `${i + 1}`,
            format: "hls" as const,
          })),
          source: "generic",
        };
      }
    }
  }

  // Priority 2: MP4
  const mp4Patterns = [
    /(?:file|source|src|url)\s*[:=]\s*["'](https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*)["']/gi,
    /(https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*)/gi,
  ];

  for (const pattern of mp4Patterns) {
    const matches = [...html.matchAll(pattern)];
    if (matches.length > 0) {
      const urls = [
        ...new Set(matches.map((m) => m[1].replace(/\\\//g, "/"))),
      ].filter((u) => !u.includes("blank") && !u.includes("test"));

      if (urls.length > 0) {
        return {
          sources: urls.map((u, i) => ({
            url: u,
            quality: `${i + 1}`,
            format: "mp4" as const,
          })),
          source: "generic",
        };
      }
    }
  }

  // Priority 3: video elements
  const videoMatch = html.match(/<video[^>]*src="([^"]+)"/i);
  if (videoMatch) {
    const vUrl = videoMatch[1].replace(/\\\//g, "/");
    return {
      sources: [
        {
          url: vUrl,
          quality: "default",
          format: vUrl.includes(".m3u8") ? "hls" : "mp4",
        },
      ],
      source: "generic",
    };
  }

  // Priority 4: iframes (try to follow one level)
  const iframeMatch = html.match(
    /<iframe[^>]*src="([^"]+)"[^>]*>/i
  );
  if (iframeMatch) {
    const embedUrl = iframeMatch[1].startsWith("http")
      ? iframeMatch[1]
      : new URL(iframeMatch[1], url).href;

    const embedRes = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: url,
      },
    });

    if (embedRes.ok) {
      const embedHtml = await embedRes.text();
      const embedM3u8 = embedHtml.match(
        /(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/
      );
      if (embedM3u8) {
        return {
          sources: [
            {
              url: embedM3u8[1].replace(/\\\//g, "/"),
              quality: "default",
              format: "hls",
            },
          ],
          embedUrl,
          source: "generic",
        };
      }

      const embedMp4 = embedHtml.match(
        /(https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*)/
      );
      if (embedMp4) {
        return {
          sources: [
            {
              url: embedMp4[1].replace(/\\\//g, "/"),
              quality: "default",
              format: "mp4",
            },
          ],
          embedUrl,
          source: "generic",
        };
      }
    }
  }

  throw new Error(
    "Could not extract video URL from this page. Try copying the direct video link instead."
  );
}

export async function extractMediaUrl(
  url: string
): Promise<ExtractedMedia> {
  // Try site-specific extractor first
  for (const extractor of extractors) {
    if (extractor.canExtract(url)) {
      try {
        return await extractor.extract(url);
      } catch (err) {
        console.error(
          `[Extractor] ${extractor.name} failed for ${url}:`,
          err
        );
        // Fall through to generic
      }
    }
  }

  // Generic fallback
  return genericExtract(url);
}
