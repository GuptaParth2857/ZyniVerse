"use client";

import { useMemo, useState } from "react";
import { QUESTIONS, computePersonality, shareLinkOf, type Personality } from "@/lib/quiz-personality";

function shareTextOf(p: Personality, name: string) {
  return `${name.trim() ? `${name.trim()}: ` : ""}Mera anime personality: ${p.name} (${p.anime}) ${p.emoji} — ${p.line} 🤩`;
}

export default function QuizPersonality({ initialResult }: { initialResult?: Personality }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [result, setResult] = useState<Personality | null>(initialResult ?? null);
  const [copied, setCopied] = useState(false);

  const q = QUESTIONS[step];
  const total = QUESTIONS.length;

  function pick(w: string[]) {
    const next = [...picks, w[0]];
    setPicks(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      setResult(computePersonality(next as never));
    }
  }

  function restart() {
    setStep(0);
    setPicks([]);
    setResult(null);
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${result ? shareTextOf(result, name) : ""}\n\n${shareLinkOf(result!.key, name)}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const whatsapp = useMemo(() => {
    if (!result) return "";
    const txt = `${shareTextOf(result, name)}\n\n${shareLinkOf(result.key, name)}`;
    return `https://wa.me/?text=${encodeURIComponent(txt)}`;
  }, [result, name]);

  // ---------- RESULT SHARE ----------
  if (result) {
    return (
      <div className="min-h-screen animate-page-in flex flex-col items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <div
            className="neon-rgb-border rounded-2xl overflow-hidden"
          >
            <div
              className="px-6 py-8 flex flex-col items-center text-center relative"
              style={{ background: `linear-gradient(160deg, ${result.from}55 0%, #0b0614 70%)` }}
            >
              <span className="text-6xl mb-2">{result.emoji}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-mute)]">Tumhara anime personality nikla</span>
              <h1 className="font-display text-5xl font-black mt-2" style={{ color: result.accent, textShadow: `0 0 26px ${result.accent}66` }}>
                {result.name}
              </h1>
              <span className="mt-1 text-sm font-bold text-[var(--color-ink)]">{result.anime}</span>
              <p className="mt-3 text-sm text-[var(--color-mute)]">{result.line}</p>

              <div className="mt-5 w-full grid gap-2">
                {result.traits.map((t) => (
                  <div key={t} className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-xs text-[var(--color-ink)]">
                    {t}
                  </div>
                ))}
              </div>

              <div className="mt-5 w-full">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 24))}
                  placeholder="Apna naam daalo (optional)…"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/30 px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-4 py-4 border-t border-[var(--color-line)] bg-[var(--color-panel)]/40">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25d366]/15 border border-[#25d366]/40 px-4 py-2 text-xs font-bold text-[#25d366] hover:bg-[#25d366]/25 transition-colors"
              >
                WhatsApp pe share
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextOf(result, name))}&url=${encodeURIComponent(shareLinkOf(result.key, name))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/15 transition-colors"
              >
                𝕏 / X
              </a>
              <button
                onClick={() => void copy()}
                className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
              >
                {copied ? "Copied ✓" : "Copy link"}
              </button>
              <button
                onClick={restart}
                className="ml-auto rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
              >
                Phir se khelo
              </button>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-[var(--color-mute)]">
            Result card → WhatsApp pe link bhejo, card preview screenshot bhi banta hai.
          </p>
        </div>
      </div>
    );
  }

  // ---------- QUESTION FLOW ----------
  return (
    <div className="min-h-screen animate-page-in flex flex-col items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8a2be2]">
            Personal test • {step + 1}/{total}
          </span>
          <span className="font-mono text-[11px] text-[var(--color-mute)]">ZyniVerse</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8a2be2] to-[#ff00ff] transition-all duration-500"
            style={{ width: `${((step) / total) * 100}%` }}
          />
        </div>

        <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 p-6">
          <h2 className="text-xl font-bold text-[var(--color-ink)] leading-snug min-h-[3.5rem]">{q.q}</h2>

          <div className="mt-6 grid gap-3">
            {q.options.map((o) => (
              <button
                key={o.text}
                onClick={() => pick(o.w)}
                className="group text-left rounded-xl border border-[var(--color-line)] bg-black/25 px-4 py-3.5 text-sm text-[var(--color-ink)] hover:border-[#8a2be2]/70 hover:bg-[#8a2be2]/10 transition-all hover:translate-x-1"
              >
                {o.text}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-[var(--color-mute)]">
          6 sawaal → apna anime personality jano → WhatsApp pe share karo 😎
        </p>
      </div>
    </div>
  );
}