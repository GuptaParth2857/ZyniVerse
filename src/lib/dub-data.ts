import { getDubFeeds, type DubFeedsResult } from "@/lib/dub-feeds";

export interface DubEntry {
  title: string;
  type: string;
  /** Real upload date (YYYY-MM-DD) derived from the source feed's publish time. */
  releaseDate: string;
  status: "Airing" | "Upcoming" | "Completed";
  episodes: string;
  anilistId?: number;
  coverImage?: string;
  /** Direct video URL when the entry comes from a live feed. */
  url?: string;
  thumbnail?: string | null;
}

/**
 * Maps real dub-feed entries (Muse India / Ani-One India YouTube RSS) into
 * DubEntry records. Pure — no network — so it is safe to unit test and to
 * reuse for both GraphQL and any future UI.
 */
export function dubsFromFeeds(feeds: DubFeedsResult): DubEntry[] {
  const out: DubEntry[] = [];
  for (const src of feeds.sources) {
    if (!src.ok) continue;
    for (const e of src.entries) {
      const releaseDate = e.published.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) continue;
      out.push({
        title: e.title,
        type: `${e.language} Dub`,
        releaseDate,
        status: "Airing",
        episodes: "",
        url: e.url,
        thumbnail: e.thumbnail,
      });
    }
  }
  // Newest first — every date here is a real publish date from the source feed.
  return out.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
}

/**
 * All known dub releases, pulled live from the official Muse India and
 * Ani-One India YouTube channels (see src/lib/dub-feeds.ts).
 */
export async function getAllDubs(): Promise<DubEntry[]> {
  return dubsFromFeeds(await getDubFeeds());
}

export async function getDubsByStatus(status: DubEntry["status"]): Promise<DubEntry[]> {
  return (await getAllDubs()).filter((d) => d.status === status);
}