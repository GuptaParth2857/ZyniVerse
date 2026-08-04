"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { WatchOrderGuide, WatchOrderEntry } from "@/lib/watch-order";

const RELATION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  MAIN: { label: "Main", color: "var(--color-cyan)", bg: "rgba(0,229,255,0.12)" },
  PREQUEL: { label: "Prequel", color: "var(--color-violet)", bg: "rgba(112,0,255,0.12)" },
  SEQUEL: { label: "Sequel", color: "var(--color-magenta)", bg: "rgba(255,0,230,0.12)" },
  SIDE_STORY: { label: "Side Story", color: "var(--color-amber)", bg: "rgba(255,170,0,0.12)" },
  ALTERNATIVE: { label: "Alternative", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  SPIN_OFF: { label: "Spin-off", color: "#a3e635", bg: "rgba(163,230,53,0.12)" },
  PARENT: { label: "Parent", color: "var(--color-violet)", bg: "rgba(112,0,255,0.12)" },
  CONTAINS: { label: "Contains", color: "var(--color-violet)", bg: "rgba(112,0,255,0.12)" },
  COMPILATION: { label: "Recap", color: "var(--color-amber)", bg: "rgba(255,170,0,0.12)" },
  SUMMARY: { label: "Summary", color: "var(--color-amber)", bg: "rgba(255,170,0,0.12)" },
  OTHER: { label: "Related", color: "var(--color-mute)", bg: "rgba(128,128,128,0.12)" },
};

function getFormatTag(format?: string): { label: string; color: string } | null {
  if (!format) return null;
  switch (format) {
    case "MOVIE": return { label: "Movie", color: "var(--color-magenta)" };
    case "OVA": return { label: "OVA", color: "var(--color-violet)" };
    case "ONA": return { label: "ONA", color: "var(--color-violet)" };
    case "SPECIAL": return { label: "Special", color: "var(--color-amber)" };
    case "TV_SHORT": return { label: "Short", color: "var(--color-amber)" };
    case "TV": return { label: "TV", color: "var(--color-cyan)" };
    default: return { label: format, color: "var(--color-cyan)" };
  }
}

function dateLabel(d?: { year?: number; month?: number; day?: number }): string {
  if (!d?.year) return "";
  const month = d.month ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.month - 1] : undefined;
  return month ? `${month} ${d.year}` : String(d.year);
}

function TimelineRow({ entry, number, isMain, isLast }: { entry: WatchOrderEntry; number: number; isMain: boolean; isLast: boolean }) {
  const relStyle = RELATION_LABELS[entry.relationType] || RELATION_LABELS.OTHER;
  const formatTag = getFormatTag(entry.format);
  const date = dateLabel(entry.startDate);

  return (
    <div className="relative flex gap-4 sm:gap-5">
      {/* Timeline node */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold font-mono shrink-0 transition-colors duration-300"
          style={{
            borderColor: relStyle.color,
            color: isMain ? "#fff" : relStyle.color,
            backgroundColor: isMain ? relStyle.color : relStyle.bg,
          }}
        >
          {number}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 my-1 rounded-full opacity-20" style={{ backgroundColor: relStyle.color }} />
        )}
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-4 rounded-xl neon-rgb-border bg-[var(--glass-bg)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] group ${isLast ? "mb-0" : ""} ${isMain ? "" : "hover:border-white/15"}`}
      >
        <div className="flex items-stretch">
          {entry.coverImage && (
            <Link
              href={`/anime/${entry.id}`}
              className="relative shrink-0 w-16 sm:w-20 overflow-hidden bg-[var(--color-void)]"
            >
              <Image
                src={entry.coverImage}
                alt={entry.title}
                fill
                sizes="80px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </Link>
          )}

          <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-bold text-sm sm:text-base text-[var(--color-ink)] truncate group-hover:text-white transition-colors">
                  {entry.title}
                  {isMain && <span className="ml-2 text-[10px] text-[var(--color-cyan)]">(Main)</span>}
                </h4>
                <p className="mt-0.5 text-[11px] text-[var(--color-mute)]">
                  {entry.episodes && `${entry.episodes} episodes`}
                  {date && `${entry.episodes ? " · " : ""}${date}`}
                  {entry.status && ` · ${entry.status}`}
                </p>
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <span
                  className="rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold"
                  style={{
                    borderColor: `${relStyle.color}40`,
                    backgroundColor: relStyle.bg,
                    color: relStyle.color,
                  }}
                >
                  {relStyle.label}
                </span>
                {formatTag && (
                  <span
                    className="rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold"
                    style={{
                      borderColor: `${formatTag.color}40`,
                      backgroundColor: `${formatTag.color}15`,
                      color: formatTag.color,
                    }}
                  >
                    {formatTag.label}
                  </span>
                )}
              </div>
            </div>

            {entry.note && (
              <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-magenta)]/10 px-2.5 py-1 text-[10px] text-[var(--color-magenta)] border border-[var(--color-magenta)]/15">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                {entry.note}
              </p>
            )}

            <div className="mt-2 flex items-center gap-3">
              <Link
                href={`/anime/${entry.id}`}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-magenta)] hover:text-[var(--color-cyan)] transition-colors"
              >
                View Details
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnimeWatchOrder({ guide }: { guide: WatchOrderGuide }) {
  const [mode, setMode] = useState<"release" | "grouped">("release");

  if (guide.totalEntries === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-mute)]">No related entries found for this anime.</p>
      </div>
    );
  }

  const presentRelations = new Set(guide.releaseOrder.map((e) => e.relationType));
  const firstEntry = guide.releaseOrder[0];

  return (
    <div className="relative">
      {/* Summary chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          {guide.totalEntries} {guide.totalEntries === 1 ? "entry" : "entries"}
        </span>
        {guide.movieCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-magenta)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-magenta)] border border-[var(--color-magenta)]/20">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="6" width="20" height="12" rx="2" /><path d="m10 9 5 3-5 3V9z" />
            </svg>
            {guide.movieCount} movies &amp; specials
          </span>
        )}
        {firstEntry && firstEntry.id !== guide.mainId && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-violet)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-violet)] border border-[var(--color-violet)]/20">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            Start with {firstEntry.title}
          </span>
        )}
      </div>

      {/* Mode tabs */}
      <div className="mb-6 flex items-center gap-2 border-b border-[var(--color-line)] pb-3">
        {(["release", "grouped"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              mode === m
                ? "text-[var(--color-magenta)] border-b-2 border-[var(--color-magenta)]"
                : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >
            {m === "release" ? "Release Order" : "Grouped by Type"}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[var(--color-mute)] hidden sm:inline">
          Auto-generated from AniList relations
        </span>
      </div>

      {mode === "release" ? (
        <div>
          {guide.releaseOrder.map((entry, i) => (
            <TimelineRow
              key={entry.id}
              entry={entry}
              number={i + 1}
              isMain={entry.id === guide.mainId}
              isLast={i === guide.releaseOrder.length - 1}
            />
          ))}
        </div>
      ) : (
        guide.sections.map((section) => (
          <div key={section.group} className="mb-8">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: section.color }} />
              <h3 className="font-display font-bold text-sm sm:text-base text-[var(--color-ink)]">
                {section.label}
              </h3>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold"
                style={{ borderColor: `${section.color}33`, color: section.color }}
              >
                {section.entries.length}
              </span>
            </div>
            <div>
              {section.entries.map((entry, i) => (
                <TimelineRow
                  key={entry.id}
                  entry={entry}
                  number={i + 1}
                  isMain={entry.id === guide.mainId}
                  isLast={i === section.entries.length - 1}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] text-[var(--color-mute)]">
        {Object.entries(RELATION_LABELS)
          .filter(([key]) => presentRelations.has(key))
          .map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: val.color }} />
              {val.label}
            </span>
          ))}
      </div>
    </div>
  );
}
