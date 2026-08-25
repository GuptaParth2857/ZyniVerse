"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket, type PartyUser } from "@/lib/socket";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface VoiceParticipant {
  user: PartyUser;
  socketId: string;
  isSpeaking: boolean;
  audioStream?: MediaStream;
}

export function useVoiceChat({
  partyId,
  user,
  isMember,
}: {
  partyId: string;
  user: PartyUser | null;
  isMember: boolean;
}) {
  const [voiceActive, setVoiceActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [speakingMap, setSpeakingMap] = useState<Record<string, boolean>>({});

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const speakingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const analyserRef = useRef<Map<string, { analyser: AnalyserNode; source: MediaStreamAudioSourceNode }>>(new Map());
  const speakingCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();

    // Remove all audio elements
    audioElementsRef.current.forEach((el) => {
      el.srcObject = null;
      el.remove();
    });
    audioElementsRef.current.clear();

    // Clear analyser refs
    analyserRef.current.forEach(({ source }) => {
      try { source.disconnect(); } catch { /* ignore */ }
    });
    analyserRef.current.clear();

    // Clear timers
    speakingTimersRef.current.forEach((t) => clearTimeout(t));
    speakingTimersRef.current.clear();

    if (speakingCheckRef.current) {
      clearInterval(speakingCheckRef.current);
      speakingCheckRef.current = null;
    }
  }, []);

  // Create a peer connection for a remote user
  const createPeerConnection = useCallback(
    (remoteSocketId: string, remoteUser: PartyUser, _isInitiator: boolean) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      const socket = getSocket();

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("voice-ice-candidate", {
            partyId,
            targetId: remoteSocketId,
            candidate: e.candidate.toJSON(),
          });
        }
      };

      // Handle remote stream
      pc.ontrack = (e) => {
        const [stream] = e.streams;
        if (!stream) return;

        // Create audio element for remote user
        let audioEl = audioElementsRef.current.get(remoteSocketId);
        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.autoplay = true;
          audioEl.style.display = "none";
          document.body.appendChild(audioEl);
          audioElementsRef.current.set(remoteSocketId, audioEl);
        }
        audioEl.srcObject = stream;

        // Setup speaking detection
        try {
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current.set(remoteSocketId, { analyser, source });
        } catch { /* ignore */ }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          pc.close();
          peersRef.current.delete(remoteSocketId);
          audioElementsRef.current.get(remoteSocketId)?.remove();
          audioElementsRef.current.delete(remoteSocketId);
          analyserRef.current.delete(remoteSocketId);
          setParticipants((prev) => prev.filter((p) => p.socketId !== remoteSocketId));
        }
      };

      peersRef.current.set(remoteSocketId, pc);
      setParticipants((prev) => {
        const exists = prev.some((p) => p.socketId === remoteSocketId);
        if (exists) return prev;
        return [...prev, { user: remoteUser, socketId: remoteSocketId, isSpeaking: false }];
      });

      return pc;
    },
    [partyId]
  );

  // Socket event handlers
  useEffect(() => {
    if (!user || !isMember) return;

    const socket = getSocket();

    const handleVoiceUserJoined = async ({ user: remoteUser, socketId: remoteSocketId }: { user: PartyUser; socketId: string }) => {
      if (remoteSocketId === socket.id) return;
      if (!voiceActive) return;

      // Existing user creates offer to new user
      const pc = createPeerConnection(remoteSocketId, remoteUser, true);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("voice-offer", {
        partyId,
        targetId: remoteSocketId,
        offer: pc.localDescription!.toJSON(),
        fromUser: user,
      });
    };

    const handleVoiceUserLeft = ({ socketId: remoteSocketId }: { user: PartyUser; socketId: string }) => {
      const pc = peersRef.current.get(remoteSocketId);
      if (pc) {
        pc.close();
        peersRef.current.delete(remoteSocketId);
      }
      audioElementsRef.current.get(remoteSocketId)?.remove();
      audioElementsRef.current.delete(remoteSocketId);
      analyserRef.current.delete(remoteSocketId);
      setParticipants((prev) => prev.filter((p) => p.socketId !== remoteSocketId));
    };

    const handleVoiceOffer = async ({ offer, fromUser: remoteUser, fromSocketId: remoteSocketId }: { offer: RTCSessionDescriptionInit; fromUser: PartyUser; fromSocketId: string }) => {
      if (!voiceActive) return;

      const pc = createPeerConnection(remoteSocketId, remoteUser, false);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("voice-answer", {
        partyId,
        targetId: remoteSocketId,
        answer: pc.localDescription!.toJSON(),
      });
    };

    const handleVoiceAnswer = async ({ answer, fromSocketId: remoteSocketId }: { answer: RTCSessionDescriptionInit; fromSocketId: string }) => {
      const pc = peersRef.current.get(remoteSocketId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleVoiceIceCandidate = async ({ candidate, fromSocketId: remoteSocketId }: { candidate: RTCIceCandidateInit; fromSocketId: string }) => {
      const pc = peersRef.current.get(remoteSocketId);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch { /* ignore */ }
      }
    };

    const handleVoiceSpeaking = ({ socketId: remoteSocketId, isSpeaking }: { user: PartyUser; isSpeaking: boolean; socketId: string }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === remoteSocketId ? { ...p, isSpeaking } : p))
      );
      setSpeakingMap((prev) => ({ ...prev, [remoteSocketId]: isSpeaking }));
    };

    socket.on("voice-user-joined", handleVoiceUserJoined);
    socket.on("voice-user-left", handleVoiceUserLeft);
    socket.on("voice-offer", handleVoiceOffer);
    socket.on("voice-answer", handleVoiceAnswer);
    socket.on("voice-ice-candidate", handleVoiceIceCandidate);
    socket.on("voice-speaking", handleVoiceSpeaking);

    return () => {
      socket.off("voice-user-joined", handleVoiceUserJoined);
      socket.off("voice-user-left", handleVoiceUserLeft);
      socket.off("voice-offer", handleVoiceOffer);
      socket.off("voice-answer", handleVoiceAnswer);
      socket.off("voice-ice-candidate", handleVoiceIceCandidate);
      socket.off("voice-speaking", handleVoiceSpeaking);
    };
  }, [user, isMember, voiceActive, partyId, createPeerConnection]);

  // Speaking detection - check audio levels periodically
  useEffect(() => {
    if (!voiceActive || muted) {
      if (speakingCheckRef.current) {
        clearInterval(speakingCheckRef.current);
        speakingCheckRef.current = null;
      }
      return;
    }

    const socket = getSocket();
    const dataArray = new Uint8Array(128);

    speakingCheckRef.current = setInterval(() => {
      analyserRef.current.forEach(({ analyser }, socketId) => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const isSpeaking = avg > 20;

        setSpeakingMap((prev) => {
          if (prev[socketId] !== isSpeaking) {
            // Only emit if state changed
            return { ...prev, [socketId]: isSpeaking };
          }
          return prev;
        });
      });

      // Check local mic level and broadcast speaking state
      if (localStreamRef.current && !muted) {
        const localAnalyser = analyserRef.current.get("local");
        if (localAnalyser) {
          localAnalyser.analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const isSpeaking = avg > 20;

          socket.emit("voice-speaking", {
            partyId,
            user,
            isSpeaking,
          });
        }
      }
    }, 150);

    return () => {
      if (speakingCheckRef.current) {
        clearInterval(speakingCheckRef.current);
        speakingCheckRef.current = null;
      }
    };
  }, [voiceActive, muted, partyId, user]);

  // Start voice chat
  const startVoice = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });

      localStreamRef.current = stream;
      setVoiceActive(true);

      // Setup local speaking detection
      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current.set("local", { analyser, source });
      } catch { /* ignore */ }

      // Join voice via socket
      const socket = getSocket();
      socket.emit("voice-join", { partyId, user });
    } catch {
      console.error("Could not access microphone");
    }
  }, [partyId, user]);

  // Stop voice chat
  const stopVoice = useCallback(() => {
    const socket = getSocket();
    socket.emit("voice-leave", { partyId, user });
    cleanup();
    setVoiceActive(false);
    setMuted(false);
    setParticipants([]);
    setSpeakingMap({});
  }, [partyId, user, cleanup]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const newMuted = !muted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !newMuted;
    });
    setMuted(newMuted);
  }, [muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (voiceActive) {
        const socket = getSocket();
        socket.emit("voice-leave", { partyId, user });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    voiceActive,
    muted,
    participants,
    speakingMap,
    startVoice,
    stopVoice,
    toggleMute,
  };
}
