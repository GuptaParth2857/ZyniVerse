"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import type { DnaProfile } from "@/lib/dna";

const EASE = [0.22, 1, 0.36, 1] as const;

function DnaHelix({ colors }: { colors: string[] }) {
  const rungs = colors.slice(0, 8);
  return (
    <div aria-hidden className="relative mx-auto h-40 w-44">
      <div className="absolute inset-x-1/2 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      {rungs.map((color, i) => {
        const top = 6 + i * 18;
        const swing = Math.sin((i / rungs.length) * Math.PI * 2) * 26;
        return (
          <div key={i} className="absolute h-px w-14" style={{ top: `${top}px`, left: "50%" }}>
            <div
              className="absolute -top-3 h-2 w-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 10px ${color}`, left: `${Math.round(56 + swing)}px` }}
            />
            <div
              className="absolute -top-3 h-2 w-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 10px ${color}`, left: `calc(100% - 8px)`, right: `${Math.round(56 - swing)}px` }}
            />
            <span className="absolute -top-[7px] h-px w-px bg-white/30" style={{ left: "50%" }} />
          </div>
        );
      })}
    </div>
  );
}

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export default function DnaExplorer({ profile, isOwn }: { profile: DnaProfile; isOwn: boolean }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  const shareUrl = `${baseUrl}/dna/${profile.username}`;

  const shareText = `🧬 My Anime DNA — "${profile.archetype.label}" on ZyniVerse!\n🎬 ${profile.totalAnime} titles | 🏆 Mean ${profile.meanScore}/100 | 🔥 ${profile.streak}-day streak\nTop: ${profile.topGenres.map((g) => g.genre).join(", ") || "everything"}\n👉 ${shareUrl}\n#ZyniVerse #AnimeDNA`;

  const handleDownload = useCallback(async () => {
    const node = cardRef.current;
    if (!node || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: "#0a0a14" });
      const link = document.createElement("a");
      link.download = `zyniverse-anime-dna-${profile.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // ignore — export is best-effort
    } finally {
      setExporting(false);
    }
  }, [exporting, profile.username]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [shareText]);

  const handleTweet = useCallback(() => {
    const text = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "width=600,height=420");
  }, [shareText]);

  const { r, g, b } = parseHexColor(profile.fingerprint);
  const fingerprintGlow = `rgba(${r},${g},${b},0.35)`;
  const geneColors = [
    profile.fingerprint,
    ...profile.genes.map((gene) => gene.split("·")[1]?.trim() || profile.fingerprint),
  ];
  const subtitle = isOwn
    ? "Apna Anime DNA — watchlist, genres aur streaks se bana. Download karke share karo!"
    : `Yeh ${profile.displayName} ka Anime DNA hai`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="neon-banner-btn inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-void)]"
        >
          {exporting ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-void)]/30 border-t-[var(--color-void)]" />
              Rendering…
            </>
          ) : (
            <>⬇️ Download PNG</>
          )}
        </button>
        <button
          onClick={handleCopy}
          className="rounded-xl border border-[var(--color-line)] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
        >
          {copied ? "✅ Copied" : "🔗 Copy Share"}
        </button>
        <button
          onClick={handleTweet}
          className="rounded-xl border border-[var(--color-line)] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
        >
          🐦 Tweet
        </button>
      </div>

      <p className="text-center text-sm text-[var(--color-mute)]">{subtitle}</p>

      {/* ─────────── THE DNA CARD ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        ref={cardRef}
        className="neon-premium relative overflow-hidden rounded-[28px]"
      >
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(60% 45% at 50% 0%, ${fingerprintGlow}, transparent 70%), radial-gradient(45% 40% at 85% 85%, rgba(255,122,217,0.22), transparent 70%), radial-gradient(45% 40% at 12% 80%, rgba(0,255,224,0.16), transparent 70%)`,
          }}
        />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            {profile.avatar ? (
              <Image src={profile.avatar} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--color-cyan)]/50" />
            ) : (
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-black uppercase"
                style={{ background: `${profile.fingerprint}33`, color: profile.fingerprint, border: `1px solid ${profile.fingerprint}` }}
              >
                {profile.username[0] || "Z"}
              </span>
            )}
            <div className="min-w-0">
              <p className="console-label flex items-center gap-2 text-[var(--color-cyan)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                </span>
                ANIME DNA
              </p>
              <h1 className="truncate font-display text-xl font-black text-white">{profile.displayName}</h1>
            </div>
            <span
              className="ml-auto shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: profile.fingerprint, borderColor: `${profile.fingerprint}66`, background: `${profile.fingerprint}14` }}
            >
              ID-{profile.shareCode}
            </span>
          </div>

          {/* Archetype */}
          <div className="mt-6 flex flex-col items-center text-center">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
              className="text-6xl"
              style={{ filter: `drop-shadow(0 0 18px ${fingerprintGlow})` }}
            >
              {profile.archetype.emoji}
            </motion.span>
            <h2 className="neon-text-gradient mt-3 font-display text-3xl font-black tracking-tight">{profile.archetype.label}</h2>
            <p className="mt-2 max-w-md text-sm font-medium text-[var(--color-ink)]/90">{profile.archetype.punchline}</p>
          </div>

          {/* Helix */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <DnaHelix colors={geneColors} />
          </div>

          {/* Genes strip */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {profile.genes.map((gene, i) => {
              const color = gene.split("·")[1]?.trim() || profile.fingerprint;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{ color, borderColor: `${color}55`, background: `${color}12` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                  {gene.split("·")[0]}
                </span>
              );
            })}
          </div>

          {/* Fingerprint */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span
              className="h-10 w-10 rounded-lg border border-white/20"
              style={{ background: profile.fingerprint, boxShadow: `0 0 22px ${fingerprintGlow}` }}
            />
            <span className="font-mono text-sm font-bold uppercase tracking-widest" style={{ color: profile.fingerprint }}>
              {profile.fingerprint} · {profile.shareCode}
            </span>
          </div>

          {/* Top genres */}
          <div className="mt-6 space-y-2.5">
            {profile.topGenres.map((g) => {
              const c = `hsl(${Math.round(hash(g.genre) % 360)}, 72%, 58%)`;
              return (
                <div key={g.genre} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 truncate text-left text-[10px] font-bold uppercase tracking-wide text-white/60">{g.genre}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(8, g.pct * 3)}%` }}
                      transition={{ delay: 0.25 + g.count % 3 * 0.1, duration: 0.8, ease: EASE }}
                      className="h-full rounded-full"
                      style={{ background: c, boxShadow: `0 0 12px ${c}55` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right font-mono text-[10px] text-white/50">{g.count}</span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[
              { label: "Titles", value: profile.totalAnime, icon: "🎬" },
              { label: "Completed", value: profile.completedCount, icon: "✅" },
              { label: "Mean Score", value: profile.meanScore, icon: "🏆" },
              { label: "Days Watched", value: profile.totalDaysWatched, icon: "⏱️" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)]/50 px-2 py-3 text-center">
                <p className="text-base">{s.icon}</p>
                <p className="mt-1 font-display text-lg font-black text-[var(--color-ink)]">{s.value}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-mute)]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Watch style */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)]/50 px-4 py-3">
            <span className="text-2xl">{profile.watchStyle.emoji}</span>
            <div>
              <p className="font-display text-sm font-bold text-[var(--color-ink)]">{profile.watchStyle.label}</p>
              <p className="text-xs text-[var(--color-mute)]">{profile.watchStyle.note}</p>
            </div>
            {profile.favoriteStudio && (
              <span className="ml-auto hidden rounded-full border border-[var(--color-line)] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] sm:block">
                🏢 {profile.favoriteStudio}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-mute)]">
              ZyniVerse · Anime DNA
            </span>
            <Link href={shareUrl} className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-cyan)] hover:underline">
              {shareUrl.replace("https://", "")}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// tiny stable hash so bar colors look deterministic
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i) | 0;
  return Math.abs(h);
}