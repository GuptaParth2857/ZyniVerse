import type { Metadata } from "next";
import {
  getAnimeEvents,
  getEventTypes,
  getCountries,
  getAnimeEventsMeta,
  getAllAnnouncements,
  getUpcomingEvents,
} from "@/lib/anime-events";
import EventFilters from "@/components/EventFilters";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import EventHero from "@/components/EventHero";
import FeaturedEventCard from "@/components/FeaturedEventCard";

export const metadata: Metadata = {
  title: "Anime Events & Announcements — Conventions, Expo, Premieres | ZyniVerse",
  description:
    "Track anime events worldwide — Anime Expo, AnimeJapan, Jump Festa, Comic Market, Anime NYC and more. See all announcements, trailers, reveals, and key visuals from major anime events.",
  openGraph: {
    title: "Anime Events & Announcements | ZyniVerse",
    description:
      "Track anime events worldwide and see all announcements, trailers, and reveals.",
  },
};

export default async function AnimeEventsPage() {
  let events: Awaited<ReturnType<typeof getAnimeEvents>> = [];
  let types: Awaited<ReturnType<typeof getEventTypes>> = [];
  let countries: Awaited<ReturnType<typeof getCountries>> = [];
  let meta: Awaited<ReturnType<typeof getAnimeEventsMeta>> = { totalEvents: 0, disclaimer: "Anime event data is curated from public sources. Dates, announcements, and details may change — verify with official event websites.", lastUpdated: "N/A", source: "curated" };
  let announcements: Awaited<ReturnType<typeof getAllAnnouncements>> = [];
  let upcoming: Awaited<ReturnType<typeof getUpcomingEvents>> = [];

  try {
    [events, types, countries, meta, announcements, upcoming] = await Promise.all([
      getAnimeEvents(),
      getEventTypes(),
      getCountries(),
      getAnimeEventsMeta(),
      getAllAnnouncements(),
      getUpcomingEvents(),
    ]);
  } catch {
    // Fallback to empty arrays — page renders with zero data
  }

  const totalAnnouncements = announcements.length;
  const totalCountries = countries.length;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <EventHero
        eventsCount={events.length}
        announcementsCount={totalAnnouncements}
        countriesCount={totalCountries}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Disclaimer */}
        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <span>
            <strong>Curated data.</strong> Event dates and announcements sourced from public
            information. Verify with official event websites before attending.
            <span className="text-amber-400/60"> Last updated: {meta.lastUpdated}.</span>{" "}
            Event status (upcoming / ongoing / past) updates automatically from dates.
          </span>
        </div>

        {/* Featured Upcoming Event */}
        {upcoming.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <h2 className="font-display text-lg font-bold">Next Up</h2>
            </div>
            <FeaturedEventCard event={upcoming[0]} />
          </section>
        )}

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📢</span>
              <h2 className="font-display text-xl font-bold">All Announcements</h2>
            </div>
            <p className="text-sm text-[var(--color-mute)] mb-5">
              Trailers, reveals, and announcements from every tracked event
            </p>
            <AnnouncementsSection events={events} />
          </section>
        )}

        {/* Divider */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-line)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--color-void)] px-4 text-xs font-mono text-[var(--color-mute)]/40 uppercase tracking-wider">All Events</span>
          </div>
        </div>

        {/* Events Listing */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌐</span>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
              <h2 className="font-display text-xl font-bold">Browse Events</h2>
            </div>
          </div>
          <p className="text-sm text-[var(--color-mute)] mb-5">
            Upcoming and past anime events across the globe
          </p>
          <EventFilters events={events} types={types} countries={countries} />
        </section>
      </div>
    </div>
  );
}
