"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const CARD_EASE = [0.22, 1, 0.36, 1] as const;
const SIZES = [8, 16, 32] as const;

const HUB_HERO_TAGS = [
  { label: "Qualifying", emoji: "⚡", color: "#22d3ee" },
  { label: "1v1 Battles", emoji: "⚔️", color: "#f87171" },
  { label: "Auto Rounds", emoji: "🏆", color: "#facc15" },
  { label: "Community", emoji: "🤝", color: "#a78bfa" },
];

const HUB_HERO_STATS = [
  { icon: "⚡", label: "7-Day Qualifiers" },
  { icon: "⚔️", label: "Single Elim" },
  { icon: "🤝", label: "One Vote Each" },
];

const HUB_TICKER = [
  { label: "Qualifying Open", emoji: "⚡", color: "#22d3ee" },
  { label: "1v1 Battles", emoji: "⚔️", color: "#f87171" },
  { label: "Auto Cron", emoji: "🕛", color: "#a78bfa" },
  { label: "Top 16", emoji: "🎯", color: "#facc15" },
  { label: "Community", emoji: "🤝", color: "#34d399" },
  { label: "Champion", emoji: "👑", color: "#f472b6" },
  { label: "Dream 16", emoji: "🌟", color: "#60a5fa" },
  { label: "Fan Vote", emoji: "🗳️", color: "#fb923c" },
];

interface TournamentSummary {
  id: string;
  title: string;
  description: string | null;
  posterUrl: string | null;
  size: number;
  status: "qualifying" | "upcoming" | "active" | "completed" | "cancelled";
  currentRound: number;
  totalRounds: number;
  createdAt: string;
  creator: { id: string; username: string; avatar: string | null };
  _count: { participants: number; matches: number };
}

interface CharacterResult {
  id: number;
  name: { full?: string; userPreferred?: string };
  image: { large?: string; medium?: string };
}

interface SelectedChar {
  charId: number;
  charName: string;
  charImage: string;
  thumbnail: string;
}

type StatusBadge = Record<TournamentSummary["status"], { label: string; className: string }>;

const STATUS_BADGE: StatusBadge = {
  qualifying: {
    label: "⚡ Qualifying",
    className: "bg-cyan-400/15 border-cyan-400/40 text-cyan-300",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-[var(--color-violet)]/15 border-[var(--color-violet)]/40 text-[var(--color-violet)]",
  },
  active: {
    label: "Active",
    className: "bg-[var(--color-magenta)]/15 border-[var(--color-magenta)]/40 text-[var(--color-magenta)]",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-white/5 border-white/10 text-[var(--color-mute)]",
  },
};

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function CharacterTournamentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(
    (mine: boolean) => {
      setLoading(true);
      setError(null);
      const suffix = mine ? "?mine=1&limit=50" : "?limit=50";
      fetch(`/api/character-tournaments${suffix}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
        .then((d) => {
          setTournaments(d);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load tournaments");
          setLoading(false);
        });
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(tab === "mine");
  }, [tab, load]);

  const showCreate = createOpen && !!session?.user?.id;

  return (
    <PageTransition>
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-30 blur-[100px]"
          style={{
            background:
              "radial-gradient(60% 60% at 30% 40%, var(--color-violet), transparent 70%), radial-gradient(60% 60% at 70% 40%, var(--color-magenta), transparent 70%)",
          }}
        />

        {/* ─────────── HERO ─────────── */}
        <section className="neon-rgb-border relative mb-8 overflow-hidden rounded-3xl bg-[var(--color-panel)]/60 py-14 text-center backdrop-blur-sm sm:py-20">
          <div className="neon-banner-card pointer-events-none absolute inset-0" />

          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div aria-hidden className="scanline-sweep" />

          <div aria-hidden className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[var(--color-cyan)]/50" />
          <div aria-hidden className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[var(--color-cyan)]/50" />
          <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[var(--color-magenta)]/50" />
          <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[var(--color-magenta)]/50" />

          <span aria-hidden className="pointer-events-none absolute left-10 top-10 hidden text-3xl opacity-40 float-anim md:block">🥊</span>
          <span aria-hidden className="pointer-events-none absolute right-12 top-14 hidden text-3xl opacity-40 float-anim md:block" style={{ animationDelay: "0.9s" }}>🎬</span>
          <span aria-hidden className="pointer-events-none absolute bottom-12 left-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "0.45s" }}>📰</span>
          <span aria-hidden className="pointer-events-none absolute bottom-14 right-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "1.3s" }}>🎨</span>

          <div aria-hidden className="pointer-events-none absolute left-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-cyan)]/25 blur-[55px] float-anim md:block" />
          <div aria-hidden className="pointer-events-none absolute right-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-magenta)]/25 blur-[55px] float-anim md:block" style={{ animationDelay: "1.5s" }} />

          <div className="relative z-10 mx-auto max-w-3xl px-6">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
              style={{
                background: "conic-gradient(from 0deg, var(--color-magenta), var(--color-cyan), var(--color-violet), var(--color-magenta))",
                animation: "spin 10s linear infinite",
              }}
            />

            <div className="relative">
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="console-label mb-4 flex animate-hero-text items-center justify-center gap-2"
                style={{ animationDelay: "0.05s" }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                </span>
                🏆 Community Bracket
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: CARD_EASE, delay: 0.1 }}
                className="neon-text-gradient animate-hero-text font-display text-4xl font-black tracking-tight sm:text-6xl"
                style={{ filter: "drop-shadow(0 0 28px rgba(138,92,255,0.35))", animationDelay: "0.15s" }}
              >
                Character Tournaments
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mt-4 max-w-xl animate-hero-text text-sm text-[var(--color-mute)] sm:text-base"
                style={{ animationDelay: "0.25s" }}
              >
                Crown the ultimate anime character. Create a bracket, rally votes, and see who takes the title.
              </motion.p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {HUB_HERO_STATS.map((s) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] backdrop-blur-sm"
                  >
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {HUB_HERO_TAGS.map((tag) => (
                  <span
                    key={tag.label}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:brightness-125"
                    style={{ color: tag.color, borderColor: `${tag.color}55`, background: `${tag.color}14` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: tag.color, boxShadow: `0 0 8px ${tag.color}` }} />
                    {tag.emoji} {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div aria-hidden className="ticker-window relative z-10 mt-8 border-t border-[var(--color-line)] bg-[var(--color-void)]/40 py-3">
            <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap px-8">
              {[...HUB_TICKER, ...HUB_TICKER].map((t, i) => (
                <span key={i} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                  <span className="text-base leading-none" style={{ textShadow: `0 0 10px ${t.color}aa` }}>{t.emoji}</span>
                  <span className="text-[var(--color-mute)]">{t.label}</span>
                  <span className="ml-6 select-none text-[var(--color-magenta)]/40">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] p-1">
            {(["all", "mine"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                disabled={t === "mine" && !session?.user?.id}
                className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-colors ${
                  tab === t
                    ? "bg-[var(--color-magenta)] text-black"
                    : "text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {!showCreate && (
            <motion.button
              onClick={() => (session?.user?.id ? setCreateOpen(true) : router.push("/login"))}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_var(--color-magenta)]"
              style={{ background: "linear-gradient(90deg, var(--color-magenta), var(--color-violet))" }}
            >
              <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <svg className="relative h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="relative">{session?.user?.id ? "Create Tournament" : "Log in to Create"}</span>
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-[var(--color-panel)] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-10 text-center">
            <p className="text-sm text-[var(--color-mute)]">{error}</p>
            <button
              onClick={() => load(tab === "mine")}
              className="mt-4 rounded-lg bg-[var(--color-magenta)]/20 px-4 py-2 text-sm font-bold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)] hover:text-black transition-colors"
            >
              Retry
            </button>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60">
            <div className="p-12 text-center">
              <div className="text-3xl">🏆</div>
              <p className="mt-3 text-sm text-[var(--color-mute)]">
                {tab === "mine" ? "You haven't created any tournaments yet." : "No tournaments yet. Be the first to create one!"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t, i) => (
              <TournamentCard key={t.id} t={t} index={i} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {createOpen && (
          <CreateModal
            isOpen={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={(id) => router.push(`/character-tournaments/${id}`)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

function TournamentCard({ t, index }: { t: TournamentSummary; index: number }) {
  const badge = STATUS_BADGE[t.status];
  const hot = t.status === "qualifying" || t.status === "active";
  const players = t.status === "qualifying" ? t.size : t._count.participants;
  const playersLabel = t.status === "qualifying" ? "candidates" : "fighters";
  const roundLabel =
    t.status === "qualifying"
      ? "Open Qualifying"
      : t.status === "upcoming"
      ? `Round 1 of ${t.totalRounds}`
      : `Round ${t.currentRound} of ${t.totalRounds}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: CARD_EASE, delay: index * 0.06 }}
    >
      <Link
        href={`/character-tournaments/${t.id}`}
        className="group relative block h-full rounded-[24px]"
      >
        {/* premium rotating neon conic border */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
              animation: "spin 6s linear infinite",
              willChange: "transform",
            }}
          />
          <span className="absolute inset-[1.5px] rounded-[22.5px] neon-border-inner" />
        </div>

        {/* popular-style pill badge */}
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
          {hot ? (
            <span className="block whitespace-nowrap rounded-full bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] px-3.5 py-1 text-[9px] font-bold uppercase tracking-wider text-black shadow-[0_0_20px_-5px_rgba(0,255,224,0.4)]">
              {badge.label}
            </span>
          ) : t.status === "completed" ? (
            <span className="block whitespace-nowrap rounded-full border border-emerald-400/40 bg-[#15121d]/95 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              {badge.label}
            </span>
          ) : (
            <span className="block whitespace-nowrap rounded-full border border-white/10 bg-[#15121d]/95 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--color-mute)]">
              {badge.label}
            </span>
          )}
        </div>

        {/* interior */}
        <div className="relative z-10 flex h-full flex-col p-5 pt-6">
          <p className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.35em] text-[var(--color-cyan)]/80">
            {t.status === "qualifying" ? "✦ Qualifying" : "✦ Bracket"}
          </p>
          {t.posterUrl && (
            <div className="mb-3 h-32 w-full overflow-hidden rounded-xl bg-[#0a0910]">
              <Image
                src={t.posterUrl}
                alt={t.title}
                width={400}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h2 className="line-clamp-1 font-display text-lg font-bold text-[var(--color-ink)]">
            {t.title}
          </h2>
          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-mute)]">@{t.creator.username}</p>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-3xl font-black tabular-nums text-transparent">
              {players}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-mute)]">
              {playersLabel}
            </span>
          </div>

          <ul className="mt-4 space-y-1.5">
            <li className="flex items-center gap-2 text-[11px] text-[var(--color-mute)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={hot ? "#ff00e6" : "#00ffe0"} strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {roundLabel}
            </li>
            <li className="flex items-center gap-2 text-[11px] text-[var(--color-mute)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={hot ? "#ff00e6" : "#00ffe0"} strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t._count.matches} matches scheduled
            </li>
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-[11px] font-mono text-[var(--color-mute)]">{relativeDate(t.createdAt)}</span>
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-[11px] font-bold uppercase tracking-wider text-transparent">
              {t.status === "qualifying"
                ? "Vote now"
                : t.status === "completed"
                ? "View results"
                : "View bracket"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CreateModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [size, setSize] = useState<number>(8);
  const [mode, setMode] = useState<"bracket" | "qualifying">("bracket");
  const [qualSize, setQualSize] = useState<number>(64);
  const [qualBracket, setQualBracket] = useState<number>(16);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CharacterResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SelectedChar[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSize = mode === "qualifying" ? qualSize : size;

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize(8);
      setMode("bracket");
      setQualSize(64);
      setQualBracket(16);
      setTitle("");
      setDescription("");
      setPosterUrl(null);
      setPosterPreview(null);
      setQuery("");
      setResults([]);
      setSelected([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const q = query.trim();
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/anilist/characters?q=${encodeURIComponent(q)}&perPage=12`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("search failed"))))
        .then((d) => {
          setResults(d.results ?? []);
          setSearching(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 350);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, isOpen]);

  const handlePosterUpload = async (file: File) => {
    setPosterPreview(URL.createObjectURL(file));
    setUploadingPoster(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setPosterUrl(data.url);
      else setPosterUrl(null);
    } catch {
      setPosterUrl(null);
    } finally {
      setUploadingPoster(false);
    }
  };

  const selectedIds = new Set(selected.map((s) => s.charId));

  const addCharacter = (c: CharacterResult) => {
    if (selectedIds.has(c.id)) return;
    if (selected.length >= activeSize) return;
    const full = c.name.full || c.name.userPreferred || "Character";
    const img = c.image.large || c.image.medium || "";
    setSelected((prev) => [
      ...prev,
      {
        charId: c.id,
        charName: full,
        charImage: img,
        thumbnail: img,
      },
    ]);
    setQuery("");
    setResults([]);
    setError(null);
  };

  const removeCharacter = (charId: number) => {
    setSelected((prev) => prev.filter((s) => s.charId !== charId));
  };

  const canCreate = selected.length === activeSize && title.trim() !== "" && !creating;

  const handleCreate = async () => {
    if (!canCreate) {
      if (title.trim() === "") setError("Give your tournament a title.");
      else if (selected.length !== activeSize)
        setError(`Select exactly ${activeSize} characters (${selected.length}/${activeSize}).`);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/character-tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          posterUrl: posterUrl || undefined,
          size: activeSize,
          mode,
          bracketSize: mode === "qualifying" ? qualBracket : undefined,
          participants: selected.map((s) => ({
            charId: s.charId,
            charName: s.charName,
            charImage: s.charImage || undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create tournament");
        setCreating(false);
        return;
      }
      onCreated(data.id);
    } catch {
      setError("Failed to create tournament");
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: CARD_EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="max-h-[80vh] overflow-y-auto p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-[var(--color-ink)]">Create Tournament</h3>
              <p className="mt-1 text-xs text-[var(--color-mute)]">Pick a size, name it, and draft your fighters.</p>
            </div>
            <button onClick={onClose} className="text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
                Mode
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] p-1">
                {(["bracket", "qualifying"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError(null);
                      setSelected((prev) => prev.slice(0, m === "qualifying" ? qualSize : size));
                    }}
                    className={`flex-1 rounded-md px-3 py-2 text-xs font-bold capitalize transition ${
                      mode === m
                        ? "bg-[var(--color-magenta)] text-black"
                        : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {m === "bracket" ? "Direct Bracket" : "Qualifying → Bracket"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
                {mode === "bracket" ? "Tournament Size" : "Candidate Pool Size"}
              </label>
              {mode === "bracket" ? (
                <div className="flex items-center gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSize(s);
                        setSelected((prev) => prev.slice(0, s));
                        setError(null);
                      }}
                      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors ${
                        size === s
                          ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]"
                          : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-line)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[16, 32, 48, 64, 100, 200].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setQualSize(s);
                          setSelected((prev) => prev.slice(0, s));
                          setError(null);
                        }}
                        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                          qualSize === s
                            ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/15 text-cyan-300"
                            : "border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-mute)]">
                      Top advance to bracket
                    </p>
                    <div className="flex gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setQualBracket(s);
                            setError(null);
                          }}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                            qualBracket === s
                              ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]"
                              : "border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Best Shonen Protagonist"
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-magenta)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
                Description <span className="font-normal normal-case text-[var(--color-mute)] opacity-60">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's the theme of this bracket?"
                rows={2}
                className="w-full resize-none rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-magenta)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
                Poster <span className="font-normal normal-case text-[var(--color-mute)] opacity-60">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                {posterPreview ? (
                  <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--color-line)]">
                    <Image
                      src={posterPreview}
                      alt="Poster preview"
                      width={80}
                      height={112}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setPosterUrl(null);
                        setPosterPreview(null);
                      }}
                      aria-label="Remove poster"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-[var(--color-magenta)]"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--color-line)] bg-[var(--color-void)] text-2xl">
                    🖼️
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-mute)]">
                    A banner for your tournament card. JPG / PNG / WEBP, under 5MB.
                  </p>
                  <div className="relative mt-2">
                    <label
                      className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border text-xs font-bold transition-colors ${
                        uploadingPoster
                          ? "cursor-wait border-[var(--color-cyan)]/40 text-cyan-300"
                          : "border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-cyan-300 hover:bg-[var(--color-cyan)]/20"
                      }`}
                    >
                      {uploadingPoster ? "Uploading…" : "Upload poster"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={uploadingPoster}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handlePosterUpload(f);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">Characters</label>
                <span className={`text-[11px] font-mono ${selected.length === activeSize ? "text-emerald-400" : "text-[var(--color-magenta)]"}`}>
                  {selected.length}/{activeSize} selected
                </span>
              </div>

              {selected.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selected.map((c) => (
                    <div
                      key={c.charId}
                      className="relative flex items-center gap-1.5 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] pr-1.5"
                    >
                      {c.thumbnail ? (
                        <Image
                          src={c.thumbnail}
                          alt={c.charName}
                          width={32}
                          height={32}
                          unoptimized={c.thumbnail.includes("anilist.co")}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                          className="h-8 w-8 object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center bg-[var(--color-panel)] text-xs">🎴</div>
                      )}
                      <span className="max-w-[9rem] truncate text-xs text-[var(--color-ink)]">{c.charName}</span>
                      <button
                        onClick={() => removeCharacter(c.charId)}
                        className="text-[var(--color-mute)] transition-colors hover:text-[var(--color-magenta)]"
                        aria-label={`Remove ${c.charName}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search characters…"
                  disabled={selected.length >= activeSize}
                  className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-cyan)] disabled:opacity-50"
                />
                {searching && (
                  <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[var(--color-cyan)] border-t-transparent" />
                )}
              </div>

              {selected.length < activeSize && results.length > 0 && !searching && (
                <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] p-1">
                  {results.map((c) => {
                    const full = c.name.full || c.name.userPreferred || "Character";
                    const img = c.image.large || c.image.medium || "";
                    const isSel = selectedIds.has(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => addCharacter(c)}
                        disabled={isSel}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-panel)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {img ? (
                          <Image
                            src={img}
                            alt={full}
                            width={32}
                            height={32}
                            unoptimized={img.includes("anilist.co")}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-panel)] text-xs">🎴</div>
                        )}
                        <span className="truncate text-sm text-[var(--color-ink)]">{full}</span>
                        {isSel && <span className="ml-auto text-xs text-emerald-400">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {selected.length >= activeSize && query && (
                <p className="mt-2 text-xs text-emerald-400">Bracket full — remove a character to add another.</p>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10 px-3 py-2 text-xs font-semibold text-[var(--color-magenta)]"
              >
                {error}
              </motion.p>
            )}

            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className={`w-full rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 ${
                canCreate
                  ? "text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_var(--color-magenta)]"
                  : "cursor-not-allowed bg-white/5 text-white/30"
              }`}
              style={
                canCreate
                  ? { background: "linear-gradient(90deg, var(--color-magenta), var(--color-violet))" }
                  : undefined
              }
            >
              {creating
                ? "Creating…"
                : canCreate
                ? mode === "qualifying"
                  ? `Create ${qualSize} → ${qualBracket} Qualifier`
                  : `Create ${size}-Player Tournament`
                : "Select fighters to continue"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
