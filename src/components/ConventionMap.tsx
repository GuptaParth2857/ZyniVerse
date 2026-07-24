"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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

function NeonBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[16px] ${className}`}>
      <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
            animation: "spin 6s linear infinite",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function ConventionMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [allConvs, setAllConvs] = useState<Convention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch("/api/conventions?status=all");
        const data = await res.json();
        setAllConvs(data.conventions || []);
      } catch {
        setAllConvs([]);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const states = [...new Set(allConvs.map((c) => c.state))].sort();

  const groupedByState = (() => {
    const map = new Map<string, { state: string; cities: Map<string, Convention[]> }>();
    for (const c of allConvs) {
      if (!map.has(c.state)) map.set(c.state, { state: c.state, cities: new Map() });
      const entry = map.get(c.state)!;
      if (!entry.cities.has(c.city)) entry.cities.set(c.city, []);
      entry.cities.get(c.city)!.push(c);
    }
    return Array.from(map.values()).sort((a, b) => a.state.localeCompare(b.state));
  })();

  const filtered = selectedState
    ? groupedByState.filter((g) => g.state === selectedState)
    : groupedByState;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ffe0] border-t-transparent" />
        <p className="mt-3 text-sm text-white/30">Loading locations...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setSelectedState(null)}
          className={`rounded-lg border px-5 py-2.5 text-xs font-medium transition-colors ${!selectedState ? "border-[#00ffe0] text-[#00ffe0]" : "border-[rgba(0,255,224,0.1)] text-white/40 hover:border-[#00ffe0]/40"}`}>
          All States
        </button>
        {states.map((s) => (
          <button key={s} onClick={() => setSelectedState(s)}
            className={`rounded-lg border px-5 py-2.5 text-xs font-medium transition-colors ${selectedState === s ? "border-[#00ffe0] text-[#00ffe0]" : "border-[rgba(0,255,224,0.1)] text-white/40 hover:border-[#00ffe0]/40"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map(({ state, cities }, idx) => {
          const cityEntries = Array.from(cities.entries()).sort();
          const totalConvs = cityEntries.reduce((sum, [, cs]) => sum + cs.length, 0);
          return (
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <NeonBorder>
                <div className="rounded-[16px] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00ffe0]">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <h3 className="font-display font-bold text-lg text-white">{state}</h3>
                    <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-[rgba(0,255,224,0.1)]">{totalConvs} event{totalConvs !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cityEntries.map(([city, convs]) => (
                      <div key={city} className="rounded-xl border border-[rgba(0,255,224,0.06)] bg-white/[0.02] p-3 hover:border-[rgba(0,255,224,0.2)] transition-all hover:bg-[rgba(0,255,224,0.02)]">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-white/80">{city}</h4>
                          <span className="text-[10px] font-mono text-white/20 bg-white/5 px-1.5 py-0.5 rounded-full">{convs.length}</span>
                        </div>
                        <div className="space-y-1">
                          {convs.map((c) => (
                            <Link key={c.id} href={`/conventions/${c.id}`}
                              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#00ffe0] transition-colors">
                              <span className={`h-1.5 w-1.5 rounded-full ${c.status === "upcoming" ? "bg-green-400" : c.status === "ongoing" ? "bg-blue-400" : "bg-gray-400"}`} />
                              <span className="truncate">{c.shortName || c.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </NeonBorder>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
