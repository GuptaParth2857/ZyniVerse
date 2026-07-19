import type { AnimeEvent } from "@/lib/anime-events";

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
      <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-line)]" />

      <div className="space-y-6">
        {sorted.map((event) => {
          const start = new Date(event.startDate);
          const isPast = event.status === "past";
          const isOngoing = event.status === "ongoing";

          return (
            <div key={event.id} className="relative pl-10">
              <div
                className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${
                  isPast
                    ? "bg-gray-500 border-gray-400"
                    : isOngoing
                      ? "bg-blue-500 border-blue-400 animate-pulse"
                      : "bg-[var(--color-cyan)] border-[var(--color-cyan)]"
                }`}
              />

              <div className="text-[10px] font-mono text-[var(--color-mute)]/60 mb-1">
                {start.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              <div
                className={`rounded-lg border p-3 transition-all ${
                  isPast
                    ? "border-[var(--color-line)]/50 bg-[var(--color-panel)]/30 opacity-60"
                    : isOngoing
                      ? "border-blue-500/40 bg-blue-500/5"
                      : "border-[var(--color-line)] bg-[var(--color-panel)]/50 hover:border-[var(--color-cyan)]/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{TYPE_ICONS[event.type]}</span>
                  <span className="font-display text-sm font-bold">
                    {event.name}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-mute)]">
                  {event.location}
                </p>
                {event.announcements.length > 0 && (
                  <p className="text-[10px] text-[var(--color-magenta)] mt-1">
                    {event.announcements.length} announcement{event.announcements.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
