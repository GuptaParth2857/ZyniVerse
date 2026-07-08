"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { VoiceLine } from "@/lib/voice-lines";

export default function QuoteOfTheDay() {
  const [line, setLine] = useState<VoiceLine | null>(null);

  useEffect(() => {
    fetch("/api/voice-lines/daily")
      .then((r) => r.json())
      .then((d) => setLine(d.line))
      .catch(() => {});
  }, []);

  if (!line) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <Link
        href={`/voice-lines/${line.id}`}
        className="group block rounded-2xl border border-[var(--color-magenta)]/20 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-6 sm:p-8 transition-all duration-300 hover:border-[var(--color-magenta)]/40"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-magenta)]">
          Quote of the Day
        </p>
        <p className="mt-3 text-xl leading-relaxed italic sm:text-2xl before:content-['\201C'] before:mr-1 after:content-['\201D'] after:ml-1">
          {line.line}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="font-bold text-[var(--color-cyan)]">{line.character}</span>
          <span className="text-[var(--color-mute)]">·</span>
          <span className="text-[var(--color-mute)]">{line.animeTitle}</span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-mute)] group-hover:text-[var(--color-cyan)] transition-colors">
          <span>View all quotes →</span>
        </div>
      </Link>
    </section>
  );
}
