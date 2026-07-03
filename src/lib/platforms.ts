export interface Platform {
  id: string;
  name: string;
  color: string;
  gradient: string;
  url: string;
}

export const PLATFORMS: Record<string, Platform> = {
  crunchyroll: {
    id: "crunchyroll",
    name: "Crunchyroll",
    color: "#F47521",
    gradient: "from-[#F47521] to-[#f59e0b]",
    url: "https://www.crunchyroll.com",
  },
  netflix: {
    id: "netflix",
    name: "Netflix",
    color: "#E50914",
    gradient: "from-[#E50914] to-[#b20710]",
    url: "https://www.netflix.com",
  },
  prime: {
    id: "prime",
    name: "Amazon Prime Video",
    color: "#00A8E1",
    gradient: "from-[#00A8E1] to-[#1E90FF]",
    url: "https://www.primevideo.com",
  },
  hulu: {
    id: "hulu",
    name: "Hulu",
    color: "#1CE783",
    gradient: "from-[#1CE783] to-[#00a86b]",
    url: "https://www.hulu.com",
  },
  disney: {
    id: "disney",
    name: "Disney+",
    color: "#113CC2",
    gradient: "from-[#113CC2] to-[#1E40AF]",
    url: "https://www.disneyplus.com",
  },
  funimation: {
    id: "funimation",
    name: "Funimation",
    color: "#5B0BB5",
    gradient: "from-[#5B0BB5] to-[#8B5CF6]",
    url: "https://www.funimation.com",
  },
  hidive: {
    id: "hidive",
    name: "HIDIVE",
    color: "#00B4E6",
    gradient: "from-[#00B4E6] to-[#0099cc]",
    url: "https://www.hidive.com",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    gradient: "from-[#FF0000] to-[#cc0000]",
    url: "https://www.youtube.com",
  },
  apple: {
    id: "apple",
    name: "Apple TV",
    color: "#555555",
    gradient: "from-[#555555] to-[#333333]",
    url: "https://tv.apple.com",
  },
};

export function getPlatformByName(name: string): Platform | undefined {
  const lower = name.toLowerCase();
  if (lower.includes("crunchyroll")) return PLATFORMS.crunchyroll;
  if (lower.includes("netflix")) return PLATFORMS.netflix;
  if (lower.includes("prime") || lower.includes("amazon")) return PLATFORMS.prime;
  if (lower.includes("hulu")) return PLATFORMS.hulu;
  if (lower.includes("disney") || lower.includes("hotstar")) return PLATFORMS.disney;
  if (lower.includes("funimation")) return PLATFORMS.funimation;
  if (lower.includes("hidive")) return PLATFORMS.hidive;
  if (lower.includes("youtube")) return PLATFORMS.youtube;
  if (lower.includes("apple")) return PLATFORMS.apple;
  return undefined;
}

export function getAnimeStreamingPlatforms(
  streaming: { site: string; url: string }[] | undefined
): { platform: Platform; url: string }[] {
  if (!streaming || streaming.length === 0) return [];
  const seen = new Set<string>();
  const result: { platform: Platform; url: string }[] = [];
  for (const s of streaming) {
    const platform = getPlatformByName(s.site);
    if (platform && !seen.has(platform.id)) {
      seen.add(platform.id);
      result.push({ platform, url: s.url });
    }
  }
  return result;
}
