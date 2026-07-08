"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import type { WatchPartyData } from "@/lib/watch-party";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface ActivityEntry {
  id: string;
  userId: string;
  username: string;
  message: string;
  type: string;
  createdAt: string;
}

export default function WatchPartyRoom({ partyId }: { partyId: string }) {
  const { data: session } = useSession();
  const [party, setParty] = useState<WatchPartyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [episodeInput, setEpisodeInput] = useState("");

  const fetchParty = useCallback(async () => {
    try {
      const res = await fetch(`/api/watch-party/${partyId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setParty(data.party);
    } catch {
      setParty(null);
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/activity?limit=20`);
      const data = await res.json();
      const filtered = (data.activities || []).filter(
        (a: any) => a.type === "WATCH_PARTY" && a.message?.includes(`[PARTY:${partyId}]`)
      ).map((a: any) => ({
        id: a.id,
        userId: a.userId,
        username: a.user?.username || "Unknown",
        message: a.message?.replace(`[PARTY:${partyId}] `, "") || "",
        type: a.type,
        createdAt: a.createdAt,
      }));
      setActivities(filtered.slice(0, 50));
    } catch {
      // ignore
    }
  }, [partyId]);

  useEffect(() => {
    fetchParty();
    fetchActivities();
    const interval = setInterval(() => {
      fetchParty();
      fetchActivities();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchParty, fetchActivities]);

  async function handleJoin() {
    await fetch(`/api/watch-party/${partyId}/join`, { method: "POST" });
    await fetchParty();
  }

  async function handleLeave() {
    await fetch(`/api/watch-party/${partyId}/join`, { method: "DELETE" });
    await fetchParty();
  }

  async function handleAction(action: string) {
    await fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await fetchParty();
  }

  async function handleEpisodeChange() {
    const ep = parseInt(episodeInput);
    if (isNaN(ep) || ep < 1) return;
    await fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episode: ep }),
    });
    setEpisodeInput("");
    await fetchParty();
  }

  if (loading) return <Loader label="Loading party..." />;
  if (!party) return <div className="text-center py-16 text-[var(--color-mute)]">Party not found.</div>;

  const userId = session?.user?.id;
  const isHost = userId === party.hostId;
  const isMember = userId ? party.members.some((m) => m.userId === userId) : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Header */}
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 flex gap-4 items-start">
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--color-line)]">
              {party.mediaImage ? (
                <Image src={party.mediaImage} alt={party.mediaTitle} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--color-mute)]">No img</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-bold">{party.mediaTitle}</h1>
              <p className="text-sm text-[var(--color-mute)]">Episode {party.episode}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-mute)]">
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold capitalize ${
                  party.status === "live" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                  party.status === "waiting" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                  "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }`}>{party.status}</span>
                {party.startTime && <span>Started {timeAgo(party.startTime)}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {isHost && party.status === "waiting" && (
                  <button onClick={() => handleAction("start")}
                    className="rounded-lg bg-green-500/20 border border-green-500/30 px-3 py-1 text-xs font-semibold text-green-400 hover:bg-green-500/30"
                  >Start Party</button>
                )}
                {isHost && party.status !== "ended" && (
                  <button onClick={() => handleAction("end")}
                    className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/30"
                  >End Party</button>
                )}
              </div>
            </div>
          </div>

          {/* Episode control (host only) */}
          {isHost && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <h3 className="text-sm font-semibold mb-2">Episode Control</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={episodeInput}
                  onChange={(e) => setEpisodeInput(e.target.value)}
                  placeholder={`Current: Episode ${party.episode}`}
                  className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                />
                <button onClick={handleEpisodeChange}
                  className="rounded-lg bg-[var(--color-cyan)]/20 border border-[var(--color-cyan)]/30 px-4 py-2 text-xs font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/30"
                >Update</button>
              </div>
            </div>
          )}

          {/* Streaming links */}
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <h3 className="text-sm font-semibold mb-2">Watch Episode {party.episode}</h3>
            <p className="text-xs text-[var(--color-mute)]">Streaming links will appear here based on available platforms.</p>
            <div className="mt-3 flex gap-2">
              <a
                href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(party.mediaTitle)}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-lg bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 text-xs font-semibold text-orange-400 hover:bg-orange-500/30"
              >Crunchyroll</a>
              <a
                href={`https://www.netflix.com/search?q=${encodeURIComponent(party.mediaTitle)}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30"
              >Netflix</a>
              <a
                href={`https://www.primevideo.com/search?phrase=${encodeURIComponent(party.mediaTitle)}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/30"
              >Prime Video</a>
            </div>
          </div>

          {/* Join/Leave */}
          {userId && !isHost && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
              {isMember ? (
                <button onClick={handleLeave}
                  className="rounded-lg bg-red-500/20 border border-red-500/30 px-6 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/30"
                >Leave Party</button>
              ) : party.status !== "ended" ? (
                <button onClick={handleJoin}
                  className="rounded-lg bg-[var(--color-magenta)]/20 border border-[var(--color-magenta)]/30 px-6 py-2 text-sm font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30"
                >Join Party</button>
              ) : null}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Members */}
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              Members
              <span className="text-[10px] text-[var(--color-mute)] font-mono">({party.members.length})</span>
            </h3>
            <div className="space-y-2">
              {party.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[var(--color-void)] border border-[var(--color-line)]">
                    {m.user.avatar ? (
                      <Image src={m.user.avatar} alt="" fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--color-mute)]">
                        {m.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{m.user.username}</p>
                    <p className="text-[9px] text-[var(--color-mute)] capitalize">{m.role}</p>
                  </div>
                  {m.role === "host" && (
                    <span className="text-[9px] text-[var(--color-cyan)] font-semibold">Host</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <h3 className="text-sm font-semibold mb-3">Activity</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-[10px] text-[var(--color-mute)] text-center py-4">No activity yet.</p>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="text-[10px] text-[var(--color-mute)]">
                    <span className="font-semibold text-[var(--color-ink)]">{a.username}</span> {a.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
