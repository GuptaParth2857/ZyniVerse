"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { NeonFilterShell } from "@/components/NeonSelect";

interface MediaCardItem {
  id: number;
  title: string;
  poster: string | null;
  year?: number | null;
  format?: string | null;
  type?: string;
  score?: number | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface StoredMessage extends ChatMessage {
  media?: MediaCardItem[];
}

const CHAT_STORAGE_KEY = "zyni-ai-chat-v1";
const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm Zyni AI ✨ Ask me anything about anime or manga — recommendations, plot questions, where to start, anything!",
};

function loadChatHistory(): { messages: ChatMessage[]; mediaByIndex: Record<number, MediaCardItem[]> } | null {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMessage[];
    if (!Array.isArray(parsed)) return null;
    const valid = parsed.filter(
      (m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant")
    );
    if (valid.length === 0) return null;
    const messages: ChatMessage[] = [];
    const mediaByIndex: Record<number, MediaCardItem[]> = {};
    valid.forEach((m, i) => {
      messages.push({ role: m.role, content: m.content });
      if (Array.isArray(m.media) && m.media.length > 0) mediaByIndex[i] = m.media;
    });
    return { messages, mediaByIndex };
  } catch {
    return null;
  }
}

function loadStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full/blocked */
  }
}

function clearStored(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

const EASE = [0.22, 1, 0.36, 1] as const;

const QUICK_PROMPTS = [
  "Anime like Attack on Titan?",
  "Hidden gems of 2025",
  "Short anime under 12 episodes",
  "Anime that will make me cry",
];

const VIBE_PRESETS = [
  "Cozy slice of life",
  "Dark psychological",
  "Epic shonen battles",
  "Tearjerker romance",
];

/* 3D tilt wrapper — same interaction as VoiceLineCard */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const py = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="h-full"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      {children}
    </div>
  );
}

function MediaGrid({ items }: { items: MediaCardItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
      {items.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: (i % 9) * 0.07, ease: EASE }}
        >
          <TiltCard>
            <Link href={`/anime/${m.id}`} className="group block h-full no-underline">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-[var(--color-line)] group-hover:border-[var(--color-cyan)] group-hover:shadow-[0_0_14px_rgba(0,255,224,0.25)] transition-all">
                {m.poster ? (
                  <Image src={m.poster} alt={m.title} fill className="object-cover" sizes="(max-width:640px) 30vw, 15vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[var(--color-mute)]">No art</div>
                )}
                {m.score ? (
                  <span className="absolute top-1 right-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-[#ffd700]">
                    ★ {(m.score / 10).toFixed(1)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 truncate text-xs font-medium">{m.title}</p>
              {m.year && <p className="truncate text-[10px] text-[var(--color-mute)]">{m.year}</p>}
            </Link>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
    >
      {message}
    </motion.p>
  );
}

function chipClass(active: boolean): string {
  return active
    ? "rounded-full border border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-cyan)] shadow-[0_0_14px_rgba(0,255,224,0.2)] transition-all"
    : "rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--color-mute)] transition-all hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]";
}

function ChatTab() {
  const [restored] = useState(() => (typeof window === "undefined" ? null : loadChatHistory()));
  const [messages, setMessages] = useState<ChatMessage[]>(() => restored?.messages ?? [GREETING]);
  const [mediaByIndex, setMediaByIndex] = useState<Record<number, MediaCardItem[]>>(
    () => restored?.mediaByIndex ?? {}
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);

  /* Keep the scroll INSIDE the messages box — never move the page itself */
  useEffect(() => {
    const el = scrollBoxRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: firstScroll.current ? "auto" : "smooth" });
    firstScroll.current = false;
  }, [messages, busy]);

  /* Persist after every change */
  useEffect(() => {
    try {
      const stored: StoredMessage[] = messages.map((m, i) =>
        mediaByIndex[i] ? { ...m, media: mediaByIndex[i] } : { ...m }
      );
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(stored.slice(-40)));
    } catch {
      /* storage full/blocked — chat still works in-memory */
    }
  }, [messages, mediaByIndex]);

  function clearChat() {
    setMessages([GREETING]);
    setMediaByIndex({});
    setError("");
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {}
  }

  async function ask(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setInput("");
    setError("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      const withReply: ChatMessage[] = [...nextMessages, { role: "assistant", content: data.reply }];
      setMessages(withReply);
      if (Array.isArray(data.media) && data.media.length > 0) {
        setMediaByIndex((prev) => ({ ...prev, [withReply.length - 1]: data.media }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <div className="neon-premium rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content overflow-hidden rounded-[20px]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
          <span className="h-1.5 w-8 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_rgba(0,255,224,0.55)]" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-cyan)]">✦ Zyni Chat</span>
          <span className="ml-auto flex items-center gap-2">
            {messages.length > 1 && (
              <motion.button
                whileTap={{ scale: 0.82 }}
                onClick={clearChat}
                disabled={busy}
                title="Clear chat history"
                className="flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2.5 py-1 text-[10px] font-mono uppercase text-[var(--color-mute)] transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
                Clear
              </motion.button>
            )}
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2.5 py-0.5 font-mono text-[10px] uppercase text-[var(--color-mute)]">
              Gemini
            </span>
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollBoxRef} className="max-h-[50vh] min-h-[220px] space-y-4 overflow-y-auto px-4 py-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10"
                      : "border border-[var(--color-line)] bg-black/25"
                  }`}
                >
                  {m.content}
                </div>
                {mediaByIndex[i] && (
                  <div className="mt-2 w-full">
                    <MediaGrid items={mediaByIndex[i]} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-[var(--color-mute)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-cyan)]" />
              </span>
              Zyni AI is thinking…
            </motion.div>
          )}
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {QUICK_PROMPTS.map((p) => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.94 }}
              disabled={busy}
              onClick={() => void ask(p)}
              className={chipClass(false) + " disabled:opacity-40"}
            >
              {p}
            </motion.button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={send} className="border-t border-[var(--color-line)] px-4 py-3">
          {error && <ErrorNote message={error} />}
          <NeonFilterShell className="mt-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any anime…"
              maxLength={500}
              className="flex-1 bg-transparent py-3 pl-4 pr-4 text-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-mute)]"
            />
            <motion.button
              whileTap={{ scale: 0.82 }}
              disabled={busy}
              className="shrink-0 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              <span className="bg-gradient-to-r from-[#ff00e6] via-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">Send ➤</span>
            </motion.button>
          </NeonFilterShell>
        </form>
      </div>
    </div>
  );
}

interface IdentifyState {
  result: {
    title: string;
    confidence: number | null;
    episodeGuess: string | null;
    characters: string[];
    scene: string | null;
  };
  matches: MediaCardItem[];
}

const IDENTIFY_KEY = "zyni-ai-identify-v1";
const VIBE_KEY = "zyni-ai-vibe-v1";

function IdentifyTab() {
  const [restored] = useState(() =>
    typeof window === "undefined" ? null : loadStored<IdentifyState>(IDENTIFY_KEY)
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<IdentifyState["result"] | null>(() => restored?.result ?? null);
  const [matches, setMatches] = useState<MediaCardItem[]>(() => restored?.matches ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /* Persist last identification (image preview can't be saved, file objects
     aren't serializable — result card + matches restore fine) */
  useEffect(() => {
    if (result) saveStored(IDENTIFY_KEY, { result, matches });
    else clearStored(IDENTIFY_KEY);
  }, [result, matches]);

  function pick(f: File | undefined | null) {
    setResult(null);
    setMatches([]);
    setError("");
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function analyze() {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/ai/identify", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't analyze that image.");
      setResult(data.identification);
      setMatches(data.matches ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="neon-premium rounded-[20px]">
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content overflow-hidden rounded-[20px]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
            <span className="h-1.5 w-8 rounded-full bg-[var(--color-magenta)] shadow-[0_0_10px_rgba(255,64,146,0.55)]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-magenta)]">✦ Screenshot ID</span>
            <span className="ml-auto rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2.5 py-0.5 font-mono text-[10px] uppercase text-[var(--color-mute)]">
              Vision
            </span>
          </div>

          {/* Drop zone */}
          <div className="px-4 py-5">
            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-line)] bg-black/25 px-4 py-10 text-center transition-all hover:border-[var(--color-magenta)]/60">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Screenshot preview" className="max-h-64 rounded-lg object-contain" />
              ) : (
                <>
                  <motion.span
                    whileHover={{ rotate: 8, scale: 1.08 }}
                    className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 text-2xl shadow-[0_0_16px_rgba(255,64,146,0.25)]"
                  >
                    📸
                  </motion.span>
                  <span className="text-sm font-semibold">Drop an anime screenshot here</span>
                  <span className="mt-1 text-xs text-[var(--color-mute)]">or click to choose an image (max 5MB)</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            </label>
          </div>

          {/* Action */}
          {file && !result && (
            <div className="border-t border-[var(--color-line)] px-4 py-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={analyze}
                disabled={busy}
                className="w-full rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 py-3 text-sm font-bold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20 disabled:opacity-50"
              >
                {busy ? "Analyzing…" : "Identify Anime"}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {error && <ErrorNote message={error} />}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="neon-premium mt-4 rounded-[20px]"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
            <div className="neon-premium-content rounded-[20px] p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_rgba(0,255,224,0.55)]" />
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  Identified
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-display text-lg font-bold text-[var(--color-cyan)]">{result.title}</h3>
                {result.confidence !== null && (
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                    result.confidence >= 70 ? "border-green-500/30 bg-green-500/20 text-green-400" : result.confidence >= 40 ? "border-amber-500/30 bg-amber-500/20 text-amber-400" : "border-red-500/30 bg-red-500/20 text-red-400"
                  }`}>
                    {result.confidence}% sure
                  </span>
                )}
              </div>
              {result.episodeGuess && result.episodeGuess !== "unknown" && (
                <p className="mt-1 text-sm text-[var(--color-mute)]">Episode guess: {result.episodeGuess}</p>
              )}
              {result.characters.length > 0 && (
                <p className="mt-1 text-sm text-[var(--color-mute)]">Characters: {result.characters.join(", ")}</p>
              )}
              {result.scene && <p className="mt-2 text-sm italic text-[var(--color-mute)]">“{result.scene}”</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <MediaGrid items={matches} />
    </div>
  );
}

interface VibeState {
  q: string;
  interpreted: { search: string; genre: string | null };
  results: MediaCardItem[];
}

function VibeTab() {
  const [restored] = useState(() =>
    typeof window === "undefined" ? null : loadStored<VibeState>(VIBE_KEY)
  );
  const [q, setQ] = useState(() => restored?.q ?? "");
  const [results, setResults] = useState<MediaCardItem[] | null>(() => restored?.results ?? null);
  const [interpreted, setInterpreted] = useState<VibeState["interpreted"] | null>(
    () => restored?.interpreted ?? null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /* Persist last vibe search so results survive tab switches & reloads */
  useEffect(() => {
    if (q.trim() && results && interpreted) saveStored(VIBE_KEY, { q, interpreted, results });
    else clearStored(VIBE_KEY);
  }, [q, results, interpreted]);

  async function search(query: string) {
    const clean = query.trim();
    if (!clean || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");
      setResults(data.results);
      setInterpreted(data.interpreted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void search(q);
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <NeonFilterShell>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-3.5 shrink-0 text-[var(--color-mute)] group-focus-within:text-[var(--color-magenta)] transition-colors">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. tearjerker romance with beautiful animation"
            maxLength={200}
            className="flex-1 bg-transparent py-3 pr-4 text-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-mute)]"
          />
          <motion.button
            whileTap={{ scale: 0.82 }}
            disabled={busy}
            className="shrink-0 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <span className="bg-gradient-to-r from-[#ff00e6] via-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">{busy ? "…" : "Find ✦"}</span>
          </motion.button>
        </NeonFilterShell>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {VIBE_PRESETS.map((p) => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.94 }}
            disabled={busy}
            onClick={() => { setQ(p); void search(p); }}
            className={chipClass(false) + " disabled:opacity-40"}
          >
            {p}
          </motion.button>
        ))}
      </div>

      <p className="mt-2 text-xs text-[var(--color-mute)]">
        Describe a feeling, not a title — Zyni AI translates vibes into anime.
      </p>
      {error && <ErrorNote message={error} />}
      {interpreted && results && (
        <>
          <div className="mt-5 flex items-center gap-3">
            <p className="text-sm text-[var(--color-mute)]">
              Interpreted as <span className="font-semibold text-[var(--color-cyan)]">{interpreted.search}</span>
              {interpreted.genre && <> · genre <span className="font-semibold text-[var(--color-cyan)]">{interpreted.genre}</span></>}
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
          </div>
          <MediaGrid items={results} />
        </>
      )}
    </div>
  );
}

const TABS = [
  { id: "chat", label: "💬 Chat" },
  { id: "identify", label: "📸 Identify" },
  { id: "vibe", label: "✨ Vibe Search" },
] as const;

export default function AiClient() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(() => {
    if (typeof window === "undefined") return "chat";
    const t = localStorage.getItem("zyni-ai-tab");
    return t === "identify" || t === "vibe" ? t : "chat";
  });

  useEffect(() => {
    try {
      localStorage.setItem("zyni-ai-tab", tab);
    } catch {}
  }, [tab]);

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="neon-premium rounded-[20px]"
        >
          <div className="neon-premium-track" />
          <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
          <div className="neon-premium-content rounded-[20px] p-8">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
              ✦ Anime Copilot
            </p>
            <div className="mb-4 flex justify-center">
              <div className="neon-rgb-border inline-block rounded-2xl px-5 py-3">
                <h1 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-2xl font-bold text-transparent sm:text-4xl">
                  Zyni AI
                </h1>
              </div>
            </div>
            <p className="text-sm text-[var(--color-mute)] mb-6">
              Sign in to chat with Zyni AI, identify anime from screenshots, and discover anime by vibe.
            </p>
            <motion.div whileTap={{ scale: 0.94 }}>
              <Link href="/login" className="inline-block rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-6 py-3 font-bold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20">
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <section className="mb-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]"
        >
          ✦ Anime Copilot
        </motion.p>
        <div className="neon-rgb-border inline-block rounded-2xl px-5 py-3">
          <h1 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-3xl font-bold text-transparent sm:text-5xl">
            Zyni AI
          </h1>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-mute)]">
          Your anime copilot — chat, identify from screenshots, and search by vibe.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {["Gemini Powered", "Free for everyone", "20 req / day"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 text-xs text-[var(--color-mute)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              tab === t.id
                ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] shadow-[0_0_14px_rgba(0,255,224,0.2)]"
                : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]"
            }`}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {tab === "chat" && <ChatTab />}
          {tab === "identify" && <IdentifyTab />}
          {tab === "vibe" && <VibeTab />}
        </motion.div>
      </AnimatePresence>

      <p className="mt-8 text-center text-[10px] text-[var(--color-mute)]">
        20 free AI requests per user per day · answers may be wrong sometimes, verify important details
      </p>
    </div>
  );
}
