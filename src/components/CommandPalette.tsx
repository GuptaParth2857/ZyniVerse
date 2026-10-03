"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  COMMAND_WEIGHTS,
  type Command,
  commandFields,
  commandsFor,
} from "@/lib/commands";
import { fuzzySearch, highlight } from "@/lib/fuzzy";
import { isAdminEmail } from "@/lib/admin-identity";

const MAX_PER_GROUP = 5;
const ENTITY_DEBOUNCE_MS = 180;
const RECENT_KEY = "zyniverse:command-palette:recent";

type Row =
  | { kind: "command"; id: string; group: string; label: string; emoji?: string; href: string; indices: number[]; score: number }
  | { kind: "entity"; id: string; group: string; label: string; sub?: string; emoji: string; href: string }
  | { kind: "ai"; id: string; group: string; label: string; emoji: string; href?: string }
  | { kind: "hint"; id: string; group: string; label: string; emoji: string };

interface UnifiedResponse {
  anime?: Array<{ id: number; title: string; titleRomaji?: string | null; poster?: string | null; format?: string | null; year?: number | null }>;
  manga?: Array<{ id: number; title: string; poster?: string | null; format?: string | null; year?: number | null }>;
  users?: Array<{ id: string; username: string; avatar?: string | null }>;
  wiki?: Array<{ slug: string; title: string; summary?: string | null; category?: string | null }>;
  forum?: Array<{ id: string; title: string; animeTitle?: string | null; postCount?: number | null }>;
  blog?: Array<{ slug: string; title: string; excerpt?: string | null }>;
}

export default function CommandPalette() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [entities, setEntities] = useState<UnifiedResponse>({});
  const [searching, setSearching] = useState(false);
  const [aiPending, setAiPending] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{ text: string; href?: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const seq = useRef(0);

  const isAuth = status === "authenticated";
  const isAdmin = isAdminEmail((session?.user as { email?: string | null } | undefined)?.email ?? null);

  const commands = useMemo(
    () => commandsFor({ isAuth, isAdmin }),
    [isAuth, isAdmin]
  );

  const [recent, setRecent] = useState<string[]>([]);

  const readRecent = useCallback((): string[] => {
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }, []);

  // ── open / close ───────────────────────────────────────────────────────────
  // Deliberately reads no refs: `go` and `askAi` are handed straight to JSX
  // event props, and a handler that touches `restoreFocus.current` drags a ref
  // read into render, which the React compiler lint rightly rejects. Focus
  // restoration is done by the effect below instead.
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setEntities({});
    setAiAnswer(null);
    setAiPending(false);
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) restoreFocus.current = document.activeElement as HTMLElement;
          return !prev;
        });
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      setRecent(readRecent());
    }, 20);
    // Lock background scroll while the dialog owns the viewport.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open, readRecent]);

  // Hand focus back to whatever opened the palette, once it has closed. Kept
  // out of `close()` so that handlers stay ref-free.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) restoreFocus.current?.focus?.();
    wasOpen.current = open;
  }, [open]);

  // ── entity search (debounced, race-guarded) ────────────────────────────────
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const mine = ++seq.current;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/unified?q=${encodeURIComponent(q)}`);
        if (mine !== seq.current) return;
        if (res.ok) setEntities((await res.json()) as UnifiedResponse);
      } catch {
        /* offline or rate limited - commands still work, so fail quietly */
      } finally {
        if (mine === seq.current) setSearching(false);
      }
    }, ENTITY_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  // ── rows ───────────────────────────────────────────────────────────────────
  const rows = useMemo<Row[]>(() => {
    const q = query.trim();
    const out: Row[] = [];

    if (q.length === 0) {
      // Empty state: recently used first, then a short tour of the app.
      const picked = new Set<string>();
      for (const path of recent) {
        const c = commands.find((x) => x.path === path && !picked.has(x.id));
        if (!c) continue;
        picked.add(c.id);
        out.push(toCommandRow(c, [], 0));
        if (picked.size >= 5) break;
      }
      const starters: Command[] = [
        commands.find((c) => c.id === "search")!,
        commands.find((c) => c.id === "watchlist")!,
        commands.find((c) => c.id === "leaderboard")!,
        commands.find((c) => c.id === "random")!,
        commands.find((c) => c.id === "wiki")!,
      ].filter(Boolean);
      for (const c of starters) {
        if (picked.has(c.id)) continue;
        picked.add(c.id);
        out.push(toCommandRow(c, [], 0));
      }
      return out;
    }

    const hits = fuzzySearch(q, commands, {
      fields: commandFields,
      weights: COMMAND_WEIGHTS,
      threshold: 20,
      limit: 60,
    });

    // Recent commands win ties, so the thing you use most is always first.
    hits.sort((a, b) => {
      const ra = recent.indexOf(a.item.path);
      const rb = recent.indexOf(b.item.path);
      if (ra !== -1 || rb !== -1) {
        if (ra === -1) return 1;
        if (rb === -1) return -1;
        return ra - rb;
      }
      return b.score - a.score;
    });

    const perGroup = new Map<string, number>();
    for (const hit of hits) {
      const n = perGroup.get(hit.item.group) ?? 0;
      if (n >= MAX_PER_GROUP) continue;
      perGroup.set(hit.item.group, n + 1);
      out.push(toCommandRow(hit.item, hit.indices, hit.score));
    }

    for (const m of (entities.anime ?? []).slice(0, MAX_PER_GROUP)) {
      out.push({
        kind: "entity",
        id: `anime-${m.id}`,
        group: "Anime",
        label: m.title,
        sub: [m.format, m.year].filter(Boolean).join(" · ") || undefined,
        emoji: "🎬",
        href: `/anime/${m.id}`,
      });
    }
    for (const u of (entities.users ?? []).slice(0, 3)) {
      out.push({ kind: "entity", id: `user-${u.id}`, group: "People", label: u.username, sub: "Profile", emoji: "👤", href: `/u/${u.username}` });
    }
    for (const w of (entities.wiki ?? []).slice(0, 3)) {
      out.push({ kind: "entity", id: `wiki-${w.slug}`, group: "Wiki", label: w.title, sub: w.category ?? undefined, emoji: "📚", href: `/wiki/${w.slug}` });
    }
    for (const m of (entities.manga ?? []).slice(0, 3)) {
      out.push({ kind: "entity", id: `manga-${m.id}`, group: "Manga", label: m.title, sub: [m.format, m.year].filter(Boolean).join(" · ") || undefined, emoji: "📖", href: `/manga/${m.id}` });
    }
    for (const f of (entities.forum ?? []).slice(0, 3)) {
      out.push({ kind: "entity", id: `forum-${f.id}`, group: "Forum", label: f.title, sub: f.animeTitle ?? undefined, emoji: "💬", href: `/forum/thread/${f.id}` });
    }
    for (const b of (entities.blog ?? []).slice(0, 3)) {
      out.push({ kind: "entity", id: `blog-${b.slug}`, group: "Blog", label: b.title, sub: b.excerpt ?? undefined, emoji: "📝", href: `/blog/${b.slug}` });
    }

    if (q.length >= 3 && !aiAnswer) {
      out.push({ kind: "ai", id: "ai-ask", group: "Zyni AI", label: `Ask Zyni AI about “${q}”`, emoji: "🤖" });
    }

    if (out.length === 0) {
      out.push({ kind: "hint", id: "empty", group: "Zyni AI", label: "Nothing matched. Try different words, or ask Zyni AI below.", emoji: "🔍" });
    }

    return out;
  }, [query, commands, entities, recent, aiAnswer]);

  // ── activate ───────────────────────────────────────────────────────────────
  const remember = useCallback((href: string) => {
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
      const list = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
      const next = [href, ...list.filter((x) => x !== href)].slice(0, 8);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* private mode - recents are a nicety, never a requirement */
    }
  }, []);

  const go = useCallback(
    (href: string) => {
      remember(href);
      close();
      router.push(href);
    },
    [close, remember, router]
  );

  const askAi = useCallback(async () => {
    const q = query.trim();
    if (q.length < 3 || aiPending) return;
    setAiPending(true);
    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      const data = (await res.json()) as { answer?: string; href?: string; error?: string };
      if (data.href) go(data.href);
      else if (data.answer) setAiAnswer({ text: data.answer });
    } catch {
      setAiAnswer({ text: "Zyni AI is unreachable right now. Normal search still works." });
    } finally {
      setAiPending(false);
    }
  }, [query, aiPending, go]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (rows.length ? (i + 1) % rows.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (rows.length ? (i - 1 + rows.length) % rows.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = rows[active];
        if (!row) return;
        if (row.kind === "command" || row.kind === "entity") go(row.href);
        else if (row.kind === "ai") void askAi();
      } else if (e.key === "Tab") {
        // Keep focus inside the dialog: the input is the only other control.
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    [rows, active, go, askAi]
  );

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open || typeof document === "undefined") return null;

  // Flatten to sections in render order so section headers can be injected.
  const sections: Array<{ group: string; rows: Row[] }> = [];
  for (const row of rows) {
    const last = sections[sections.length - 1];
    if (last && last.group === row.group) last.rows.push(row);
    else sections.push({ group: row.group, rows: [row] });
  }

  let flat = 0;
  const rendered = sections.map((section) => (
    <div key={section.group}>
      <div className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-mute)]">
        {section.group}
      </div>
      {section.rows.map((row) => {
        const idx = flat++;
        const selected = idx === active;
        const base =
          "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors";
        const tone = selected ? "bg-[var(--color-magenta)]/15 text-[var(--color-ink)]" : "text-[var(--color-ink)]/85 hover:bg-white/5";
        const inner = (
          <>
            <span className="w-6 shrink-0 text-center text-base">{row.emoji ?? "•"}</span>
            <span className="min-w-0 flex-1 truncate">
              {row.kind === "command" ? (
                <Highlighted text={row.label} indices={row.indices} />
              ) : (
                row.label
              )}
              {row.kind === "entity" && row.sub ? (
                <span className="ml-2 text-xs text-[var(--color-mute)]">{row.sub}</span>
              ) : null}
            </span>
            {row.kind === "command" ? (
              <span className="shrink-0 font-mono text-[10px] text-[var(--color-mute)]">{row.href}</span>
            ) : null}
          </>
        );
        return (
          <div
            key={row.id}
            data-idx={idx}
            role="option"
            aria-selected={selected}
            className={`${base} ${tone}`}
            onMouseMove={() => setActive(idx)}
            onClick={() => {
              if (row.kind === "command" || row.kind === "entity") go(row.href);
              else if (row.kind === "ai") void askAi();
            }}
          >
            {inner}
          </div>
        );
      })}
    </div>
  ));

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        aria-label="Close command palette"
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4">
          <span className="text-[var(--color-cyan)]">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              // Reset here rather than in an effect keyed on `query`: one
              // render instead of two, and no cascading setState.
              setActive(0);
              if (v.trim().length < 2) {
                setEntities({});
                setSearching(false);
              } else {
                setSearching(true);
              }
            }}
            onKeyDown={onKeyDown}
            placeholder="Search anime, characters, pages…  or ask Zyni AI"
            aria-label="Search commands"
            className="w-full bg-transparent py-4 text-[15px] outline-none placeholder:text-[var(--color-mute)]"
          />
          {searching && <span className="text-xs text-[var(--color-mute)]">searching…</span>}
          {aiPending && <span className="text-xs text-[var(--color-cyan)]">thinking…</span>}
        </div>

        {aiAnswer ? (
          <div className="border-b border-[var(--color-line)] px-4 py-3 text-sm">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-magenta)]">
              Zyni AI
            </p>
            <p className="whitespace-pre-wrap text-[var(--color-ink)]/90">{aiAnswer.text}</p>
          </div>
        ) : null}

        <div ref={listRef} role="listbox" className="max-h-[52vh] overflow-y-auto py-1">
          {rendered}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-line)] px-4 py-2 font-mono text-[10px] text-[var(--color-mute)]">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{rows.length} result{rows.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function toCommandRow(c: Command, indices: number[], score: number): Row {
  return {
    kind: "command",
    id: c.id,
    group: c.group,
    label: c.label,
    emoji: c.emoji,
    href: c.path,
    indices,
    score,
  };
}

function Highlighted({ text, indices }: { text: string; indices: number[] }) {
  if (indices.length === 0) return <>{text}</>;
  return (
    <>
      {highlight(text, indices).map((part, i) =>
        part.match ? (
          <mark key={i} className="bg-transparent font-semibold text-[var(--color-cyan)]">
            {part.char}
          </mark>
        ) : (
          <span key={i}>{part.char}</span>
        )
      )}
    </>
  );
}