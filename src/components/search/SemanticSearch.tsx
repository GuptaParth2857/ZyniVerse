"use client";

/**
 * Meaning-based search over the site's written and structured content.
 *
 * Deliberately a separate surface from /search, which is entirely about AniList
 * media. Mixing prose search into a genre/tag-filtered anime catalogue would
 * have meant one page answering two unrelated questions.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Source =
  | "wiki"
  | "blog"
  | "forum"
  | "review"
  | "tags"
  | "clip"
  | "moment"
  | "award";

interface Hit {
  id: string;
  source: Source;
  title: string;
  href: string;
  snippet: string;
  tags: string;
  score: number;
}

interface Payload {
  q: string;
  hits: Hit[];
  count: number;
  scanned: number;
  degraded: boolean;
  engine?: "pgvector" | "scan";
  notice?: string;
}

/**
 * How long typing has to pause before a query is sent.
 *
 * Short enough to feel instant, long enough that a normal sentence does not fire
 * a request per keystroke. Each request costs a real embedding call.
 */
const TYPING_PAUSE_MS = 280;

const SOURCE_COLOR: Record<Source, string> = {
  wiki: "var(--color-cyan)",
  blog: "var(--color-violet)",
  forum: "var(--color-magenta)",
  review: "var(--color-gold, #ffb020)",
  tags: "var(--color-magenta)",
  clip: "var(--color-cyan)",
  moment: "var(--color-violet)",
  award: "var(--color-gold, #ffb020)",
};

const EXAMPLES = [
  "which episodes should I skip",
  "where do I start if I have never seen anime",
  "anime with a villain people actually respect",
  "what fans say about the pacing of One Piece",
];

/**
 * Sources the index can return, in the order shown.
 *
 * Passed in by the server page from the same `SOURCES` constant the API and the
 * backfill script use, so the filter row cannot fall behind the index. It was
 * previously a hardcoded three-item list in this file, which is why the index
 * could grow without the UI ever showing it.
 */
export interface SemanticSearchProps {
  sources: Array<{ key: Source; label: string }>;
}

export default function SemanticSearch({ sources }: SemanticSearchProps) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Source | "all">("all");
  /**
   * The last answer, tagged with the request that produced it.
   *
   * There is deliberately no "is loading" flag. Tagging the answer with its own
   * request key makes the question "is the thing on screen current?" derivable
   * rather than stored, which removes the class of bug where the two disagree -
   * a spinner with no matching request, or a request with no spinner.
   */
  const [answer, setAnswer] = useState<{ key: string; data: Payload } | null>(null);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);

  // The typed text is the only input. It settles into `query` after a pause, and
  // `query` is what the fetch watches.
  //
  // This is the fix for the page feeling dead. It used to keep two states and
  // advance the second one only from Enter, the button or an example chip, while
  // the handler that received every keystroke set a loading flag. So typing lit
  // the flag, never fired the request, and left the page showing neither results
  // nor a spinner nor a message. Deriving the query from the input means there
  // is no path that can set "waiting" without also scheduling the work.
  useEffect(() => {
    const settled = input.trim();
    const timer = setTimeout(() => setQuery(settled), TYPING_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  const requestKey = `${query}\u0000${filter}`;

  useEffect(() => {
    // Nothing to do for an empty box: clearing is handled in the input handler,
    // where it belongs. An effect that reset state here would be a cascading
    // render, and React's lint rule is right to object - there is no external
    // system to synchronise with at this point.
    if (!query) return;

    const ac = new AbortController();
    abort.current = ac;
    let cancelled = false;

    const run = async () => {
      const params = new URLSearchParams({ q: query, limit: "20" });
      if (filter !== "all") params.set("sources", filter);
      try {
        const res = await fetch(`/api/search/semantic?${params}`, { signal: ac.signal });
        const body = (await res.json()) as Payload & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(body.error ?? `Search failed (${res.status})`);
          setAnswer(null);
          return;
        }
        setError("");
        setAnswer({ key: requestKey, data: body });
      } catch (e) {
        // An abort is the expected outcome of typing another character.
        if (!cancelled && (e as Error)?.name !== "AbortError") {
          setError("Could not reach the search service.");
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [query, filter, requestKey]);

  /**
   * Everything the input touches, in one place.
   *
   * Clearing has to drop the results here rather than in an effect: an answer
   * for text the user has deleted sits on screen looking like a failed search,
   * and the reset is a consequence of the event, not of any new request.
   */
  const handleInput = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      setAnswer(null);
      setError("");
    }
  };

  const data = answer?.data ?? null;
  // Two ways to be waiting: the text has not settled into a query yet, or the
  // answer on screen belongs to a different query/filter than the one asked for.
  const searching = Boolean(query) && (input.trim() !== query || answer?.key !== requestKey);
  const answered = Boolean(query) && !searching;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Search by <span style={{ color: "var(--color-violet)" }}>meaning</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--color-mute)" }}>
          Describes what you want instead of the words it happens to use. Type{" "}
          <em>&ldquo;which filler can I skip&rdquo;</em> and it finds the filler guides — without either word
          matching exactly.
        </p>
      </header>

      <form
        className="mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          // Enter searches immediately rather than waiting out the debounce.
          setQuery(input.trim());
        }}
      >
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
        >
          <input
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Describe what you are looking for…"
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: "var(--color-ink)" }}
            autoComplete="off"
            // Announced by screen readers while the answer is on its way.
            aria-busy={searching}
            aria-label="Search by meaning"
          />
          {input && (
            <button
              type="button"
              onClick={() => handleInput("")}
              aria-label="Clear search"
              className="shrink-0 rounded px-1.5 text-sm"
              style={{ color: "var(--color-mute)" }}
            >
              &times;
            </button>
          )}
          <button
            type="submit"
            className="shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{ background: "var(--color-violet)", color: "#fff" }}
          >
            Search
          </button>
        </div>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Everything
        </FilterChip>
        {sources.map((s) => (
          <FilterChip key={s.key} active={filter === s.key} onClick={() => setFilter(s.key)}>
            {s.label}
          </FilterChip>
        ))}
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "rgba(255,45,120,0.4)", background: "rgba(255,45,120,0.08)" }}
        >
          {error}
        </div>
      )}

      {data?.degraded && data.notice && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-xs"
          style={{ borderColor: "rgba(255,176,32,0.4)", background: "rgba(255,176,32,0.08)", color: "var(--color-ink)" }}
        >
          {data.notice}
        </div>
      )}

      {searching && (
        <p className="mb-3 text-xs" style={{ color: "var(--color-mute)" }} aria-live="polite">
          Searching {data ? `— still showing ${data.count} from the last search` : "…"}
        </p>
      )}

      {answered && data && !error && (
        <p className="mb-3 text-xs" aria-live="polite" style={{ color: "var(--color-mute)" }}>
          {data.count} result{data.count === 1 ? "" : "s"} across {data.scanned} indexed document
          {data.scanned === 1 ? "" : "s"}
          {data.engine === "pgvector" && " · pgvector index"}
        </p>
      )}

      <ul className="space-y-2">
        {(data?.hits ?? []).map((h) => (
          <li key={`${h.source}-${h.id}`}>
            <Link
              href={h.href}
              className="block rounded-xl border p-4 transition hover:border-white/25"
              style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                  style={{ background: "rgba(255,255,255,0.06)", color: SOURCE_COLOR[h.source] }}
                >
                  {h.source}
                </span>
                <span className="truncate text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                  {h.title}
                </span>
                {/* Confidence is shown as a bar, not a number: these scores are
                    cosine similarities between 0 and 1 and "73%" would imply a
                    precision the embedding does not have. */}
                <span className="ml-auto h-1 w-16 shrink-0 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(4, Math.round(h.score * 100))}%`,
                      background: SOURCE_COLOR[h.source],
                    }}
                  />
                </span>
              </div>
              {h.snippet && (
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-mute)" }}>
                  {h.snippet}
                </p>
              )}
              {h.tags && (
                <p className="mt-1.5 truncate text-[10px]" style={{ color: "var(--color-mute)" }}>
                  {h.tags.split(/[,\s]+/).filter(Boolean).slice(0, 6).join(" · ")}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {!input.trim() && (
        <section className="mt-2">
          <p className="mb-2 text-xs" style={{ color: "var(--color-mute)" }}>
            Try one of these:
          </p>
          <ul className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <li key={e}>
                <button
                  type="button"
                  onClick={() => handleInput(e)}
                  className="rounded-full border px-3 py-1.5 text-xs transition hover:border-white/30"
                  style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
                >
                  {e}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-xs leading-relaxed" style={{ color: "var(--color-mute)" }}>
            This indexes the site&rsquo;s own writing — wiki pages, blog posts, forum threads, reviews,
            community tags, clips, moments and award records — not the AniList catalogue. To browse
            anime by genre, studio or season, use the{" "}
            <Link href="/search" style={{ color: "var(--color-violet)" }}>
              catalogue search
            </Link>
            .
          </p>
        </section>
      )}

      {answered && data && data.count === 0 && !error && (
        <div
          className="rounded-xl border p-6 text-center text-sm"
          style={{ borderColor: "var(--color-line)", color: "var(--color-mute)" }}
        >
          <p>Nothing in the index reads close to that.</p>
          <p className="mt-2 text-xs">
            Try describing the topic rather than naming it, or drop the source filter — it may be
            narrowing to a section with no match.
          </p>
        </div>
      )}
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full border px-3 py-1 text-xs transition hover:border-white/30"
      style={{
        borderColor: active ? "var(--color-violet)" : "var(--color-line)",
        color: active ? "var(--color-ink)" : "var(--color-mute)",
        background: active ? "rgba(138,92,255,0.12)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}