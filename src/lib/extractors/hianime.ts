import type { SiteExtractor, ExtractedMedia } from "./base";

const HIANIME_DOMAINS = [
  "hianime.to",
  "hianime.nz",
  "hianime.sx",
  "zoro.to",
  "aniwatch.to",
];

async function fetchHTML(url: string, referer?: string): Promise<string> {
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

function extractEpisodeId(url: string): string | null {
  const match = url.match(/(?:ep|episode)[=-](\d+)/i);
  if (match) return match[1];

  const pathMatch = url.match(/\/episode\/([a-z0-9-]+)/i);
  if (pathMatch) return pathMatch[1];

  return null;
}

async function getServerId(episodeId: string, baseUrl: string): Promise<string> {
  const html = await fetchHTML(
    `${baseUrl}/ajax/v2/episode/servers?episodeId=${episodeId}`,
    baseUrl
  );
  const data = JSON.parse(html);
  // Pick first available server (sub preferred)
  const server = data?.sub?.[0] || data?.dub?.[0] || data?.raw?.[0];
  if (!server?.id) throw new Error("No server available");
  return server.id;
}

async function getEmbedUrl(
  serverId: string,
  baseUrl: string
): Promise<string> {
  const html = await fetchHTML(
    `${baseUrl}/ajax/v2/episode/sources?id=${serverId}`,
    baseUrl
  );
  const data = JSON.parse(html);
  if (!data?.link) throw new Error("No embed URL found");
  return data.link;
}

function _extractVideoIdFromEmbed(embedUrl: string): string | null {
  // https://megacloud.tv/embed-2/v3/e-1/abc123?k=1
  const match = embedUrl.match(/\/e(?:mbed)?(?:-1|-2)?\/(?:v\d+\/)?(?:e-\d+\/)?([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}

// MegaCloud decryption constants and functions
// Based on the reverse-engineered MegaCloud decryption algorithm
function charCodeXor(str: string, key: number): string {
  return str
    .split("")
    .map((c, i) => {
      const code = c.charCodeAt(0);
      const xorKey = key + i;
      return String.fromCharCode(((code - 32 - (xorKey % 95)) % 95) + 32);
    })
    .join("");
}

function _extractKeyFromScript(scriptContent: string): { secretKey: string; keyMap: number[] } | null {
  // The key is embedded in obfuscated JS - look for patterns
  // Pattern 1: direct variable assignment
  const keyMatch = scriptContent.match(
    /(?:const|let|var)\s+\w+\s*=\s*["']([A-Za-z0-9+/=]{20,})["']/
  );

  // Pattern 2: Array of numbers that map to key characters
  const keyArrMatch = scriptContent.match(
    /\[(\d+(?:\s*,\s*\d+){20,})\]/
  );

  if (keyMatch) {
    return { secretKey: keyMatch[1], keyMap: [] };
  }

  if (keyArrMatch) {
    const nums = keyArrMatch[1].split(",").map(Number);
    return { secretKey: "", keyMap: nums };
  }

  return null;
}

function _decryptMegaCloudSources(
  encrypted: string,
  key: { secretKey: string; keyMap: number[] }
): string {
  if (key.secretKey) {
    // Simple XOR with key
    return charCodeXor(encrypted, parseInt(key.secretKey.slice(0, 4), 36) || 0);
  }

  // Complex decryption with keyMap
  // Fisher-Yates reverse shuffle
  const parts = encrypted.split("&");
  const shuffled: string[] = new Array(parts.length);

  let idx = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    const mapIdx = key.keyMap[idx % key.keyMap.length];
    shuffled[mapIdx % parts.length] = parts[i];
    idx++;
  }

  return shuffled.join("");
}

async function extractFromMegaCloud(
  embedUrl: string
): Promise<ExtractedMedia> {
  const embedHtml = await fetchHTML(embedUrl, embedUrl);

  // Try to find the API endpoint in the page scripts
  const apiPatterns = [
    embedHtml.match(
      /https?:\/\/[^"'\s]+\/getSources\?id=([^&"'\s]+)/
    ),
    embedHtml.match(/sources\s*=\s*(?:await\s+)?fetch\(["']([^"']+)["']/),
  ];

  // If we found a direct sources URL
  for (const match of apiPatterns) {
    if (match) {
      const apiUrl = match[1].startsWith("http")
        ? match[1]
        : new URL(match[1], embedUrl).href;

      try {
        const res = await fetch(apiUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: embedUrl,
          },
        });
        const data = await res.json();
        const sources = Array.isArray(data.sources) ? data.sources : [];
        if (sources.length > 0) {
          return {
            sources: sources.map((s: { file: string; label: string; type: string }) => ({
              url: s.file,
              quality: s.label || "default",
              format:
                s.type?.includes("hls") || s.file?.includes(".m3u8")
                  ? "hls"
                  : "mp4",
            })),
            tracks: data.track?.tracks?.map((t: { file: string; label: string; kind: string }) => ({
              file: t.file,
              label: t.label,
              kind: t.kind || "subtitles",
            })) || [],
            embedUrl,
            source: "hianime",
          };
        }
      } catch {
        // continue
      }
    }
  }

  // Fallback: try to extract m3u8/mp4 URLs directly from page
  const m3u8Match = embedHtml.match(
    /(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/
  );
  if (m3u8Match) {
    return {
      sources: [
        {
          url: m3u8Match[1],
          quality: "default",
          format: "hls",
        },
      ],
      embedUrl,
      source: "hianime",
    };
  }

  throw new Error(
    "Could not extract video sources from HiAnime embed. The site may have changed its encryption."
  );
}

export const hianimeExtractor: SiteExtractor = {
  name: "HiAnime/Zoro",

  canExtract(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return HIANIME_DOMAINS.some(
        (d) => hostname === d || hostname.endsWith("." + d)
      );
    } catch {
      return false;
    }
  },

  async extract(url: string): Promise<ExtractedMedia> {
    const baseUrl = new URL(url).origin;
    const episodeId = extractEpisodeId(url);

    if (!episodeId) {
      throw new Error("Could not extract episode ID from HiAnime URL");
    }

    const serverId = await getServerId(episodeId, baseUrl);
    const embedUrl = await getEmbedUrl(serverId, baseUrl);

    return extractFromMegaCloud(embedUrl);
  },
};
