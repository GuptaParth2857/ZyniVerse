"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  TV_CHANNELS,
  getScheduleForChannel,
  getNowPlaying,
  getDayName,
  getNext7Days,
  getShowPoster,
  type TimeSlot,
  type TvChannel,
} from "@/lib/tv-channels";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface LiveAiringEntry {
  id: number;
  title: string;
  englishTitle?: string;
  episode: number;
  airTime: string;
  day: string;
  coverImage?: string;
  genres?: string[];
  format?: string;
  totalEpisodes?: number;
}

interface LiveAiringData {
  updatedAt: string;
  days: Record<string, LiveAiringEntry[]>;
  total: number;
}

interface LiveScheduleEntry {
  show: string;
  start: string;
  end: string;
  duration: number;
  description?: string;
  episode?: number;
  coverImage?: string;
  isLive?: boolean;
}

interface ChannelLiveSchedule {
  channelId: string;
  channelName: string;
  channelColor: string;
  channelLogo?: string;
  channelType: "tv" | "youtube";
  days: Record<string, LiveScheduleEntry[]>;
}

interface LiveScheduleData {
  updatedAt: string;
  today: string;
  channels: ChannelLiveSchedule[];
  liveAiringTotal: number;
}
import { PageTransition } from "@/components/PageTransition";

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

function NeonBorder({ children, glowColor }: { children: React.ReactNode; glowColor?: string }) {
  return (
    <div className="relative rounded-[24px]">
      <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: `conic-gradient(from 0deg, transparent, ${glowColor || "#00ffe0"}, transparent, #ff00e6, transparent, #7000ff, transparent, ${glowColor || "#00ffe0"})`, animation: "spin 6s linear infinite", willChange: "transform" }}
        />
        <div className="absolute inset-[1.5px] rounded-[22.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ChannelLogo({
  channel,
  size = 48,
}: {
  channel: TvChannel;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const showImg = channel.logoUrl && !imgError;

  if (!showImg) {
    return (
      <div
        className="flex items-center justify-center rounded-xl text-xs font-bold text-white shrink-0 shadow-lg"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${channel.color}, ${channel.color}cc)`,
          border: `1.5px solid ${channel.color}44`,
          fontSize: size > 40 ? 12 : 9,
        }}
      >
        {channel.shortName}
      </div>
    );
  }

  return (
    <img
      src={channel.logoUrl}
      alt={channel.name}
      className="rounded-xl shrink-0 shadow-lg"
      style={{ width: size, height: size, border: `1.5px solid ${channel.color}44`, objectFit: "contain", background: "rgba(0,0,0,0.3)" }}
      onError={() => setImgError(true)}
    />
  );
}

const TV_CHANNEL_IDS = [
  "cn",
  "sony_yay",
  "hungama",
  "super_hungama",
  "pogo",
  "nick",
  "nick_jr",
  "sonic",
  "discovery_kids",
  "disney_channel",
  "disney_junior",
  "epic_kids",
  "animax",
];
const YT_CHANNEL_IDS = ["muse_asia", "muse_india", "anime_log", "crunchyroll", "netflix_anime", "prime_video", "sony_liv", "jio_hotstar"];

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isCurrentlyAiring(slot: TimeSlot): boolean {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = parseMinutes(slot.start);
  const end = parseMinutes(slot.end);
  if (end === 0 && start > 0) {
    return cur >= start || cur < end;
  }
  return cur >= start && cur < end;
}

function isPast(slot: TimeSlot): boolean {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const end = parseMinutes(slot.end);
  return cur >= end && end !== 0;
}

function NowPlayingBanner({ liveData }: { liveData?: LiveScheduleData | null }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  const nowPlaying = useMemo(() => {
    const hardcoded = getNowPlaying();

    const liveNowPlaying: { channel: TvChannel; slot: TimeSlot }[] = [];
    if (liveData?.channels) {
      const now = new Date();
      const curMinutes = now.getHours() * 60 + now.getMinutes();
      const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];

      for (const ch of liveData.channels) {
        const channel = TV_CHANNELS[ch.channelId];
        if (!channel) continue;
        const daySlots = ch.days[todayName] || [];
        const liveSlot = daySlots.find((s) => {
          const [sh, sm] = s.start.split(":").map(Number);
          const [eh, em] = s.end.split(":").map(Number);
          const start = sh * 60 + sm;
          const end = eh * 60 + em;
          return curMinutes >= start && curMinutes < end;
        });
        if (liveSlot && !hardcoded.some((h) => h.channel.id === channel.id)) {
          liveNowPlaying.push({ channel, slot: liveSlot });
        }
      }
    }

    return [...hardcoded, ...liveNowPlaying];
  }, [tick, liveData]);
  if (nowPlaying.length === 0) return null;

  const now = new Date();
  const curMinutes = now.getHours() * 60 + now.getMinutes();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 relative"
    >
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-emerald-500/10 to-cyan-500/20 blur-xl opacity-60" />

      <NeonBorder glowColor="#00ffe0">
        <div className="rounded-[24px] border border-cyan-400/20 bg-[var(--color-panel)]/80 backdrop-blur-xl overflow-hidden">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30" />
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,188,212,0.8)]" />
                </span>
              </div>
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Live Now
                </h2>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">
                  {nowPlaying.length} channel{nowPlaying.length > 1 ? "s" : ""} currently broadcasting
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-cyan-400">{timeStr}</span>
            </div>
          </div>

        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {nowPlaying.map(({ channel, slot }, idx) => {
            const slotStart = parseMinutes(slot.start);
            const slotEnd = parseMinutes(slot.end);
            const slotDuration = slotEnd > slotStart ? slotEnd - slotStart : (1440 - slotStart) + slotEnd;
            const elapsed = slotEnd > slotStart
              ? Math.max(0, Math.min(curMinutes - slotStart, slotDuration))
              : Math.max(0, curMinutes >= slotStart ? curMinutes - slotStart : (1440 - slotStart) + curMinutes);
            const progress = slotDuration > 0 ? Math.min((elapsed / slotDuration) * 100, 100) : 0;

            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.4 }}
                className="group relative rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-[var(--color-panel)]/90 to-cyan-400/5 backdrop-blur-xl p-4 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,188,212,0.12)]"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px rgba(0,188,212,0.2), 0 0 20px rgba(0,188,212,0.08)` }} />

                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-50" />

                <div className="relative flex items-start gap-3">
                  <ChannelLogo channel={channel} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold truncate leading-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                      {slot.show}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink)] font-medium mt-0.5">
                      {channel.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] font-mono text-[var(--color-mute)]">
                        {slot.start} — {slot.end}
                      </span>
                      <span className="text-[8px] text-[var(--color-mute)]">·</span>
                      <span className="text-[9px] text-cyan-400/70 font-semibold">
                        {slot.duration}m
                      </span>
                    </div>
                  </div>
                </div>

                {getShowPoster(slot.show) ? (
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
                    <img
                      src={getShowPoster(slot.show)}
                      alt={slot.show}
                      className="w-full h-28 object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/5 relative h-28">
                    <img
                      src={channel.logoUrl}
                      alt={channel.name}
                      className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/60 text-center px-2 leading-tight">{slot.show}</span>
                    </div>
                  </div>
                )}

                <div className="relative mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000"
                    style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(0,188,212,0.6)" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
        </div>
      </NeonBorder>
    </motion.div>
  );
}

function LiveAiringSection({ selectedDay }: { selectedDay: string }) {
  const [data, setData] = useState<LiveAiringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchLive() {
      try {
        const res = await fetch("/api/airing/live");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {}
      if (!cancelled) setLoading(false);
    }
    fetchLive();
    const interval = setInterval(fetchLive, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (loading || !data) {
    return (
      <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.08 }} className="mb-6">
        <NeonBorder glowColor="#ff00e6">
          <div className="rounded-[24px] p-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 rounded-full bg-fuchsia-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">
                  Live Airing Schedule
                </p>
                <p className="text-[10px] text-[var(--color-mute)]">
                  Fetching this week&apos;s Japanese broadcast data...
                </p>
              </div>
            </div>
          </div>
        </NeonBorder>
      </motion.div>
    );
  }

  const daySchedule = data.days[selectedDay] || [];
  if (daySchedule.length === 0) return null;

  return (
    <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.08 }} className="mb-6">
      <NeonBorder glowColor="#ff00e6">
        <div className="rounded-[24px] overflow-hidden">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-fuchsia-500 animate-ping opacity-30" />
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">
                    Live Airing Schedule
                  </h3>
                  <p className="text-[10px] text-[var(--color-mute)]">
                    {daySchedule.length} anime currently airing this week
                  </p>
                </div>
              </div>
              <span className="text-[9px] text-[var(--color-mute)]">
                Updated {new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="mb-3 rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 px-3 py-2">
              <p className="text-[10px] text-fuchsia-300/80 leading-relaxed">
                <span className="font-bold text-fuchsia-400">What is this?</span> These are anime currently airing in Japan this week with real-time broadcast data. Times shown are <span className="font-bold">Indian Standard Time (IST)</span>. This is separate from Indian TV channel schedules below — those show when shows broadcast on Indian TV channels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-line)]">
              {daySchedule.map((entry) => {
                const poster = entry.coverImage;
                const title = entry.englishTitle || entry.title;
                return (
                  <div
                    key={`${entry.id}-${entry.episode}`}
                    className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)]/50 px-3 py-2.5 hover:border-fuchsia-500/30 transition-colors"
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt={title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/5"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center shrink-0 border border-fuchsia-500/20">
                        <span className="text-[10px] font-bold text-fuchsia-400">EP</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate">
                        {title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono font-bold text-fuchsia-400">
                          {entry.airTime} IST
                        </span>
                        <span className="text-[9px] text-[var(--color-mute)]">
                          Ep {entry.episode}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </NeonBorder>
    </motion.div>
  );
}

function TimeSlotRow({
  slot,
  channelColor,
  showDescription,
  isStreaming,
  channelLogoUrl,
}: {
  slot: TimeSlot;
  channelColor: string;
  showDescription: boolean;
  isStreaming?: boolean;
  channelLogoUrl?: string;
}) {
  const isAlwaysAvailable = isStreaming && slot.start === "00:00" && slot.end === "00:00";
  const airing = !isAlwaysAvailable && isCurrentlyAiring(slot);
  const past = !isAlwaysAvailable && isPast(slot);

  return (
    <div
      id={`slot-${slot.start.replace(":", "-")}`}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
        airing
          ? "border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/5"
          : isAlwaysAvailable
          ? "border-[var(--color-line)] hover:border-white/10 hover:bg-white/[0.02]"
          : past
          ? "border-[var(--color-line)] opacity-50"
          : "border-[var(--color-line)] hover:border-white/10 hover:bg-white/[0.02]"
      }`}
    >
      <div className="w-20 shrink-0 text-right">
        {isAlwaysAvailable ? (
          <>
            <p className="text-[10px] font-bold text-emerald-400">24/7</p>
            <p className="text-[9px] font-mono text-[var(--color-mute)]">Always</p>
          </>
        ) : (
          <>
            <p className={`text-xs font-mono font-bold ${past ? "text-[var(--color-mute)] line-through" : "text-[var(--color-ink)]"}`}>
              {slot.start}
            </p>
            <p className="text-[9px] font-mono text-[var(--color-mute)]">
              {slot.end}
            </p>
          </>
        )}
      </div>

      <div
        className="w-[3px] self-stretch rounded-full shrink-0 transition-all duration-300"
        style={{
          background: airing
            ? `linear-gradient(to bottom, ${channelColor}, ${channelColor}66)`
            : isAlwaysAvailable
            ? `linear-gradient(to bottom, ${channelColor}66, ${channelColor}22)`
            : past
            ? "var(--color-line)"
            : `${channelColor}33`,
          boxShadow: airing ? `0 0 8px ${channelColor}44` : "none",
        }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {(getShowPoster(slot.show) || channelLogoUrl) && (airing || (!past && !isAlwaysAvailable)) && (
            <img
              src={getShowPoster(slot.show) || channelLogoUrl}
              alt={slot.show}
              className="w-8 h-8 rounded-md object-cover shrink-0 border border-white/10"
              loading="lazy"
            />
          )}
          <p
            className={`text-sm font-semibold truncate ${
              airing
                ? "text-cyan-400"
                : past
                ? "text-[var(--color-mute)] line-through decoration-1"
                : "text-[var(--color-ink)]"
            }`}
          >
            {slot.show}
          </p>
          {airing && (
            <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold text-cyan-400 shadow-[0_0_12px_rgba(0,188,212,0.15)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </span>
              LIVE
            </span>
          )}
          {isAlwaysAvailable && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              FREE
            </span>
          )}
        </div>
        {showDescription && slot.description && (
          <p className="text-[10px] text-[var(--color-mute)] truncate mt-0.5">
            {slot.description}
          </p>
        )}
      </div>

      <span className="text-[9px] text-[var(--color-mute)] shrink-0">
        {isAlwaysAvailable ? "∞" : slot.duration > 0 ? `${slot.duration}m` : "—"}
      </span>
    </div>
  );
}

function ChannelScheduleCard({
  channel,
  day,
  searchQuery,
  liveSchedule,
}: {
  channel: TvChannel;
  day: string;
  searchQuery: string;
  liveSchedule?: ChannelLiveSchedule;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const schedule = getScheduleForChannel(channel.id, day);
  const liveDaySlots = liveSchedule?.days[day];

  // Merge: use live data if available, fall back to hardcoded
  const effectiveSlots = useMemo(() => {
    if (liveDaySlots && liveDaySlots.length > 0) {
      return liveDaySlots.map((ls) => ({
        show: ls.show,
        start: ls.start,
        end: ls.end,
        duration: ls.duration,
        description: ls.description,
      }));
    }
    return schedule?.slots || [];
  }, [liveDaySlots, schedule]);

  const filteredSlots = useMemo(() => searchQuery
    ? effectiveSlots.filter((s) =>
        s.show.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : effectiveSlots, [effectiveSlots, searchQuery]);

  // Auto-scroll to currently airing slot within card (no page scroll)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || filteredSlots.length === 0) return;
    const timer = setTimeout(() => {
      const now = new Date();
      const curMin = now.getHours() * 60 + now.getMinutes();
      let targetIdx = filteredSlots.findIndex((s) => {
        const [sh, sm] = s.start.split(":").map(Number);
        const [eh, em] = s.end.split(":").map(Number);
        return curMin >= sh * 60 + sm && curMin < eh * 60 + em;
      });
      if (targetIdx === -1) {
        targetIdx = filteredSlots.findIndex((s) => {
          const [sh, sm] = s.start.split(":").map(Number);
          return sh * 60 + sm > curMin;
        });
        if (targetIdx === -1) targetIdx = filteredSlots.length - 1;
      }
      const el = container.querySelector(`#slot-${filteredSlots[targetIdx].start.replace(":", "-")}`) as HTMLElement;
      if (el && el.offsetTop !== undefined) {
        container.scrollTo({ top: el.offsetTop - container.offsetTop - 40, behavior: "smooth" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filteredSlots, day]);

  if (filteredSlots.length === 0) return null;

  const uniqueShows = [...new Set(filteredSlots.map((s) => s.show))];
  const showDesc = channel.type === "tv";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <NeonBorder glowColor={channel.color}>
        <div
          className="rounded-[24px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--channel-glow,0,188,212),0.1)]"
          style={{ "--channel-glow": channel.color.replace("#", "").match(/.{2}/g)?.map(h => parseInt(h, 16)).join(",") || "0,188,212" } as React.CSSProperties}
        >
          <div
            className="h-[2px]"
            style={{ background: `linear-gradient(to right, transparent, ${channel.color}, transparent)` }}
          />

          <div className="p-4">
            <div className="flex items-center gap-3 mb-1">
              <ChannelLogo channel={channel} size={48} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {channel.name}
                </p>
                {channel.dthNumbers && (
                  <p className="text-[9px] text-[var(--color-mute)] mt-0.5">
                    {channel.dthNumbers}
                  </p>
                )}
                {channel.type === "youtube" && channel.subscriberCount && (
                  <p className="text-[9px] text-[var(--color-mute)] mt-0.5">
                    {channel.subscriberCount} subscribers
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const container = scrollRef.current;
                    if (!container) return;
                    const airing = container.querySelector('[class*="border-cyan"]') as HTMLElement;
                    if (airing) container.scrollTo({ top: airing.offsetTop - container.offsetTop - 40, behavior: "smooth" });
                  }}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold text-cyan-400 hover:bg-cyan-400/20 transition-colors cursor-pointer"
                >
                  Now
                </button>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                  style={{ background: `${channel.color}18`, color: channel.color }}
                >
                  {uniqueShows.length} shows
                </span>
                <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-0.5 text-[9px] font-mono font-bold text-[var(--color-mute)]">
                  {filteredSlots.length} slots
                </span>
              </div>
            </div>

            <div ref={scrollRef} className="space-y-1 mt-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-line)]">
              {filteredSlots.map((slot, i) => (
                <TimeSlotRow
                  key={`${slot.start}-${slot.show}-${i}`}
                  slot={slot}
                  channelColor={channel.color}
                  showDescription={showDesc}
                  isStreaming={channel.type !== "tv"}
                  channelLogoUrl={channel.logoUrl}
                />
              ))}
            </div>
          </div>
        </div>
      </NeonBorder>
    </motion.div>
  );
}

function ChannelFilterTabs({
  selectedChannel,
  onSelect,
}: {
  selectedChannel: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <motion.div
      {...FADE_UP}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mb-6 space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
          TV Channels
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-line)]">
        <button
          onClick={() => onSelect(null)}
          className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0"
          style={{
            borderColor: !selectedChannel ? "var(--color-cyan)" : "var(--color-line)",
            background: !selectedChannel ? "rgba(0,188,212,0.13)" : "transparent",
            color: !selectedChannel ? "var(--color-cyan)" : "var(--color-mute)",
          }}
        >
          All
        </button>
        {TV_CHANNEL_IDS.map((id) => {
          const ch = TV_CHANNELS[id];
          if (!ch) return null;
          const active = selectedChannel === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(active ? null : id)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0"
              style={{
                borderColor: active ? ch.color : "var(--color-line)",
                background: active ? `${ch.color}22` : "transparent",
                color: active ? ch.color : "var(--color-mute)",
              }}
            >
              <div
                className="h-4 w-4 rounded flex items-center justify-center text-[7px] font-bold text-white"
                style={{ background: ch.color }}
              >
                {ch.shortName}
              </div>
              {ch.name}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <div className="h-4 w-1 rounded-full bg-[var(--color-amber)]" />
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
          Streaming Platforms
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-line)]">
        {YT_CHANNEL_IDS.map((id) => {
          const ch = TV_CHANNELS[id];
          if (!ch) return null;
          const active = selectedChannel === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(active ? null : id)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0"
              style={{
                borderColor: active ? ch.color : "var(--color-line)",
                background: active ? `${ch.color}22` : "transparent",
                color: active ? ch.color : "var(--color-mute)",
              }}
            >
              <div
                className="h-4 w-4 rounded flex items-center justify-center text-[7px] font-bold text-white"
                style={{ background: ch.color }}
              >
                {ch.shortName}
              </div>
              {ch.name}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function TvSchedulePage() {
  const [selectedDay, setSelectedDay] = useState<string>(getDayName());
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveData, setLiveData] = useState<LiveScheduleData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [refreshCount, setRefreshCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const days = useMemo(() => getNext7Days(), []);
  const channels = useMemo(() => Object.values(TV_CHANNELS), []);

  // Fetch live schedule data
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/tv-schedule/live");
      if (!res.ok) return;
      const data: LiveScheduleData = await res.json();
      setLiveData(data);
      setLastUpdated(new Date(data.updatedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }));
      setRefreshCount((c) => c + 1);
    } catch {}
  }, []);

  // Initial fetch + auto-refresh every 30 minutes
  useEffect(() => {
    fetchLiveData();
    intervalRef.current = setInterval(fetchLiveData, 30 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLiveData]);

  const filteredChannels = useMemo(() => {
    if (selectedChannel) {
      return channels.filter((ch) => ch.id === selectedChannel);
    }
    return channels;
  }, [selectedChannel, channels]);

  const orderedChannels = useMemo(() => {
    const tv = filteredChannels.filter((ch) => ch.type === "tv");
    const yt = filteredChannels.filter((ch) => ch.type === "youtube");
    return [...tv, ...yt];
  }, [filteredChannels]);

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />
        <motion.div className="absolute top-[15%] left-[5%] w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,255,224,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute top-[40%] right-[10%] w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,0,230,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute bottom-[15%] left-[35%] w-[250px] h-[250px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(112,0,255,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
          animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <motion.div {...FADE_UP} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-1 rounded-full bg-[var(--color-amber)]" />
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  TV Channel Schedule
                </h1>
              </div>
              <p className="text-sm text-[var(--color-mute)] ml-4">
                Daily broadcast schedule for Indian TV &amp; YouTube anime channels with exact show timings
              </p>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)]/50 px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] text-[var(--color-mute)]">
                  Live • Updated {lastUpdated}
                </span>
                <span className="text-[9px] text-[var(--color-mute)] opacity-50">
                  (refreshes every 30m)
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <NowPlayingBanner liveData={liveData} />

        <LiveAiringSection selectedDay={selectedDay} />

        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.1 }} className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-line)]">
            {days.map((day) => {
              const isToday = day === getDayName();
              const active = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shrink-0"
                  style={{
                    borderColor: active ? "var(--color-amber)" : "var(--color-line)",
                    background: active ? "rgba(245,158,11,0.1)" : "transparent",
                    color: active ? "#f59e0b" : "var(--color-mute)",
                  }}
                >
                  {isToday ? "Today" : day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mb-4"
        >
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-mute)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search shows across all channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] py-2 pl-9 pr-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)] hover:text-[var(--color-ink)] text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        <ChannelFilterTabs
          selectedChannel={selectedChannel}
          onSelect={setSelectedChannel}
        />

        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orderedChannels.map((ch) => {
              const liveSchedule = liveData?.channels.find(
                (lc) => lc.channelId === ch.id
              );
              return (
                <ChannelScheduleCard
                  key={ch.id}
                  channel={ch}
                  day={selectedDay}
                  searchQuery={searchQuery}
                  liveSchedule={liveSchedule}
                />
              );
            })}
          </div>
        </motion.div>
      </div>
      </div>
    </PageTransition>
  );
}

export default function TvSchedulePageWrapper() {
  return (
    <ErrorBoundary>
      <TvSchedulePage />
    </ErrorBoundary>
  );
}
