"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import MessageBubble, { type MessageView } from "@/components/MessageBubble";
import { logError } from "@/lib/logger";
import { useDmSocket } from "@/hooks/useDmSocket";
import type { DmReactionEvent, DmSeenEvent, DmDeleteEvent, DmTypingEvent } from "@/lib/socket";

const EMOJIS = ["❤️", "👍", "😂", "🔥", "😮", "😢", "😡"];

interface ConversationSummary {
  id: string;
  otherUser: { id: string; username: string; avatar: string | null } | null;
  otherLastReadAt: string | null;
  lastMessage: { id: string; content: string; senderId: string; createdAt: string; isDeleted: boolean; deletedFor: string } | null;
  unreadCount: number;
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
  const myId = session?.user?.id;

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<MessageView | null>(null);
  const [seenByOther, setSeenByOther] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; avatar: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);
  const tempIdCounter = useRef(0);

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

  const markAsRead = useCallback((conversationId: string) => {
    fetch("/api/chat/conversations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations();
  }, [status, router, fetchConversations]);

  useEffect(() => {
    const convoId = searchParams.get("conversation");
    if (convoId && conversations.length > 0) {
      const convo = conversations.find((c) => c.id === convoId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveConvoId(convoId);
      setSeenByOther(convo?.otherLastReadAt ?? null);
      setReplyTo(null);
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (!activeConvoId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
    setReplyTo(null);
    setOtherTyping(false);
    fetchMessages(activeConvoId);
    const convo = conversations.find((c) => c.id === activeConvoId);
    setSeenByOther(convo?.otherLastReadAt ?? null);
    markAsRead(activeConvoId);
    const interval = setInterval(() => fetchMessages(activeConvoId), 3000);
    return () => clearInterval(interval);
  }, [activeConvoId, fetchMessages, conversations, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  useDmSocket(myId, {
    onMessage: (msg) => {
      if (activeConvoId === msg.conversationId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        markAsRead(msg.conversationId);
      } else {
        fetchConversations();
      }
    },
    onReaction: (ev: DmReactionEvent) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === ev.messageId ? { ...m, reactions: ev.reactions } : m))
      );
    },
    onTyping: (ev: DmTypingEvent) => {
      if (ev.userId === myId || ev.conversationId !== activeConvoId) return;
      setOtherTyping(ev.typing);
      if (ev.typing) {
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setOtherTyping(false), 5000);
      }
    },
    onSeen: (ev: DmSeenEvent) => {
      if (ev.conversationId !== activeConvoId) return;
      setSeenByOther(ev.lastReadAt);
      setConversations((prev) =>
        prev.map((c) => (c.id === ev.conversationId ? { ...c, otherLastReadAt: ev.lastReadAt } : c))
      );
    },
    onDelete: (ev: DmDeleteEvent) => {
      if (ev.mode !== "everyone") return;
      setMessages((prev) =>
        prev.map((m) => (m.id === ev.messageId ? { ...m, isDeleted: true } : m))
      );
      fetchConversations();
    },
  });

  async function handleSend() {
    if (!input.trim() || !activeConvoId) return;
    const content = input.trim();
    const body = JSON.stringify({
      conversationId: activeConvoId,
      content,
      replyToId: replyTo?.id ?? null,
    });
    setInput("");
    setReplyTo(null);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeConvoId, typing: false }),
    }).catch(() => {});
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
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

  async function handleToggleReaction(messageId: string, emoji: string) {
    if (!myId) return;
    const existing = messages.find((m) => m.id === messageId);
    if (!existing) return;
    const hasMine = existing.reactions.some((r) => r.userId === myId && r.emoji === emoji);
    const optimistic = hasMine
      ? existing.reactions.filter((r) => !(r.userId === myId && r.emoji === emoji))
      : [
          ...existing.reactions,
          { id: `temp-${tempIdCounter.current++}`, userId: myId, emoji, user: { id: myId, username: session?.user?.name ?? "" } },
        ];
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: optimistic } : m)));

    try {
      const res = await fetch(`/api/chat/messages/${messageId}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (data.reactions) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: data.reactions } : m)));
      }
    } catch (e) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: existing.reactions } : m)));
      logError(e);
    }
  }

  async function handleDelete(messageId: string, mode: "me" | "everyone") {
    if (mode === "me") {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } else {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true } : m)));
    }
    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (e) { logError(e); }
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (!activeConvoId) return;
    const now = Date.now();
    if (now - lastTypingSent.current > 1500) {
      lastTypingSent.current = now;
      fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConvoId, typing: true }),
      }).catch(() => {});
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConvoId, typing: false }),
      }).catch(() => {});
    }, 3000);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleNewConversation(recipientId: string) {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        setSearch("");
        setSearchResults([]);
        await fetchConversations();
        setActiveConvoId(data.conversation.id);
        router.replace(`/messages?conversation=${data.conversation.id}`);
      }
    } catch (e) { logError(e); }
  }

  useEffect(() => {
    if (search.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        setSearchResults(data.users ?? []);
      } catch (e) { logError(e); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  if (status === "loading") return null;

  const activeConvo = conversations.find((c) => c.id === activeConvoId);
  const visibleMessages = messages.filter(
    (m) => !m.deletedFor || !m.deletedFor.split(",").includes(myId ?? "")
  );
  const lastOwnId = (() => {
    for (let i = visibleMessages.length - 1; i >= 0; i--) {
      const m = visibleMessages[i];
      if (m.senderId === myId && !m.isDeleted) return m.id;
    }
    return null;
  })();

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mb-6">
          <h1 className="font-display text-2xl font-bold">Messages</h1>
        </div>
        <div className="flex rounded-2xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden" style={{ minHeight: "70vh" }}>
          {/* Sidebar */}
          <div className={`${activeConvo ? "hidden" : "flex"} sm:flex w-72 sm:w-80 border-r border-[var(--color-line)] flex-col shrink-0`}>
            <div className="p-3 border-b border-[var(--color-line)]">
              <div className="neon-rgb-border flex items-center gap-2 rounded-lg bg-[var(--color-surface)] px-3 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users to message..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
                />
              </div>
              {search.trim().length >= 2 && (
                <div className="mt-2 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]">
                  {searching ? (
                    <div className="px-3 py-2.5 text-xs text-[var(--color-mute)]">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-3 py-2.5 text-xs text-[var(--color-mute)]">No users found.</div>
                  ) : (
                    searchResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleNewConversation(u.id)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-white/5 transition-colors"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-[10px] font-bold text-black shrink-0 overflow-hidden">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-[var(--color-ink)]">{u.username}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
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
                conversations.map((convo) => {
                  const previewDeleted = convo.lastMessage?.deletedFor
                    ? convo.lastMessage.deletedFor.split(",").includes(myId ?? "")
                    : false;
                  return (
                    <button
                      key={convo.id}
                      onClick={() => {
                        setActiveConvoId(convo.id);
                        setSeenByOther(convo.otherLastReadAt ?? null);
                        setReplyTo(null);
                        router.replace(`/messages?conversation=${convo.id}`);
                      }}
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
                            {previewDeleted || !convo.lastMessage
                              ? convo.lastMessage ? "You deleted this message" : "No messages yet"
                              : convo.lastMessage.isDeleted
                                ? "[deleted]"
                                : convo.lastMessage.content}
                          </p>
                          {convo.unreadCount > 0 && (
                            <span className="shrink-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-magenta)] px-1 text-[9px] font-bold text-black">
                              {convo.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
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
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--color-ink)] truncate">
                      {activeConvo.otherUser?.username ?? "Chat"}
                    </span>
                    <span className="block text-[11px] text-[var(--color-cyan)]">
                      {otherTyping ? "typing..." : ""}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  {visibleMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-[var(--color-mute)]">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    visibleMessages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        myId={myId ?? ""}
                        isOwn={msg.senderId === myId}
                        isSeen={
                          msg.id === lastOwnId &&
                          !!seenByOther &&
                          new Date(msg.createdAt) <= new Date(seenByOther)
                        }
                        onToggleReaction={(emoji) => handleToggleReaction(msg.id, emoji)}
                        onReply={() => setReplyTo(msg)}
                        onDelete={(mode) => handleDelete(msg.id, mode)}
                      />
                    ))
                  )}
                  {otherTyping && (
                    <div className="flex justify-start mt-1">
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-mute)]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-mute)] [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-mute)] [animation-delay:240ms]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="relative border-t border-[var(--color-line)] p-3">
                  {replyTo && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-[var(--color-cyan)]">
                          Replying to {replyTo.sender.username}
                        </p>
                        <p className="truncate text-xs text-[var(--color-mute)]">
                          {replyTo.isDeleted ? "[deleted]" : replyTo.content}
                        </p>
                      </div>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="shrink-0 text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                        aria-label="Cancel reply"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setPickerOpen((v) => !v)}
                        aria-label="Emoji"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg hover:bg-white/5 transition-colors"
                      >
                        😀
                      </button>
                      {pickerOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
                          <div className="absolute bottom-full left-0 z-20 mb-2 grid w-56 grid-cols-7 gap-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-2 shadow-xl">
                            {EMOJIS.map((e) => (
                              <button
                                key={e}
                                onClick={() => {
                                  setInput((prev) => prev + e);
                                  setPickerOpen(false);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-base hover:bg-white/5"
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={replyTo ? "Reply..." : "Type a message..."}
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
