"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import ChatBubble from "./ChatBubble";
import { logError } from "@/lib/logger";
import type { DmMessage } from "@/lib/socket";

const DmSocketBridge = dynamic(() => import("./DmSocketBridge"), { ssr: false });

interface ConversationSummary {
  id: string;
  otherUser: { id: string; username: string; avatar: string | null } | null;
  lastMessage: { id: string; content: string; senderId: string; createdAt: string; isDeleted: boolean } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  sender: { id: string; username: string; avatar: string | null };
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(date).toLocaleDateString();
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "messages">("list");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchUnreadTotal = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/unread");
      const data = await res.json();
      setUnreadTotal(data.count ?? 0);
    } catch (e) { logError(e); }
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoadingConvos(true);
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch (e) { logError(e); }
    setLoadingConvos(false);
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}&limit=50`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (e) { logError(e); }
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadTotal();
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchUnreadTotal();
    }, 30000);
    return () => clearInterval(interval);
  }, [session, fetchUnreadTotal]);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch("/api/chat/conversations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
    } catch (e) { logError(e); }
  }, []);

  const handleDmMessage = useCallback((msg: DmMessage) => {
    if (open && view === "messages" && activeConvo === msg.conversationId) {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      markAsRead(msg.conversationId);
      fetchUnreadTotal();
    } else {
      setUnreadTotal((t) => t + 1);
      if (open && view === "list") fetchConversations();
    }
  }, [open, view, activeConvo, markAsRead, fetchUnreadTotal, fetchConversations]);

  useEffect(() => {
    if (!open || !session?.user?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (view === "list") fetchConversations();
  }, [open, view, session, fetchConversations]);

  useEffect(() => {
    if (!activeConvo || !open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages(activeConvo);
    markAsRead(activeConvo);

    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchMessages(activeConvo);
    }, 20000);
    return () => clearInterval(interval);
  }, [activeConvo, open, fetchMessages, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (view === "messages" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [view]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setView("list");
        setActiveConvo(null);
      }
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  async function handleSelectConvo(convo: ConversationSummary) {
    setActiveConvo(convo.id);
    setView("messages");
    await markAsRead(convo.id);
  }

  async function handleSend() {
    if (!input.trim() || !activeConvo) return;
    const content = input.trim();
    setInput("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConvo, content }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        fetchUnreadTotal();
      }
    } catch {
      setInput(content);
    }
  }

  function handleBack() {
    setView("list");
    setActiveConvo(null);
    setMessages([]);
    fetchConversations();
    fetchUnreadTotal();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!session?.user?.id) return null;
  const currentUserId = session.user.id;

  const activeConvoData = conversations.find((c) => c.id === activeConvo);

  return (
    <>
      <DmSocketBridge userId={session.user.id} onMessage={handleDmMessage} />
      <div ref={panelRef} className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="neon-rgb-border mb-3 w-80 overflow-hidden rounded-2xl bg-[var(--color-panel)]/95 shadow-2xl shadow-black/40 backdrop-blur-xl sm:w-96"
            style={{ maxHeight: "70vh" }}
          >
            <div className="h-1 bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-violet)] to-[var(--color-cyan)]" />
            {view === "messages" ? (
              <>
                <div className="flex items-center gap-3 border-b border-[var(--color-line)] bg-white/[0.03] px-4 py-3">
                  <button
                    onClick={handleBack}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-mute)] transition-colors hover:bg-white/5 hover:text-[var(--color-ink)]"
                    aria-label="Back to conversations"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-sm font-bold text-black">
                      {(activeConvoData?.otherUser?.username ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[var(--color-panel)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                      {activeConvoData?.otherUser?.username ?? "Chat"}
                    </p>
                    <p className="text-[10px] text-[var(--color-mute)]">Online</p>
                  </div>
                </div>
                <div className="overflow-y-auto space-y-1 px-4 py-3" style={{ height: "350px" }}>
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-[var(--color-mute)]">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--color-mute)]">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        content={msg.content}
                        sender={msg.sender}
                        isOwn={msg.senderId === currentUserId}
                        createdAt={msg.createdAt}
                        isDeleted={msg.isDeleted}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2 border-t border-[var(--color-line)] bg-white/[0.02] p-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-black shadow-[0_4px_16px_-4px_var(--color-magenta)] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                    aria-label="Send"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-white/[0.03] px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-magenta)]">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Messages
                  </span>
                  <button
                    onClick={() => router.push("/messages")}
                    className="text-xs font-medium text-[var(--color-cyan)] hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: "350px" }}>
                  {loadingConvos ? (
                    <div className="space-y-2 p-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--color-line)]" />
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center px-4 py-10 text-center">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-[var(--color-mute)]">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--color-mute)]">
                        No conversations yet. Go to a user&apos;s profile to send a message.
                      </p>
                    </div>
                  ) : (
                    conversations.map((convo) => (
                      <button
                        key={convo.id}
                        onClick={() => handleSelectConvo(convo)}
                        className="flex w-full items-center gap-3 border-b border-[var(--color-line)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/5"
                      >
                        <div className="relative shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-sm font-bold text-black">
                            {(convo.otherUser?.username ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[var(--color-panel)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-[var(--color-ink)]">
                              {convo.otherUser?.username ?? "Unknown"}
                            </span>
                            {convo.lastMessage && (
                              <span className="shrink-0 text-[10px] text-[var(--color-mute)]">
                                {timeAgo(convo.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="truncate text-xs text-[var(--color-mute)]">
                              {convo.lastMessage
                                ? convo.lastMessage.isDeleted
                                  ? "[deleted]"
                                  : convo.lastMessage.content
                                : "No messages yet"}
                            </p>
                            {convo.unreadCount > 0 && (
                              <span className="flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--color-magenta)] px-1 text-[9px] font-bold text-black">
                                {convo.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => { setOpen((o) => !o); if (open) { setView("list"); setActiveConvo(null); setMessages([]); } }}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-black shadow-[0_6px_20px_-4px_var(--color-magenta)] transition-transform hover:scale-105"
        aria-label="Chat"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-amber)] px-1 text-[10px] font-bold leading-none text-black">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </button>
    </div>
    </>
  );
}
