import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAnimeEventBySlug,
  getUpcomingEvents,
} from "@/lib/anime-events";
import { eventImageSrc } from "@/lib/event-images";
import EventAnnouncementCard from "@/components/EventAnnouncementCard";
import EventDetailHero from "@/components/EventDetailHero";
import EventDetailInfo from "@/components/EventDetailInfo";
import EventTimeline from "@/components/EventTimeline";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getAnimeEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  return {
    title: `${event.name} — Anime Events | ZyniVerse`,
    description: `${event.name} at ${event.location}. ${event.startDate} — ${event.endDate}. ${event.description.slice(0, 160)}`,
    openGraph: {
      title: `${event.name} — Anime Events`,
      description: event.description.slice(0, 160),
      url: `${baseUrl}/events/${slug}`,
    },
    alternates: { canonical: `${baseUrl}/events/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function AnimeEventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getAnimeEventBySlug(slug);
  if (!event) notFound();

  const allUpcoming = await getUpcomingEvents();
  const upcoming = allUpcoming.filter((e) => e.id !== event.id).slice(0, 4);

  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const dateStr = `${start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} — ${end.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`;

  // eslint-disable-next-line react-hooks/purity -- server component: Date.now is per-request dynamic
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

  const TYPE_CONFIG: Record<string, { icon: string; color: string; gradient: string }> = {
    expo: { icon: "🎯", color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10", gradient: "from-cyan-500/15" },
    convention: { icon: "🎪", color: "text-purple-400 border-purple-500/40 bg-purple-500/10", gradient: "from-purple-500/15" },
    stream: { icon: "📺", color: "text-blue-400 border-blue-500/40 bg-blue-500/10", gradient: "from-blue-500/15" },
    festival: { icon: "🎆", color: "text-pink-400 border-pink-500/40 bg-pink-500/10", gradient: "from-pink-500/15" },
    premiere: { icon: "🎬", color: "text-amber-400 border-amber-500/40 bg-amber-500/10", gradient: "from-amber-500/15" },
  };

  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.convention;
  const heroImage = eventImageSrc(event.announcements.find((a) => a.posterUrl)?.posterUrl || event.image);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        {/* Background image or gradient */}
        {heroImage ? (
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[rgba(10,10,15,0.85)] to-[rgba(10,10,15,0.6)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan)]/10 via-transparent to-[var(--color-magenta)]/10" />
          </div>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} via-transparent to-transparent`} />
        )}

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <EventDetailHero
            event={event}
            dateStr={dateStr}
            countdownText={countdownText}
            isPast={isPast}
          />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Info Grid + About */}
        <EventDetailInfo event={event} />

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {event.announcements.map((ann, i) => (
                <EventAnnouncementCard key={ann.id} announcement={ann} index={i} />
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
