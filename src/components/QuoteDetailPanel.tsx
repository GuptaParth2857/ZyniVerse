"use client";

import { motion } from "framer-motion";
import type { VoiceLine } from "@/lib/voice-lines";

const typeAccent: Record<string, string> = {
  iconic: "#facc15",
  funny: "#4ade80",
  inspiring: "#60a5fa",
  sad: "#a78bfa",
  badass: "#f87171",
  romantic: "#f472b6",
};

const langLabels: Record<string, string> = {
  english: "EN",
  japanese: "JP",
  hindi: "HI",
  tamil: "TA",
  telugu: "TE",
};

const EASE = [0.22, 1, 0.36, 1] as const;

function InfoItem({ label, value, accent, i }: { label: string; value: string; accent: string; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: EASE }}
      className="rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-mute)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>
        {value}
      </p>
    </motion.div>
  );
}

function Block({ label, value, accent, delay }: { label: string; value: string; accent: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-mute)]">
        {label}
      </p>
      <p className="mt-1 text-sm italic" style={{ color: accent }}>
        {value}
      </p>
    </motion.div>
  );
}

export default function QuoteDetailPanel({ line }: { line: VoiceLine }) {
  const accent = typeAccent[line.type] || "#00ffe0";
  const extraDelay = 0.3 + 4 * 0.08;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
      className="neon-premium mt-8 rounded-[20px]"
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span
            className="h-1.5 w-8 rounded-full"
            style={{ background: accent, boxShadow: `0 0 10px ${accent}88` }}
          />
          <h2 className="font-display text-lg font-bold">About this quote</h2>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">
              {line.type}
            </span>
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2.5 py-0.5 text-[10px] font-mono uppercase text-[var(--color-mute)]">
              {langLabels[line.language] || line.language}
            </span>
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="Character" value={line.character} accent={accent} i={0} />
          <InfoItem label="Anime" value={line.animeTitle} accent={accent} i={1} />
          <InfoItem label="Language" value={line.language.charAt(0).toUpperCase() + line.language.slice(1)} accent={accent} i={2} />
          {line.episode ? (
            <InfoItem label="Episode" value={`Ep. ${line.episode}${line.timestamp ? ` · ${line.timestamp}` : ""}`} accent={accent} i={3} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.3 + 3 * 0.08, ease: EASE }}
              className="rounded-xl border border-dashed border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-mute)]"
            >
              No episode info
            </motion.div>
          )}
        </div>

        {line.context && (
          <div className="mt-3">
            <Block
              label="Context"
              value={line.context}
              accent={accent}
              delay={extraDelay}
            />
          </div>
        )}

        {(line.lineJapanese || line.lineHindi) && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {line.lineJapanese && (
              <Block label="Japanese" value={line.lineJapanese} accent="#00ffe0" delay={extraDelay} />
            )}
            {line.lineHindi && (
              <Block label="Hindi" value={line.lineHindi} accent="#ff4092" delay={extraDelay + 0.08} />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
