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

const typeColors: Record<string, string> = {
  watch: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  read: "bg-green-500/20 text-green-300 border-green-500/30",
  mixed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  custom: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
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

  const isJoined = !!participation;
  const pct = participation ? Math.min(Math.round((participation.progress / participation.goalCount) * 100), 100) : 0;

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

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  useEffect(() => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-medium ${typeColors[challenge.type] || typeColors.custom}`}>
                {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium border ${isPast ? "border-gray-500/30 text-gray-400" : isActive ? "border-green-500/30 text-green-300 bg-green-500/20" : "border-yellow-500/30 text-yellow-300 bg-yellow-500/20"}`}>
                <span className={`h-2 w-2 rounded-full ${isPast ? "bg-gray-400" : isActive ? "bg-green-400" : "bg-yellow-400"}`} />
                {isPast ? "Ended" : isActive ? "Active" : "Upcoming"}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{challenge.title}</h1>
            {challenge.description && (
              <p className="text-sm text-[var(--color-mute)]">{challenge.description}</p>
            )}
          </div>
          {challenge.coverImage && (
            <div className="relative h-24 w-40 rounded-lg overflow-hidden shrink-0 border border-[var(--color-line)]">
              <Image src={challenge.coverImage} alt="" fill className="object-cover" sizes="160px" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-mute)] mb-4">
          <span className="font-mono">
            {new Date(challenge.startDate).toLocaleDateString()} – {new Date(challenge.endDate).toLocaleDateString()}
          </span>
          <span>{challenge._count?.participants ?? 0} participants</span>
          {challenge.creator && (
            <span>Created by <span className="text-[var(--color-cyan)]">{challenge.creator.username}</span></span>
          )}
          {challenge.year && <span className="font-mono text-[var(--color-magenta)]">{challenge.year}</span>}
        </div>

        {challenge.rules && (
          <details className="mb-4">
            <summary className="text-sm text-[var(--color-cyan)] cursor-pointer font-medium">Rules</summary>
            <div className="mt-2 text-sm text-[var(--color-mute)] whitespace-pre-wrap bg-[var(--color-void)] rounded-lg p-4 border border-[var(--color-line)]">
              {challenge.rules}
            </div>
          </details>
        )}

        <div className="flex items-center gap-3">
          {!isPast && (
            isJoined ? (
              <button onClick={handleLeave} disabled={loading}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >Leave Challenge</button>
            ) : (
              <button onClick={handleJoin} disabled={loading}
                className="rounded-lg bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-5 py-2 text-sm font-bold text-black hover:opacity-90 transition-opacity"
              >{loading ? "Loading..." : "Join Challenge"}</button>
            )
          )}
          {isJoined && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/challenges/${challenge.id}`;
                navigator.clipboard?.writeText(url);
              }}
              className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-mute)] hover:bg-[var(--color-void)] transition-colors"
            >Share</button>
          )}
        </div>
      </div>

      {isJoined && participation && (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h2 className="text-lg font-bold mb-3">Your Progress</h2>
          <div className="mb-4">
            <ChallengeProgress
              progress={participation.progress}
              goal={participation.goalCount}
            />
          </div>

          <div className="mb-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime/manga to add to challenge..."
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
            />
            {searching && <p className="text-xs text-[var(--color-mute)] mt-1">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] max-h-60 overflow-y-auto">
                {searchResults.map((media: any) => (
                  <button
                    key={media.id}
                    onClick={() => handleAddEntry(media)}
                    disabled={loading}
                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors text-left border-b border-[var(--color-line)] last:border-0"
                  >
                    {media.coverImage?.large && (
                      <div className="relative h-12 w-8 rounded overflow-hidden shrink-0 border border-[var(--color-line)]">
                        <Image src={media.coverImage.large} alt="" fill className="object-cover" sizes="32px" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {media.title?.userPreferred || media.title?.english || media.title?.romaji || "Unknown"}
                      </p>
                      <p className="text-xs text-[var(--color-mute)]">
                        {media.type} {media.episodes && `• ${media.episodes} ep`} {media.chapters && `• ${media.chapters} ch`}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--color-cyan)] font-medium shrink-0">+ Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
        <div className="flex border-b border-[var(--color-line)]">
          <button
            onClick={() => setActiveTab("entries")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "entries" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >Entries</button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "leaderboard" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >Leaderboard</button>
        </div>

        <div className="p-6">
          {activeTab === "entries" && (
            <div>
              {isJoined ? (
                entries.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {entries.map((entry: any) => (
                      <div key={entry.id} className="relative group rounded-lg border border-[var(--color-line)] overflow-hidden bg-[var(--color-void)]">
                        {entry.mediaImage ? (
                          <div className="relative aspect-[3/4]">
                            <Image src={entry.mediaImage} alt={entry.mediaTitle} fill className="object-cover" sizes="150px" />
                          </div>
                        ) : (
                          <div className="aspect-[3/4] flex items-center justify-center bg-[var(--color-line)]">
                            <span className="text-xs text-[var(--color-mute)]">No Image</span>
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs font-medium truncate">{entry.mediaTitle}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-[var(--color-mute)]">{entry.mediaType}</span>
                            <button
                              onClick={() => handleRemoveEntry(entry.mediaId)}
                              className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-mute)] text-center py-8">
                    No entries yet. Search and add anime/manga above!
                  </p>
                )
              ) : (
                <p className="text-sm text-[var(--color-mute)] text-center py-8">
                  Join the challenge to add entries!
                </p>
              )}
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div>
              {leaderboard.length > 0 ? (
                <div className="space-y-1">
                  {leaderboard.map((entry: any, i: number) => (
                    <div key={entry.user.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[var(--color-void)] transition-colors">
                      <span className="w-6 text-center text-sm font-mono font-bold text-[var(--color-mute)]">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-[var(--color-line)] shrink-0">
                        {entry.user.avatar ? (
                          <Image src={entry.user.avatar} alt="" fill className="object-cover" sizes="32px" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-[var(--color-mute)]">
                            {entry.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{entry.user.username}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-mute)]">
                          <span>{entry.progress} / {entry.goalCount}</span>
                          {entry.completedAt && (
                            <span className="text-green-400">✓ Completed</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]"
                            style={{ width: `${Math.min(Math.round((entry.progress / entry.goalCount) * 100), 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-[var(--color-mute)] w-8 text-right">
                          {entry.goalCount > 0 ? Math.round((entry.progress / entry.goalCount) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-mute)] text-center py-8">
                  No participants yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
