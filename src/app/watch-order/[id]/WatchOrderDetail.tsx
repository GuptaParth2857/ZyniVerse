"use client";

import Link from "next/link";
import { useState } from "react";

interface Entry {
  title: string;
  info: string;
  anilistId?: number;
}

interface Props {
  slug: string;
  methods: string[];
  entries: Record<string, Entry[]>;
  tip?: string;
}

export default function WatchOrderDetail({ slug, methods, entries, tip }: Props) {
  const [activeMethod, setActiveMethod] = useState(methods[0] || "Release Order");
  const currentEntries = entries[activeMethod] || [];

  return (
    <>
      {/* Method Tabs */}
      {methods.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMethod(m)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 border ${
                activeMethod === m
                  ? "bg-[var(--color-magenta)]/15 border-[var(--color-magenta)]/40 text-[var(--color-magenta)]"
                  : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]/20 hover:text-[var(--color-ink)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {currentEntries.map((entry, i) => {
          const isLast = i === currentEntries.length - 1;
          const isMovie = entry.info.toLowerCase().includes("movie");
          const isOVA = entry.info.toLowerCase().includes("ova") || entry.info.toLowerCase().includes("special");
          const isSpinoff = entry.info.toLowerCase().includes("spinoff") || entry.info.toLowerCase().includes("comedy");

          let accentColor = "var(--color-cyan)";
          let tagLabel = "";
          let tagColor = "";
          if (isMovie) {
            accentColor = "var(--color-magenta)";
            tagLabel = "Movie";
            tagColor = "bg-[var(--color-magenta)]/10 text-[var(--color-magenta)] border-[var(--color-magenta)]/20";
          } else if (isOVA) {
            accentColor = "var(--color-violet)";
            tagLabel = isOVA ? entry.info.match(/OVA|Special/i)?.[0] || "OVA" : "OVA";
            tagColor = "bg-[var(--color-violet)]/10 text-[var(--color-violet)] border-[var(--color-violet)]/20";
          } else if (isSpinoff) {
            accentColor = "var(--color-amber)";
            tagLabel = "Spinoff";
            tagColor = "bg-[var(--color-amber)]/10 text-[var(--color-amber)] border-[var(--color-amber)]/20";
          }

          return (
            <div key={i} className="relative flex gap-4 sm:gap-5">
              {/* Timeline Line + Number */}
              <div className="flex flex-col items-center shrink-0">
                {/* Step number */}
                <div
                  className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold font-mono shrink-0 transition-colors duration-300"
                  style={{
                    borderColor: accentColor,
                    color: accentColor,
                    backgroundColor: `${accentColor}15`,
                  }}
                >
                  {i + 1}
                </div>
                {/* Connecting line */}
                {!isLast && (
                  <div
                    className="w-0.5 flex-1 my-1 rounded-full opacity-20"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </div>

              {/* Card */}
              <div
                className={`flex-1 mb-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] group ${isLast ? "mb-0" : ""}`}
              >
                <div className="flex items-stretch">
                  {/* Cover Image */}
                  {entry.anilistId && (
                    <Link
                      href={`/anime/${entry.anilistId}`}
                      className="shrink-0 w-16 sm:w-20 overflow-hidden bg-[var(--color-void)]"
                    >
                      <img
                        src={`https://img.anili.st/media/${entry.anilistId}`}
                        alt={entry.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </Link>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-bold text-sm sm:text-base text-[var(--color-ink)] truncate group-hover:text-white transition-colors">
                          {entry.title}
                        </h4>
                        <p className="mt-0.5 text-[11px] text-[var(--color-mute)]">
                          {entry.info}
                        </p>
                      </div>

                      {/* Type tag */}
                      {tagLabel && (
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold ${tagColor}`}>
                          {tagLabel}
                        </span>
                      )}
                    </div>

                    {/* Actions row */}
                    <div className="mt-2 flex items-center gap-3">
                      {entry.anilistId && (
                        <Link
                          href={`/anime/${entry.anilistId}`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-magenta)] hover:text-[var(--color-cyan)] transition-colors"
                        >
                          View Details
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Tip */}
      {tip && (
        <div className="mt-8 rounded-xl border border-[var(--color-cyan)]/15 bg-[var(--color-cyan)]/[0.04] p-5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5 h-6 w-6 rounded-lg bg-[var(--color-cyan)]/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2">
                <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6-1 1-2 2.5-2 4h-4c0-1.5-1-3-2-4-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z" />
                <path d="M9 21h6" />
                <path d="M9 18h6" />
              </svg>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[var(--color-cyan)] mb-1">Pro Tip</p>
              <p className="text-xs text-[var(--color-mute)] leading-relaxed">{tip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] text-[var(--color-mute)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-cyan)]" /> TV Series
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-magenta)]" /> Movie
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-violet)]" /> OVA / Special
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-amber)]" /> Spinoff
        </span>
      </div>
    </>
  );
}
