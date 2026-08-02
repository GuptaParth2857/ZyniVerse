import type { AnimeEvent } from "@/lib/anime-events";
import Image from "next/image";

const TYPE_ICONS: Record<string, string> = {
  expo: "🎯",
  convention: "🎪",
  stream: "📺",
  festival: "🎆",
  premiere: "🎬",
};

export default function EventTimeline({ events }: { events: AnimeEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-mute)]/60">
        <p className="text-sm">No events to display in timeline.</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-cyan)]/30 via-[var(--color-magenta)]/20 to-transparent" />

      <div className="space-y-4">
        {sorted.map((event) => {
          const start = new Date(event.startDate);
          const isPast = event.status === "past";
          const isOngoing = event.status === "ongoing";
          const poster = event.announcements.find((a) => a.posterUrl)?.posterUrl || event.image;

          return (
            <div key={event.id} className="relative pl-10">
              <div
                className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 z-10 ${
                  isPast
                    ? "bg-gray-500 border-gray-400"
                    : isOngoing
                      ? "bg-blue-500 border-blue-400 animate-pulse"
                      : "bg-[var(--color-cyan)] border-[var(--color-cyan)] shadow-[0_0_8px_-2px_rgba(0,255,224,0.5)]"
                }`}
              />

              <a href={`/events/${event.slug}`} className="block">
                <div className="text-[10px] font-mono text-[var(--color-mute)]/60 mb-1.5">
                  {start.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <div className="neon-premium rounded-xl group/timeline overflow-hidden">
                  <div className="neon-premium-track" />
                  <div className="neon-premium-overlay" />
                  <div className="neon-premium-content rounded-xl overflow-hidden flex">
                    {/* Poster thumbnail */}
                    {poster && (
                      <div className="w-16 h-16 shrink-0 overflow-hidden hidden sm:block">
                        <Image
                          src={poster}
                          alt=""
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{TYPE_ICONS[event.type]}</span>
                        <span className="font-display text-sm font-bold group-hover/timeline:text-[var(--color-cyan)] transition-colors">
                          {event.name}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-mute)]/70">
                        {event.location}
                      </p>
                      {event.announcements.length > 0 && (
                        <p className="text-[10px] text-[var(--color-magenta)] mt-1">
                          {event.announcements.length} announcement{event.announcements.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
