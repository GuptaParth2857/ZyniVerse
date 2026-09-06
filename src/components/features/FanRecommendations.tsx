"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Rec = {
  id: string;
  fromMediaId: number;
  fromTitle: string;
  fromType: string;
  toMediaId: number;
  toTitle: string;
  toType: string;
  meaning: string;
  authorUsername: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: string;
};

export default function FanRecommendations({ mediaId, mediaTitle }: { mediaId: number; mediaTitle: string }) {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toTitle, setToTitle] = useState("");
  const [toId, setToId] = useState("");
  const [meaning, setMeaning] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    fetch(`/api/recommendations?fromId=${mediaId}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setRecs(d.recommendations || []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mediaId]);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromMediaId: mediaId,
          fromTitle: mediaTitle,
          toMediaId: Number(toId),
          toTitle,
          meaning,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to add");
      setRecs((prev) => [d.recommendation, ...prev]);
      setShowForm(false);
      setToTitle("");
      setToId("");
      setMeaning("");
      setMsg(null);
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to add recommendation." });
    }
    setBusy(false);
  };

  const vote = async (id: string, value: number) => {
    if (votes[id] === value) return;
    const res = await fetch(`/api/recommendations/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const d = await res.json();
      setRecs((prev) => prev.map((r) => (r.id === id ? { ...r, upvotes: d.upvotes, downvotes: d.downvotes } : r)));
      setVotes((prev) => ({ ...prev, [id]: value }));
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Fan Recommendations</h2>
          <p className="mt-1 text-sm text-[var(--color-mute)]">Hand-written picks from the community &amp; why they recommend them.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="shrink-0 rounded-lg px-4 py-2 text-xs font-bold text-black transition-all hover:scale-105"
          style={{ background: "var(--color-magenta)" }}
        >
          {showForm ? "Cancel" : "+ Add a Pick"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 grid gap-3 rounded-xl border border-[var(--color-magenta)]/30 bg-[var(--color-panel)] p-4 sm:grid-cols-1">
          <div className="text-sm text-[var(--color-mute)]">
            Recommend a <span className="font-bold text-[var(--color-cyan)]">{mediaTitle}</span> alternative to other fans.
          </div>
          <input
            value={toTitle}
            onChange={(e) => setToTitle(e.target.value)}
            placeholder="Recommended title (e.g. A Silent Voice)"
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)]"
          />
          <input
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            placeholder="Recommended AniList media ID (numbers only)"
            type="number"
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)]"
          />
          <textarea
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="Why you'll like it (this is the heart of the rec)..."
            maxLength={500}
            rows={3}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)]"
          />
          <div className="flex items-center justify-end gap-3">
            <span className="text-[10px] text-[var(--color-mute)]">{meaning.length}/500</span>
            <button onClick={submit} disabled={busy} className="rounded-lg bg-[var(--color-cyan)] px-5 py-2 text-xs font-bold text-black transition-all hover:scale-105 disabled:opacity-50">
              {busy ? "..." : "Post Recommendation"}
            </button>
          </div>
          {msg && <p className="text-xs text-red-400">{msg.text}</p>}
        </div>
      )}

      {loading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-[var(--color-panel)] animate-pulse" />
          ))}
        </div>
      ) : recs.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-mute)]">
          No fan picks yet. Be the first to recommend something after{" "}
          <span className="font-bold text-[var(--color-cyan)]">{mediaTitle}</span>!
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recs.map((r) => (
            <div key={r.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/anime/${r.toMediaId}`} className="min-w-0">
                  <p className="text-sm font-bold text-[var(--color-cyan)] hover:underline truncate">{r.toTitle}</p>
                </Link>
                <span className="shrink-0 rounded-full bg-[var(--color-line)]/40 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[var(--color-mute)]">
                  {r.fromType === "MANGA" ? "Manga" : "Anime"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-mute)]">“{r.meaning}”</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-mute)]">by {r.authorUsername || "a fan"}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => vote(r.id, 1)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${votes[r.id] === 1 ? "bg-[var(--color-cyan)] text-black" : "bg-[var(--color-line)]/30 text-[var(--color-mute)] hover:text-white"}`}
                  >
                    ▲ {r.upvotes}
                  </button>
                  <button
                    onClick={() => vote(r.id, -1)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${votes[r.id] === -1 ? "bg-red-500 text-black" : "bg-[var(--color-line)]/30 text-[var(--color-mute)] hover:text-white"}`}
                  >
                    ▼ {r.downvotes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}