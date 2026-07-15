"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  waiting: { label: "Waiting", dot: "bg-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
  live: { label: "Live Now", dot: "bg-green-400", bg: "bg-green-500/10 border-green-500/20 text-green-400" },
  ended: { label: "Ended", dot: "bg-gray-500", bg: "bg-gray-500/10 border-gray-500/20 text-gray-400" },
};

export default function WatchPartyRoom({ partyId }: { partyId: string }) {
  const { data: session } = useSession();
  const [party, setParty] = useState<WatchPartyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [episodeInput, setEpisodeInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);

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
      const filtered = (data.activities || [])
        .filter((a: any) => a.type === "WATCH_PARTY" && a.message?.includes(`[PARTY:${partyId}]`))
        .map((a: any) => ({
          id: a.id,
          userId: a.userId,
          username: a.user?.username || "Unknown",
          message: a.message?.replace(`[PARTY:${partyId}] `, "") || "",
          type: a.type,
          createdAt: a.createdAt,
        }));
      setActivities(filtered.slice(0, 50));
    } catch {}
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

  async function handleSendMessage() {
    if (!chatInput.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/watch-party/${partyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput.trim() }),
      });
      setChatInput("");
      await fetchActivities();
    } catch {} finally {
      setSending(false);
    }
  }

  if (loading) return <Loader label="Loading party..." />;
  if (!party) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-lg font-semibold text-white/50 mb-2">Party not found</p>
      <Link href="/watch-party" className="text-sm text-[#00ffe0] hover:underline">Back to Watch Parties</Link>
    </div>
  );

  const userId = session?.user?.id;
  const isHost = userId === party.hostId;
  const isMember = userId ? party.members.some((m) => m.userId === userId) : false;
  const status = statusConfig[party.status] || statusConfig.ended;

  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <Link href="/watch-party" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All Parties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Media header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.6)] backdrop-blur-md overflow-hidden"
            >
              <div className="relative h-48 w-full">
                {party.mediaImage ? (
                  <Image src={party.mediaImage} alt={party.mediaTitle} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[rgba(0,255,224,0.05)] to-[rgba(255,0,230,0.05)]">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.95)] via-[rgba(10,10,15,0.4)] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${party.status === "live" ? "animate-pulse" : ""}`} />
                      {status.label}
                    </span>
                    {party.startTime && (
                      <span className="text-[11px] text-white/30">Started {timeAgo(party.startTime)}</span>
                    )}
                  </div>
                  <h1 className="font-display text-2xl font-bold text-white">{party.mediaTitle}</h1>
                  <p className="text-sm text-white/40 mt-1">Episode {party.episode}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-[rgba(255,255,255,0.06)] p-4 flex flex-wrap gap-2">
                {isHost && party.status === "waiting" && (
                  <button onClick={() => handleAction("start")}
                    className="rounded-[10px] bg-green-500/10 border border-green-500/20 px-5 py-2 text-xs font-bold text-green-400 hover:bg-green-500/20 hover:border-green-500/30 transition-all"
                  >
                    Start Party
                  </button>
                )}
                {isHost && party.status !== "ended" && (
                  <button onClick={() => handleAction("end")}
                    className="rounded-[10px] bg-red-500/10 border border-red-500/20 px-5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                  >
                    End Party
                  </button>
                )}
                {userId && !isHost && (
                  isMember ? (
                    <button onClick={handleLeave}
                      className="rounded-[10px] bg-red-500/10 border border-red-500/20 px-5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      Leave Party
                    </button>
                  ) : party.status !== "ended" ? (
                    <button onClick={handleJoin}
                      className="rounded-[10px] bg-gradient-to-r from-[rgba(0,255,224,0.12)] to-[rgba(0,255,224,0.06)] border border-[rgba(0,255,224,0.2)] px-5 py-2 text-xs font-bold text-[#00ffe0] hover:border-[rgba(0,255,224,0.4)] hover:shadow-[0_0_20px_-5px_rgba(0,255,224,0.25)] transition-all"
                    >
                      Join Party
                    </button>
                  ) : null
                )}
              </div>
            </motion.div>

            {/* Episode control */}
            {isHost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[16px] border border-[rgba(0,255,224,0.08)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
              >
                <h3 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Episode Control</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={episodeInput}
                    onChange={(e) => setEpisodeInput(e.target.value)}
                    placeholder={`Current: Episode ${party.episode}`}
                    className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] px-3 py-2.5 text-sm text-white outline-none focus:border-[rgba(0,255,224,0.3)] transition-colors placeholder:text-white/20"
                  />
                  <button onClick={handleEpisodeChange}
                    className="rounded-[10px] bg-gradient-to-r from-[rgba(0,255,224,0.12)] to-[rgba(0,255,224,0.06)] border border-[rgba(0,255,224,0.2)] px-5 py-2.5 text-xs font-bold text-[#00ffe0] hover:border-[rgba(0,255,224,0.4)] transition-all"
                  >
                    Update
                  </button>
                </div>
              </motion.div>
            )}

            {/* Streaming links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
            >
              <h3 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Watch Episode {party.episode}</h3>
              <p className="text-xs text-white/25 mb-3">Open the episode on your preferred platform, then sync with your party.</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Crunchyroll", color: "orange", url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(party.mediaTitle)}` },
                  { name: "Netflix", color: "red", url: `https://www.netflix.com/search?q=${encodeURIComponent(party.mediaTitle)}` },
                  { name: "Prime Video", color: "blue", url: `https://www.primevideo.com/search?phrase=${encodeURIComponent(party.mediaTitle)}` },
                  { name: "YouTube", color: "white", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(party.mediaTitle + " episode " + party.episode)}` },
                ].map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-[10px] bg-${platform.color}-500/10 border border-${platform.color}-500/20 px-4 py-2 text-xs font-bold text-${platform.color}-400 hover:bg-${platform.color}-500/20 transition-all`}
                  >
                    {platform.name}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Chat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
            >
              <h3 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Party Chat</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {activities.length === 0 ? (
                  <p className="text-[11px] text-white/20 text-center py-6">No messages yet. Say hello!</p>
                ) : (
                  activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-[#ff00e6] shrink-0">{a.username}</span>
                      <span className="text-[11px] text-white/40">{a.message}</span>
                    </div>
                  ))
                )}
              </div>
              {isMember && (
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] px-3 py-2 text-xs text-white outline-none focus:border-[rgba(255,0,230,0.3)] transition-colors placeholder:text-white/20"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || sending}
                    className="rounded-[10px] bg-[rgba(255,0,230,0.1)] border border-[rgba(255,0,230,0.2)] px-4 py-2 text-xs font-bold text-[#ff00e6] hover:bg-[rgba(255,0,230,0.2)] transition-all disabled:opacity-30"
                  >
                    Send
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Members */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
            >
              <h3 className="text-xs font-bold text-white/60 mb-4 uppercase tracking-wider flex items-center gap-2">
                Members
                <span className="rounded-full bg-[rgba(0,255,224,0.1)] px-2 py-0.5 text-[9px] font-bold text-[#00ffe0]">
                  {party.members.length}
                </span>
              </h3>
              <div className="space-y-3">
                {party.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
                      {m.user.avatar ? (
                        <Image src={m.user.avatar} alt="" fill className="object-cover" sizes="36px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-bold text-white/30">
                          {m.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white/80 truncate">{m.user.username}</p>
                      <p className="text-[10px] text-white/25 capitalize">{m.role}</p>
                    </div>
                    {m.role === "host" && (
                      <span className="text-[9px] font-bold text-[#ff00e6]">HOST</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Party info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
            >
              <h3 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Party Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/30">Created</span>
                  <span className="text-white/50">{timeAgo(party.createdAt)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/30">Host</span>
                  <span className="text-white/50">{party.host.username}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/30">Episode</span>
                  <span className="text-white/50">{party.episode}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/30">Status</span>
                  <span className={`font-bold ${status.bg.split(" ").pop()}`}>{status.label}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
