import CryptoJS from "crypto-js";
import type { SiteExtractor, ExtractedMedia } from "./base";

const SANJI_DOMAINS = [
  "sanji.tv",
  "sanjianime.tv",
  "sanji.one",
  "sanji.ninja",
  "sanji.pizza",
];

async function fetchPage(url: string, referer?: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: referer || new URL(url).origin + "/",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

function cleanUrl(url: string): string {
  return url.replace(/\\\//g, "/").replace(/\\/g, "");
}

async function decryptFairUsePlayer(embedUrl: string): Promise<string | null> {
  try {
    const html = await fetchPage(embedUrl, embedUrl);

    // Extract encrypted payloads
    const kakenMatch = html.match(/window\.kaken\s*=\s*["']([^"']+)["']/);
    const localKeyMatch = html.match(/window\.localKey\s*=\s*["']([^"']+)["']/);
    const pdMatch = html.match(/(?:^|;\s*)pd\s*=\s*["'](\d+)["']/m);
    const psMatch = html.match(/(?:^|;\s*)ps\s*=\s*["']([^"']+)["']/m);

    if (!kakenMatch || !localKeyMatch) return null;

    const kaken = kakenMatch[1];
    const localKey = localKeyMatch[1];
    const pd = pdMatch ? pdMatch[1] : "1787680064";
    const ps = psMatch ? psMatch[1] : kaken;

    // PBKDF2 key derivation
    const salt = CryptoJS.enc.Utf8.parse(pd);
    const key = CryptoJS.PBKDF2(localKey, salt, {
      keySize: 256 / 32,
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256,
    });

    // AES decrypt
    const decrypted = CryptoJS.AES.decrypt(ps, key, {
      iv: CryptoJS.lib.WordArray.create(new Uint8Array(16)),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonStr) return null;

    const config = JSON.parse(jsonStr);

    // Extract video source URL from config
    if (config.sources && Array.isArray(config.sources)) {
      const source = config.sources[0];
      if (source?.file) return cleanUrl(source.file);
    }

    if (config.playlist && Array.isArray(config.playlist)) {
      const item = config.playlist[0];
      if (item?.sources && Array.isArray(item.sources)) {
        const source = item.sources[0];
        if (source?.file) return cleanUrl(source.file);
      }
    }

    return null;
  } catch {
    return null;
  }
}

function extractDirectMp4(html: string): string | null {
  // Look for archive.org or direct MP4 URLs
  const mp4Patterns = [
    /https?:\/\/ia\d+\.us\.archive\.org\/[^"'\s\\]+\.mp4[^"'\s\\]*/gi,
    /https?:\/\/[^"'\s\\]*archive\.org[^"'\s\\]*\.mp4[^"'\s\\]*/gi,
    /https?:\/\/[^"'\s\\]*\.mp4[^"'\s\\]*/gi,
  ];

  for (const pattern of mp4Patterns) {
    const matches = [...html.matchAll(pattern)];
    const cleanUrls = matches
      .map((m) => cleanUrl(m[0]))
      .filter((u) => !u.includes("blank") && !u.includes("test") && u.length > 20);

    if (cleanUrls.length > 0) {
      return cleanUrls[0];
    }
  }

  return null;
}

function extractM3u8(html: string): string | null {
  const match = html.match(/(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/);
  return match ? cleanUrl(match[1]) : null;
}

function extractIframes(html: string): string[] {
  const matches = [...html.matchAll(/<iframe[^>]*src="([^"]+)"[^>]*>/gi)];
  return matches
    .map((m) => cleanUrl(m[1]))
    .filter((u) => u.startsWith("http"));
}

async function extractSanjiVideo(url: string): Promise<ExtractedMedia> {
  const html = await fetchPage(url);

  // Strategy 1: Direct MP4 from archive.org (most reliable)
  const directMp4 = extractDirectMp4(html);
  if (directMp4) {
    return {
      sources: [{ url: directMp4, quality: "default", format: "mp4" }],
      source: "sanji",
    };
  }

  // Strategy 2: m3u8 in page
  const m3u8 = extractM3u8(html);
  if (m3u8) {
    return {
      sources: [{ url: m3u8, quality: "default", format: "hls" }],
      source: "sanji",
    };
  }

  // Strategy 3: Follow iframes
  const iframes = extractIframes(html);

  for (const iframeUrl of iframes) {
    // Check if it's a fairuseonly embed
    if (iframeUrl.includes("fairuseonly") || iframeUrl.includes("player.")) {
      const videoUrl = await decryptFairUsePlayer(iframeUrl);
      if (videoUrl) {
        const format = videoUrl.includes(".m3u8") ? ("hls" as const) : ("mp4" as const);
        return {
          sources: [{ url: videoUrl, quality: "default", format }],
          embedUrl: iframeUrl,
          source: "sanji",
        };
      }

      // Try fetching the embed page for direct MP4
      try {
        const embedHtml = await fetchPage(iframeUrl, url);
        const embedMp4 = extractDirectMp4(embedHtml);
        if (embedMp4) {
          return {
            sources: [{ url: embedMp4, quality: "default", format: "mp4" }],
            embedUrl: iframeUrl,
            source: "sanji",
          };
        }

        const embedM3u8 = extractM3u8(embedHtml);
        if (embedM3u8) {
          return {
            sources: [{ url: embedM3u8, quality: "default", format: "hls" }],
            embedUrl: iframeUrl,
            source: "sanji",
          };
        }
      } catch { /* continue */ }
    }

    // Try generic embed
    try {
      const embedHtml = await fetchPage(iframeUrl, url);
      const embedMp4 = extractDirectMp4(embedHtml);
      if (embedMp4) {
        return {
          sources: [{ url: embedMp4, quality: "default", format: "mp4" }],
          embedUrl: iframeUrl,
          source: "sanji",
        };
      }

      const embedM3u8 = extractM3u8(embedHtml);
      if (embedM3u8) {
        return {
          sources: [{ url: embedM3u8, quality: "default", format: "hls" }],
          embedUrl: iframeUrl,
          source: "sanji",
        };
      }
    } catch { /* continue */ }
  }

  // Strategy 4: Look for wp-json API
  const wpApiMatch = html.match(
    /site_rest_url\s*=\s*["']([^"']+)["']/
  );
  if (wpApiMatch) {
    const apiUrl = cleanUrl(wpApiMatch[1]);
    // Try fetching episode data from WP REST API
    try {
      const postMatch = html.match(/var\s+current_post_data_id\s*=\s*(\d+)/);
      if (postMatch) {
        const res = await fetch(`${apiUrl}episode/${postMatch[1]}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: url,
          },
        });
        if (res.ok) {
          const data = await res.json();
          // Check for video sources in API response
          const apiMp4 = JSON.stringify(data).match(
            /(https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*)/
          );
          if (apiMp4) {
            return {
              sources: [{ url: cleanUrl(apiMp4[1]), quality: "default", format: "mp4" }],
              source: "sanji",
            };
          }
        }
      }
    } catch { /* continue */ }
  }

  throw new Error(
    "Could not extract video from SanjiAnime page. The content may be encrypted or require browser interaction."
  );
}

export const sanjiExtractor: SiteExtractor = {
  name: "SanjiAnime",

  canExtract(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return SANJI_DOMAINS.some(
        (d) => hostname === d || hostname.endsWith("." + d)
      );
    } catch {
      return false;
    }
  },

  async extract(url: string): Promise<ExtractedMedia> {
    return extractSanjiVideo(url);
  },
};
