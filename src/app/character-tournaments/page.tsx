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

interface TournamentSummary {
  id: string;
  title: string;
  description: string | null;
  size: number;
  status: "upcoming" | "active" | "completed" | "cancelled";
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

        <div className="mb-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-magenta)]"
          >
            🏆 Community Bracket
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: CARD_EASE }}
            className="neon-rgb-border mt-1 inline-block rounded-xl px-4 py-2"
          >
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Character Tournaments</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-3 max-w-lg text-sm text-[var(--color-mute)]"
          >
            Crown the ultimate anime character. Create a bracket, rally votes, and see who takes the title.
          </motion.p>
        </div>

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: CARD_EASE, delay: index * 0.06 }}
    >
      <Link
        href={`/character-tournaments/${t.id}`}
        className="group relative block h-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-magenta)]/40 hover:shadow-[0_12px_40px_-12px_var(--color-magenta)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, var(--color-violet), transparent 70%)",
          }}
        />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 font-display text-lg font-bold text-[var(--color-ink)]">
              {t.title}
            </h2>
            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--color-mute)]">@{t.creator.username}</p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-mute)]">
            <span className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-[var(--color-violet)]">{t.size}</span> players
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-[var(--color-magenta)]">
                {t.status === "upcoming" ? "Round 1" : `Round ${t.currentRound}`}
              </span>
              of {t.totalRounds}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-3">
            <span className="text-[11px] font-mono text-[var(--color-mute)]">{relativeDate(t.createdAt)}</span>
            <span className="flex items-center gap-3 text-[11px] font-mono text-[var(--color-mute)]">
              <span>{t._count.participants} fighters</span>
              <span>{t._count.matches} matches</span>
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CharacterResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SelectedChar[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSize(8);
      setTitle("");
      setDescription("");
      setQuery("");
      setResults([]);
      setSelected([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const q = query.trim();
    if (!q) {
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

  const selectedIds = new Set(selected.map((s) => s.charId));

  const addCharacter = (c: CharacterResult) => {
    if (selectedIds.has(c.id)) return;
    if (selected.length >= size) return;
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

  const canCreate = selected.length === size && title.trim() !== "" && !creating;

  const handleCreate = async () => {
    if (!canCreate) {
      if (title.trim() === "") setError("Give your tournament a title.");
      else if (selected.length !== size) setError(`Select exactly ${size} characters (${selected.length}/${size}).`);
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
          size,
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
                Tournament Size
              </label>
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
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">Characters</label>
                <span className={`text-[11px] font-mono ${selected.length === size ? "text-emerald-400" : "text-[var(--color-magenta)]"}`}>
                  {selected.length}/{size} selected
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
                  disabled={selected.length >= size}
                  className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-cyan)] disabled:opacity-50"
                />
                {searching && (
                  <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[var(--color-cyan)] border-t-transparent" />
                )}
              </div>

              {selected.length < size && results.length > 0 && !searching && (
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

              {selected.length >= size && query && (
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
              {creating ? "Creating…" : canCreate ? `Create ${size}-Player Tournament` : "Select fighters to continue"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
