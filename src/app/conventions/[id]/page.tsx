import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConventionById } from "@/lib/conventions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = getConventionById(id);
  if (!c) return { title: "Convention Not Found" };
  return {
    title: `${c.name} — Anime Conventions | ZyniVerse`,
    description: `${c.name} at ${c.venue}, ${c.city}. ${c.startDate} — ${c.endDate}. ${c.description.slice(0, 160)}`,
    openGraph: {
      title: `${c.name} — ${c.city}`,
      description: c.description.slice(0, 160),
    },
  };
}

export default async function ConventionDetailPage({ params }: Props) {
  const { id } = await params;
  const c = getConventionById(id);
  if (!c) notFound();

  const start = new Date(c.startDate);
  const end = new Date(c.endDate);

  const dateStr = `${start.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} — ${end.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`;

  const googleMapsQuery = encodeURIComponent(`${c.venue}, ${c.city}, ${c.state}`);
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(c.name)}&dates=${c.startDate.replace(/-/g, "")}/${c.endDate.replace(/-/g, "")}&details=${encodeURIComponent(c.description)}&location=${encodeURIComponent(c.venue)}`;

  const STATUS_COLORS: Record<string, string> = {
    upcoming: "text-green-400 border-green-500/50 bg-green-500/10",
    ongoing: "text-blue-400 border-blue-500/50 bg-blue-500/10 animate-pulse",
    past: "text-gray-400 border-gray-500/30 bg-gray-500/10",
    cancelled: "text-red-400 border-red-500/50 bg-red-500/10",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/conventions" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors mb-6">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to Conventions
      </Link>

      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-300">
        <span><strong>Community-sourced.</strong> Details are illustrative — verify with the official event website before attending.</span>
      </div>

      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="font-display text-2xl font-bold">{c.name}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[c.status] || STATUS_COLORS.upcoming}`}>{c.status}</span>
            </div>
            <p className="text-sm text-[var(--color-mute)]">{c.venue}</p>
            <p className="text-sm text-[var(--color-mute)]">{c.city}, {c.state}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={googleCalUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors">
              Add to Calendar
            </a>
            {c.ticketUrl && (
              <a href={c.ticketUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-lg bg-[var(--color-cyan)] px-4 py-1.5 text-xs font-semibold text-black hover:opacity-80 transition-opacity">
                Get Tickets
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <DetailRow label="Dates" value={dateStr} />
            <DetailRow label="Venue" value={c.venue} />
            <DetailRow label="City" value={c.city} />
            <DetailRow label="State" value={c.state} />
          </div>
          <div className="space-y-3">
            <a href={`https://maps.google.com/?q=${googleMapsQuery}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--color-cyan)] hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              View on Google Maps
            </a>
            <a href={c.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--color-cyan)] hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              Official Website
            </a>
            {c.estimatedAttendance && (
              <DetailRow label="Expected Attendance" value={`${c.estimatedAttendance.toLocaleString("en-IN")}+`} />
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-display font-bold text-sm mb-2">About</h3>
          <p className="text-sm text-[var(--color-mute)] leading-relaxed">{c.description}</p>
        </div>

        {c.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {c.tags.map((t) => (
              <span key={t} className="text-[10px] text-[var(--color-mute)]/60 bg-[var(--color-void)]/50 px-2 py-1 rounded-full border border-[var(--color-line)]/50">{t}</span>
            ))}
          </div>
        )}

        {c.guests && c.guests.length > 0 && (
          <div>
            <h3 className="font-display font-bold text-sm mb-3">Guests</h3>
            <div className="space-y-2">
              {c.guests.map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-magenta)]" />
                  <span className="font-medium">{g.name}</span>
                  <span className="text-[var(--color-mute)]">— {g.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-mono text-[var(--color-mute)]/60 min-w-28">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
