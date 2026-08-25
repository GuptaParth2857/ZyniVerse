import type { SiteExtractor, ExtractedMedia } from "./base";

const ANIMEWORLD_DOMAINS = [
  "animeworld.to",
  "animeworld.tv",
  "animeworld.ac",
  "animeworld.cc",
  "watchanimeworld.one",
  "watchanimeworld.in",
  "www1.animeworld.ac",
];

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: new URL(url).origin + "/",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

async function extractAnimeWorldVideo(
  url: string
): Promise<ExtractedMedia> {
  const html = await fetchHTML(url);

  // 1. Check for direct video/source element
  const videoMatch = html.match(/<video[^>]*src="([^"]+)"[^>]*>/i);
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
      source: "animeworld",
    };
  }

  const sourceMatch = html.match(
    /<source[^>]*src="([^"]+)"[^>]*>/i
  );
  if (sourceMatch) {
    const sUrl = sourceMatch[1].replace(/\\\//g, "/");
    return {
      sources: [
        {
          url: sUrl,
          quality: "default",
          format: sUrl.includes(".m3u8") ? "hls" : "mp4",
        },
      ],
      source: "animeworld",
    };
  }

  // 2. Check for embedded iframe
  const iframeMatch = html.match(
    /<iframe[^>]*src="([^"]*(?:embed|player|stream|zephyr|flick)[^"]*)"[^>]*>/i
  );
  if (iframeMatch) {
    const embedUrl = iframeMatch[1].startsWith("http")
      ? iframeMatch[1]
      : new URL(iframeMatch[1], url).href;

    return extractFromAnimeWorldEmbed(embedUrl, url);
  }

  // 3. Look for JS video config
  const configPatterns = [
    html.match(
      /(?:file|source|videoUrl|video_url)\s*[:=]\s*["'](https?:\/\/[^"'\s]+)["']/i
    ),
    html.match(
      /(?:playlist|sources)\s*:\s*\[\s*\{[^}]*["']?file["']?\s*:\s*["'](https?:\/\/[^"'\s]+)["']/i
    ),
    html.match(
      /data-(?:src|file|url|video)\s*=\s*["'](https?:\/\/[^"'\s]+)["']/i
    ),
  ];

  for (const match of configPatterns) {
    if (match) {
      const vUrl = match[1].replace(/\\\//g, "/");
      const format = vUrl.includes(".m3u8") ? "hls" : "mp4";
      return {
        sources: [{ url: vUrl, quality: "default", format }],
        source: "animeworld",
      };
    }
  }

  // 4. Fallback: scan for any video URL
  const m3u8Match = html.match(
    /(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/
  );
  if (m3u8Match) {
    return {
      sources: [
        { url: m3u8Match[1].replace(/\\\//g, "/"), quality: "default", format: "hls" },
      ],
      source: "animeworld",
    };
  }

  const mp4Match = html.match(
    /(https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*)/
  );
  if (mp4Match) {
    return {
      sources: [
        { url: mp4Match[1].replace(/\\\//g, "/"), quality: "default", format: "mp4" },
      ],
      source: "animeworld",
    };
  }

  throw new Error("Could not extract video from AnimeWorld page");
}

async function extractFromAnimeWorldEmbed(
  embedUrl: string,
  _referer: string
): Promise<ExtractedMedia> {
  const html = await fetchHTML(embedUrl);

  // Look for video/source in the embed
  const videoMatch = html.match(/<video[^>]*src="([^"]+)"[^>]*>/i);
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
      embedUrl,
      source: "animeworld",
    };
  }

  // Look for JS configs in embed
  const configMatch = html.match(
    /(?:file|source|src)\s*[:=]\s*["'](https?:\/\/[^"'\s]+\.mp4[^"'\s]*)["']/i
  );
  if (configMatch) {
    return {
      sources: [
        {
          url: configMatch[1].replace(/\\\//g, "/"),
          quality: "default",
          format: "mp4",
        },
      ],
      embedUrl,
      source: "animeworld",
    };
  }

  const hlsMatch = html.match(
    /(?:file|source|src)\s*[:=]\s*["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/i
  );
  if (hlsMatch) {
    return {
      sources: [
        {
          url: hlsMatch[1].replace(/\\\//g, "/"),
          quality: "default",
          format: "hls",
        },
      ],
      embedUrl,
      source: "animeworld",
    };
  }

  // Any video URL
  const anyM3u8 = html.match(/(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/);
  if (anyM3u8) {
    return {
      sources: [
        { url: anyM3u8[1].replace(/\\\//g, "/"), quality: "default", format: "hls" },
      ],
      embedUrl,
      source: "animeworld",
    };
  }

  const anyMp4 = html.match(/(https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*)/);
  if (anyMp4) {
    return {
      sources: [
        { url: anyMp4[1].replace(/\\\//g, "/"), quality: "default", format: "mp4" },
      ],
      embedUrl,
      source: "animeworld",
    };
  }

  throw new Error("Could not extract video from AnimeWorld embed");
}

export const animeworldExtractor: SiteExtractor = {
  name: "AnimeWorld",

  canExtract(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return ANIMEWORLD_DOMAINS.some(
        (d) => hostname === d || hostname.endsWith("." + d)
      );
    } catch {
      return false;
    }
  },

  async extract(url: string): Promise<ExtractedMedia> {
    return extractAnimeWorldVideo(url);
  },
};
