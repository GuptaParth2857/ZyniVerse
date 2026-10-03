"use client";

/**
 * Meaning-based search over wiki pages, blog posts and forum threads.
 *
 * Deliberately a separate surface from /search, which is entirely about AniList
 * media. Mixing prose search into a genre/tag-filtered anime catalogue would
 * have meant one page answering two unrelated questions.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Source = "wiki" | "blog" | "forum";

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
  notice?: string;
}

const FILTERS: Array<{ key: Source | "all"; label: string }> = [
  { key: "all", label: "Everything" },
  { key: "wiki", label: "Wiki" },
  { key: "blog", label: "Blog" },
  { key: "forum", label: "Forum" },
];

const SOURCE_COLOR: Record<Source, string> = {
  wiki: "var(--color-cyan)",
  blog: "var(--color-violet)",
  forum: "var(--color-magenta)",
};

const EXAMPLES = [
  "which episodes should I skip",
  "show with strong swordsmen and redemption arcs",
  "where do I start if I have never seen anime",
  "best studio for quiet slice of life",
];

export default function SemanticSearch() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Source | "all">("all");
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    // Nothing to reset here: `submit` clears stale results when the query is
    // emptied, so the effect only has to wait for a real query.
    if (!q) return;

    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({ q, limit: "20" });
      if (filter !== "all") params.set("sources", filter);

      try {
        const res = await fetch(`/api/search/semantic?${params}`, { signal: ac.signal });
        const body = (await res.json()) as Payload & { error?: string };
        if (!res.ok) {
          setError(body.error ?? `Search failed (${res.status})`);
          setData(null);
          return;
        }
        setError("");
        setData(body);
      } catch (e) {
        // An abort is the expected outcome of typing another character.
        if ((e as Error)?.name !== "AbortError") setError("Could not reach the search service.");
      } finally {
        setLoading(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [query, filter]);

  const submit = (value: string) => {
    // Event-driven reset: stale results must not sit on screen next to the
    // spinner for a query they have nothing to do with, and clearing the box
    // has to clear the results too.
    const hasQuery = value.trim().length > 0;
    setLoading(hasQuery);
    setError("");
    setData(null);
    setQuery(value);
  };

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

      <div className="mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
          >
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setLoading(true);
              }}
              placeholder="Describe what you are looking for…"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--color-ink)" }}
              autoComplete="off"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold"
              style={{ background: "var(--color-violet)", color: "#fff" }}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className="rounded-full border px-3 py-1 text-xs transition hover:border-white/30"
            style={{
              borderColor: filter === f.key ? "var(--color-violet)" : "var(--color-line)",
              color: filter === f.key ? "var(--color-ink)" : "var(--color-mute)",
              background: filter === f.key ? "rgba(138,92,255,0.12)" : "transparent",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!query.trim() && (
        <section>
          <p className="mb-2 text-xs" style={{ color: "var(--color-mute)" }}>
            Try one of these:
          </p>
          <ul className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <li key={e}>
                <button
                  type="button"
                  onClick={() => {
                    setInput(e);
                    submit(e);
                  }}
                  className="rounded-full border px-3 py-1.5 text-xs transition hover:border-white/30"
                  style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
                >
                  {e}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

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

      {query.trim() && !loading && data && (
        <p className="mb-3 text-xs" style={{ color: "var(--color-mute)" }}>
          {data.count} result{data.count === 1 ? "" : "s"} across {data.scanned} indexed document
          {data.scanned === 1 ? "" : "s"}
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
                  className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                  style={{ background: "rgba(255,255,255,0.06)", color: SOURCE_COLOR[h.source] }}
                >
                  {h.source}
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                  {h.title}
                </span>
                {/* Confidence is shown as a bar, not a number: these scores are
                    cosine similarities between 0 and 1 and "73%" would imply a
                    precision the embedding does not have. */}
                <span className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-white/10">
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
            </Link>
          </li>
        ))}
      </ul>

      {query.trim() && !loading && data && data.count === 0 && (
        <p className="rounded-xl border p-6 text-center text-sm" style={{ borderColor: "var(--color-line)", color: "var(--color-mute)" }}>
          Nothing close enough. Try describing the topic instead of naming it.
        </p>
      )}
    </main>
  );
}