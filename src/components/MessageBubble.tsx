"use client";

import { useMemo, useState } from "react";

export interface ReactionView {
  id: string;
  userId: string;
  emoji: string;
  user: { id: string; username: string };
}

export interface MessageView {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  replyToId: string | null;
  replyTo: {
    id: string;
    content: string;
    isDeleted: boolean;
    deletedFor: string;
    sender: { id: string; username: string };
  } | null;
  reactions: ReactionView[];
  isDeleted: boolean;
  deletedFor: string;
  createdAt: string;
  sender: { id: string; username: string; avatar: string | null };
}

interface MessageBubbleProps {
  msg: MessageView;
  myId: string;
  isOwn: boolean;
  isSeen: boolean;
  onToggleReaction: (emoji: string) => void;
  onReply: () => void;
  onDelete: (mode: "me" | "everyone") => void;
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ msg, myId, isOwn, isSeen, onToggleReaction, onReply, onDelete }: MessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, { emoji: string; count: number; mine: boolean }>();
    for (const r of msg.reactions) {
      const g = map.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false };
      g.count += 1;
      if (r.userId === myId) g.mine = true;
      map.set(r.emoji, g);
    }
    return [...map.values()];
  }, [msg.reactions, myId]);

  const actions = (
    <div className="relative flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        onClick={() => onToggleReaction("❤️")}
        title="React"
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs transition-transform hover:scale-110"
      >
        ❤️
      </button>
      <button
        onClick={onReply}
        title="Reply"
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs transition-transform hover:scale-110"
      >
        💬
      </button>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        title="More"
        aria-label="More options"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div
            className={`absolute z-20 top-full mt-1 w-44 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] shadow-xl ${isOwn ? "right-0" : "left-0"}`}
          >
            <button
              onClick={() => { onDelete("me"); setMenuOpen(false); }}
              className="w-full px-3 py-2 text-left text-xs text-[var(--color-ink)] hover:bg-white/5"
            >
              Delete for me
            </button>
            {isOwn && (
              <button
                onClick={() => { onDelete("everyone"); setMenuOpen(false); }}
                className="w-full px-3 py-2 text-left text-xs text-[var(--color-magenta)] hover:bg-white/5"
              >
                Delete for everyone
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className={`group flex items-end gap-1 ${isOwn ? "justify-end" : "justify-start"}`}>
      {isOwn && actions}
      <div className={`flex max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className={`relative rounded-2xl px-3.5 py-2 ${
            isOwn
              ? "bg-[var(--color-magenta)] text-black rounded-br-md"
              : "bg-[var(--color-panel)] text-[var(--color-ink)] rounded-bl-md border border-[var(--color-line)]"
          }`}
        >
          {msg.replyTo && (
            <div
              className={`mb-1.5 rounded-lg px-2 py-1 ${
                isOwn ? "bg-black/15" : "bg-[var(--color-surface)] border border-[var(--color-line)]"
              }`}
            >
              <p className="text-[10px] font-bold">{msg.replyTo.sender.username}</p>
              <p className="truncate text-xs opacity-70">
                {msg.replyTo.isDeleted ? "This message was deleted" : msg.replyTo.content}
              </p>
            </div>
          )}
          {msg.isDeleted ? (
            <p className="text-sm italic text-[var(--color-mute)]">[deleted]</p>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
          )}
          <div className={`mt-1 flex items-center justify-end gap-1 ${isOwn ? "text-black/60" : "text-[var(--color-mute)]"}`}>
            <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
            {isOwn && isSeen && (
              <span className="text-[9px] font-semibold">Seen</span>
            )}
          </div>
        </div>
        {grouped.length > 0 && (
          <div className={`mt-0.5 flex flex-wrap gap-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {grouped.map((g) => (
              <button
                key={g.emoji}
                onClick={() => onToggleReaction(g.emoji)}
                className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors ${
                  g.mine
                    ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/10"
                    : "border-[var(--color-line)] bg-[var(--color-surface)]"
                }`}
              >
                <span>{g.emoji}</span>
                <span className="text-[10px] font-semibold text-[var(--color-mute)]">{g.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {!isOwn && actions}
    </div>
  );
}
