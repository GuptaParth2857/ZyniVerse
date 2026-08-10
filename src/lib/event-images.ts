const PROXY_HOSTS = new Set(["s4.anilist.co", "img.anili.st", "cdn.myanimelist.net"]);

export function eventImageSrc(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (PROXY_HOSTS.has(u.hostname)) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // Not a valid URL — return as-is
  }
  return url;
}
