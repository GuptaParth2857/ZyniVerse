"use client";

export default function LiveActionPlaceholder({ title, year }: { title: string; year: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center bg-gradient-to-br from-[var(--color-cyan)]/15 via-[#0d0d1a] to-[var(--color-magenta)]/15">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-cyan)]/80">
        Live-Action
      </span>
      <span className="font-display text-sm font-bold leading-tight text-white/85 line-clamp-3">{title}</span>
      <span className="mt-1 rounded-full border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 px-2 py-0.5 text-[9px] font-bold text-[var(--color-amber)]">
        Coming {year}
      </span>
    </div>
  );
}
