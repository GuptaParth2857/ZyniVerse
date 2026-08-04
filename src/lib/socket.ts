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

export interface DmMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  replyToId: string | null;
  replyTo: { id: string; content: string; isDeleted: boolean; deletedFor: string; sender: { id: string; username: string } } | null;
  reactions: { id: string; userId: string; emoji: string; user: { id: string; username: string } }[];
  isDeleted: boolean;
  deletedFor: string;
  createdAt: string;
  sender: { id: string; username: string; avatar: string | null };
}

export interface DmReactionEvent {
  conversationId: string;
  messageId: string;
  reactions: { id: string; userId: string; emoji: string; user: { id: string; username: string } }[];
}

export interface DmTypingEvent {
  conversationId: string;
  userId: string;
  username: string;
  typing: boolean;
}

export interface DmSeenEvent {
  conversationId: string;
  userId: string;
  lastReadAt: string;
}

export interface DmDeleteEvent {
  conversationId: string;
  messageId: string;
  mode: "me" | "everyone";
  deletedFor: string[];
  isDeleted: boolean;
}
