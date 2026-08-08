const AVATAR_PROXY_HOSTS = [
  "googleusercontent.com",
  "supabase.co",
  "githubusercontent.com",
  "discordapp.com",
  "ui-avatars.com",
  "gravatar.com",
  "anilist.co",
  "wikimedia.org",
  "wikipedia.org",
];

export function isAllowedAvatarHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return AVATAR_PROXY_HOSTS.some((allowed) => h === allowed || h.endsWith("." + allowed));
}

export function proxyImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || !isAllowedAvatarHost(u.hostname)) return url;
    return `/api/avatar?url=${encodeURIComponent(u.toString())}`;
  } catch {
    return url;
  }
}

export function unproxyImageUrl(url: string | null | undefined): string | null | undefined {
  if (typeof url === "string" && url.startsWith("/api/avatar?url=")) {
    try {
      return decodeURIComponent(url.slice("/api/avatar?url=".length));
    } catch {
      return url;
    }
  }
  return url;
}
