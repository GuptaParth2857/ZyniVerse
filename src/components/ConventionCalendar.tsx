"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getConventions, getCities } from "@/lib/conventions";
import type { Convention } from "@/lib/conventions";

const STATUS_STYLES: Record<string, string> = {
  upcoming: "border-green-500/50 text-green-400 bg-green-500/10",
  ongoing: "border-blue-500/50 text-blue-400 bg-blue-500/10 animate-pulse",
  past: "border-gray-500/30 text-gray-400 bg-gray-500/10",
  cancelled: "border-red-500/50 text-red-400 bg-red-500/10",
};

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function googleCalUrl(c: Convention): string {
  const start = c.startDate.replace(/-/g, "");
  const end = c.endDate.replace(/-/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: c.name,
    dates: `${start}/${end}`,
    details: c.description,
    location: c.venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function ConventionCalendar() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("upcoming");
  const [monthFilter, setMonthFilter] = useState("");

  const cities = useMemo(() => getCities(), []);

  const conventions = useMemo(
    () =>
      getConventions({
        city: cityFilter || undefined,
        status: (statusFilter as "upcoming" | "past" | "ongoing" | "all") || undefined,
        month: monthFilter ? Number(monthFilter) : undefined,
      }),
    [cityFilter, statusFilter, monthFilter]
  );

  const ongoing = useMemo(() => conventions.filter((c) => c.status === "ongoing"), [conventions]);
  const upcoming = useMemo(() => conventions.filter((c) => c.status === "upcoming"), [conventions]);
  const past = useMemo(() => conventions.filter((c) => c.status === "past"), [conventions]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-[var(--color-line)] overflow-hidden">
          <button onClick={() => setView("list")} className={`px-5 py-2.5 text-xs font-medium transition-colors ${view === "list" ? "bg-[var(--color-cyan)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>List</button>
          <button onClick={() => setView("calendar")} className={`px-5 py-2.5 text-xs font-medium transition-colors ${view === "calendar" ? "bg-[var(--color-cyan)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>Calendar</button>
        </div>

        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors">
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex rounded-lg border border-[var(--color-line)] overflow-hidden">
          {["all", "upcoming", "ongoing", "past"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-[var(--color-magenta)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}>{s}</button>
          ))}
        </div>

        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors">
          <option value="">All Months</option>
          {MONTHS.filter(Boolean).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {view === "list" ? (
        <div className="space-y-4">
          {conventions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]/30 mb-3">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-sm text-[var(--color-mute)]/50">No conventions found</p>
            </div>
          )}
          {conventions.map((c) => (
            <ConventionCard key={c.id} convention={c} />
          ))}
        </div>
      ) : (
        <CalendarView conventions={conventions} />
      )}
    </div>
  );
}

function ConventionCard({ convention: c }: { convention: Convention }) {
  const dateStr = `${new Date(c.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${new Date(c.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 backdrop-blur-sm p-5 hover:border-[var(--color-cyan)]/40 transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/conventions/${c.id}`} className="hover:text-[var(--color-cyan)] transition-colors">
              <h3 className="font-display font-bold text-lg">{c.name}</h3>
            </Link>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[c.status] || STATUS_STYLES.upcoming}`}>{c.status}</span>
          </div>
          <p className="text-sm text-[var(--color-mute)] mt-1">{c.venue}, {c.city}, {c.state}</p>
          <p className="text-xs text-[var(--color-mute)]/60 mt-0.5">{dateStr}</p>
          {c.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {c.tags.map((t) => (
                <span key={t} className="text-[9px] text-[var(--color-mute)]/60 bg-[var(--color-void)]/50 px-1.5 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={googleCalUrl(c)} target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors">
            + Calendar
          </a>
          {c.ticketUrl && (
            <a href={c.ticketUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-lg bg-[var(--color-cyan)] px-5 py-2.5 text-xs font-semibold text-black hover:opacity-80 transition-opacity">
              Get Tickets
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ conventions }: { conventions: Convention[] }) {
  const months = useMemo(() => {
    const map = new Map<string, Convention[]>();
    for (const c of conventions) {
      const d = new Date(c.startDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries()).sort();
  }, [conventions]);

  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-[var(--color-mute)]/50">No conventions in this view</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {months.map(([key, cons]) => {
        const [year, month] = key.split("-");
        const monthName = MONTHS[Number(month)];
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

        const activeDays = new Set<number>();
        for (const c of cons) {
          const start = new Date(c.startDate).getDate();
          const end = new Date(c.endDate).getDate();
          for (let d = start; d <= end; d++) activeDays.add(d);
        }

        return (
          <div key={key} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-4">
            <h3 className="font-display font-bold text-base mb-3">{monthName} {year} <span className="text-xs text-[var(--color-mute)] font-normal">({cons.length} event{cons.length !== 1 ? "s" : ""})</span></h3>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-[10px] text-[var(--color-mute)]/50 font-mono py-1">{d}</div>
              ))}
              {Array.from({ length: new Date(Number(year), Number(month) - 1, 1).getDay() }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isActive = activeDays.has(day);
                return (
                  <div key={day}
                    className={`rounded-lg py-1.5 text-xs font-mono transition-colors ${isActive ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] font-bold" : "text-[var(--color-mute)]/40"}`}>
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 space-y-1">
              {cons.map((c) => (
                <Link key={c.id} href={`/conventions/${c.id}`}
                  className="flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shrink-0" />
                  <span className="font-medium">{c.name}</span>
                  <span className="text-[var(--color-mute)]/50">· {c.city}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
