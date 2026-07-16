"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Hls from "hls.js";

interface PartyVideoPlayerProps {
  videoUrl: string | null;
  videoType: string | null;
  isPlaying: boolean;
  playbackPos: number;
  isHost: boolean;
  onPlay: (pos: number) => void;
  onPause: (pos: number) => void;
  onSeek: (pos: number) => void;
  onSyncState: (playing: boolean, pos: number) => void;
}

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function detectPlatform(url: string): { name: string; icon: string; color: string; embeddable: boolean } | null {
  if (url.match(/youtube\.com|youtu\.be/)) return { name: "YouTube", icon: "YT", color: "#FF0000", embeddable: true };
  if (url.match(/vimeo\.com/)) return { name: "Vimeo", icon: "VM", color: "#1AB7EA", embeddable: true };
  if (url.match(/bilibili\.com|b23\.tv/)) return { name: "Bilibili", icon: "BL", color: "#00A1D6", embeddable: true };
  if (url.match(/dailymotion\.com|dai\.ly/)) return { name: "Dailymotion", icon: "DM", color: "#0066DC", embeddable: true };
  if (url.match(/twitch\.tv/)) return { name: "Twitch", icon: "TW", color: "#9146FF", embeddable: true };
  if (url.match(/crunchyroll\.com/)) return { name: "Crunchyroll", icon: "CR", color: "#F47521", embeddable: false };
  if (url.match(/funimation\.com/)) return { name: "Funimation", icon: "FN", color: "#F98B00", embeddable: false };
  if (url.match(/netflix\.com/)) return { name: "Netflix", icon: "NX", color: "#E50914", embeddable: false };
  if (url.match(/primevideo\.com|amazon\..*\/video/)) return { name: "Prime Video", icon: "PV", color: "#00A8E1", embeddable: false };
  if (url.match(/disneyplus\.com|hotstar\./)) return { name: "Disney+", icon: "D+", color: "#113CCF", embeddable: false };
  if (url.match(/\.mp4($|\?)/)) return { name: "MP4 Video", icon: "MP", color: "#00ffe0", embeddable: true };
  if (url.match(/\.m3u8($|\?)/)) return { name: "HLS Stream", icon: "HL", color: "#7000ff", embeddable: true };
  if (url.match(/\.webm($|\?)/)) return { name: "WebM Video", icon: "WB", color: "#FF6B00", embeddable: true };
  return null;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?#]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0`;

  // Bilibili
  const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if (biliMatch) return `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}&high_quality=1`;
  const biliAv = url.match(/bilibili\.com\/video\/av(\d+)/);
  if (biliAv) return `https://player.bilibili.com/player.html?aid=${biliAv[1]}&high_quality=1`;

  // Dailymotion
  const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dmMatch) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
  const daiMatch = url.match(/dai\.ly\/([a-zA-Z0-9]+)/);
  if (daiMatch) return `https://www.dailymotion.com/embed/video/${daiMatch[1]}`;

  // Twitch
  const twitchMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
  if (twitchMatch) return `https://player.twitch.tv/?video=${twitchMatch[1]}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`;
  const twitchChannel = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)$/);
  if (twitchChannel) return `https://player.twitch.tv/?channel=${twitchChannel[1]}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`;

  return null;
}

export default function PartyVideoPlayer({
  videoUrl, videoType, isPlaying, playbackPos, isHost,
  onPlay, onPause, onSeek, onSyncState,
}: PartyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const seekLockRef = useRef(false);

  const platform = useMemo(() => videoUrl ? detectPlatform(videoUrl) : null, [videoUrl]);

  const isNativeVideo = useMemo(() => {
    if (!videoUrl) return false;
    if (videoType === "mp4" || videoType === "hls") return true;
    if (videoUrl.match(/\.mp4($|\?)/) || videoUrl.match(/\.m3u8($|\?)/) || videoUrl.match(/\.webm($|\?)/)) return true;
    return false;
  }, [videoUrl, videoType]);

  const embedUrl = useMemo(() => videoUrl ? getEmbedUrl(videoUrl) : null, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || !isNativeVideo) return;

    if (videoType === "hls" && videoUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setDuration(video.duration);
        });
        return () => { hls.destroy(); hlsRef.current = null; };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      }
    } else {
      video.src = videoUrl;
    }
  }, [videoUrl, videoType, isNativeVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!seekLockRef.current) {
        setCurrentTime(video.currentTime);
      }
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPaused(false); };
    const onPauseHandler = () => setIsPaused(true);
    const onEnded = () => { setIsPaused(true); if (isHost) onPlay(0); };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPauseHandler);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPauseHandler);
      video.removeEventListener("ended", onEnded);
    };
  }, [isHost, onPlay]);

  useEffect(() => {
    if (!isHost && isNativeVideo) {
      const video = videoRef.current;
      if (!video) return;
      const diff = Math.abs(video.currentTime - playbackPos);
      if (diff > 2) {
        seekLockRef.current = true;
        video.currentTime = playbackPos;
        setTimeout(() => { seekLockRef.current = false; }, 500);
      }
      if (isPlaying && video.paused) {
        video.play().catch(() => {});
      } else if (!isPlaying && !video.paused) {
        video.pause();
      }
    }
  }, [isPlaying, playbackPos, isHost, isNativeVideo]);

  useEffect(() => {
    if (isHost && isNativeVideo) {
      syncIntervalRef.current = setInterval(() => {
        const video = videoRef.current;
        if (video && !video.paused) {
          onSyncState(true, video.currentTime);
        }
      }, 3000);
    }
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [isHost, onSyncState, isNativeVideo]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isHost) return;
    if (video.paused) { video.play().catch(() => {}); onPlay(video.currentTime); }
    else { video.pause(); onPause(video.currentTime); }
  }, [isHost, onPlay, onPause]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !isHost) return;
    const time = parseFloat(e.target.value);
    seekLockRef.current = true;
    video.currentTime = time;
    setCurrentTime(time);
    onSeek(time);
    setTimeout(() => { seekLockRef.current = false; }, 500);
  }, [isHost, onSeek]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    setVolume(v);
    if (v === 0) { video.muted = true; setIsMuted(true); }
    else if (video.muted) { video.muted = false; setIsMuted(false); }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) { el.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // --- Empty state ---
  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.6)] backdrop-blur-md overflow-hidden flex flex-col items-center justify-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(0,255,224,0.05)] border border-[rgba(0,255,224,0.1)]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,224,0.4)" strokeWidth="1.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/50 mb-1">No video source set</p>
          <p className="text-xs text-white/25">Host can paste a video URL below to start watching</p>
        </div>
      </div>
    );
  }

  // --- Embeddable platform (YouTube, Vimeo, Bilibili, etc.) ---
  if (embedUrl && !isNativeVideo) {
    return (
      <div className="relative aspect-video w-full rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-black overflow-hidden">
        <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        {platform && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1">
            <span className="text-[10px] font-bold" style={{ color: platform.color }}>{platform.icon}</span>
            <span className="text-[10px] text-white/60">{platform.name}</span>
          </div>
        )}
        {!isHost && (
          <div className="absolute top-3 right-3 z-20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,0,230,0.15)] border border-[rgba(255,0,230,0.3)] px-3 py-1 text-[10px] font-bold text-[#ff00e6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff00e6] animate-pulse" />
              SYNCED
            </span>
          </div>
        )}
      </div>
    );
  }

  // --- Native video (MP4, HLS, WebM) ---
  if (isNativeVideo) {
    return (
      <div ref={containerRef}
        className="relative aspect-video w-full rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-black overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { if (!videoRef.current?.paused) setShowControls(false); }}
      >
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-contain" onClick={togglePlay} playsInline />

        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#00ffe0] border-t-transparent" />
          </div>
        )}

        {!isHost && (
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,0,230,0.15)] border border-[rgba(255,0,230,0.3)] px-3 py-1 text-[10px] font-bold text-[#ff00e6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff00e6] animate-pulse" />
              SYNCED
            </span>
          </div>
        )}

        <div className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="px-4 pb-4 pt-8">
            <div className="flex items-center gap-2 mb-2">
              <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-[#00ffe0]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isHost ? (
                  <button onClick={togglePlay} className="text-white hover:text-[#00ffe0] transition-colors">
                    {isPaused ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    )}
                  </button>
                ) : (
                  <span className="text-[10px] text-white/40 font-mono">HOST CONTROLS</span>
                )}
                <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>
                  )}
                </button>
                <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-16 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-white"
                />
                <span className="text-[11px] text-white/50 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <button onClick={toggleFullscreen} className="text-white/60 hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isFullscreen ? (
                    <><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" /></>
                  ) : (
                    <><path d="M8 3H5a2 2 0 00-2 2v3m21 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Non-embeddable external link ---
  return (
    <div className="relative aspect-video w-full rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.6)] backdrop-blur-md overflow-hidden flex flex-col items-center justify-center gap-4">
      {platform ? (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full border" style={{ background: `${platform.color}10`, borderColor: `${platform.color}25` }}>
            <span className="text-2xl font-black" style={{ color: platform.color }}>{platform.icon}</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/70 mb-1">{platform.name}</p>
            <p className="text-xs text-white/30 mb-3 max-w-xs">This platform doesn&apos;t support embedded playback. Open it in a new tab, then sync with your party using the timer.</p>
            <div className="flex items-center gap-2">
              <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: `${platform.color}18`, border: `1px solid ${platform.color}35` }}
              >
                Open on {platform.name}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(0,255,224,0.05)] border border-[rgba(0,255,224,0.1)]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,224,0.4)" strokeWidth="1.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/50 mb-1">External Video</p>
            <p className="text-xs text-white/25 mb-3">Click the link below to watch, then sync with your party</p>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-[rgba(0,255,224,0.12)] to-[rgba(0,255,224,0.06)] border border-[rgba(0,255,224,0.2)] px-5 py-2.5 text-xs font-bold text-[#00ffe0] hover:border-[rgba(0,255,224,0.4)] hover:shadow-[0_0_20px_-5px_rgba(0,255,224,0.25)] transition-all"
            >
              Open Video Link
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
