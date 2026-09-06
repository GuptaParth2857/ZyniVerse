export const MAL_STATUS_MAP: Record<string, string> = {
  watching: "CURRENT",
  completed: "COMPLETED",
  "plan to watch": "PLANNING",
  dropped: "DROPPED",
  "on-hold": "PAUSED",
  "rewatching": "REWATCHING",
  "Plan to Watch": "PLANNING",
  "On-Hold": "PAUSED",
};

export interface MalAnimeEntry {
  animeId: number;
  status: string;
  score: number;
  episodesWatched: number;
  totalEpisodes: number;
  startDate: string | null;
  endDate: string | null;
}

export function parseMALXml(xmlText: string): MalAnimeEntry[] {
  const results: MalAnimeEntry[] = [];

  // MAL XML format: <anime> <series_animedb_id>12345</series_animedb_id> ...
  const animeBlocks = xmlText.split("<anime>");
  for (let i = 1; i < animeBlocks.length; i++) {
    const block = animeBlocks[i].split("</anime>")[0];
    const extract = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
      const match = block.match(regex);
      return match ? match[1].trim() : "";
    };

    const animeId = parseInt(extract("series_animedb_id"), 10);
    if (!animeId || isNaN(animeId)) continue;

    const statusRaw = extract("my_status");
    const status = MAL_STATUS_MAP[statusRaw] || "CURRENT";

    const score = parseInt(extract("my_score"), 10);
    const episodesWatched = parseInt(extract("my_watched_episodes"), 10) || 0;
    const totalEpisodes = parseInt(extract("series_episodes"), 10) || 0;
    const startDate = extract("my_start_date");
    const endDate = extract("my_finish_date");

    results.push({
      animeId,
      status,
      score: score > 0 ? score : 0,
      episodesWatched,
      totalEpisodes,
      startDate: startDate !== "0000-00-00" ? startDate : null,
      endDate: endDate !== "0000-00-00" ? endDate : null,
    });
  }
  return results;
}