import CryptoJS from "crypto-js";
import type { SiteExtractor, ExtractedMedia } from "./base";

const SECRET_KEY = "ksKJdFu489P";

const GOGO_DOMAINS = [
  "gogoanime3.co",
  "gogoanimehd.to",
  "gogoanime.mom",
  "gogoanime.gg",
  "anitaku.pe",
  "anitaku.to",
  "anitaku.so",
  "anitaku.fi",
  "anitaku.sh",
  "gogoanime.mn",
  "gogoanime.ty",
  "gogoanime.movie",
  "www1.gogotaku.info",
];

function generateEncryptedAjaxParams(id: string, token: string): string {
  const encrypted = CryptoJS.AES.encrypt(id, SECRET_KEY).toString();
  const apiToken = CryptoJS.enc.Utf8.parse(token);
  const params = new URLSearchParams();
  params.set(
    "id",
    encrypted.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  );
  params.set("token", apiToken.toString(CryptoJS.enc.Base64));
  params.set("ajax", "2");
  params.set("system", "1");
  return params.toString();
}

async function fetchPage(url: string): Promise<string> {
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

function parseSources(data: Record<string, unknown>, embedUrl: string): ExtractedMedia {
  const rawSrc = (data.source_bk || data.source || []) as { file: string; label: string; type: string }[];
  const rawTracks = ((data.track as { tracks?: { file: string; label: string; kind: string }[] })?.tracks || []);

  return {
    sources: rawSrc.map((s) => ({
      url: s.file,
      quality: s.label || "default",
      format: s.type?.includes("hls") || s.file?.includes(".m3u8") ? ("hls" as const) : ("mp4" as const),
    })),
    tracks: rawTracks.map((t) => ({
      file: t.file,
      label: t.label,
      kind: t.kind || "subtitles",
    })),
    embedUrl,
    source: "gogoanime",
  };
}

async function extractFromEmbed(embedUrl: string): Promise<ExtractedMedia> {
  const embedHtml = await fetchPage(embedUrl);

  const scriptMatch = embedHtml.match(/data-id\s*=\s*["'](\d+)["']/);
  const tokenMatch = embedHtml.match(/token\s*=\s*["']([^"']+)["']/);

  let videoId: string | null = scriptMatch ? scriptMatch[1] : null;
  const token = tokenMatch ? tokenMatch[1] : "1";

  // Try encrypt-ajax pattern directly from embed HTML
  const ajaxMatch = embedHtml.match(/encrypt-ajax\.php\?id=([^&"']+)/);
  if (ajaxMatch) {
    const parsed = new URL(embedUrl);
    parsed.pathname = parsed.pathname.replace(/\/[^/]+\.php/, "/encrypt-ajax.php");
    const res = await fetch(`${parsed}?${ajaxMatch[0]}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: embedUrl,
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const data: Record<string, unknown> = await res.json();
    return parseSources(data, embedUrl);
  }

  // Fallback: extract id from URL params
  if (!videoId) {
    try {
      const params = new URL(embedUrl).searchParams;
      videoId = params.get("id") || params.get("vid");
    } catch { /* ignore */ }
  }

  if (!videoId) throw new Error("Could not extract video ID from Gogoanime embed");

  // Build encrypt-ajax URL
  const origin = new URL(embedUrl).origin;
  const ajaxUrl = `${origin}/encrypt-ajax.php`;
  const params = generateEncryptedAjaxParams(videoId, token);

  const res = await fetch(`${ajaxUrl}?${params}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: embedUrl,
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const data: Record<string, unknown> = await res.json();
  return parseSources(data, embedUrl);
}

export const gogoanimeExtractor: SiteExtractor = {
  name: "Gogoanime/Anitaku",

  canExtract(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return GOGO_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d));
    } catch {
      return false;
    }
  },

  async extract(url: string): Promise<ExtractedMedia> {
    const html = await fetchPage(url);
    const iframeMatch = html.match(
      /<iframe[^>]*src="([^"]*(?:gogoplay|embed|stream)[^"]*?)"[^>]*>/i
    );
    if (!iframeMatch) throw new Error("No video embed found on this Gogoanime page");

    const embedUrl = iframeMatch[1].startsWith("http")
      ? iframeMatch[1]
      : new URL(iframeMatch[1], url).href;

    return extractFromEmbed(embedUrl);
  },
};
