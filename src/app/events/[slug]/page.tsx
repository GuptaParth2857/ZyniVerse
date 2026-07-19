import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAnimeEventBySlug,
  getUpcomingEvents,
} from "@/lib/anime-events";
import EventAnnouncementCard from "@/components/EventAnnouncementCard";
import EventTimeline from "@/components/EventTimeline";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getAnimeEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.name} — Anime Events | ZyniVerse`,
    description: `${event.name} at ${event.location}. ${event.startDate} — ${event.endDate}. ${event.description.slice(0, 160)}`,
    openGraph: {
      title: `${event.name} — Anime Events`,
      description: event.description.slice(0, 160),
    },
  };
}

export default async function AnimeEventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getAnimeEventBySlug(slug);
  if (!event) notFound();

  const upcoming = getUpcomingEvents().filter((e) => e.id !== event.id).slice(0, 4);

  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const dateStr = `${start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} — ${end.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`;

  const daysUntil = Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isPast = event.status === "past";
  const countdownText = isPast
    ? "Ended"
    : daysUntil === 0
      ? "Happening Today!"
      : daysUntil === 1
        ? "Tomorrow"
        : daysUntil > 0
          ? `In ${daysUntil} days`
          : "Ongoing";

  const STATUS_COLORS: Record<string, string> = {
    upcoming: "text-green-400 border-green-500/50 bg-green-500/10",
    ongoing: "text-blue-400 border-blue-500/50 bg-blue-500/10 animate-pulse",
    past: "text-gray-400 border-gray-500/30 bg-gray-500/10",
  };

  const TYPE_CONFIG: Record<string, { icon: string; color: string; gradient: string }> = {
    expo: { icon: "🎯", color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10", gradient: "from-cyan-500/15" },
    convention: { icon: "🎪", color: "text-purple-400 border-purple-500/40 bg-purple-500/10", gradient: "from-purple-500/15" },
    stream: { icon: "📺", color: "text-blue-400 border-blue-500/40 bg-blue-500/10", gradient: "from-blue-500/15" },
    festival: { icon: "🎆", color: "text-pink-400 border-pink-500/40 bg-pink-500/10", gradient: "from-pink-500/15" },
    premiere: { icon: "🎬", color: "text-amber-400 border-amber-500/40 bg-amber-500/10", gradient: "from-amber-500/15" },
  };

  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.convention;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative overflow-hidden border-b border-[var(--color-line)]`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} via-transparent to-transparent`} />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors mb-6"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>

          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-2xl">{config.icon}</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${config.color}`}>
                  {event.type}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[event.status]}`}>
                  {event.status}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
                {event.name}
              </h1>
              <p className="text-sm text-[var(--color-mute)]/80">{event.location}</p>
              <p className="text-xs font-mono text-[var(--color-cyan)]/70 mt-1">{dateStr}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!isPast && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  event.status === "ongoing"
                    ? "text-blue-400 bg-blue-500/10"
                    : daysUntil <= 14
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-green-400 bg-green-500/10"
                }`}>
                  {countdownText}
                </span>
              )}
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[var(--color-cyan)] px-5 py-2.5 text-xs font-semibold text-black hover:opacity-80 transition-opacity"
              >
                Official Website ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <InfoCard label="Dates" value={dateStr} />
          <InfoCard label="Location" value={`${event.location}, ${event.country}`} />
          <InfoCard
            label="Expected Attendance"
            value={event.attendance ? `${event.attendance.toLocaleString("en-US")}+` : "TBA"}
          />
        </div>

        {/* About */}
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/30 p-5 sm:p-6 mb-8">
          <h3 className="font-display font-bold text-sm mb-3 text-[var(--color-mute)]">About This Event</h3>
          <p className="text-sm text-[var(--color-mute)]/90 leading-relaxed">{event.description}</p>
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {event.tags.map((t) => (
                <span key={t} className="text-[10px] text-[var(--color-mute)]/50 bg-[var(--color-void)]/50 px-2.5 py-1 rounded-full border border-[var(--color-line)]/50">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Announcements */}
        {event.announcements.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📢</span>
              <h2 className="font-display text-xl font-bold">
                Announcements & Reveals
              </h2>
            </div>
            <p className="text-sm text-[var(--color-mute)] mb-5">
              {event.announcements.length} announcement{event.announcements.length > 1 ? "s" : ""} from{" "}
              {event.name}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.announcements.map((ann) => (
                <EventAnnouncementCard key={ann.id} announcement={ann} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events Timeline */}
        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📅</span>
              <h2 className="font-display text-xl font-bold">Upcoming Events</h2>
            </div>
            <EventTimeline events={upcoming} />
          </section>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/30 p-4">
      <p className="text-[10px] font-mono text-[var(--color-mute)]/50 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium leading-snug">{value}</p>
    </div>
  );
}
