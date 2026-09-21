"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DubFeedsResult, DubFeedSource, DubFeedEntry } from "@/lib/dub-feeds";

const REFRESH_MS = 6 * 60 * 1000;
const TZ = "Asia/Kolkata";

const LANG_BADGE: Record<string, string> = {
  Hindi: "bg-[#ff9933]/20 text-[#ffb366]",
  Tamil: "bg-[#4fa3ff]/20 text-[#8ec5ff]",
  Telugu: "bg-[#2fbf71]/20 text-[#6ee0a4]",
  Kannada: "bg-[#c084fc]/20 text-[#d8b4fe]",
  Malayalam: "bg-[#f97316]/20 text-[#fdba74]",
  Marathi: "bg-[#38bdf8]/20 text-[#7dd3fc]",
  Bengali: "bg-[#f43f5e]/20 text-[#fda4af]",
};

function istDay(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function istDateShort(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
  }).format(d);
}

function istTime(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function FeedRow({ entry }: { entry: DubFeedEntry }) {
  const badge = LANG_BADGE[entry.language] || "bg-white/15 text-white";
  const d = new Date(entry.published);
  const day = istDay(d) === istDay(new Date()) ? "Today" : istDateShort(d);

  return (
    <li className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 transition-colors hover:border-[var(--color-cyan)]/40 hover:bg-white/[0.06]">
      {entry.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.thumbnail}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-14 w-20 shrink-0 rounded-lg border border-white/10 object-cover"
        />
      ) : (
        <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]">
          <span className="font-display text-lg font-black text-white/50">IN</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">{entry.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}>
            {entry.language} Dub
          </span>
          <span className="font-mono text-[10px] text-[var(--color-mute)]">
            {day} · {istTime(d)} IST
          </span>
        </div>
      </div>
      <a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-cyan)] transition-colors hover:border-[var(--color-cyan)] hover:bg-[var(--color-cyan)] hover:text-black"
      >
        Watch ▸
      </a>
    </li>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
          <div className="h-14 w-20 rounded-lg bg-white/10" />
          <div className="mt-2 h-3 w-3/4 rounded bg-white/10" />
          <div className="mt-2 h-2 w-1/2 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function SourceSection({ source }: { source: DubFeedSource }) {
  return (
    <section className="min-w-0" aria-label={`${source.name} auto-fetched feed`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-[var(--color-magenta)] pulse-dot" />
          <h3 className="font-display text-lg font-bold text-white">{source.name}</h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">
            Official YouTube
          </span>
        </div>
        {source.ok && source.entries.length > 0 && (
          <span className="font-mono text-[10px] text-[var(--color-mute)]">
            Synced {istTime(new Date(source.fetchedAt))} IST
          </span>
        )}
      </div>

      <div className="mt-3">
        {!source.ok ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <p className="font-display text-sm font-bold text-white">Feed temporarily unavailable</p>
            <p className="mt-1 text-xs text-[var(--color-mute)]">
              {source.name}&apos;s feed didn&apos;t respond this time — next sync in a few minutes.
            </p>
          </div>
        ) : source.entries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <p className="font-display text-sm font-bold text-white">No recent dub uploads</p>
            <p className="mt-1 text-xs text-[var(--color-mute)]">
              {source.name}&apos;s latest feed is live, but there are no new Indian-dub titles to show.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {source.entries.map((entry) => (
              <FeedRow key={`${source.id}-${entry.videoId}`} entry={entry} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-2.5 text-[11px] text-[var(--color-mute)]">
        Source:{" "}
        <Link
          href={source.channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-cyan)] hover:underline"
        >
          {source.channelName} — official YouTube channel
        </Link>
      </div>
    </section>
  );
}

export default function LiveDubFeeds() {
  const [data, setData] = useState<DubFeedsResult | null>(null);
  const [error, setError] = useState(false);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;
      try {
        const res = await fetch("/api/live-dubs", { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json: DubFeedsResult = await res.json();
        if (!cancelled) {
          setData(json);
          setError(false);
        }
      } catch {
        if (!cancelled && !controller.signal.aborted) setError(true);
      }
    }

    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      inFlight.current?.abort();
    };
  }, []);

  return (
    <section className="mt-14" aria-label="Auto-fetched Indian dub feeds">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--color-magenta)] pulse-dot" />
            <p className="console-label">Live Feed · Auto-fetched</p>
          </div>
          <h2 className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">
            Fresh Dubs, Pulled Live
          </h2>
        </div>
        {data && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">
            Synced {istTime(new Date(data.fetchedAt))} IST · every 6 min
          </p>
        )}
      </div>

      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[var(--color-mute)]">
        These rows are pulled straight from the channels&apos; official public YouTube feeds — no dates are invented here.
        <span className="text-white/60"> Whenever a dub uploads, it appears here on its own.</span>
      </p>

      <div className="mt-5">
        {error && data === null ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="font-display text-base font-bold text-white">Feeds temporarily unavailable</p>
            <p className="mt-1 text-xs text-[var(--color-mute)]">
              The live feeds didn&apos;t respond this time. They retry automatically — the guides above are still live.
            </p>
          </div>
        ) : data === null ? (
          <Skeleton />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {data.sources.map((source) => (
              <div key={source.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <SourceSection source={source} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-mute)]">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">Sources</span>
        <span>Muse India · Ani-One India</span>
        <span className="text-white/25">·</span>
        <span>auto-synced every ~6 minutes</span>
      </div>
    </section>
  );
}