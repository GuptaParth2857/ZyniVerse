"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

interface ScreenShareProps {
  isHost: boolean;
  partyId: string;
  socket: {
    emit: (event: string, data: unknown) => void;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    off: (event: string, handler: (...args: unknown[]) => void) => void;
  } | null;
  screenShareActive: boolean;
  onScreenShareToggle: (active: boolean) => void;
}

export default function ScreenShare({
  isHost, partyId, socket, screenShareActive, onScreenShareToggle,
}: ScreenShareProps) {
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState("");
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanup = useCallback(() => {
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setViewerCount(0);
  }, []);

  const stopShare = useCallback(() => {
    cleanup();
    onScreenShareToggle(false);
    socket?.emit("screen-share-stopped", { partyId });
  }, [partyId, socket, cleanup, onScreenShareToggle]);

  // Host: start screen share
  const startShare = useCallback(async () => {
    if (!isHost) return;
    try {
      setError("");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor", logicalSurface: true, cursor: "always" } as MediaTrackConstraints,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      stream.getVideoTracks()[0].onended = () => {
        cleanup();
        onScreenShareToggle(false);
        socket?.emit("screen-share-stopped", { partyId });
      };
      onScreenShareToggle(true);
      socket?.emit("screen-share-started", { partyId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Screen share failed");
    }
  }, [isHost, partyId, socket, onScreenShareToggle, cleanup]);

  // Host: handle viewer joining
  useEffect(() => {
    if (!isHost || !socket || !screenShareActive) return;

    const handleViewerJoin = async (data: { viewerId: string; partyId: string }) => {
      if (data.partyId !== partyId) return;
      const stream = localStreamRef.current;
      if (!stream) return;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current.set(data.viewerId, pc);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("webrtc-ice-candidate", {
            partyId, targetId: data.viewerId, candidate: e.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          pc.close();
          peersRef.current.delete(data.viewerId);
          setViewerCount(peersRef.current.size);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        partyId, targetId: data.viewerId, offer: pc.localDescription,
      });

      setViewerCount(peersRef.current.size);
    };

    const handleViewerAnswer = async (data: { viewerId: string; answer: RTCSessionDescriptionInit; partyId: string }) => {
      if (data.partyId !== partyId) return;
      const pc = peersRef.current.get(data.viewerId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    };

    const handleIceCandidate = async (data: { senderId: string; candidate: RTCIceCandidateInit; partyId: string }) => {
      if (data.partyId !== partyId) return;
      const pc = peersRef.current.get(data.senderId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    socket.on("webrtc-viewer-join", handleViewerJoin as never);
    socket.on("webrtc-viewer-answer", handleViewerAnswer as never);
    socket.on("webrtc-ice-candidate-host", handleIceCandidate as never);

    return () => {
      socket.off("webrtc-viewer-join", handleViewerJoin as never);
      socket.off("webrtc-viewer-answer", handleViewerAnswer as never);
      socket.off("webrtc-ice-candidate-host", handleIceCandidate as never);
    };
  }, [isHost, socket, screenShareActive, partyId]);

  // Viewer: receive screen share
  useEffect(() => {
    if (isHost || !socket || !screenShareActive) return;

    let pc: RTCPeerConnection | null = null;

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit; partyId: string; hostId: string }) => {
      if (data.partyId !== partyId) return;

      pc = new RTCPeerConnection(ICE_SERVERS);

      pc.ontrack = (e) => {
        if (videoRef.current && e.streams[0]) {
          videoRef.current.srcObject = e.streams[0];
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("webrtc-ice-candidate", {
            partyId, targetId: data.hostId, candidate: e.candidate,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc-viewer-answer", {
        partyId, hostId: data.hostId, answer: pc.localDescription,
      });
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; partyId: string }) => {
      if (data.partyId !== partyId) return;
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    const handleStopped = (data: { partyId: string }) => {
      if (data.partyId !== partyId) return;
      if (pc) { pc.close(); pc = null; }
      if (videoRef.current) videoRef.current.srcObject = null;
      onScreenShareToggle(false);
    };

    socket.on("webrtc-offer-viewer", handleOffer as never);
    socket.on("webrtc-ice-candidate-viewer", handleIceCandidate as never);
    socket.on("screen-share-stopped-viewers", handleStopped as never);

    socket.emit("webrtc-viewer-ready", { partyId });

    return () => {
      socket.off("webrtc-offer-viewer", handleOffer as never);
      socket.off("webrtc-ice-candidate-viewer", handleIceCandidate as never);
      socket.off("screen-share-stopped-viewers", handleStopped as never);
      if (pc) { pc.close(); pc = null; }
    };
  }, [isHost, socket, screenShareActive, partyId, onScreenShareToggle]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div ref={containerRef} className="relative aspect-video w-full rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(18,17,30,0.6)] backdrop-blur-md overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-contain" />

      {isHost && !screenShareActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(112,0,255,0.05)] border border-[rgba(112,0,255,0.15)]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(112,0,255,0.5)" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/50 mb-1">Share Your Screen</p>
            <p className="text-xs text-white/25 mb-3 max-w-xs">Play any video on your browser and share it with the party in real-time</p>
            <button onClick={startShare}
              className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-[rgba(112,0,255,0.15)] to-[rgba(112,0,255,0.08)] border border-[rgba(112,0,255,0.25)] px-5 py-2.5 text-xs font-bold text-[#7000ff] hover:border-[rgba(112,0,255,0.4)] hover:shadow-[0_0_20px_-5px_rgba(112,0,255,0.3)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Start Screen Share
            </button>
          </div>
        </div>
      )}

      {isHost && screenShareActive && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(112,0,255,0.2)] border border-[rgba(112,0,255,0.4)] px-3 py-1 text-[10px] font-bold text-[#7000ff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7000ff] animate-pulse" />
            SHARING SCREEN
            {viewerCount > 0 && <span className="ml-1 text-white/40">({viewerCount} watching)</span>}
          </span>
          <button onClick={stopShare}
            className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/25 transition-all"
          >
            Stop
          </button>
        </div>
      )}

      {!isHost && screenShareActive && (
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,0,230,0.15)] border border-[rgba(255,0,230,0.3)] px-3 py-1 text-[10px] font-bold text-[#ff00e6]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff00e6] animate-pulse" />
            WATCHING HOST SCREEN
          </span>
        </div>
      )}

      {!isHost && !screenShareActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <p className="text-xs text-white/30">Waiting for host to share screen...</p>
        </div>
      )}

      {error && (
        <div className="absolute bottom-3 left-3 right-3 z-20 rounded-[10px] bg-red-500/10 border border-red-500/20 px-3 py-2 text-[11px] text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
