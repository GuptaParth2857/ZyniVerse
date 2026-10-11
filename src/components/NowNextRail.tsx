"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TV_CHANNELS } from "@/lib/tv-channels";
import { computeNowNext, timeToMinutes } from "@/lib/tv-now-next";

interface RailSlot {
  show: string;
  start: string;
  end: string;
  duration: number;
  description?: string;
  episode?: number;
  coverImage?: string;
  isLive?: boolean;
}

interface RailChannel {
  channelId: string;
  channelName: string;
  channelColor: string;
  channelLogo?: string;
  channelType: "tv" | "youtube";
  days: Record<string, RailSlot[]>;
}

export interface RailData {
  updatedAt: string;
  today: string;
  channels: RailChannel[];
  liveAiringTotal: number;
}

function formatCountdown(minutes: number): string {
  if (minutes <= 0) return "jaise abhi";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function ChannelLogo({ channelId, size = 36 }: { channelId: string; size?: number }) {
  const ch = TV_CHANNELS[channelId];
  if (!ch) return null;
  const [imgError, setImgError] = useState(false);
  if (!ch.logoUrl || imgError) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-lg font-bold text-white"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${ch.color}, ${ch.color}bb)`,
          fontSize: size > 40 ? 11 : 9,
        }}
      >
        {ch.shortName}
      </span>
    );
  }
  return (
    <Image
      src={ch.logoUrl}
      alt={ch.name}
      width={size}
      height={size}
      className="shrink-0 rounded-lg"
      style={{ objectFit: "contain", width: size, height: size, background: "rgba(0,0,0,0.3)", border: `1px solid ${ch.color}44` }}
      onError={() => setImgError(true)}
    />
  );
}

function RailRow({ channel, today, nowMinutes }: { channel: RailChannel; today: string; nowMinutes: number }) {
  const ch = TV_CHANNELS[channel.channelId];
  if (!ch) return null;
  const slots = channel.days?.[today] || [];
  const result = useMemo(() => computeNowNext(slots, nowMinutes), [slots, nowMinutes]);

  const now = result.now;
  const next = result.next;
  if (!now && !next) return null;

  const isAlways = now && now.start === "00:00" && now.end === "00:00";

  let elapsedPct = 0;
  if (now && !isAlways) {
    const start = timeToMinutes(now.start);
    const end = timeToMinutes(now.end);
    const duration = start > end ? 1440 - start + end : end - start;
    const elapsed = start > end
      ? (nowMinutes >= start ? nowMinutes - start : 1440 - start + nowMinutes)
      : Math.min(Math.max(nowMinutes - start, 0), duration);
    elapsedPct = duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => {
        const el = document.getElementById(`channel-${channel.channelId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="group cursor-pointer rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-3 transition-colors hover:border-[var(--color-cyan)]/40 hover:bg-[var(--color-panel)]"
    >
      <div className="flex items-center gap-3">
        <ChannelLogo channelId={channel.channelId} />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold" style={{ color: channel.channelColor }}>
            {channel.channelName}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-mute)]">
            {channel.channelType === "tv" ? "TV" : "Streaming"}
          </p>
        </div>
        {now && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--color-cyan)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
            </span>
            Live
          </span>
        )}
      </div>

      <div className="mt-2.5 space-y-1.5">
        {/* Now */}
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/40 px-3 py-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--color-cyan)]">Now</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[var(--color-ink)]">
              {now ? now.show : "—"}
            </p>
            {now && !isAlways && (
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: channel.channelColor, boxShadow: `0 0 8px ${channel.channelColor}66` }}
                  animate={{ width: `${elapsedPct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            )}
          </div>
          {now && !isAlways && (
            <span className="shrink-0 font-mono text-[10px] text-[var(--color-mute)]">
              {now.start}–{now.end}
              {result.nowEndsInMinutes != null && (
                <span className="ml-1 text-[var(--color-cyan)]/70">· {formatCountdown(result.nowEndsInMinutes)} left</span>
              )}
            </span>
          )}
          {isAlways && <span className="shrink-0 font-mono text-[9px] font-bold text-emerald-400">24/7</span>}
        </div>

        {/* Next */}
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--color-line)] px-3 py-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Next</span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-ink)]/85">
            {next ? next.show : "No more shows today"}
          </p>
          {next && (
            <span className="shrink-0 font-mono text-[10px]">
              <span className="text-[var(--color-magenta)]">
                {result.nextInMinutes != null && result.nextInMinutes < 360 ? `in ${formatCountdown(result.nextInMinutes)}` : "kal"}
              </span>
              <span className="ml-1 text-[var(--color-mute)]">{formatTime(next.start)}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function NowNextRail({ data }: { data: RailData | null }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const today = data?.today || ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];

  const rows = useMemo(() => {
    if (!data) return [];
    return [...data.channels]
      .filter((ch) => {
        const res = computeNowNext(ch.days?.[today] || [], nowMinutes);
        return Boolean(ch.days?.[today]?.length);
      })
      .sort((a, b) => {
        const aNow = computeNowNext(a.days?.[today] || [], nowMinutes).now ? 1 : 0;
        const bNow = computeNowNext(b.days?.[today] || [], nowMinutes).now ? 1 : 0;
        if (aNow !== bNow) return bNow - aNow;
        if (a.channelType !== b.channelType) return a.channelType === "tv" ? -1 : 1;
        return a.channelName.localeCompare(b.channelName);
      });
  }, [data, today, nowMinutes]);

  if (!data || rows.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-4 text-center font-mono text-xs text-[var(--color-mute)]">
        EPG data load ho raha hai — thodi der me now/next yahaan dikhega…
      </div>
    );
  }

  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="neon-premium relative mb-8 rounded-[24px]"
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-cyan)] to-transparent" />

      <div className="relative p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-cyan)] opacity-30" />
              <span className="relative flex h-2.5 w-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_12px_rgba(0,255,224,0.8)]" />
              </span>
            </div>
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--color-cyan)]">
                Now Playing · Up Next
              </h2>
              <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-mute)]">
                India TV + streaming · countdown har 30s refresh
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 px-3 py-1 font-mono text-[10px] font-bold text-[var(--color-cyan)]">
            🕐 {timeStr}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((ch) => (
            <RailRow key={ch.channelId} channel={ch} today={today} nowMinutes={nowMinutes} />
          ))}
        </div>

        <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-[var(--color-mute)]/70">
          Row pe click karke channel ke full schedule me jump karo · updated {new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.section>
  );
}