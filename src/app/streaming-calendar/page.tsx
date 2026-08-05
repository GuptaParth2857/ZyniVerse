import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import StreamingCalendarGrid from "./StreamingCalendarGrid";
import { fetchStreamingCalendarWeek, type StreamingCalendarEntry } from "@/lib/anilist-schedule";

export const metadata: Metadata = {
  title: "Streaming Calendar - Where to Watch Anime This Week | ZyniVerse",
  description: "See what's new on Crunchyroll, Netflix, JioHotstar, Amazon Prime Video, Muse Asia and more in India. Weekly anime streaming schedule.",
};

// Re-render at most once an hour so the schedule always reflects the current week.
export const revalidate = 3600;

const FALLBACK_SCHEDULE: StreamingCalendarEntry[] = [
  { id: 21, title: "One Piece", episode: 1158, platform: "Crunchyroll", date: "Sunday", time: "11:15 PM IST" },
  { id: 200637, title: "The 100 Girlfriends Who Really, Really, Really, Really, REALLY Love You S3", episode: 6, platform: "Crunchyroll", date: "Sunday", time: "7:00 PM IST" },
  { id: 188139, title: "Though I Am an Inept Villainess", episode: 5, platform: "Crunchyroll", date: "Sunday", time: "8:15 PM IST" },
  { id: 198409, title: "The World's Strongest Rearguard", episode: 6, platform: "Muse Asia", date: "Sunday", time: "6:30 PM IST" },
  { id: 199111, title: "Grand Blue Dreaming Season 3", episode: 5, platform: "Crunchyroll", date: "Monday", time: "8:30 PM IST" },
  { id: 202269, title: "Love Unseen Beneath the Clear Night Sky", episode: 5, platform: "Muse Asia", date: "Monday", time: "5:30 PM IST" },
  { id: 199408, title: "A Livid Lady's Guide to Getting Even", episode: 5, platform: "Muse Asia", date: "Monday", time: "7:00 PM IST" },
  { id: 177699, title: "THE GHOST IN THE SHELL", episode: 5, platform: "Netflix", date: "Tuesday", time: "7:30 PM IST" },
  { id: 187260, title: "I Want to Love You Till Your Dying Day", episode: 5, platform: "Muse Asia", date: "Tuesday", time: "6:00 PM IST" },
  { id: 128757, title: "Young Ladies Don't Play Fighting Games", episode: 5, platform: "Crunchyroll", date: "Tuesday", time: "5:00 PM IST" },
  { id: 198709, title: "Victoria of Many Faces", episode: 5, platform: "Muse Asia", date: "Tuesday", time: "8:30 PM IST" },
  { id: 189046, title: "Re:ZERO -Starting Life in Another World- Season 4", episode: 11, platform: "Crunchyroll", date: "Wednesday", time: "9:30 PM IST" },
  { id: 135865, title: "Saga of Tanya the Evil II", episode: 5, platform: "Crunchyroll", date: "Wednesday", time: "6:00 PM IST" },
  { id: 159309, title: "Trapped in a Dating Sim S2", episode: 5, platform: "Crunchyroll", date: "Wednesday", time: "8:00 PM IST" },
  { id: 198946, title: "Clevatess II", episode: 5, platform: "Crunchyroll", date: "Wednesday", time: "5:30 PM IST" },
  { id: 197715, title: "The Villager of Level 999", episode: 6, platform: "Crunchyroll", date: "Wednesday", time: "8:30 PM IST" },
  { id: 180136, title: "The Exiled Heavy Knight Knows How to Game the System", episode: 5, platform: "Muse Asia", date: "Thursday", time: "8:56 PM IST" },
  { id: 204466, title: "KAIJU GIRL CARAMELISE", episode: 5, platform: "Crunchyroll", date: "Thursday", time: "9:58 PM IST" },
  { id: 201667, title: "Bungo Stray Dogs WAN! 2", episode: 5, platform: "Crunchyroll", date: "Thursday", time: "6:10 PM IST" },
  { id: 182205, title: "That Time I Got Reincarnated as a Slime S4", episode: 16, platform: "Crunchyroll", date: "Friday", time: "8:00 PM IST" },
  { id: 209983, title: "HELL MODE: The Hardcore Gamer Dominates in Another World with Garbage Balancing 2nd Season", episode: 5, platform: "Crunchyroll", date: "Friday", time: "9:30 PM IST" },
  { id: 188525, title: "Draw This, Then Die!", episode: 6, platform: "Crunchyroll", date: "Friday", time: "8:05 PM IST" },
  { id: 199748, title: "I Became a Legend After My 10 Year-Long Last Stand", episode: 5, platform: "Muse Asia", date: "Friday", time: "7:00 PM IST" },
  { id: 178789, title: "Mushoku Tensei: Jobless Reincarnation Season 3", episode: 6, platform: "Crunchyroll", date: "Saturday", time: "4:30 PM IST" },
  { id: 185874, title: "BLEACH: Thousand-Year Blood War - The Calamity", episode: 3, platform: "Crunchyroll", date: "Saturday", time: "7:30 PM IST" },
  { id: 185542, title: "Skeleton Knight in Another World Season 2", episode: 6, platform: "Muse Asia", date: "Saturday", time: "5:00 PM IST" },
  { id: 187538, title: "Black Torch", episode: 6, platform: "Crunchyroll", date: "Saturday", time: "6:30 PM IST" },
  { id: 190569, title: "Jaadugar: A Witch in Mongolia", episode: 6, platform: "Muse Asia", date: "Saturday", time: "7:30 PM IST" },
];

export default async function StreamingCalendarPage() {
  let entries: StreamingCalendarEntry[] = FALLBACK_SCHEDULE;
  try {
    const live = await fetchStreamingCalendarWeek();
    if (live.length > 0) entries = live;
  } catch {
    // AniList unreachable — fall back to the curated list above.
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Where to Watch</p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Streaming Calendar</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          New episodes this week on major Indian streaming platforms.
        </p>
        <StreamingCalendarGrid entries={entries} />
      </div>
    </PageTransition>
  );
}
