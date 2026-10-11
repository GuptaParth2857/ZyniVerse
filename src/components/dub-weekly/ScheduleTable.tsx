import Link from "next/link";
import { type DubChannel, type LiveDubEntry } from "@/lib/dub-weekly";

function formatIST(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}, ${time} IST`;
}

export function ScheduleTable({ entries }: { entries: LiveDubEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 text-sm text-[var(--color-mute)]">
        No live dub uploads found right now — check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((e, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{e.show}</p>
            <p className="mt-0.5 text-xs text-[var(--color-mute)]">
              {e.channel.replace(" (YouTube)", "")} · uploaded {formatIST(e.published)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-bold text-cyan-400">
              {e.language} dub
            </span>
            <a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[var(--color-magenta)] px-4 py-1.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
            >
              Watch →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChannelNav({ active }: { active: DubChannel | "all" }) {
  const links: { key: "all" | DubChannel; label: string; href: string }[] = [
    { key: "all", label: "All Channels", href: "/hindi-dub-schedule" },
    { key: "Muse India (YouTube)" as DubChannel, label: "Muse India", href: "/hindi-dub-schedule/muse-india" },
    { key: "Ani-One India (YouTube)" as DubChannel, label: "Ani-One India", href: "/hindi-dub-schedule/ani-one-india" },
    { key: "Crunchyroll" as DubChannel, label: "Crunchyroll", href: "/hindi-dub-schedule/crunchyroll" },
  ];
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {links.map((l) => (
        <Link
          key={l.key}
          href={l.href}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
            active === l.key
              ? "bg-[var(--color-cyan)] text-black"
              : "neon-rgb-border text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
