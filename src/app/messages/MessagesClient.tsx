"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import ChatBubble from "@/components/ChatBubble";

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
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString();
}

export default function MessagesClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetchConversations();
  }, [status, router, fetchConversations]);

  useEffect(() => {
    const convoId = searchParams.get("conversation");
    if (convoId && conversations.length > 0) {
      setActiveConvoId(convoId);
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (!activeConvoId) return;
    fetchMessages(activeConvoId);
    const interval = setInterval(() => fetchMessages(activeConvoId), 10000);
    return () => clearInterval(interval);
  }, [activeConvoId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !activeConvoId) return;
    const content = input.trim();
    setInput("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConvoId, content }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        fetchConversations();
      }
    } catch {
      setInput(content);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (status === "loading") return null;

  const activeConvo = conversations.find((c) => c.id === activeConvoId);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="font-display text-2xl font-bold mb-6">Messages</h1>
        <div className="flex rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden" style={{ minHeight: "70vh" }}>
          {/* Sidebar */}
          <div className={`${activeConvo ? "hidden" : "flex"} sm:flex w-72 sm:w-80 border-r border-[var(--color-line)] flex-col shrink-0`}>
            <div className="p-3 border-b border-[var(--color-line)]">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--color-line)]" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--color-mute)]">
                  No conversations yet.
                </div>
              ) : (
                conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => { setActiveConvoId(convo.id); router.replace(`/messages?conversation=${convo.id}`); }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-white/5 border-b border-[var(--color-line)] last:border-0 ${
                      activeConvoId === convo.id ? "bg-white/[0.04]" : ""
                    }`}
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
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col">
            {activeConvo ? (
              <>
                <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
                  <button onClick={() => { setActiveConvoId(null); router.replace("/messages"); }} className="sm:hidden shrink-0 mr-1 flex items-center justify-center h-8 w-8 rounded-lg text-sm text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-colors" aria-label="Back to conversations">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
                  </button>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-xs font-bold text-black">
                    {(activeConvo.otherUser?.username ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-ink)]">
                    {activeConvo.otherUser?.username ?? "Chat"}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3">
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
                        isOwn={msg.senderId === session?.user?.id}
                        createdAt={msg.createdAt}
                        isDeleted={msg.isDeleted}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-[var(--color-line)] p-3 flex gap-2">
                  <input
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
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--color-mute)]">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
