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

export const metadata: Metadata = {
  title: "Anime Events & Announcements — Conventions, Expo, Premieres | ZyniVerse",
  description:
    "Track anime events worldwide — Anime Expo, Jump Festa, Crunchyroll Expo, SDCC and more. See all announcements, trailers, reveals, and key visuals from major anime events.",
  openGraph: {
    title: "Anime Events & Announcements | ZyniVerse",
    description:
      "Track anime events worldwide and see all announcements, trailers, and reveals.",
  },
};

export default function AnimeEventsPage() {
  const events = getAnimeEvents();
  const types = getEventTypes();
  const countries = getCountries();
  const meta = getAnimeEventsMeta();
  const announcements = getAllAnnouncements();
  const upcoming = getUpcomingEvents();

  const totalAnnouncements = announcements.length;
  const totalCountries = countries.length;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan)]/8 via-[var(--color-magenta)]/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-cyan)_0%,_transparent_50%)] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                  Live Tracking
                </span>
              </div>
              <h1 className="font-display text-4xl font-black sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                Anime{" "}
                <span className="bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">
                  Events Hub
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[var(--color-mute)] max-w-xl leading-relaxed">
                Track every major anime event worldwide. Conventions, expos, festivals — with
                all announcements, trailers, reveals, and key visuals in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 sm:gap-6">
              <StatCard value={events.length} label="Events" color="cyan" />
              <StatCard value={totalAnnouncements} label="Announcements" color="magenta" />
              <StatCard value={totalCountries} label="Countries" color="cyan" />
            </div>
          </div>
        </div>
      </section>

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
            Last updated: {meta.lastUpdated}
          </span>
        </div>

        {/* Featured Upcoming Event */}
        {upcoming.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <h2 className="font-display text-lg font-bold">Next Up</h2>
            </div>
            <a href={`/events/${upcoming[0].slug}`}>
              <div className="group relative rounded-2xl border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-panel)]/80 to-[var(--color-void)]/50 backdrop-blur-sm p-6 sm:p-8 transition-all hover:border-[var(--color-cyan)]/40 hover:shadow-xl hover:shadow-[var(--color-cyan)]/5">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-xl">🎯</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-green-400 border-green-500/40 bg-green-500/10 uppercase">Upcoming</span>
                      <span className="text-[10px] font-mono text-[var(--color-mute)]/60">
                        {new Date(upcoming[0].startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(upcoming[0].endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-black group-hover:text-[var(--color-cyan)] transition-colors mb-2">
                      {upcoming[0].name}
                    </h3>
                    <p className="text-sm text-[var(--color-mute)] mb-3">{upcoming[0].location}</p>
                    <p className="text-sm text-[var(--color-mute)]/80 line-clamp-2 max-w-2xl">
                      {upcoming[0].description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {upcoming[0].tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-[9px] text-[var(--color-mute)]/50 bg-[var(--color-void)]/50 px-2 py-0.5 rounded-full border border-[var(--color-line)]/40">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-3">
                    {upcoming[0].announcements.length > 0 && (
                      <span className="text-sm font-bold text-[var(--color-magenta)] bg-[var(--color-magenta)]/10 px-3 py-1.5 rounded-full border border-[var(--color-magenta)]/30">
                        {upcoming[0].announcements.length} announcement{upcoming[0].announcements.length > 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="text-xs text-[var(--color-cyan)] font-semibold group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            </a>
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
            <h2 className="font-display text-xl font-bold">Browse Events</h2>
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

function StatCard({ value, label, color }: { value: number; label: string; color: "cyan" | "magenta" }) {
  const colorClass = color === "cyan"
    ? "border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5"
    : "border-[var(--color-magenta)]/20 bg-[var(--color-magenta)]/5";
  const textColor = color === "cyan"
    ? "text-[var(--color-cyan)]"
    : "text-[var(--color-magenta)]";

  return (
    <div className={`rounded-xl border ${colorClass} px-5 py-3 text-center min-w-[90px]`}>
      <div className={`font-display text-2xl sm:text-3xl font-black ${textColor}`}>{value}</div>
      <div className="text-[10px] font-mono text-[var(--color-mute)]/60 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
