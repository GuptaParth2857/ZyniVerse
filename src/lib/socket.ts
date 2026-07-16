"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    socket = io(wsUrl || (typeof window !== "undefined" ? window.location.origin : ""), {
      path: "/api/socketio",
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export interface PartyUser {
  id: string;
  username: string;
  avatar: string | null;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  type: string;
  createdAt: string;
}

export interface Reaction {
  userId: string;
  username: string;
  emoji: string;
}

export interface SyncState {
  isPlaying: boolean;
  playbackPos: number;
  episode: number;
  timestamp: number;
}
