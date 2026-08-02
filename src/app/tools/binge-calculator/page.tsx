"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Pace = "speed" | "normal" | "relaxed" | "marathon";
const PACES: Record<Pace, { label: string; epsPerDay: number; hoursPerDay: number }> = {
  speed:    { label: "Speed Run",  epsPerDay: 12, hoursPerDay: 5.0 },
  normal:   { label: "Normal",    epsPerDay: 6,  hoursPerDay: 2.5 },
  relaxed:  { label: "Relaxed",   epsPerDay: 3,  hoursPerDay: 1.25 },
  marathon: { label: "Marathon",  epsPerDay: 20, hoursPerDay: 8.3 },
};

const EPISODE_PRESETS = [
  { name: "Attack on Titan", eps: 94 },
  { name: "Demon Slayer", eps: 63 },
  { name: "Jujutsu Kaisen", eps: 47 },
  { name: "Naruto", eps: 720 },
  { name: "One Piece", eps: 1120 },
  { name: "Hunter x Hunter", eps: 148 },
];

export default function BingeCalculator() {
  const [episodes, setEpisodes] = useState<number>(0);
  const [pace, setPace] = useState<Pace>("normal");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (episodes <= 0) return null;
    const p = PACES[pace];
    const days = Math.ceil(episodes / p.epsPerDay);
    const totalHours = Math.round(episodes * 0.42 * 10) / 10;
    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + days);

    const dailyHours = p.hoursPerDay;
    const dailyEpMin = Math.round((24 * 60) / p.epsPerDay);

    return { days, totalHours, finishDate, dailyHours, dailyEpMin, epsPerDay: p.epsPerDay };
  }, [episodes, pace]);

  function copyPlan() {
    if (!result) return;
    const text = `🎬 My Binge Plan\n\n${episodes} episodes at "${PACES[pace].label}" pace (${PACES[pace].epsPerDay}/day)\n\n⏳ Finish in ${result.days} days — by ${result.finishDate.toDateString()}\n🕐 ${result.totalHours} total hours of watch time\n\nPlanned with ZyniVerse ⚡`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Tool</p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-2">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Binge Watch Calculator</h1>
        </div>
        <p className="mt-3 text-sm text-[var(--color-mute)] max-w-lg mx-auto">
          Planning an anime marathon? Enter episodes and your pace — we&apos;ll tell you when you&apos;ll finish.
        </p>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1.5">How many episodes?</label>
        <input
          type="number"
          min={1}
          value={episodes || ""}
          onChange={(e) => setEpisodes(Number(e.target.value))}
          placeholder="e.g. 500"
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--color-cyan)]/50 transition-colors"
        />
      </div>

      {/* Presets */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[var(--color-mute)] mb-3 uppercase tracking-wider">Popular Series</p>
        <div className="flex flex-wrap gap-2">
          {EPISODE_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setEpisodes(p.eps)}
              className={`rounded-full neon-rgb-border bg-[var(--color-panel)] px-3 py-1.5 text-xs font-semibold transition-colors ${episodes === p.eps ? "text-[var(--color-cyan)]" : "hover:border-[var(--color-cyan)]/40"}`}
            >
              {p.name} ({p.eps})
            </button>
          ))}
        </div>
      </div>

      {/* Pace Selector */}
      <div className="mb-10">
        <label className="block text-xs font-semibold text-[var(--color-mute)] mb-3">Your Binge Pace</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(PACES) as [Pace, typeof PACES[Pace]][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setPace(key)}
              className={`rounded-xl px-4 py-3 text-center transition-all ${
                pace === key
                  ? "neon-rgb-border bg-[var(--color-cyan)]/10 border-[var(--color-cyan)]/40"
                  : "neon-rgb-border bg-[var(--color-panel)] hover:border-[var(--color-cyan)]/20"
              }`}
            >
              <p className="font-display text-sm font-bold">{val.label}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{val.epsPerDay} eps/day</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold mb-5 text-center">Your Marathon Plan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
              <p className="font-display text-2xl font-bold text-[var(--color-cyan)]">{result.days}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Days to Finish</p>
            </div>
            <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
              <p className="font-display text-2xl font-bold text-[var(--color-magenta)]">{result.totalHours}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Total Hours</p>
            </div>
            <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
              <p className="font-display text-2xl font-bold text-[var(--color-amber)]">{result.epsPerDay}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Episodes/Day</p>
            </div>
            <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
              <p className="font-display text-lg font-bold text-[var(--color-cyan)]">
                {result.finishDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Finish Date</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl bg-[var(--color-void)] p-4">
            <p className="text-xs font-semibold text-[var(--color-mute)] mb-2">Daily Schedule</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[var(--color-cyan)]">9:00 AM</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]" style={{ width: `${Math.min(100, (result.dailyHours / 16) * 100)}%` }} />
              </div>
              <span className="text-[var(--color-magenta)]">
                {9 + Math.floor(result.dailyHours)}:{result.dailyHours % 1 === 0 ? "00" : "30"} AM
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-mute)] mt-2">
              ~{result.dailyHours}h/day watching, ~{result.dailyEpMin} min per episode (including intros/outros)
            </p>
          </div>

          {/* Copy */}
          <div className="flex justify-center mt-6">
            <button
              onClick={copyPlan}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                copied ? "bg-[var(--color-cyan)] text-black" : "neon-rgb-border bg-[var(--color-void)] text-[var(--color-cyan)]"
              }`}
            >
              {copied ? (
                <>Copied ✓</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy Plan
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link href="/schedule" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
          Check Anime Schedule →
        </Link>
      </div>
    </div>
  );
}
