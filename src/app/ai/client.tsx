"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

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

function MediaGrid({ items }: { items: MediaCardItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
      {items.map((m) => (
        <Link key={m.id} href={`/anime/${m.id}`} className="group">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-[var(--color-line)] group-hover:border-[var(--color-cyan)] transition-colors">
            {m.poster ? (
              <Image src={m.poster} alt={m.title} fill className="object-cover" sizes="(max-width:640px) 30vw, 15vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[var(--color-mute)]">No art</div>
            )}
            {m.score ? (
              <span className="absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-[#ffd700]">
                ★ {(m.score / 10).toFixed(1)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs font-medium">{m.title}</p>
          {m.year && <p className="truncate text-[10px] text-[var(--color-mute)]">{m.year}</p>}
        </Link>
      ))}
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{message}</p>
  );
}

function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm Zyni AI ✨ Ask me anything about anime or manga — recommendations, plot questions, where to start, anything!" },
  ]);
  const [mediaByIndex, setMediaByIndex] = useState<Record<number, MediaCardItem[]>>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
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
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="max-h-[55vh] min-h-[240px] space-y-4 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-black/20 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[var(--color-cyan)]/15 border border-[var(--color-cyan)]/30"
                  : "bg-white/5 border border-[var(--color-line)]"
              }`}
            >
              {m.content}
            </div>
            {mediaByIndex[i] && <MediaGrid items={mediaByIndex[i]} />}
          </div>
        ))}
        {busy && <div className="text-sm text-[var(--color-mute)] animate-pulse">Zyni AI is thinking…</div>}
        <div ref={bottomRef} />
      </div>
      {error && <ErrorNote message={error} />}
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any anime…"
          maxLength={500}
          className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]"
        />
        <button
          disabled={busy}
          className="rounded-lg bg-[var(--color-violet)] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function IdentifyTab() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    title: string;
    confidence: number | null;
    episodeGuess: string | null;
    characters: string[];
    scene: string | null;
  } | null>(null);
  const [matches, setMatches] = useState<MediaCardItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-line)] bg-black/20 px-4 py-10 text-center hover:border-[var(--color-cyan)] transition-colors">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Screenshot preview" className="max-h-64 rounded-lg object-contain" />
        ) : (
          <>
            <span className="text-3xl mb-2">📸</span>
            <span className="text-sm font-medium">Drop an anime screenshot here</span>
            <span className="mt-1 text-xs text-[var(--color-mute)]">or click to choose an image (max 5MB)</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </label>

      {file && !result && (
        <button
          onClick={analyze}
          disabled={busy}
          className="mt-3 w-full rounded-lg bg-[var(--color-violet)] py-3 text-sm font-bold text-black disabled:opacity-50"
        >
          {busy ? "Analyzing…" : "Identify Anime"}
        </button>
      )}
      {error && <ErrorNote message={error} />}

      {result && (
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-display text-lg font-bold text-[var(--color-cyan)]">{result.title}</h3>
            {result.confidence !== null && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                result.confidence >= 70 ? "bg-green-500/15 text-green-400" : result.confidence >= 40 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"
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
      )}
      <MediaGrid items={matches} />
    </div>
  );
}

function VibeTab() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MediaCardItem[] | null>(null);
  const [interpreted, setInterpreted] = useState<{ search: string; genre: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query }),
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

  return (
    <div>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. tearjerker romance with beautiful animation"
          maxLength={200}
          className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]"
        />
        <button
          disabled={busy}
          className="rounded-lg bg-[var(--color-violet)] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          {busy ? "…" : "Find"}
        </button>
      </form>
      <p className="mt-2 text-xs text-[var(--color-mute)]">
        Describe a feeling, not a title — Zyni AI translates vibes into anime.
      </p>
      {error && <ErrorNote message={error} />}
      {interpreted && results && (
        <>
          <p className="mt-4 text-xs text-[var(--color-mute)]">
            Interpreted as: <span className="font-bold text-[var(--color-cyan)]">{interpreted.search}</span>
            {interpreted.genre && <> · genre <span className="font-bold text-[var(--color-cyan)]">{interpreted.genre}</span></>}
          </p>
          <MediaGrid items={results} />
        </>
      )}
    </div>
  );
}

const TABS = [
  { id: "chat", label: "💬 Chat", desc: "Ask Zyni AI anything anime" },
  { id: "identify", label: "📸 Identify", desc: "Screenshot → which anime?" },
  { id: "vibe", label: "✨ Vibe Search", desc: "Mood → anime list" },
] as const;

export default function AiClient() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("chat");

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="font-display text-2xl font-bold mb-2">Zyni AI</h1>
          <p className="text-sm text-[var(--color-mute)] mb-6">
            Sign in to chat with Zyni AI, identify anime from screenshots, and discover anime by vibe.
          </p>
          <Link href="/login" className="inline-block rounded-xl bg-[var(--color-violet)] px-6 py-3 font-bold text-black">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold">
          <span className="logo-text">Zyni</span> AI
        </h1>
        <p className="mt-1 text-sm text-[var(--color-mute)]">Your anime copilot — powered by Gemini, free for everyone</p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl border px-2 py-3 text-center transition-colors ${
              tab === t.id
                ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10"
                : "border-[var(--color-line)] bg-[var(--color-panel)] hover:border-[var(--color-mute)]"
            }`}
          >
            <p className="text-sm font-bold">{t.label}</p>
            <p className="hidden sm:block mt-0.5 text-[10px] text-[var(--color-mute)]">{t.desc}</p>
          </button>
        ))}
      </div>

      {tab === "chat" && <ChatTab />}
      {tab === "identify" && <IdentifyTab />}
      {tab === "vibe" && <VibeTab />}

      <p className="mt-6 text-center text-[10px] text-[var(--color-mute)]">
        20 free AI requests per user per day · answers may be wrong sometimes, verify important details
      </p>
    </div>
  );
}
