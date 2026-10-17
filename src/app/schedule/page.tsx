import type { Metadata } from "next";
import { bestTitle, getAiringSchedule, type AiringScheduleEntry } from "@/lib/anilist";
import { DAY_MS, startOfWeekIST } from "@/lib/ist";
import ScheduleBoard from "./ScheduleBoard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
const SITE_NAME = "ZyniVerse";

export const metadata: Metadata = {
  title: "Anime Schedule in IST — Weekly Broadcast Board",
  description:
    "This week's anime broadcast schedule in IST: episode times, live ON AIR status and what's airing next — pulled live from AniList with no filler.",
  keywords: [
    "anime schedule", "anime airing schedule", "anime broadcast times ist", "this week anime schedule",
    "anime release time ist", "next episode time", "anime calendar ist", "anime airing today ist",
    "new anime episodes this week", "anime tv schedule india",
  ],
  alternates: { canonical: `${BASE_URL}/schedule` },
  robots: { index: true, follow: true },
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Anime Schedule in IST — Weekly Broadcast Board",
    description: "This week's anime broadcast schedule in IST with live ON AIR status — pulled live from AniList.",
    url: `${BASE_URL}/schedule`,
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Anime Schedule in IST — What's On This Week",
    description: "Episode times, live ON AIR status and what's airing next — in IST.",
  },
};

// ISR (5 min) instead of per-request rendering: the CDN edge serves a cached
// HTML snapshot in ~50-100ms with zero serverless cold start, and revalidates
// in the background. All time-sensitive parts — ON AIR rows, countdowns, IST
// week roll-over — are client-driven in the board, which re-anchors to the new
// week within 30s of a Sunday boundary, so a ≤5min-stale snapshot is invisible.
// `loading.tsx` streams the skeleton while the first render generates.
export const revalidate = 300;

/** Schedule-specific structured data so the board can win rich results. */
function buildScheduleJsonLd(schedule: AiringScheduleEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "This week's anime airing schedule (IST)",
    url: `${BASE_URL}/schedule`,
    numberOfItems: schedule.length,
    itemListElement: schedule.slice(0, 50).map((item, i) => {
      const title = bestTitle(item.media.title);
      const mediaUrl = `${BASE_URL}/anime/${item.media.id}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "TVEpisode",
          name: `${title} — Episode ${item.episode}`,
          episodeNumber: item.episode,
          datePublished: new Date(item.airingAt * 1000).toISOString(),
          url: mediaUrl,
          partOfSeries: { "@type": "TVSeries", name: title, url: mediaUrl },
        },
      };
    }),
  };
}

export default async function SchedulePage() {
  const weekStartMs = startOfWeekIST(0);
  const fromSec = Math.floor(weekStartMs / 1000);
  const toSec = Math.floor((weekStartMs + 7 * DAY_MS) / 1000);

  let schedule: AiringScheduleEntry[] = [];
  let error: string | null = null;
  try {
    schedule = await getAiringSchedule(fromSec, toSec);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load the schedule.";
  }

  // The initial week rides in the SSR payload, so the client draws the full
  // board on first paint without a round-trip (the board self-heals: it retries
  // once if `error` is set, and fetches neighbouring weeks on navigation).
  return (
    <>
      {schedule.length > 0 && (
        <script
          type="application/ld+json"
          // JSON-LD is data, not user HTML; stringify is safe here.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildScheduleJsonLd(schedule)) }}
        />
      )}
      <ScheduleBoard
        initialSchedule={schedule}
        initialWeekStartMs={weekStartMs}
        initialError={error}
      />
    </>
  );
}
