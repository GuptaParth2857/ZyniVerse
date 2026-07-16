"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { getSocket, type PartyUser, type ChatMessage, type Reaction, type SyncState } from "@/lib/socket";

interface UseWatchPartySocketOptions {
  partyId: string;
  user: PartyUser | null;
  isHost: boolean;
  onSyncState?: (state: SyncState) => void;
  onNewMessage?: (msg: ChatMessage) => void;
  onNewReaction?: (reaction: Reaction) => void;
  onMemberJoined?: (data: { user: PartyUser; members: string[] }) => void;
  onMemberLeft?: (data: { user: PartyUser; members: string[] }) => void;
  onEpisodeChange?: (data: { episode: number }) => void;
  onVideoUpdated?: (data: { videoUrl: string; videoType: string }) => void;
  onPlay?: (data: { playbackPos: number; timestamp: number }) => void;
  onPause?: (data: { playbackPos: number; timestamp: number }) => void;
  onSeek?: (data: { playbackPos: number; timestamp: number }) => void;
  onScreenShareStarted?: () => void;
  onScreenShareStopped?: () => void;
}

export function useWatchPartySocket(options: UseWatchPartySocketOptions) {
  const { partyId, user, isHost } = options;

  const [connected, setConnected] = useState(false);
  const [socketAvailable, setSocketAvailable] = useState(false);
  const callbacksRef = useRef(options);

  useEffect(() => {
    callbacksRef.current = options;
  });

  useEffect(() => {
    if (!user || !partyId) return;

    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
      setSocketAvailable(true);
      socket.emit("join-party", { partyId, user, isHost });
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onConnectError = () => {
      setSocketAvailable(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    socket.on("sync-state", (state: SyncState) => callbacksRef.current.onSyncState?.(state));
    socket.on("new-message", (msg: ChatMessage) => callbacksRef.current.onNewMessage?.(msg));
    socket.on("new-reaction", (r: Reaction) => callbacksRef.current.onNewReaction?.(r));
    socket.on("member-joined", (d: { user: PartyUser; members: string[] }) => callbacksRef.current.onMemberJoined?.(d));
    socket.on("member-left", (d: { user: PartyUser; members: string[] }) => callbacksRef.current.onMemberLeft?.(d));
    socket.on("episode-change", (d: { episode: number }) => callbacksRef.current.onEpisodeChange?.(d));
    socket.on("video-updated", (d: { videoUrl: string; videoType: string }) => callbacksRef.current.onVideoUpdated?.(d));
    socket.on("play", (d: { playbackPos: number; timestamp: number }) => callbacksRef.current.onPlay?.(d));
    socket.on("pause", (d: { playbackPos: number; timestamp: number }) => callbacksRef.current.onPause?.(d));
    socket.on("seek", (d: { playbackPos: number; timestamp: number }) => callbacksRef.current.onSeek?.(d));
    socket.on("screen-share-started-viewers", () => callbacksRef.current.onScreenShareStarted?.());
    socket.on("screen-share-stopped-viewers", () => callbacksRef.current.onScreenShareStopped?.());

    socket.connect();

    return () => {
      socket.emit("leave-party", { partyId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("sync-state");
      socket.off("new-message");
      socket.off("new-reaction");
      socket.off("member-joined");
      socket.off("member-left");
      socket.off("episode-change");
      socket.off("video-updated");
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("screen-share-started-viewers");
      socket.off("screen-share-stopped-viewers");
      socket.disconnect();
    };
  }, [partyId, user, isHost]);

  const emitHostSync = useCallback((isPlaying: boolean, playbackPos: number, episode: number) => {
    if (!isHost || !socketAvailable) return;
    getSocket().emit("host-sync", { partyId, isPlaying, playbackPos, episode });
  }, [partyId, isHost, socketAvailable]);

  const emitHostPlay = useCallback((playbackPos: number) => {
    if (!isHost || !socketAvailable) return;
    getSocket().emit("host-play", { partyId, playbackPos });
  }, [partyId, isHost, socketAvailable]);

  const emitHostPause = useCallback((playbackPos: number) => {
    if (!isHost || !socketAvailable) return;
    getSocket().emit("host-pause", { partyId, playbackPos });
  }, [partyId, isHost, socketAvailable]);

  const emitHostSeek = useCallback((playbackPos: number) => {
    if (!isHost || !socketAvailable) return;
    getSocket().emit("host-seek", { partyId, playbackPos });
  }, [partyId, isHost, socketAvailable]);

  const emitHostEpisode = useCallback((episode: number) => {
    if (!isHost || !socketAvailable) return;
    getSocket().emit("host-episode", { partyId, episode });
  }, [partyId, isHost, socketAvailable]);

  const emitChatMessage = useCallback((message: string) => {
    if (!user || !socketAvailable) return;
    getSocket().emit("chat-message", { partyId, user, message });
  }, [partyId, user, socketAvailable]);

  const emitReaction = useCallback((emoji: string) => {
    if (!user || !socketAvailable) return;
    getSocket().emit("reaction", { partyId, user, emoji });
  }, [partyId, user, socketAvailable]);

  const emitVideoSource = useCallback((videoUrl: string, videoType: string) => {
    if (!isHost || !socketAvailable) return;
    getSocket().emit("video-source", { partyId, videoUrl, videoType });
  }, [partyId, isHost, socketAvailable]);

  return {
    connected,
    socketAvailable,
    socket: socketAvailable ? getSocket() : null,
    emitHostSync,
    emitHostPlay,
    emitHostPause,
    emitHostSeek,
    emitHostEpisode,
    emitChatMessage,
    emitReaction,
    emitVideoSource,
  };
}
