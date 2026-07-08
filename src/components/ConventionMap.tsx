"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getConventions, getStates, getCities } from "@/lib/conventions";
import type { Convention } from "@/lib/conventions";

export default function ConventionMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const states = useMemo(() => getStates(), []);
  const allConvs = useMemo(() => getConventions(), []);

  const groupedByState = useMemo(() => {
    const map = new Map<string, { state: string; cities: Map<string, Convention[]> }>();
    for (const c of allConvs) {
      if (!map.has(c.state)) map.set(c.state, { state: c.state, cities: new Map() });
      const entry = map.get(c.state)!;
      if (!entry.cities.has(c.city)) entry.cities.set(c.city, []);
      entry.cities.get(c.city)!.push(c);
    }
    return Array.from(map.values()).sort((a, b) => a.state.localeCompare(b.state));
  }, [allConvs]);

  const filtered = selectedState
    ? groupedByState.filter((g) => g.state === selectedState)
    : groupedByState;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setSelectedState(null)}
          className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${!selectedState ? "border-[var(--color-cyan)] text-[var(--color-cyan)]" : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]"}`}>
          All States
        </button>
        {states.map((s) => (
          <button key={s} onClick={() => setSelectedState(s)}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${selectedState === s ? "border-[var(--color-cyan)] text-[var(--color-cyan)]" : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map(({ state, cities }) => {
          const cityEntries = Array.from(cities.entries()).sort();
          const totalConvs = cityEntries.reduce((sum, [, cs]) => sum + cs.length, 0);
          return (
            <div key={state} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-cyan)]">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <h3 className="font-display font-bold text-lg">{state}</h3>
                <span className="text-xs text-[var(--color-mute)] bg-[var(--color-void)]/50 px-2 py-0.5 rounded-full">{totalConvs} event{totalConvs !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cityEntries.map(([city, convs]) => (
                  <div key={city} className="rounded-lg border border-[var(--color-line)]/50 bg-[var(--color-void)]/30 p-3 hover:border-[var(--color-cyan)]/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{city}</h4>
                      <span className="text-[10px] font-mono text-[var(--color-mute)] bg-[var(--color-panel)] px-1.5 py-0.5 rounded-full">{convs.length}</span>
                    </div>
                    <div className="space-y-1">
                      {convs.map((c) => (
                        <Link key={c.id} href={`/conventions/${c.id}`}
                          className="flex items-center gap-1.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">
                          <span className={`h-1.5 w-1.5 rounded-full ${c.status === "upcoming" ? "bg-green-400" : c.status === "ongoing" ? "bg-blue-400" : "bg-gray-400"}`} />
                          <span className="truncate">{c.shortName || c.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
