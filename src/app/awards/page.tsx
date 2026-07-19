"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { UPCOMING_AWARDS, type UpcomingAward } from "@/lib/awards-data";

interface AwardEntry {
  year: number;
  category: string;
  winner: string;
  malId: number;
  anilistId?: number;
  image?: string | null;
  platform: string;
  type: "anime" | "manga" | "live-action" | "character" | "music";
}

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  anime: { label: "Anime", icon: "🎬", color: "from-purple-500 to-indigo-600" },
  manga: { label: "Manga", icon: "📖", color: "from-pink-500 to-rose-600" },
  "live-action": { label: "Live Action", icon: "🎥", color: "from-red-500 to-orange-600" },
  character: { label: "Character / Voice", icon: "👤", color: "from-amber-500 to-yellow-600" },
  music: { label: "Music / OST", icon: "🎵", color: "from-cyan-500 to-teal-600" },
};

const PLATFORM_COLORS: Record<string, string> = {
  Crunchyroll: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Anime Trending": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  MyAnimeList: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Anime News Network": "bg-green-500/20 text-green-300 border-green-500/30",
  Newtype: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Tsugi ni Kuru Manga": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "Japan Academy Prize": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Saturn Awards": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  HIDIVE: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "Anime Awards": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "AniList Community": "bg-sky-500/20 text-sky-300 border-sky-500/30",
};

const GRADIENTS = [
  "from-purple-600 to-indigo-800",
  "from-pink-600 to-rose-800",
  "from-cyan-600 to-blue-800",
  "from-amber-600 to-orange-800",
  "from-emerald-600 to-teal-800",
  "from-red-600 to-pink-800",
  "from-violet-600 to-purple-800",
  "from-yellow-600 to-amber-800",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function getCountdown(dateStr: string): { days: number; hours: number; minutes: number; expired: boolean } {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, expired: false };
}

function NeonBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[20px]">
      <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
            animation: "spin 6s linear infinite",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-[1.5px] rounded-[18.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function UpcomingAwardCard({ award }: { award: UpcomingAward }) {
  const [countdown, setCountdown] = useState(getCountdown(award.date));

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown(award.date)), 60000);
    return () => clearInterval(timer);
  }, [award.date]);

  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      dot: "bg-emerald-400",
      glow: "shadow-[0_0_40px_-12px_rgba(0,255,224,0.25)]",
      border: "hover:border-emerald-500/40",
      gradient: "from-emerald-500 to-teal-600",
    },
    live: {
      label: "Live Now!",
      color: "bg-red-500/15 text-red-300 border-red-500/30",
      dot: "bg-red-400 animate-pulse",
      glow: "shadow-[0_0_40px_-12px_rgba(255,0,100,0.3)]",
      border: "hover:border-red-500/40",
      gradient: "from-red-500 to-pink-600",
    },
    completed: {
      label: "Completed",
      color: "bg-gray-500/10 text-gray-400 border-gray-600/30",
      dot: "bg-gray-500",
      glow: "",
      border: "hover:border-gray-500/40",
      gradient: "from-gray-500 to-gray-600",
    },
  };

  const status = award.status === "live" ? statusConfig.live : countdown.expired ? statusConfig.completed : statusConfig.upcoming;
  const formattedDate = new Date(award.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`min-w-[300px] max-w-[340px] flex-shrink-0 ${status.glow}`}
    >
      <NeonBorder>
        <div className={`relative rounded-[20px] p-5 flex flex-col h-full bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-sm ${status.border} transition-all duration-300 group`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className="text-[10px] font-medium text-[rgba(255,255,255,0.25)] uppercase tracking-[0.15em]">
              {award.category}
            </span>
          </div>

          {/* Title + Date */}
          <h3 className="text-white font-bold text-base mb-1.5 leading-tight">{award.name}</h3>
          <p className="text-[rgba(255,255,255,0.35)] text-xs mb-4">{formattedDate} · {award.location}</p>

          {/* Countdown */}
          {!countdown.expired && award.status !== "live" && (
            <div className="flex gap-3 mb-4 p-3 rounded-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
              {[
                { value: countdown.days, label: "days" },
                { value: countdown.hours, label: "hrs" },
                { value: countdown.minutes, label: "min" },
              ].map((item) => (
                <div key={item.label} className="flex-1 text-center">
                  <span className="text-white font-mono text-xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    {String(item.value).padStart(2, "0")}
                  </span>
                  <span className="text-[rgba(255,255,255,0.25)] text-[10px] block mt-0.5 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-[rgba(255,255,255,0.4)] text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
            {award.description}
          </p>

          {/* CTA */}
          <a
            href={award.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full rounded-[12px] bg-gradient-to-r ${status.gradient} px-4 py-2.5 text-center text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] active:scale-[0.98]`}
          >
            Visit Official Site →
          </a>
        </div>
      </NeonBorder>
    </motion.div>
  );
}

function AwardCard({ award, index }: { award: AwardEntry; index: number }) {
  const typeInfo = TYPE_LABELS[award.type] || { label: award.type, icon: "🏅", color: "from-gray-500 to-gray-600" };

  return (
    <motion.div
      key={`${award.year}-${award.category}-${award.platform}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all group"
    >
      {/* Poster */}
      <div className="relative h-52 overflow-hidden">
        {award.image ? (
          <img
            src={award.image}
            alt={award.winner}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(award.winner)} flex items-center justify-center`}>
            <span className="text-5xl font-black text-white/20 select-none">{award.winner.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />
        <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${typeInfo.color} text-white shadow-lg`}>
          {typeInfo.icon} {typeInfo.label}
        </span>
        <span className="absolute top-3 right-3 text-xs font-mono text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">{award.year}</span>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg line-clamp-2">
            {award.winner}
          </h3>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-gray-400 text-sm mb-3">{award.category}</p>
        <Link
          href={`/search?q=${encodeURIComponent(award.winner)}`}
          className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Search on ZyniVerse
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </motion.div>
  );
}

function CommunityPicks({ currentYear }: { currentYear: number }) {
  const [picks, setPicks] = useState<{ category: string; title: string; emoji: string; winner: { title: string; votes: number } | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/zyni-awards/${currentYear}`)
      .then((r) => r.json())
      .then((d) => {
        const awards = (d.awards || []).filter((a: { nominees: { votes: number }[] }) => a.nominees.length > 0);
        const mapped = awards.map((a: { category: string; title: string; nominees: { title: string; votes: number }[] }) => {
          const sorted = [...a.nominees].sort((x: { votes: number }, y: { votes: number }) => y.votes - x.votes);
          return {
            category: a.category,
            title: a.title,
            emoji: CATEGORY_EMOJIS[a.category] || "🏆",
            winner: sorted[0] || null,
          };
        });
        setPicks(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentYear]);

  if (loading || picks.length === 0) return null;

  return (
    <div className="mb-14">
      <div className="text-center mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff00e6] mb-2"
        >
          Community Voice
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#ff00e6] via-[#7000ff] to-[#00ffe0] bg-clip-text text-transparent"
        >
          ZyniVerse Community Picks
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-[rgba(255,255,255,0.35)] text-sm"
        >
          What our community thinks is the best of {currentYear}
        </motion.p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {picks.slice(0, 6).map((pick, i) => (
          <motion.div
            key={pick.category}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            className="rounded-[16px] bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.06)] p-4 hover:border-[rgba(255,255,255,0.12)] transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{pick.emoji}</span>
              <span className="text-[11px] text-[rgba(255,255,255,0.35)] uppercase tracking-wider font-medium">{pick.title}</span>
            </div>
            {pick.winner ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-10 rounded-lg bg-gradient-to-br from-[#7000ff]/30 to-[#ff00e6]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#00ffe0]">#{1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{pick.winner.title}</p>
                  <p className="text-[rgba(255,255,255,0.25)] text-[10px] font-mono">{pick.winner.votes} votes</p>
                </div>
              </div>
            ) : (
              <p className="text-[rgba(255,255,255,0.15)] text-xs">No votes yet</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href={`/awards/nominees/${currentYear}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[14px] bg-gradient-to-r from-[#ff00e6] to-[#7000ff] text-white text-sm font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-8px_rgba(255,0,230,0.4)] active:scale-[0.98]"
        >
          Vote Now
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

const CATEGORY_EMOJIS: Record<string, string> = {
  ANIME_OF_YEAR: "🏆", BEST_ACTION: "⚔️", BEST_ROMANCE: "💕", BEST_COMEDY: "😂",
  BEST_FANTASY: "🧙", BEST_DRAMA: "🎭", BEST_ANIMATION: "🎨", BEST_NEW_SERIES: "✨",
  BEST_SCORE: "🎵", BEST_VILLAIN: "😈", BEST_CHARACTER: "👤", BEST_OPENING: "🎶",
  BEST_FILM: "🎬", BEST_TV_ANIME: "📺", BEST_CONTINUING: "🔄", BEST_SLICE_OF_LIFE: "🌸",
  BEST_DIRECTOR: "🎥", BEST_CHARACTER_DESIGN: "✏️", BEST_ENDING: "🎵", BEST_SOUNDTRACK: "🎶",
  BEST_BOY: "👦", BEST_GIRL: "👧", BEST_COUPLE: "💑", BEST_VA: "🎤",
  BEST_MANGA: "📖", BEST_ORIGINAL: "💎", BEST_ISEKAI: "🌀", BEST_BACKGROUND_ART: "🏔️",
};

const FilterButton = ({ active, onClick, children, className = "" }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
      active
        ? "bg-white text-gray-900 shadow-lg shadow-white/10"
        : `bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 ${className}`
    }`}
  >
    {children}
  </button>
);

export default function AwardsPage() {
  const [allAwards, setAllAwards] = useState<AwardEntry[]>([]);
  const [allYears, setAllYears] = useState<number[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<string[]>([]);
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/awards")
      .then((r) => r.json())
      .then((data) => {
        setAllAwards(data.awards || []);
        setAllYears(data.years || []);
        setAllPlatforms(data.platforms || []);
        setAllTypes(data.types || []);
        setSource(data.source || "");
        setLastUpdated(new Date());
      })
      .catch(() => setAllAwards([]))
      .finally(() => setLoading(false));
  }, []);

  const awards = useMemo(() => {
    let result = allAwards;
    if (selectedYear !== null) result = result.filter((a) => a.year === selectedYear);
    if (selectedPlatform !== null) result = result.filter((a) => a.platform === selectedPlatform);
    if (selectedType !== null) result = result.filter((a) => a.type === selectedType);
    return result;
  }, [allAwards, selectedYear, selectedPlatform, selectedType]);

  const years = allYears;
  const platforms = allPlatforms;
  const types = allTypes;

  const groupByPlatform = (items: AwardEntry[]) => {
    const grouped: Record<string, AwardEntry[]> = {};
    items.forEach((a) => {
      if (!grouped[a.platform]) grouped[a.platform] = [];
      grouped[a.platform].push(a);
    });
    return grouped;
  };

  const grouped = groupByPlatform(awards);
  const activeFilterCount = (selectedYear !== null ? 1 : 0) + (selectedPlatform !== null ? 1 : 0) + (selectedType !== null ? 1 : 0);

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,224,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[40%] right-[10%] w-[280px] h-[280px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,0,230,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[15%] left-[35%] w-[250px] h-[250px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(112,0,255,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          <nav className="text-sm mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>Home</Link></li>
              <li style={{ color: "rgba(255,255,255,0.15)" }}>/</li>
              <li className="text-white">Anime Awards</li>
            </ol>
          </nav>

          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Anime Awards Hub</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The ultimate awards tracker — every platform, every category, every year.
            </p>
            {lastUpdated && (
              <p className="text-gray-500 text-xs mt-2">Last updated: {lastUpdated.toLocaleTimeString()} · Source: {source}</p>
            )}
          </div>

          {/* UPCOMING AWARDS SECTION */}
          {(() => {
            const upcoming = UPCOMING_AWARDS.filter((a) => a.status === "upcoming" || a.status === "live");
            const recentCompleted = UPCOMING_AWARDS.filter((a) => a.status === "completed").slice(0, 2);
            const display = [...upcoming, ...recentCompleted];
            if (display.length === 0) return null;
            return (
              <div className="mb-14">
                <div className="text-center mb-8">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ffe0] mb-2"
                  >
                    Schedule
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent"
                  >
                    Awards Calendar
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-[rgba(255,255,255,0.35)] text-sm"
                  >
                    Countdown to the biggest anime award ceremonies
                  </motion.p>
                </div>
                <div
                  className="flex gap-5 overflow-x-auto pb-6 px-2 scrollbar-hide"
                  style={{ scrollbarWidth: "none", maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)" }}
                >
                  {display.map((award) => (
                    <UpcomingAwardCard key={`${award.name}-${award.year}`} award={award} />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* COMMUNITY PICKS SECTION */}
          <CommunityPicks currentYear={new Date().getFullYear()} />

          {loading ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 justify-center">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-9 w-24 bg-gray-800 rounded-full animate-pulse" />)}</div>
              <div className="flex flex-wrap gap-2 justify-center">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-9 w-28 bg-gray-800 rounded-full animate-pulse" />)}</div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-gray-800/50 rounded-2xl h-80 animate-pulse" />)}</div>
            </div>
          ) : (
            <>
              {/* TYPE FILTER */}
              <div className="mb-3 flex flex-wrap gap-2 justify-center">
                <FilterButton active={selectedType === null} onClick={() => setSelectedType(null)}>All Types</FilterButton>
                {types.map((t) => {
                  const info = TYPE_LABELS[t] || { label: t, icon: "🏅", color: "from-gray-500 to-gray-600" };
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedType(selectedType === t ? null : t)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                        selectedType === t
                          ? `bg-gradient-to-r ${info.color} text-white shadow-lg`
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                      }`}
                    >
                      {info.icon} {info.label}
                    </button>
                  );
                })}
              </div>

              {/* PLATFORM FILTER */}
              <div className="mb-3 flex flex-wrap gap-2 justify-center">
                <FilterButton active={selectedPlatform === null} onClick={() => setSelectedPlatform(null)}>All Platforms</FilterButton>
                {platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(selectedPlatform === p ? null : p)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      selectedPlatform === p
                        ? `${PLATFORM_COLORS[p] || "bg-gray-700 text-white"} border shadow-lg`
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* YEAR FILTER */}
              <div className="mb-8 flex flex-wrap gap-2 justify-center">
                <FilterButton active={selectedYear === null} onClick={() => setSelectedYear(null)}>All Years</FilterButton>
                {years.map((y) => (
                  <FilterButton key={y} active={selectedYear === y} onClick={() => setSelectedYear(selectedYear === y ? null : y)}>{y}</FilterButton>
                ))}
              </div>

              {/* RESULTS COUNT */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-400 text-sm">
                    Showing <span className="text-white font-semibold">{awards.length}</span> awards
                    {selectedYear !== null && <> from <span className="text-white">{selectedYear}</span></>}
                    {selectedPlatform !== null && <> on <span className="text-white">{selectedPlatform}</span></>}
                    {selectedType !== null && <> in <span className="text-white">{TYPE_LABELS[selectedType]?.label || selectedType}</span></>}
                  </p>
                  <button
                    onClick={() => { setSelectedYear(null); setSelectedPlatform(null); setSelectedType(null); }}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* RESULTS */}
              {awards.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">No awards found for this selection.</p>
                  <button onClick={() => { setSelectedYear(null); setSelectedPlatform(null); setSelectedType(null); }} className="mt-4 text-purple-400 hover:text-purple-300 text-sm cursor-pointer">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  {Object.entries(grouped).map(([platform, platformAwards]) => (
                    <div key={platform}>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border ${PLATFORM_COLORS[platform] || "bg-gray-700 text-white border-gray-600"}`}>
                          {platform}
                        </span>
                        <span className="text-gray-500 text-sm">{platformAwards.length} awards</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                          {platformAwards.map((award, i) => (
                            <AwardCard key={`${platform}-${award.year}-${award.category}-${i}`} award={award} index={i} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-20 text-center border-t border-[rgba(255,255,255,0.06)] pt-10">
            <h2 className="text-2xl font-bold text-white mb-4">About ZyniVerse Awards</h2>
            <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              ZyniVerse tracks awards from every major platform — Crunchyroll, Anime Trending, MyAnimeList, Anime News Network, Newtype, and more.
              Filter by year, platform, or type to find exactly what you need.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <a href="https://www.crunchyroll.com/news/latest/2025/3/anime-awards-2025-winners" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-orange-500/15 text-orange-300 rounded-xl text-sm border border-orange-500/20 hover:bg-orange-500/25 hover:border-orange-500/30 transition-all">Crunchyroll Awards 2025</a>
              <a href="https://www.anime-trending.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-cyan-500/15 text-cyan-300 rounded-xl text-sm border border-cyan-500/20 hover:bg-cyan-500/25 hover:border-cyan-500/30 transition-all">Anime Trending</a>
              <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500/15 text-blue-300 rounded-xl text-sm border border-blue-500/20 hover:bg-blue-500/25 hover:border-blue-500/30 transition-all">MyAnimeList</a>
              <a href="https://www.animenewsnetwork.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-500/15 text-green-300 rounded-xl text-sm border border-green-500/20 hover:bg-green-500/25 hover:border-green-500/30 transition-all">Anime News Network</a>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-10 text-center font-mono text-[9px] tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.06)" }}
          >
            ZYNIVERSE • v2.4.1 • ENCRYPTED
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
