"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import MiniCalendar from "./MiniCalendar";

interface Convention {
  id: string;
  name: string;
  shortName: string | null;
  city: string;
  state: string;
  venue: string;
  startDate: string;
  endDate: string;
  website: string;
  ticketUrl: string | null;
  image: string | null;
  description: string;
  estimatedAttendance: number | null;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  organizers: string[];
  tags: string[];
}

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

function NeonBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[20px] ${className}`}>
      <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
            animation: "spin 6s linear infinite",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-[1.5px] rounded-[18.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function ConventionCalendar() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("upcoming");
  const [monthFilter, setMonthFilter] = useState("");
  const [conventions, setConventions] = useState<Convention[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConventions = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (cityFilter) params.set("city", cityFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (monthFilter) params.set("month", monthFilter);
      try {
        const res = await fetch(`/api/conventions?${params.toString()}`);
        const data = await res.json();
        setConventions(data.conventions || []);
      } catch {
        setConventions([]);
      }
      setLoading(false);
    };
    fetchConventions();
  }, [cityFilter, statusFilter, monthFilter]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("/api/conventions?status=all");
        const data = await res.json();
        const uniqueCities = [...new Set((data.conventions || []).map((c: Convention) => c.city))].sort() as string[];
        setCities(uniqueCities);
      } catch {
        setCities([]);
      }
    };
    fetchCities();
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-[rgba(0,255,224,0.15)] overflow-hidden">
          <button onClick={() => setView("list")} className={`px-5 py-2.5 text-xs font-medium transition-colors ${view === "list" ? "bg-[#00ffe0] text-black" : "text-white/40 hover:text-white/70"}`}>List</button>
          <button onClick={() => setView("calendar")} className={`px-5 py-2.5 text-xs font-medium transition-colors ${view === "calendar" ? "bg-[#00ffe0] text-black" : "text-white/40 hover:text-white/70"}`}>Calendar</button>
        </div>

        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-[rgba(0,255,224,0.1)] bg-[rgba(10,10,15,0.8)] px-3 py-1.5 text-sm text-white/70 outline-none focus:border-[#00ffe0] transition-colors">
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex rounded-lg border border-[rgba(0,255,224,0.15)] overflow-hidden">
          {["all", "upcoming", "ongoing", "past"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-[#ff00e6] text-black" : "text-white/40 hover:text-white/70"}`}>{s}</button>
          ))}
        </div>

        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
          className="rounded-lg border border-[rgba(0,255,224,0.1)] bg-[rgba(10,10,15,0.8)] px-3 py-1.5 text-sm text-white/70 outline-none focus:border-[#00ffe0] transition-colors">
          <option value="">All Months</option>
          {MONTHS.filter(Boolean).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ffe0] border-t-transparent" />
          <p className="mt-3 text-sm text-white/30">Loading conventions...</p>
        </div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {conventions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/10 mb-3">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-sm text-white/30">No conventions found</p>
            </div>
          )}
          {conventions.map((c, idx) => (
            <motion.div
              key={c.id}
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <ConventionCard convention={c} />
            </motion.div>
          ))}
        </div>
      ) : (
        <CalendarView conventions={conventions} />
      )}
    </div>
  );
}

function ConventionCard({ convention: c }: { convention: Convention }) {
  const dateStr = `${new Date(c.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — ${new Date(c.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
  const [daysLeft, setDaysLeft] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      setDaysLeft(Math.max(0, Math.ceil((new Date(c.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))));
    }, 0);
    return () => clearTimeout(t);
  }, [c.startDate]);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[rgba(13,13,22,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00ffe0]/40 hover:shadow-[0_16px_50px_-18px_rgba(0,255,224,0.35)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ffe0]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff00e6]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {c.image ? (
        <div className="relative h-36 overflow-hidden sm:h-40">
          <Image
            src={c.image}
            alt={c.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,13,22,1)] via-[rgba(13,13,22,0.3)] to-transparent" />
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize backdrop-blur-sm ${STATUS_STYLES[c.status] || STATUS_STYLES.upcoming}`}>{c.status}</span>
            {c.status === "upcoming" && daysLeft > 0 && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ff00e6]/20 text-[#ff00e6] border border-[#ff00e6]/30 backdrop-blur-sm">
                {daysLeft}d left
              </span>
            )}
          </div>
          {c.estimatedAttendance && (
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-white/70 border border-white/10 backdrop-blur-sm">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {c.estimatedAttendance.toLocaleString("en-IN")}+
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-[#00ffe0]/10 via-transparent to-[#ff00e6]/10">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span className={`absolute left-2.5 top-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[c.status] || STATUS_STYLES.upcoming}`}>{c.status}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[#00ffe0]/60">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <p className="truncate text-xs text-white/40">{c.city}{c.state ? `, ${c.state}` : ""}</p>
        </div>

        <Link href={`/conventions/${c.id}`} className="mt-1.5 transition-colors group-hover:text-[#00ffe0]">
          <h3 className="font-display text-base font-bold leading-snug text-white">{c.name}</h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[#ff00e6]/60">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-[11px] text-white/30">{dateStr}</p>
        </div>

        {c.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[9px] text-[#00ffe0]/50 bg-[#00ffe0]/5 px-1.5 py-0.5 rounded-full border border-[#00ffe0]/10">{t}</span>
            ))}
            {c.tags.length > 3 && (
              <span className="text-[9px] text-white/20 px-1 py-0.5">+{c.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2">
            <MiniCalendar
              startDate={c.startDate}
              endDate={c.endDate}
              name={c.name}
              label="+ Calendar"
              buttonClassName={`${c.ticketUrl ? "flex-1" : "w-full"} flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-[11px] text-white/40 transition-all hover:border-[#00ffe0]/30 hover:text-[#00ffe0]`}
            />
            {c.ticketUrl && (
              <a href={c.ticketUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] px-2.5 py-2 text-[11px] font-bold text-center text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_-8px_rgba(0,255,224,0.4)] active:scale-[0.98]">
                Tickets
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ conventions }: { conventions: Convention[] }) {
  const months = (() => {
    const map = new Map<string, Convention[]>();
    for (const c of conventions) {
      const d = new Date(c.startDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries()).sort();
  })();

  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-white/30">No conventions in this view</p>
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
          <NeonBorder key={key}>
            <div className="rounded-[20px] p-4">
              <h3 className="font-display font-bold text-base mb-3 text-white">{monthName} {year} <span className="text-xs text-white/30 font-normal">({cons.length} event{cons.length !== 1 ? "s" : ""})</span></h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-[10px] text-white/20 font-mono py-1">{d}</div>
                ))}
                {Array.from({ length: new Date(Number(year), Number(month) - 1, 1).getDay() }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isActive = activeDays.has(day);
                  return (
                    <div key={day}
                      className={`rounded-lg py-1.5 text-xs font-mono transition-colors ${isActive ? "bg-[#00ffe0]/20 text-[#00ffe0] font-bold" : "text-white/20"}`}>
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 space-y-1">
                {cons.map((c) => (
                  <Link key={c.id} href={`/conventions/${c.id}`}
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-[#00ffe0] transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ffe0] shrink-0" />
                    <span className="font-medium">{c.name}</span>
                    <span className="text-white/20">· {c.city}</span>
                  </Link>
                ))}
              </div>
            </div>
          </NeonBorder>
        );
      })}
    </div>
  );
}
