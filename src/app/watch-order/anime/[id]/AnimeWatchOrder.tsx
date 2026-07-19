"use client";

import Link from "next/link";

interface Entry {
  id: number;
  title: string;
  format?: string;
  episodes?: number;
  relationType: string;
  coverImage?: string;
  status?: string;
}

interface Props {
  entries: Entry[];
  mainId: number;
}

const RELATION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  MAIN: { label: "Main", color: "var(--color-cyan)", bg: "rgba(0,229,255,0.12)" },
  PREQUEL: { label: "Prequel", color: "var(--color-violet)", bg: "rgba(112,0,255,0.12)" },
  SEQUEL: { label: "Sequel", color: "var(--color-magenta)", bg: "rgba(255,0,230,0.12)" },
  SIDE_STORY: { label: "Side Story", color: "var(--color-amber)", bg: "rgba(255,170,0,0.12)" },
  ALTERNATIVE: { label: "Alternative", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  SPIN_OFF: { label: "Spinoff", color: "#a3e635", bg: "rgba(163,230,53,0.12)" },
};

function getFormatTag(format?: string): { label: string; color: string } | null {
  if (!format) return null;
  switch (format) {
    case "MOVIE": return { label: "Movie", color: "var(--color-magenta)" };
    case "OVA": return { label: "OVA", color: "var(--color-violet)" };
    case "ONA": return { label: "ONA", color: "var(--color-violet)" };
    case "SPECIAL": return { label: "Special", color: "var(--color-amber)" };
    case "TV_SHORT": return { label: "Short", color: "var(--color-amber)" };
    default: return { label: format, color: "var(--color-cyan)" };
  }
}

export default function AnimeWatchOrder({ entries, mainId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-mute)]">No related entries found for this anime.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {entries.map((entry, i) => {
        const isLast = i === entries.length - 1;
        const isMain = entry.id === mainId;
        const relStyle = RELATION_LABELS[entry.relationType] || RELATION_LABELS.MAIN;
        const formatTag = getFormatTag(entry.format);

        return (
          <div key={`${entry.id}-${i}`} className="relative flex gap-4 sm:gap-5">
            {/* Timeline Line + Number */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold font-mono shrink-0 transition-colors duration-300"
                style={{
                  borderColor: relStyle.color,
                  color: isMain ? "#fff" : relStyle.color,
                  backgroundColor: isMain ? relStyle.color : relStyle.bg,
                }}
              >
                {i + 1}
              </div>
              {!isLast && (
                <div
                  className="w-0.5 flex-1 my-1 rounded-full opacity-20"
                  style={{ backgroundColor: relStyle.color }}
                />
              )}
            </div>

            {/* Card */}
            <div
              className={`flex-1 mb-4 rounded-xl border bg-[var(--glass-bg)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)] group ${isLast ? "mb-0" : ""} ${isMain ? "border-[var(--color-cyan)]/30" : "border-[var(--glass-border)] hover:border-white/15"}`}
            >
              <div className="flex items-stretch">
                {/* Cover Image */}
                {entry.coverImage && (
                  <Link
                    href={`/anime/${entry.id}`}
                    className="shrink-0 w-16 sm:w-20 overflow-hidden bg-[var(--color-void)]"
                  >
                    <img
                      src={entry.coverImage}
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
                        {isMain && <span className="ml-2 text-[10px] text-[var(--color-cyan)]">(Main)</span>}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-[var(--color-mute)]">
                        {entry.episodes && `${entry.episodes} episodes`}
                        {entry.status && ` · ${entry.status}`}
                      </p>
                    </div>

                    {/* Tags */}
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

                  {/* Actions */}
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
      })}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] text-[var(--color-mute)]">
        {Object.entries(RELATION_LABELS).filter(([k]) => entries.some((e) => e.relationType === k)).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: val.color }} />
            {val.label}
          </span>
        ))}
      </div>
    </div>
  );
}
