"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";

type CardId = "theory" | "taste" | "fancast" | "s2predict" | "dreamteam";

type PredictionType = "ending" | "next_arc" | "villain" | "power_up" | "romance" | "twist" | "side_plot";

interface TheoryCard {
  headline: string;
  confidence: number;
  predictions: { type: PredictionType; title: string; text: string }[];
}
interface TasteCard { score: number; verdict: string; brief: string; reasons: string[]; }
interface FancastCard { hook: string; casting: { role: string; actor: string; reason: string }[]; }
interface S2Card { headline: string; story: string; arcs: string[]; stakes: string; new_chars: string[]; reveal: string; }
interface DreamTeamCard { mission: string; team: { member: string; role: string; power: string }[]; }

const TABS: { id: CardId; emoji: string; label: string; blurb: string; public: boolean }[] = [
  { id: "theory", emoji: "🔮", label: "Future Theory", blurb: "Predict what happens next", public: true },
  { id: "taste", emoji: "🎯", label: "Will you like it?", blurb: "AI taste-match for you", public: false },
  { id: "fancast", emoji: "🎬", label: "Live-Action Cast", blurb: "Who would play who", public: true },
  { id: "s2predict", emoji: "🚀", label: "Next Season", blurb: "Predict the continuation", public: true },
  { id: "dreamteam", emoji: "⚔️", label: "Dream Team", blurb: "Assemble a squad", public: true },
];

const PREDICTION_META: Record<PredictionType, { label: string; emoji: string }> = {
  ending: { label: "Ending", emoji: "🔚" },
  next_arc: { label: "Next Arc", emoji: "🧭" },
  villain: { label: "Villain", emoji: "👹" },
  power_up: { label: "Power-up", emoji: "🔥" },
  romance: { label: "Romance", emoji: "💘" },
  twist: { label: "Twist", emoji: "😱" },
  side_plot: { label: "Side Plot", emoji: "🌱" },
};

const VERDICT_COLOR: Record<string, string> = {
  watch: "var(--color-cyan)",
  binge: "var(--color-magenta)",
  wait: "#f59e0b",
  skip: "#ef4444",
};

interface LoadState {
  status: "idle" | "loading" | "done" | "error";
  data: unknown;
  error: string;
}

const emptyState: LoadState = { status: "idle", data: null, error: "" };

export default function AiLab({ animeId, title }: { animeId: number; title: string }) {
  const [active, setActive] = useState<CardId>("theory");
  const [cards, setCards] = useState<Record<CardId, LoadState>>({
    theory: emptyState,
    taste: emptyState,
    fancast: emptyState,
    s2predict: emptyState,
    dreamteam: emptyState,
  });
  const [votes, setVotes] = useState<{ agree: number; refute: number; myVote: boolean | null } | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const load = useCallback(async (cardId: CardId) => {
    setCards((prev) => ({ ...prev, [cardId]: { status: "loading", data: null, error: "" } }));
    try {
      const res = await fetch(`/api/anime/${animeId}/ai-lab?card=${cardId}`, { cache: "no-store" });
      if (res.status === 401) {
        setCards((prev) => ({
          ...prev,
          [cardId]: { status: "error", data: null, error: "signin" },
        }));
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.card) {
        setCards((prev) => ({
          ...prev,
          [cardId]: { status: "error", data: null, error: json.error || "Something went wrong." },
        }));
        return;
      }
      setCards((prev) => ({ ...prev, [cardId]: { status: "done", data: json.card, error: "" } }));
    } catch {
      setCards((prev) => ({
        ...prev,
        [cardId]: { status: "error", data: null, error: "Network error — try again." },
      }));
    }
  }, [animeId]);

  useEffect(() => {
    fetch(`/api/anime/${animeId}/ai-lab/vote`)
      .then((r) => r.json())
      .then((d) => setVotes(d))
      .catch(() => {});
  }, [animeId]);

  function openTab(id: CardId) {
    setActive(id);
    const s = cards[id];
    if (s.status === "idle") load(id);
  }

  async function toggleVote(agree: boolean) {
    const prev = votes;
    setVotes((v) =>
      v
        ? {
            agree: v.agree + (v.myVote === true ? -1 : 0) + (agree && v.myVote !== true ? 1 : 0),
            refute: v.refute + (v.myVote === false ? -1 : 0) + (!agree && v.myVote !== false ? 1 : 0),
            myVote: v.myVote === agree ? null : agree,
          }
        : v
    );
    try {
      const res = await fetch(`/api/anime/${animeId}/ai-lab/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agree }),
      });
      if (res.status === 401) {
        setVotes(prev);
        router.push("/login");
        return;
      }
      const d = await res.json();
      if (d) setVotes({ agree: d.agree, refute: d.refute, myVote: d.myVote });
    } catch {
      setVotes(prev);
    }
  }

  const theory = cards.theory.data as TheoryCard | null;
  const theoryShareText = theory
    ? `🔮 ${title} — Zyni AI Future Theory: ${theory.headline}\n\n${theory.predictions
        .map((p) => `${PREDICTION_META[p.type]?.emoji || "▪"} ${p.title}: ${p.text}`)
        .join("\n")}\n\nSpeculative fan theory, not canon. ${typeof window !== "undefined" ? window.location.origin : "https://zyverse.in"}/anime/${animeId}`
    : "";

  async function copyTheory() {
    try {
      await navigator.clipboard.writeText(theoryShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  async function downloadTheoryCard() {
    if (!captureRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `zyniverse-theory-${animeId}.png`;
      a.click();
    } catch { /* ignore */ }
    setDownloading(false);
  }

  const activeState = cards[active];

  return (
    <section>
      <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
        Zyni AI Lab
        <span className="ml-auto rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-2.5 py-1 font-mono text-[10px] text-[var(--color-cyan)]">
          AI · speculative
        </span>
        <Link
          href="/theories"
          className="rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-2.5 py-1 font-mono text-[10px] font-bold text-[var(--color-magenta)] transition-colors hover:bg-[var(--color-magenta)]/20"
        >
          Top theories →
        </Link>
      </h2>

      {/* Tab pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => openTab(tab.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              active === tab.id
                ? "neon-rgb-border bg-white/10 text-white shadow-[0_0_18px_-6px_var(--color-cyan)]"
                : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)]"
            }`}
            title={tab.blurb}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
        {activeState.status === "loading" && (
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-white/5" />
            <p className="pt-2 font-mono text-[10px] text-[var(--color-mute)]">Zyni AI is thinking…</p>
          </div>
        )}

        {activeState.status === "error" && (
          <div className="py-4 text-center">
            {activeState.error === "signin" ? (
              <>
                <p className="text-2xl">🔮</p>
                <p className="mt-2 text-sm text-[var(--color-mute)]">
                  Sign in to let Zyni AI cook up a {TABS.find((t) => t.id === active)?.label.toLowerCase() || "card"} for this anime.
                </p>
                <Link href="/login" className="mt-3 inline-block rounded-full neon-rgb-border bg-white/10 px-6 py-2 text-xs font-bold text-white hover:bg-[var(--color-magenta)]">
                  Sign in free
                </Link>
              </>
            ) : (
              <p className="text-sm text-[var(--color-mute)]">{activeState.error}</p>
            )}
          </div>
        )}

        {activeState.status === "done" && active === "theory" && theory && (
          <div>
            <div ref={captureRef} className="rounded-xl bg-gradient-to-br from-[#0d0b16] via-[#1a1030] to-[#0d0b16] p-6">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-cyan)]">
                <span>🔮 Zyni AI Future Theory</span>
                <span className="text-white/30">·</span>
                <span className="text-white/40">{title}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white">{theory.headline}</h3>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]" style={{ width: `${Math.min(100, Math.max(0, theory.confidence || 50))}%` }} />
              </div>
              <p className="mt-1 font-mono text-[10px] text-white/40">
                {theory.confidence ?? 50}% AI confidence · speculation, not canon
              </p>
              <div className="mt-5 space-y-3">
                {(theory.predictions || []).map((p, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-magenta)]">
                      {PREDICTION_META[p.type]?.emoji || "▪"} {PREDICTION_META[p.type]?.label || p.type} — {p.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/85">{p.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <span className="font-mono text-[9px] text-white/40">Generated by ZyniVerse AI · fan theory · may be legendary</span>
                <span className="font-mono text-[10px] font-bold tracking-wider text-white/70">✦ zyverse.in</span>
              </div>
            </div>

            {/* Vote + share bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleVote(true)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  votes?.myVote === true
                    ? "bg-[var(--color-cyan)] text-black"
                    : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
                }`}
              >
                🙏 I think so {votes ? `· ${votes.agree}` : ""}
              </button>
              <button
                onClick={() => toggleVote(false)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  votes?.myVote === false
                    ? "bg-[var(--color-magenta)] text-black"
                    : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)]"
                }`}
              >
                🧢 Cap {votes ? `· ${votes.refute}` : ""}
              </button>
              <button onClick={copyTheory} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-bold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                {copied ? "✓ Copied" : "Copy text"}
              </button>
              <button onClick={downloadTheoryCard} disabled={downloading} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-bold text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] disabled:opacity-50">
                {downloading ? "Rendering…" : "Save card 📸"}
              </button>
            </div>
          </div>
        )}

        {activeState.status === "done" && active === "taste" && (
          <TasteView card={cards.taste.data as TasteCard} title={title} />
        )}
        {activeState.status === "done" && active === "fancast" && (
          <div className="space-y-4">
            <p className="text-2xl">🎬</p>
            <p className="text-sm font-semibold italic text-[var(--color-cyan)]">{(cards.fancast.data as FancastCard)?.hook}</p>
            <div className="space-y-2">
              {((cards.fancast.data as FancastCard)?.casting || []).map((c, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-[var(--color-line)] bg-black/20 p-3">
                  <span className="rounded-md bg-[var(--color-magenta)]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--color-magenta)]">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{c.role} <span className="font-mono text-[10px] font-normal text-white/40">→</span> <span className="text-[var(--color-cyan)]">{c.actor}</span></p>
                    <p className="text-xs text-[var(--color-mute)]">{c.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeState.status === "done" && active === "s2predict" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-cyan)]">🚀 Predicted continuation</p>
              <h3 className="font-display text-lg font-bold text-white">{(cards.s2predict.data as S2Card)?.headline}</h3>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-mute)]">{(cards.s2predict.data as S2Card)?.story}</p>
            <div className="flex flex-wrap gap-2">
              {((cards.s2predict.data as S2Card)?.arcs || []).map((a, i) => (
                <span key={i} className="rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-xs text-[var(--color-cyan)]">{a}</span>
              ))}
            </div>
            <div className="rounded-lg border border-[var(--color-line)] bg-black/20 p-3 text-sm">
              <span className="font-bold text-[var(--color-magenta)]">Stakes:</span> <span className="text-[var(--color-mute)]">{(cards.s2predict.data as S2Card)?.stakes}</span>
            </div>
            {(cards.s2predict.data as S2Card)?.new_chars?.length > 0 && (
              <p className="text-xs text-[var(--color-mute)]">
                <span className="font-bold text-white">Possible new faces:</span> {((cards.s2predict.data as S2Card).new_chars || []).join(", ")}
              </p>
            )}
            <p className="rounded-lg border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10 p-3 text-xs italic text-[var(--color-magenta)]">
              {`Season tease: `}{(cards.s2predict.data as S2Card)?.reveal}
            </p>
          </div>
        )}
        {activeState.status === "done" && active === "dreamteam" && (
          <div className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-cyan)]">⚔️ Dream squad</p>
            <p className="text-sm font-semibold text-white">{(cards.dreamteam.data as DreamTeamCard)?.mission}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {((cards.dreamteam.data as DreamTeamCard)?.team || []).map((m, i) => (
                <div key={i} className="rounded-lg border border-[var(--color-line)] bg-black/20 p-3">
                  <p className="text-sm font-bold text-white">{m.member}</p>
                  <p className="font-mono text-[10px] text-[var(--color-magenta)]">{m.role}</p>
                  <p className="mt-1 text-xs text-[var(--color-mute)]">{m.power}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TasteView({ card, title }: { card: TasteCard; title: string }) {
  if (!card) return null;
  const score = Math.min(100, Math.max(0, card.score || 0));
  const barColor = score >= 75 ? "var(--color-cyan)" : score >= 45 ? "#f59e0b" : "var(--color-magenta)";
  const verdict = card.verdict || "Watch now";
  const verdictColor = VERDICT_COLOR[verdict.toLowerCase().split(" ")[0]] || "var(--color-cyan)";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${barColor} ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-panel)]">
            <span className="font-mono text-xl font-bold" style={{ color: barColor }}>{score}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-white">
            Will you like {title}?
          </p>
          <p className="mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: `${verdictColor}1a`, color: verdictColor, border: `1px solid ${verdictColor}55` }}>
            {verdict}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-mute)]">{card.brief}</p>
      <div className="space-y-2">
        {(card.reasons || []).map((r, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-[var(--color-line)] bg-black/20 p-3">
            <span className="text-[var(--color-cyan)]">▸</span>
            <p className="text-xs leading-relaxed text-[var(--color-mute)]">{r}</p>
          </div>
        ))}
      </div>
      <p className="font-mono text-[9px] text-white/30">Scored against your favourite genres, moods & tracked shows · Zyni AI</p>
    </div>
  );
}