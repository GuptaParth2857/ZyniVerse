"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ChatBubble from "./ChatBubble";

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
    } catch {}
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoadingConvos(true);
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {}
    setLoadingConvos(false);
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}&limit=50`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchUnreadTotal();
    const interval = setInterval(fetchUnreadTotal, 10000);
    return () => clearInterval(interval);
  }, [session, fetchUnreadTotal]);

  useEffect(() => {
    if (!open || !session?.user?.id) return;
    if (view === "list") fetchConversations();
  }, [open, view, session, fetchConversations]);

  useEffect(() => {
    if (!activeConvo || !open) return;
    fetchMessages(activeConvo);
    markAsRead(activeConvo);

    const interval = setInterval(() => {
      fetchMessages(activeConvo);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeConvo, open, fetchMessages]);

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
    if (open) {
      setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleSelectConvo(convo: ConversationSummary) {
    setActiveConvo(convo.id);
    setView("messages");
    await markAsRead(convo.id);
  }

  async function markAsRead(conversationId: string) {
    try {
      await fetch("/api/chat/conversations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
    } catch {}
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
    <div ref={panelRef} className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="mb-3 w-80 sm:w-96 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            {view === "messages" ? (
              <>
                <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
                  <button onClick={handleBack} className="text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-semibold text-[var(--color-ink)]">
                    {activeConvoData?.otherUser?.username ?? "Chat"}
                  </span>
                </div>
                <div className="overflow-y-auto px-4 py-3" style={{ height: "350px" }}>
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-[var(--color-mute)]">
                      No messages yet. Say hello!
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
                <div className="border-t border-[var(--color-line)] p-3 flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="rounded-lg bg-[var(--color-magenta)] px-3 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
                  <span className="text-sm font-semibold text-[var(--color-ink)]">Messages</span>
                  <button
                    onClick={() => router.push("/messages")}
                    className="text-xs text-[var(--color-cyan)] hover:underline"
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
                    <div className="px-4 py-8 text-center text-sm text-[var(--color-mute)]">
                      No conversations yet. Go to a user's profile to send a message.
                    </div>
                  ) : (
                    conversations.map((convo) => (
                      <button
                        key={convo.id}
                        onClick={() => handleSelectConvo(convo)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-white/5 border-b border-[var(--color-line)] last:border-0"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-sm font-bold text-black">
                          {(convo.otherUser?.username ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[var(--color-ink)] truncate">
                              {convo.otherUser?.username ?? "Unknown"}
                            </span>
                            {convo.lastMessage && (
                              <span className="text-[10px] text-[var(--color-mute)] shrink-0 ml-2">
                                {timeAgo(convo.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-[var(--color-mute)] truncate">
                              {convo.lastMessage
                                ? convo.lastMessage.isDeleted
                                  ? "[deleted]"
                                  : convo.lastMessage.content
                                : "No messages yet"}
                            </p>
                            {convo.unreadCount > 0 && (
                              <span className="shrink-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-magenta)] px-1 text-[9px] font-bold text-black">
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
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-magenta)] text-black shadow-lg hover:scale-105 transition-transform"
        aria-label="Chat"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-amber)] px-1 text-[10px] font-bold text-black leading-none">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </button>
    </div>
  );
}
