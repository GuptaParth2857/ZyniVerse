"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Loader from "@/components/Loader";
import PartyVideoPlayer from "@/components/PartyVideoPlayer";
import PartyChat from "@/components/PartyChat";
import FloatingReactions from "@/components/FloatingReactions";
import InviteModal from "@/components/InviteModal";
import ScreenShare from "@/components/ScreenShare";
import { useWatchPartySocket } from "@/hooks/useWatchPartySocket";
import type { ChatMessage, SyncState } from "@/lib/socket";
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

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  waiting: { label: "Waiting", dot: "bg-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
  live: { label: "Live Now", dot: "bg-green-400", bg: "bg-green-500/10 border-green-500/20 text-green-400" },
  ended: { label: "Ended", dot: "bg-gray-500", bg: "bg-gray-500/10 border-gray-500/20 text-gray-400" },
};

interface ActivityResponse {
  id: string;
  userId: string;
  type: string;
  message: string;
  user?: { username: string };
  createdAt: string;
}

export default function WatchPartyRoom({ partyId }: { partyId: string }) {
  const { data: session } = useSession();
  const [party, setParty] = useState<WatchPartyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [episodeInput, setEpisodeInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPos, setPlaybackPos] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [viewMode, setViewMode] = useState<"video" | "screen">("video");
  const videoFileRef = useRef<HTMLInputElement>(null);

  const fetchParty = useCallback(async () => {
    try {
      const res = await fetch(`/api/watch-party/${partyId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setParty(data.party);
      setIsPlaying(data.party.isPlaying);
      setPlaybackPos(data.party.playbackPos);
    } catch {
      setParty(null);
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/activity?limit=50`);
      const data = await res.json();
      const msgs = (data.activities || [])
        .filter((a: ActivityResponse) => a.type === "WATCH_PARTY" && a.message?.includes(`[PARTY:${partyId}]`))
        .map((a: ActivityResponse) => ({
          id: a.id,
          userId: a.userId,
          username: a.user?.username || "Unknown",
          message: a.message?.replace(`[PARTY:${partyId}] `, "") || "",
          type: "CHAT",
          createdAt: a.createdAt,
        }))
        .reverse();
      setChatMessages(msgs);
    } catch {}
  }, [partyId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchParty();
    fetchMessages();
  }, [fetchParty, fetchMessages]);

  const userId = session?.user?.id;
  const isHost = userId === party?.hostId;
  const isMember = userId ? party?.members.some((m) => m.userId === userId) : false;
  const status = statusConfig[party?.status || "waiting"] || statusConfig.waiting;

  const handleSyncState = useCallback((state: SyncState) => {
    setIsPlaying(state.isPlaying);
    setPlaybackPos(state.playbackPos);
  }, []);

  const handleNewMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const handleEpisodeChange = useCallback((data: { episode: number }) => {
    setParty((prev) => prev ? { ...prev, episode: data.episode } : prev);
  }, []);

  const handlePlay = useCallback((data: { playbackPos: number; timestamp: number }) => {
    setIsPlaying(true);
    setPlaybackPos(data.playbackPos);
  }, []);

  const handlePause = useCallback((data: { playbackPos: number; timestamp: number }) => {
    setIsPlaying(false);
    setPlaybackPos(data.playbackPos);
  }, []);

  const handleSeek = useCallback((data: { playbackPos: number; timestamp: number }) => {
    setPlaybackPos(data.playbackPos);
  }, []);

  const handleScreenShareStarted = useCallback(() => {
    setScreenShareActive(true);
  }, []);

  const handleScreenShareStopped = useCallback(() => {
    setScreenShareActive(false);
  }, []);

  const {
    connected, socketAvailable, socket,
    emitHostSync, emitHostPlay, emitHostPause, emitHostSeek,
    emitHostEpisode, emitChatMessage, emitReaction, emitVideoSource,
  } = useWatchPartySocket({
    partyId,
    user: userId ? { id: userId, username: session?.user?.name || "User", avatar: null } : null,
    isHost: !!isHost,
    onSyncState: handleSyncState,
    onNewMessage: handleNewMessage,
    onEpisodeChange: handleEpisodeChange,
    onPlay: handlePlay,
    onPause: handlePause,
    onSeek: handleSeek,
    onScreenShareStarted: handleScreenShareStarted,
    onScreenShareStopped: handleScreenShareStopped,
  });

  async function handleAction(action: string) {
    await fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (action === "start") emitHostEpisode(party?.episode || 1);
    await fetchParty();
  }

  async function handleEpisodeUpdate() {
    const ep = parseInt(episodeInput);
    if (isNaN(ep) || ep < 1) return;
    await fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episode: ep }),
    });
    emitHostEpisode(ep);
    setEpisodeInput("");
    await fetchParty();
  }

  async function handleSetVideo() {
    if (!videoUrlInput.trim()) return;
    const url = videoUrlInput.trim();
    let type = "external";
    if (url.match(/\.mp4($|\?)/)) type = "mp4";
    else if (url.match(/\.m3u8($|\?)/)) type = "hls";
    else if (url.match(/\.webm($|\?)/)) type = "webm";
    else if (url.match(/youtube\.com|youtu\.be/)) type = "youtube";
    else if (url.match(/vimeo\.com/)) type = "vimeo";
    else if (url.match(/bilibili\.com|b23\.tv/)) type = "bilibili";
    else if (url.match(/dailymotion\.com|dai\.ly/)) type = "dailymotion";
    else if (url.match(/twitch\.tv/)) type = "twitch";

    await fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl: url, videoType: type }),
    });
    emitVideoSource(url, type);
    setVideoUrlInput("");
    await fetchParty();
  }

  async function handleVideoUpload(file: File) {
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid type. Use MP4, WebM, OGG, or MOV.");
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setUploadError("File too large. Max 200MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("partyId", partyId);

      const xhr = new XMLHttpRequest();
      const result = await new Promise<{ url: string; videoType: string }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(data);
            else reject(new Error(data.error || "Upload failed"));
          } catch {
            reject(new Error("Upload failed"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("POST", "/api/upload/video");
        xhr.send(formData);
      });

      await fetch(`/api/watch-party/${partyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: result.url, videoType: result.videoType }),
      });
      emitVideoSource(result.url, result.videoType);
      await fetchParty();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleVideoUpload(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleVideoUpload(file);
    e.target.value = "";
  }

  async function handleJoin() {
    await fetch(`/api/watch-party/${partyId}/join`, { method: "POST" });
    await fetchParty();
  }

  async function handleLeave() {
    await fetch(`/api/watch-party/${partyId}/join`, { method: "DELETE" });
    await fetchParty();
  }

  function handleVideoPlay(pos: number) {
    setIsPlaying(true);
    emitHostPlay(pos);
    fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPlaying: true, playbackPos: pos }),
    });
  }

  function handleVideoPause(pos: number) {
    setIsPlaying(false);
    emitHostPause(pos);
    fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPlaying: false, playbackPos: pos }),
    });
  }

  function handleVideoSeek(pos: number) {
    setPlaybackPos(pos);
    emitHostSeek(pos);
    fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playbackPos: pos }),
    });
  }

  function handleVideoSync(playing: boolean, pos: number) {
    emitHostSync(playing, pos, party?.episode || 1);
  }

  function handleChatSend(message: string) {
    emitChatMessage(message);
    fetch(`/api/watch-party/${partyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      userId: userId || "",
      username: session?.user?.name || "You",
      message,
      type: "CHAT",
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, optimistic]);
  }

  function handleReact(emoji: string) {
    emitReaction(emoji);
  }

  if (loading) return <Loader label="Loading party..." />;
  if (!party) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-lg font-semibold text-white/50 mb-2">Party not found</p>
      <Link href="/watch-party" className="text-sm text-[#00ffe0] hover:underline">Back to Watch Parties</Link>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/watch-party" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Parties
          </Link>
          <div className="flex items-center gap-3">
            {socketAvailable && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${connected ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
                {connected ? "LIVE SYNC" : "CONNECTING"}
              </span>
            )}
            {isMember && (
              <button onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-[rgba(0,255,224,0.1)] border border-[rgba(0,255,224,0.2)] px-3 py-1.5 text-[10px] font-bold text-[#00ffe0] hover:bg-[rgba(0,255,224,0.2)] transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Invite
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* View mode toggle */}
            <div className="flex gap-1 p-1 rounded-[12px] bg-[rgba(18,17,30,0.5)] border border-[rgba(255,255,255,0.06)]">
              <button onClick={() => setViewMode("video")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-[10px] py-2 text-[11px] font-bold transition-all ${
                  viewMode === "video"
                    ? "bg-[rgba(0,255,224,0.1)] text-[#00ffe0] border border-[rgba(0,255,224,0.2)]"
                    : "text-white/30 hover:text-white/50 border border-transparent"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Video Player
              </button>
              <button onClick={() => setViewMode("screen")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-[10px] py-2 text-[11px] font-bold transition-all ${
                  viewMode === "screen"
                    ? "bg-[rgba(112,0,255,0.1)] text-[#7000ff] border border-[rgba(112,0,255,0.2)]"
                    : "text-white/30 hover:text-white/50 border border-transparent"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Screen Share
              </button>
            </div>

            {viewMode === "video" ? (
              <PartyVideoPlayer
                videoUrl={party.videoUrl}
                videoType={party.videoType}
                isPlaying={isPlaying}
                playbackPos={playbackPos}
                isHost={!!isHost}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onSeek={handleVideoSeek}
                onSyncState={handleVideoSync}
              />
            ) : (
              <ScreenShare
                isHost={!!isHost}
                partyId={partyId}
                socket={socket}
                screenShareActive={screenShareActive}
                onScreenShareToggle={setScreenShareActive}
              />
            )}

            {isHost && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-[16px] border border-[rgba(0,255,224,0.08)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
              >
                <h3 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Host Controls</h3>

                <div className="mb-3">
                  <label className="text-[10px] text-white/30 mb-1.5 block">Set Video URL (MP4, M3U8, YouTube, or any link)</label>
                  <div className="flex gap-2">
                    <input value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="https://... or paste any video link"
                      className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] px-3 py-2.5 text-xs text-white outline-none focus:border-[rgba(0,255,224,0.3)] transition-colors placeholder:text-white/20"
                    />
                    <button onClick={handleSetVideo}
                      className="rounded-[10px] bg-gradient-to-r from-[rgba(0,255,224,0.12)] to-[rgba(0,255,224,0.06)] border border-[rgba(0,255,224,0.2)] px-4 py-2.5 text-xs font-bold text-[#00ffe0] hover:border-[rgba(0,255,224,0.4)] transition-all"
                    >
                      Set
                    </button>
                  </div>
                </div>

                {/* Video file upload */}
                <div className="mb-3">
                  <label className="text-[10px] text-white/30 mb-1.5 block">Or upload a video file (MP4, WebM, max 200MB)</label>
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => videoFileRef.current?.click()}
                    className={`relative rounded-[10px] border-2 border-dashed cursor-pointer transition-all py-4 text-center ${
                      dragOver
                        ? "border-[#00ffe0] bg-[rgba(0,255,224,0.05)]"
                        : uploading
                        ? "border-[rgba(0,255,224,0.15)] bg-[rgba(0,255,224,0.02)] pointer-events-none"
                        : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,255,224,0.2)]"
                    }`}
                  >
                    {uploading ? (
                      <div className="space-y-2">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#00ffe0] border-t-transparent" />
                        <p className="text-[11px] text-[#00ffe0] font-medium">Uploading... {uploadProgress}%</p>
                        <div className="mx-auto max-w-[200px] h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#00ffe0] to-[#7000ff] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto mb-1.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,224,0.4)" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="text-[11px] text-white/40">
                          {dragOver ? "Drop video here" : "Click or drag video file"}
                        </p>
                      </>
                    )}
                    <input ref={videoFileRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                  </div>
                  {uploadError && (
                    <p className="mt-1.5 text-[10px] text-red-400">{uploadError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input type="number" min={1} value={episodeInput}
                    onChange={(e) => setEpisodeInput(e.target.value)}
                    placeholder={`Episode ${party.episode}`}
                    className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] px-3 py-2.5 text-sm text-white outline-none focus:border-[rgba(0,255,224,0.3)] transition-colors placeholder:text-white/20"
                  />
                  <button onClick={handleEpisodeUpdate}
                    className="rounded-[10px] bg-gradient-to-r from-[rgba(0,255,224,0.12)] to-[rgba(0,255,224,0.06)] border border-[rgba(0,255,224,0.2)] px-5 py-2.5 text-xs font-bold text-[#00ffe0] hover:border-[rgba(0,255,224,0.4)] transition-all"
                  >
                    Update Episode
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${party.status === "live" ? "animate-pulse" : ""}`} />
                    {status.label}
                  </span>
                  <h1 className="font-display text-lg font-bold text-white">{party.mediaTitle}</h1>
                </div>
                <span className="text-xs text-white/30">Ep {party.episode}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {isHost && party.status === "waiting" && (
                  <button onClick={() => handleAction("start")}
                    className="rounded-[10px] bg-green-500/10 border border-green-500/20 px-4 py-2 text-xs font-bold text-green-400 hover:bg-green-500/20 transition-all"
                  >
                    Start Party
                  </button>
                )}
                {isHost && party.status !== "ended" && (
                  <button onClick={() => handleAction("end")}
                    className="rounded-[10px] bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    End Party
                  </button>
                )}
                {userId && !isHost && (
                  isMember ? (
                    <button onClick={handleLeave}
                      className="rounded-[10px] bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      Leave Party
                    </button>
                  ) : party.status !== "ended" ? (
                    <button onClick={handleJoin}
                      className="rounded-[10px] bg-gradient-to-r from-[rgba(0,255,224,0.12)] to-[rgba(0,255,224,0.06)] border border-[rgba(0,255,224,0.2)] px-4 py-2 text-xs font-bold text-[#00ffe0] hover:border-[rgba(0,255,224,0.4)] hover:shadow-[0_0_20px_-5px_rgba(0,255,224,0.25)] transition-all"
                    >
                      Join Party
                    </button>
                  ) : null
                )}
              </div>
            </motion.div>

            {isMember && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
              >
                <h3 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Reactions</h3>
                <FloatingReactions onReact={handleReact} />
              </motion.div>
            )}
          </div>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
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

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
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
                {party.videoUrl && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/30">Source</span>
                    <span className="text-[#00ffe0] font-mono text-[10px] truncate max-w-[120px]">{party.videoType}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {isMember && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.5)] backdrop-blur-md p-4"
              >
                <PartyChat
                  messages={chatMessages}
                  onSend={handleChatSend}
                  currentUserId={userId}
                />
              </motion.div>
            )}

            {!session && (
              <Link href="/login"
                className="block rounded-[16px] border border-[rgba(0,255,224,0.2)] bg-[rgba(0,255,224,0.05)] p-4 text-center text-sm font-bold text-[#00ffe0] hover:bg-[rgba(0,255,224,0.1)] transition-all"
              >
                Login to Join Party
              </Link>
            )}
          </div>
        </div>
      </div>

      <InviteModal partyId={partyId} isOpen={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  );
}
