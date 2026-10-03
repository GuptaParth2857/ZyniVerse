"use client";

/**
 * Typeahead used by both the seed and target fields of the graph page.
 *
 * Queries AniList's character and media search in parallel and merges the two
 * result sets. Requests are debounced because these are live upstream queries
 * against a 30/min budget shared with the rest of the app - typing "one piece"
 * character by character would burn eleven of those before the user hits enter.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface Pick {
  id: string;
  label: string;
  sub: string;
  image: string | null;
}

interface Props {
  value: Pick | null;
  placeholder: string;
  accent: string;
  onChange: (pick: Pick | null) => void;
  /** Skip querying until the user asks, for the optional "target" field. */
  enabled?: boolean;
}

const DEBOUNCE_MS = 260;

export default function EntityPicker({ value, placeholder, accent, onChange, enabled = true }: Props) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Pick[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const abort = useRef<AbortController | null>(null);
  const seq = useRef(0);

  // Reset state in the change handler rather than in an effect: an effect keyed
  // on `value` would also fire for picks made inside the dropdown, which would
  // fight the user mid-interaction.
  const reset = (next: Pick | null) => {
    setText(next ? next.label : "");
    setResults([]);
    setBusy(false);
    setOpen(false);
    onChange(next);
  };

  useEffect(() => {
    const q = text.trim();
    // Nothing to clear here - `onChange` already dropped the results when the
    // query fell below two characters.
    if (!enabled || q.length < 2) return;

    const mine = ++seq.current;
    const timer = setTimeout(async () => {
      abort.current?.abort();
      const ac = new AbortController();
      abort.current = ac;

      const slim = { signal: ac.signal };
      const [chars, media] = await Promise.all([
        fetch(`/api/anilist/characters?q=${encodeURIComponent(q)}&perPage=5`, slim)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch(`/api/anilist/search-media?search=${encodeURIComponent(q)}&perPage=5&sort=SEARCH_MATCH`, slim)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);

      // A newer keystroke already owns the results.
      if (mine !== seq.current) return;

      const picks: Pick[] = [];
      for (const c of chars?.results ?? []) {
        picks.push({
          id: `character:${c.id}`,
          label: c.name?.userPreferred || c.name?.full || c.name?.native || "Unknown",
          sub: "Character",
          image: c.image?.medium ?? null,
        });
      }
      for (const m of media?.media ?? []) {
        if (m.type && m.type !== "ANIME") continue;
        picks.push({
          id: `anime:${m.id}`,
          label: m.title?.userPreferred || m.title?.english || m.title?.romaji || "Untitled",
          sub: m.format ? m.format.toLowerCase() : "Anime",
          image: m.coverImage?.medium ?? null,
        });
      }
      // Characters first: the graph is character-centric, and "Naruto" is far
      // more often wanted as the person than the show.
      picks.sort((a, b) => (a.sub === "Character" ? -1 : 1) - (b.sub === "Character" ? -1 : 1));
      setResults(picks.slice(0, 10));
      setBusy(false);
      setOpen(true);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [text, enabled]);

  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{ borderColor: value ? accent : "var(--color-line)", background: "var(--color-panel)" }}
      >
        {value?.image ? (
          <Image
            src={value.image}
            alt=""
            width={28}
            height={40}
            className="h-10 w-7 shrink-0 rounded object-cover"
            unoptimized
          />
        ) : (
          <span className="h-10 w-7 shrink-0 rounded bg-white/5" />
        )}
        <input
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            onChange(null);
            // Kept here rather than in the effect below: deriving "is this a
            // query worth sending" from the input event avoids a render pass
            // that only exists to clear state we already know is stale.
            const len = v.trim().length;
            setBusy(len >= 2);
            if (len < 2) {
              setResults([]);
              setOpen(false);
            }
          }}
          onFocus={() => enabled && results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: "var(--color-ink)" }}
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            onClick={() => reset(null)}
            className="shrink-0 text-xs"
            style={{ color: "var(--color-mute)" }}
            aria-label="Clear"
          >
            clear
          </button>
        ) : busy ? (
          <span className="shrink-0 text-[11px]" style={{ color: "var(--color-mute)" }}>
            …
          </span>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <ul
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border p-1 shadow-2xl"
          style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
        >
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  // mousedown, not click: a blur-on-click would unmount this
                  // list before the click event ever fired.
                  e.preventDefault();
                  reset(r);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-white/8"
              >
                {r.image ? (
                  <Image src={r.image} alt="" width={24} height={34} className="h-[34px] w-6 rounded object-cover" unoptimized />
                ) : (
                  <span className="h-[34px] w-6 rounded bg-white/5" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm" style={{ color: "var(--color-ink)" }}>
                    {r.label}
                  </span>
                  <span className="block text-[11px]" style={{ color: "var(--color-mute)" }}>
                    {r.sub}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type { Pick as EntityPick };