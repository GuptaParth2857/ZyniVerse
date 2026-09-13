"use client";

import Link from "next/link";
import Image from "next/image";
import TipButton from "@/components/TipButton";

interface CreatorCardProps {
  creator: {
    id: string;
    displayName: string | null;
    bio: string | null;
    totalTips: number;
    kofiUrl: string | null;
    buymeacoffeeUrl: string | null;
    upiId: string | null;
    user: { id: string; username: string; avatar: string | null };
  };
}

const BANNERS = [
  "linear-gradient(120deg, rgba(255,122,217,0.35), rgba(0,255,224,0.25))",
  "linear-gradient(120deg, rgba(99,102,241,0.35), rgba(0,255,224,0.2))",
  "linear-gradient(120deg, rgba(0,255,224,0.3), rgba(255,122,217,0.3))",
];

export default function CreatorCard({ creator }: CreatorCardProps) {
  const name = creator.displayName || creator.user.username;
  const bannerIdx = creator.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) % BANNERS.length;

  return (
    <div className="group relative h-full overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-[var(--color-panel)]/50 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-cyan)]/40 hover:shadow-[0_12px_48px_-16px_rgba(0,255,224,0.35)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)" }}
      />

      {/* ── Banner ─────────────────────────────── */}
      <div className="relative h-24 overflow-hidden" style={{ background: BANNERS[bannerIdx] }}>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur">
          Creator
        </div>
      </div>

      <div className="relative p-5">
        {/* ── Identity ─────────────────────────── */}
        <div className="-mt-12 mb-4 flex items-end gap-4">
          <Link href={`/profile/${creator.user.id}`} className="shrink-0 transition-transform group-hover:scale-105">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-4 ring-[var(--color-panel)] ring-offset-0 shadow-xl">
              {creator.user.avatar ? (
                <Image src={creator.user.avatar} alt="" fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] text-xl font-bold text-black">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          <div className="min-w-0 flex-1 pb-0.5">
            <Link href={`/profile/${creator.user.id}`} className="block text-base font-bold leading-tight transition-colors hover:text-[var(--color-cyan)] line-clamp-1">
              {name}
            </Link>
            <p className="text-[11px] text-[var(--color-mute)]">@{creator.user.username}</p>
          </div>
        </div>

        {/* ── Received ─────────────────────────── */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--color-line)]/60 bg-[var(--color-ink)]/[0.03] px-3 py-2">
          <svg className="h-4 w-4 text-[var(--color-cyan)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 9l3-3 3 3 3-3 3 3 3-3 3 3v12H2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 9l3-3" />
          </svg>
          <span className="text-sm font-black tabular-nums text-[var(--color-cyan)]">₹{creator.totalTips.toLocaleString()}</span>
          <span className="text-[11px] text-[var(--color-mute)]">received from fans</span>
        </div>

        {creator.bio && <p className="mb-4 text-xs leading-relaxed text-[var(--color-mute)] line-clamp-2">{creator.bio}</p>}

        {/* ── Payment chips ────────────────────── */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {creator.upiId && <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold text-green-400">UPI</span>}
          {creator.kofiUrl && <span className="rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-bold text-[var(--color-cyan)]">Ko-fi</span>}
          {creator.buymeacoffeeUrl && <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-400">Buy Me a Coffee</span>}
        </div>

        {/* ── Actions ──────────────────────────── */}
        <div className="flex items-center gap-2">
          <TipButton creator={creator} />
          <Link
            href={`/profile/${creator.user.id}`}
            className="flex-1 rounded-full border border-[var(--color-line)] px-4 py-2.5 text-center text-xs font-bold text-[var(--color-mute)] transition-all hover:border-[var(--color-magenta)]/50 hover:text-[var(--color-ink)]"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}