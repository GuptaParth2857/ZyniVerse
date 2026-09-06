"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Who are you?",
  "Kaise ho?",
  "Sach batao, tum kya karte rehte ho?",
  "Tumhara favourite moment kya hai?",
];

export default function CharacterChat({
  characterId,
  characterName,
  avatar,
  accent,
}: {
  characterId: number;
  characterName: string;
  avatar?: string | null;
  accent: string;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listen, setListen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<{ start(): void; stop(): void; abort(): void } | null>(null);

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN";
    u.pitch = 1;
    u.rate = 1;
    window.speechSynthesis.speak(u);
  }

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; lang: string; onresult: (e: unknown) => void; onend: () => void; onerror: () => void; start(): void; stop(): void; abort(): void } }).webkitSpeechRecognition;
    if (!SR) {
      setError("Voice input isn't supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "hi-IN";
    rec.onresult = (e) => {
      const ev = e as { results: { length: number; [i: number]: { [j: number]: { transcript: string } | undefined; isFinal?: boolean } } };
      let text = "";
      for (let i = 0; i < ev.results.length; i++) {
        const part = ev.results[i][0];
        if (part) text += part.transcript;
      }
      setInput(text);
    };
    rec.onend = () => setListen(false);
    rec.onerror = () => setListen(false);
    recRef.current = rec;
    rec.start();
    setListen(true);
    setError("");
  }, []);

  function stopListening() {
    recRef.current?.stop();
    setListen(false);
  }

  function toggleListen() {
    if (listen) stopListening();
    else startListening();
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setInput("");
    setError("");
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/character-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No reply.");
      const reply = data.reply as string;
      setMessages([...next, { role: "assistant", content: reply }]);
      if (autoSpeak) speak(reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the character.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-[70] sm:bottom-20">
      {/* Expand / collapse bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with this character"
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-[0_0_18px_rgba(0,255,224,0.25)] transition-all hover:scale-105"
        style={{ borderColor: accent, background: "var(--color-void)" }}
      >
        {open ? <span className="text-2xl">✕</span> : (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent }} />
            <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: accent }} />
          </span>
        )}
      </button>

      {open && (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-3 w-80 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl"
            style={{ position: "absolute", bottom: "100%", right: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-[var(--color-line)] px-3 py-2.5" style={{ background: `${accent}14` }}>
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: accent }}>
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt={characterName} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-bold" style={{ color: accent }}>{characterName.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold" style={{ color: accent }}>{characterName}</p>
                <p className="text-[9px] text-[var(--color-mute)]">
                  {busy ? "thinking…" : <>✨ talk to me in Hinglish</>}
                </p>
              </div>
              <button
                onClick={() => { setMessages([]); setError(""); }}
                className="rounded-full px-2 py-0.5 text-[9px] font-mono uppercase text-[var(--color-mute)] hover:text-red-400 transition-colors"
              >Clear</button>
            </div>

            {!session?.user?.id ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[var(--color-mute)]">Sign in to talk to {characterName}.</p>
                <Link href="/login" className="mt-3 inline-block rounded-full border border-cyan-500/40 bg-cyan-500/10 px-5 py-2 text-xs font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20">Sign In</Link>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div ref={boxRef} className="max-h-56 min-h-[120px] space-y-2 overflow-y-auto px-3 py-3">
                  {messages.length === 0 && (
                    <p className="text-xs text-[var(--color-mute)]">Hi! I&apos;m {characterName}. Ask me anything — main in hi character me jawab dungi/unga. 👇</p>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "border border-magenta-500/30 bg-magenta-500/10"
                          : "border border-[var(--color-line)] bg-black/25"
                      }`}>
                        {m.content}
                        {m.role === "assistant" && (
                          <button
                            onClick={() => speak(m.content)}
                            aria-label="Hear reply"
                            className="mt-1.5 flex items-center gap-1 rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[9px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors"
                          >🔊 Hear</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {busy && (
                    <p className="text-xs text-[var(--color-mute)]"><span style={{ color: accent }}>{characterName}</span> is typing…</p>
                  )}
                </div>

                {/* Suggestions */}
                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => void send(s)}
                        className="rounded-full border border-[var(--color-line)] px-2.5 py-1 text-[9px] text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {error && <p className="mx-3 mt-1 text-[10px] text-red-400">{error}</p>}

                {/* Input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); void send(input); }}
                  className="border-t border-[var(--color-line)] px-3 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleListen}
                      aria-label={listen ? "Stop listening" : "Talk to the character"}
                      title="Voice input"
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        listen ? "border-red-400 bg-red-500/20 text-red-400" : "border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
                      }`}
                    >
                      {listen ? "⏹" : "🎤"}
                    </button>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={listen ? "Listening…" : `Message ${characterName}…`}
                      maxLength={300}
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    />
                    <button
                      type="button"
                      onClick={() => setAutoSpeak((v) => !v)}
                      aria-label="Toggle auto-read replies"
                      title="Auto-read replies"
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        autoSpeak ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]" : "border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
                      }`}
                    >🔊</button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}