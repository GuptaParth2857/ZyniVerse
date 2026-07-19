"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ChallengeProgress from "./ChallengeProgress";

interface ChallengeDetailProps {
  challenge: any;
  initialLeaderboard: any[];
  initialParticipation: any;
}

const typeConfig: Record<string, { label: string; gradient: string; icon: string }> = {
  watch: { label: "Watch", gradient: "from-blue-500 to-cyan-400", icon: "\u{1F3AC}" },
  read: { label: "Read", gradient: "from-green-500 to-emerald-400", icon: "\u{1F4DA}" },
  mixed: { label: "Mixed", gradient: "from-purple-500 to-violet-400", icon: "\u{2728}" },
  custom: { label: "Custom", gradient: "from-amber-500 to-yellow-400", icon: "\u{2699}\u{FE0F}" },
};

export default function ChallengeDetail({ challenge, initialLeaderboard, initialParticipation }: ChallengeDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [participation, setParticipation] = useState(initialParticipation);
  const [entries, setEntries] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [activeTab, setActiveTab] = useState<"entries" | "leaderboard">("entries");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const isJoined = !!participation;
  const pct = participation ? Math.min(Math.round((participation.progress / participation.goalCount) * 100), 100) : 0;
  const type = typeConfig[challenge.type] || typeConfig.custom;

  const fetchEntries = useCallback(async () => {
    if (!isJoined) return;
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/entries`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {}
  }, [challenge.id, isJoined]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/leaderboard?limit=50`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch {}
  }, [challenge.id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeTab === "leaderboard") fetchLeaderboard();
  }, [activeTab, fetchLeaderboard]);

  async function handleJoin() {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    try {
      await fetch(`/api/challenges/${challenge.id}/join`, { method: "POST" });
      const res = await fetch(`/api/challenges/${challenge.id}`);
      const data = await res.json();
      setParticipation(data.userParticipation);
      router.refresh();
    } catch {}
    setLoading(false);
  }

  async function handleLeave() {
    setLoading(true);
    try {
      await fetch(`/api/challenges/${challenge.id}/join`, { method: "DELETE" });
      setParticipation(null);
      setEntries([]);
      router.refresh();
    } catch {}
    setLoading(false);
  }

  async function handleAddEntry(media: any) {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: media.id,
          mediaTitle: media.title?.userPreferred || media.title?.english || media.title?.romaji || "Unknown",
          mediaImage: media.coverImage?.large,
          mediaType: media.type?.toLowerCase() === "manga" ? "manga" : "anime",
          episodeCount: media.episodes,
          chapterCount: media.chapters,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.progress) setParticipation((p: any) => ({ ...p, progress: data.progress.progress }));
        setSearchQuery("");
        setSearchResults([]);
        fetchEntries();
        fetchLeaderboard();
        router.refresh();
      }
    } catch {}
    setLoading(false);
  }

  async function handleRemoveEntry(mediaId: number) {
    setLoading(true);
    try {
      await fetch(`/api/challenges/${challenge.id}/entries`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      fetchEntries();
      fetchLeaderboard();
      router.refresh();
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!searchQuery.trim() || !isJoined) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/anilist/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch {}
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, isJoined]);

  const now = new Date();
  const isActive = now >= new Date(challenge.startDate) && now <= new Date(challenge.endDate);
  const isPast = now > new Date(challenge.endDate);
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="neon-premium rounded-xl">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${type.gradient} px-3 py-1 text-[11px] font-bold text-black shadow-lg`}>
                    <span>{type.icon}</span>
                    {type.label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${isPast ? "bg-white/5 text-gray-400 ring-1 ring-white/10" : isActive ? "bg-green-500/15 text-green-300 ring-1 ring-green-500/30" : "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isPast ? "bg-gray-400" : isActive ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" : "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"}`} />
                    {isPast ? "Ended" : isActive ? "Active Now" : "Upcoming"}
                  </span>
                  {challenge.year && (
                    <span className="inline-flex rounded-full bg-[var(--color-magenta)]/15 px-3 py-1 text-[11px] font-mono font-bold text-[var(--color-magenta)] ring-1 ring-[var(--color-magenta)]/30">
                      {challenge.year}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-display font-bold leading-tight">{challenge.title}</h1>
                {challenge.description && (
                  <p className="text-sm text-[var(--color-mute)] leading-relaxed">{challenge.description}</p>
                )}
              </div>
              {challenge.coverImage && (
                <div className="relative h-24 w-40 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/10 shadow-lg">
                  <Image src={challenge.coverImage} alt="" fill className="object-cover" sizes="160px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-mute)] mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(challenge.startDate).toLocaleDateString()} – {new Date(challenge.endDate).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {challenge._count?.participants ?? 0} participants
              </span>
              {challenge.creator && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  by <span className="text-[var(--color-cyan)] font-medium">{challenge.creator.username}</span>
                </span>
              )}
              {isActive && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-2.5 py-1.5 text-green-400 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                </span>
              )}
            </div>

            {challenge.rules && (
              <details className="mb-5">
                <summary className="text-sm text-[var(--color-cyan)] cursor-pointer font-medium inline-flex items-center gap-1.5 hover:text-[var(--color-magenta)] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  View Rules
                </summary>
                <div className="mt-3 text-sm text-[var(--color-mute)] whitespace-pre-wrap glass-panel p-4 leading-relaxed">
                  {challenge.rules}
                </div>
              </details>
            )}

            <div className="flex items-center gap-3">
              {!isPast && (
                isJoined ? (
                  <button onClick={handleLeave} disabled={loading}
                    className="rounded-lg border border-red-500/30 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                  >
                    {loading ? "Loading..." : "Leave Challenge"}
                  </button>
                ) : (
                  <button onClick={handleJoin} disabled={loading}
                    className="rounded-lg bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-cyan)]/20 transition-all"
                  >
                    {loading ? "Loading..." : "Join Challenge"}
                  </button>
                )
              )}
              {isJoined && (
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/challenges/${challenge.id}`;
                    navigator.clipboard?.writeText(url);
                    setShareToast(true);
                    setTimeout(() => setShareToast(false), 2000);
                  }}
                  className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-ink)] transition-all relative"
                >
                  {shareToast ? (
                    <span className="flex items-center gap-1.5 text-green-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      Share
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isJoined && participation && (
        <div className="neon-premium rounded-xl">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-magenta)]" />
                <h2 className="text-lg font-display font-bold">Your Progress</h2>
              </div>
              <div className="mb-5">
                <ChallengeProgress
                  progress={participation.progress}
                  goal={participation.goalCount}
                />
              </div>

              <div className="mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anime/manga to add to challenge..."
                    className="w-full glass-input pl-10 pr-4 py-3 text-sm"
                  />
                </div>
                {searching && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-3 w-3 rounded-full border-2 border-[var(--color-cyan)] border-t-transparent animate-spin" />
                    <span className="text-xs text-[var(--color-mute)]">Searching AniList...</span>
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 glass-panel overflow-hidden">
                    {searchResults.map((media: any) => (
                      <button
                        key={media.id}
                        onClick={() => handleAddEntry(media)}
                        disabled={loading}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 group/item"
                      >
                        {media.coverImage?.large && (
                          <div className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
                            <Image src={media.coverImage.large} alt="" fill className="object-cover" sizes="36px" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate group-hover/item:text-[var(--color-cyan)] transition-colors">
                            {media.title?.userPreferred || media.title?.english || media.title?.romaji || "Unknown"}
                          </p>
                          <p className="text-xs text-[var(--color-mute)]">
                            {media.type} {media.episodes && `\u2022 ${media.episodes} ep`} {media.chapters && `\u2022 ${media.chapters} ch`}
                          </p>
                        </div>
                        <span className="text-xs text-[var(--color-cyan)] font-bold shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">+ Add</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="neon-premium rounded-xl">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content">
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab("entries")}
              className={`flex-1 px-4 py-3.5 text-sm font-bold transition-all relative ${
                activeTab === "entries" ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Entries
                {entries.length > 0 && (
                  <span className="rounded-full bg-[var(--color-cyan)]/15 px-1.5 py-0.5 text-[9px] font-mono text-[var(--color-cyan)]">
                    {entries.length}
                  </span>
                )}
              </span>
              {activeTab === "entries" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex-1 px-4 py-3.5 text-sm font-bold transition-all relative ${
                activeTab === "leaderboard" ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Leaderboard
                {leaderboard.length > 0 && (
                  <span className="rounded-full bg-[var(--color-magenta)]/15 px-1.5 py-0.5 text-[9px] font-mono text-[var(--color-magenta)]">
                    {leaderboard.length}
                  </span>
                )}
              </span>
              {activeTab === "leaderboard" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)]" />
              )}
            </button>
          </div>

          <div className="p-6">
            {activeTab === "entries" && (
              <div>
                {isJoined ? (
                  entries.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {entries.map((entry: any) => (
                        <div key={entry.id} className="relative group rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/8 hover:ring-[var(--color-cyan)]/30 transition-all hover:shadow-lg hover:shadow-[var(--color-cyan)]/5">
                          {entry.mediaImage ? (
                            <div className="relative aspect-[3/4]">
                              <Image src={entry.mediaImage} alt={entry.mediaTitle} fill className="object-cover" sizes="150px" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <button
                                onClick={() => handleRemoveEntry(entry.mediaId)}
                                className="absolute bottom-2 left-2 right-2 rounded-lg bg-red-500/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="aspect-[3/4] flex items-center justify-center bg-white/5">
                              <span className="text-xs text-[var(--color-mute)]">No Image</span>
                            </div>
                          )}
                          <div className="p-2.5">
                            <p className="text-xs font-medium truncate">{entry.mediaTitle}</p>
                            <span className="text-[10px] text-[var(--color-mute)] capitalize">{entry.mediaType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-3xl mb-3">{'\u{1F3AD}'}</div>
                      <p className="text-sm text-[var(--color-mute)]">No entries yet. Search and add anime/manga above!</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="text-3xl mb-3">{'\u{1F446}'}</div>
                    <p className="text-sm text-[var(--color-mute)]">Join the challenge to add entries!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div>
                {leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((entry: any, i: number) => {
                      const entryPct = entry.goalCount > 0 ? Math.min(Math.round((entry.progress / entry.goalCount) * 100), 100) : 0;
                      const isTop3 = i < 3;
                      const rankColors = ["from-yellow-400 to-amber-500", "from-gray-300 to-gray-400", "from-amber-600 to-orange-500"];

                      return (
                        <div
                          key={entry.user.id}
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                            isTop3
                              ? `bg-gradient-to-r ${rankColors[i]}/5 hover:${rankColors[i]}/10 ring-1 ring-white/5`
                              : "hover:bg-white/5 ring-1 ring-transparent hover:ring-white/5"
                          }`}
                        >
                          <span className={`w-7 text-center text-sm font-mono font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-500" : "text-[var(--color-mute)]"}`}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                          </span>
                          <div className="relative h-9 w-9 rounded-full overflow-hidden bg-white/10 shrink-0 ring-1 ring-white/10">
                            {entry.user.avatar ? (
                              <Image src={entry.user.avatar} alt="" fill className="object-cover" sizes="36px" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-sm font-bold text-[var(--color-mute)]">
                                {entry.user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {isTop3 && (
                              <div className={`absolute inset-0 ring-2 ring-offset-1 ring-offset-transparent ${i === 0 ? "ring-yellow-400/40" : i === 1 ? "ring-gray-300/40" : "ring-amber-500/40"} rounded-full`} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-bold truncate ${isTop3 ? "text-[var(--color-ink)]" : ""}`}>
                              {entry.user.username}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[var(--color-mute)]">
                              <span>{entry.progress} / {entry.goalCount}</span>
                              {entry.completedAt && (
                                <span className="text-green-400 font-bold flex items-center gap-0.5">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${entryPct >= 100 ? "bg-gradient-to-r from-green-400 to-emerald-300 shadow-[0_0_8px_rgba(74,222,128,0.3)]" : "bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]"}`}
                                style={{ width: `${entryPct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-mono font-bold w-8 text-right ${entryPct >= 100 ? "text-green-400" : entryPct >= 50 ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)]"}`}>
                              {entryPct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-3xl mb-3">{'\u{1F3C6}'}</div>
                    <p className="text-sm text-[var(--color-mute)]">No participants yet. Be the first to join!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
