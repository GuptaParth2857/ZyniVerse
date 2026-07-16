"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/socket";

interface PartyChatProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  currentUserId?: string;
}

export default function PartyChat({ messages, onSend, currentUserId }: PartyChatProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    onSend(input.trim());
    setInput("");
    setTimeout(() => setSending(false), 300);
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider flex items-center gap-2">
        Party Chat
        <span className="rounded-full bg-[rgba(255,0,230,0.1)] px-2 py-0.5 text-[9px] font-bold text-[#ff00e6]">
          {messages.length}
        </span>
      </h3>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto mb-3 min-h-0 max-h-[300px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,0,230,0.05)] border border-[rgba(255,0,230,0.1)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,0,230,0.3)" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-[11px] text-white/25 text-center">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-2 ${msg.userId === currentUserId ? "flex-row-reverse" : ""}`}>
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/30">{msg.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className={`max-w-[75%] ${msg.userId === currentUserId ? "text-right" : ""}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold ${msg.userId === currentUserId ? "text-[#00ffe0]" : "text-[#ff00e6]"}`}>
                    {msg.userId === currentUserId ? "You" : msg.username}
                  </span>
                  <span className="text-[9px] text-white/15">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className={`inline-block rounded-xl px-3 py-2 text-xs ${
                  msg.userId === currentUserId
                    ? "bg-[rgba(0,255,224,0.1)] border border-[rgba(0,255,224,0.15)] text-white/70"
                    : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-white/50"
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] px-3 py-2.5 text-xs text-white outline-none focus:border-[rgba(255,0,230,0.3)] transition-colors placeholder:text-white/20"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="rounded-[10px] bg-[rgba(255,0,230,0.1)] border border-[rgba(255,0,230,0.2)] px-4 py-2.5 text-xs font-bold text-[#ff00e6] hover:bg-[rgba(255,0,230,0.2)] transition-all disabled:opacity-30"
        >
          Send
        </button>
      </div>
    </div>
  );
}
