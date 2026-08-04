import { bestTitle, type MediaAnimeFull } from "@/lib/anilist";

export type WatchOrderGroup =
  | "prequel"
  | "main"
  | "sequel"
  | "side"
  | "spinoff"
  | "alternative"
  | "other";

export interface WatchOrderEntry {
  id: number;
  title: string;
  format?: string;
  episodes?: number;
  relationType: string;
  group: WatchOrderGroup;
  coverImage?: string;
  status?: string;
  score?: number;
  startDate?: { year?: number; month?: number; day?: number };
  note?: string;
}

export interface WatchOrderSection {
  group: WatchOrderGroup;
  label: string;
  color: string;
  entries: WatchOrderEntry[];
}

export interface WatchOrderGuide {
  mainId: number;
  totalEntries: number;
  movieCount: number;
  releaseOrder: WatchOrderEntry[];
  sections: WatchOrderSection[];
}

export const GROUP_LABELS: Record<WatchOrderGroup, string> = {
  prequel: "Prequels",
  main: "Main Series",
  sequel: "Sequels",
  side: "Side Stories & Specials",
  spinoff: "Spin-offs",
  alternative: "Alternatives",
  other: "Other Related",
};

export const GROUP_COLORS: Record<WatchOrderGroup, string> = {
  prequel: "var(--color-violet)",
  main: "var(--color-cyan)",
  sequel: "var(--color-magenta)",
  side: "var(--color-amber)",
  spinoff: "#a3e635",
  alternative: "#f97316",
  other: "var(--color-mute)",
};

const GROUP_ORDER: WatchOrderGroup[] = [
  "prequel",
  "main",
  "sequel",
  "side",
  "spinoff",
  "alternative",
  "other",
];

const GROUP_PRIORITY: Record<WatchOrderGroup, number> = {
  prequel: 1,
  main: 2,
  sequel: 3,
  side: 4,
  spinoff: 5,
  alternative: 6,
  other: 7,
};

type RelationEdge = NonNullable<MediaAnimeFull["relations"]>["edges"][number];

function toDateKey(d?: { year?: number; month?: number; day?: number }): number | null {
  if (!d || !d.year) return null;
  return d.year * 10000 + (d.month || 6) * 100 + (d.day || 15);
}

function groupFor(relationType: string): WatchOrderGroup {
  switch (relationType) {
    case "PREQUEL":
      return "prequel";
    case "SEQUEL":
      return "sequel";
    case "SIDE_STORY":
      return "side";
    case "SPIN_OFF":
      return "spinoff";
    case "ALTERNATIVE":
      return "alternative";
    case "PARENT":
    case "CONTAINS":
      return "prequel";
    case "COMPILATION":
    case "SUMMARY":
      return "side";
    default:
      return "other";
  }
}

function isSeriesLike(e: WatchOrderEntry): boolean {
  if (!e.format) return true;
  return e.format === "TV" || e.format === "TV_SHORT";
}

function addPlacementNotes(entries: WatchOrderEntry[]) {
  const series = entries.filter(isSeriesLike);
  for (const entry of entries) {
    if (isSeriesLike(entry)) continue;
    const key = toDateKey(entry.startDate);
    if (key === null) {
      entry.note = "Release date unknown — order may vary";
      continue;
    }
    const prev = series
      .filter((s) => (toDateKey(s.startDate) ?? Infinity) <= key)
      .sort((a, b) => (toDateKey(b.startDate) ?? 0) - (toDateKey(a.startDate) ?? 0))[0];
    const next = series
      .filter((s) => (toDateKey(s.startDate) ?? Infinity) > key)
      .sort((a, b) => (toDateKey(a.startDate) ?? Infinity) - (toDateKey(b.startDate) ?? Infinity))[0];
    if (prev && next) entry.note = `Watch after ${prev.title} · before ${next.title}`;
    else if (prev) entry.note = `Watch after ${prev.title}`;
    else if (next) entry.note = `Watch before ${next.title}`;
    else entry.note = "Standalone — watch anytime";
  }
}

export function buildWatchOrder(anime: MediaAnimeFull, relations: RelationEdge[]): WatchOrderGuide {
  const mainEntry: WatchOrderEntry = {
    id: anime.id,
    title: bestTitle(anime.title),
    format: anime.format || undefined,
    episodes: anime.episodes || undefined,
    relationType: "MAIN",
    group: "main",
    coverImage: anime.coverImage?.large || undefined,
    status: anime.status || undefined,
    score: anime.averageScore ?? undefined,
    startDate: anime.startDate || undefined,
  };

  const entries: WatchOrderEntry[] = [mainEntry];
  const seen = new Set<number>([anime.id]);

  for (const edge of relations) {
    const node = edge.node;
    if (!node || node.type !== "ANIME") continue;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    entries.push({
      id: node.id,
      title: bestTitle(node.title),
      format: node.format || undefined,
      episodes: node.episodes || undefined,
      relationType: edge.relationType,
      group: groupFor(edge.relationType),
      coverImage: node.coverImage?.large || undefined,
      status: node.status || undefined,
      score: node.averageScore ?? undefined,
      startDate: node.startDate || undefined,
    });
  }

  entries.sort((a, b) => {
    const ka = toDateKey(a.startDate);
    const kb = toDateKey(b.startDate);
    if (ka !== null && kb !== null && ka !== kb) return ka - kb;
    if (ka === null && kb !== null) return 1;
    if (ka !== null && kb === null) return -1;
    const pa = GROUP_PRIORITY[a.group];
    const pb = GROUP_PRIORITY[b.group];
    if (pa !== pb) return pa - pb;
    return a.id - b.id;
  });

  addPlacementNotes(entries);

  const sections: WatchOrderSection[] = GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    color: GROUP_COLORS[group],
    entries: entries.filter((e) => e.group === group),
  })).filter((s) => s.entries.length > 0);

  const movieCount = entries.filter(
    (e) => e.format === "MOVIE" || e.format === "OVA" || e.format === "SPECIAL",
  ).length;

  return {
    mainId: anime.id,
    totalEntries: entries.length,
    movieCount,
    releaseOrder: entries,
    sections,
  };
}
