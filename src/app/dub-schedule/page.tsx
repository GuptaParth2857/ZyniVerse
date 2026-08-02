"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { DUB_SCHEDULE, DUB_PLATFORMS, DUB_LANGUAGES, DUB_DAYS } from "@/lib/dub-schedule-data";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";

export default function DubSchedulePage() {
  const [platform, setPlatform] = useState("All");
  const [language, setLanguage] = useState("All");
  const [day, setDay] = useState("All");

  const filtered = useMemo(() => {
    return DUB_SCHEDULE.filter((e) => {
      if (platform !== "All" && e.platform !== platform) return false;
      if (language !== "All" && !e.language.includes(language)) return false;
      if (day !== "All" && e.day !== day) return false;
      return true;
    });
  }, [platform, language, day]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof DUB_SCHEDULE>();
    for (const entry of filtered) {
      const list = map.get(entry.day) || [];
      list.push(entry);
      map.set(entry.day, list);
    }
    return map;
  }, [filtered]);

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mb-4">
          <h1 className="font-display text-3xl font-bold text-white">Dub Schedule</h1>
        </div>
        <p className="text-[var(--color-mute)] mb-8 max-w-2xl">
          Estimated weekly release timings for Hindi, Tamil, and Telugu anime dubs across Indian streaming platforms.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex flex-wrap gap-1.5">
            {DUB_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  day === d
                    ? "bg-[var(--color-violet)] text-white"
                    : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div className="flex flex-wrap gap-1.5">
            {DUB_PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  platform === p
                    ? "bg-[var(--color-cyan)] text-black"
                    : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="w-px bg-white/10 hidden sm:block" />
          <div className="flex flex-wrap gap-1.5">
            {DUB_LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  language === l
                    ? "bg-[var(--color-magenta)] text-white"
                    : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-mute)] text-lg">No dub entries match the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {dayOrder.filter((d) => grouped.has(d)).map((d) => (
              <div key={d}>
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="neon-rgb-border rounded-lg px-3 py-1 text-sm">{d}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped.get(d)!.map((entry, i) => (
                    <div
                      key={`${entry.title}-${i}`}
                      className="glass-card flex gap-4 p-4 hover:bg-white/5 transition-colors"
                    >
                      {entry.coverImage && (
                        <div className="relative h-20 w-14 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={entry.coverImage}
                            alt={entry.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{entry.title}</h3>
                        <p className="text-[var(--color-mute)] text-xs mt-0.5">{entry.episode}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-mono text-[var(--color-cyan)]">{entry.time}</span>
                          <span className="text-[10px] text-white/20">•</span>
                          <span className="text-[10px] font-medium text-[var(--color-violet)]">{entry.platform}</span>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          {entry.language.split(" / ").map((lang) => (
                            <span
                              key={lang}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                lang === "Hindi"
                                  ? "bg-orange-500/20 text-orange-300"
                                  : lang === "Tamil"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-green-500/20 text-green-300"
                              }`}
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                        {entry.anilistId && (
                          <Link
                            href={`/anime/${entry.anilistId}`}
                            className="text-[10px] text-[var(--color-magenta)] hover:underline mt-1 inline-block"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
