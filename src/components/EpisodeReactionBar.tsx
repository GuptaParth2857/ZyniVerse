"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const REACTIONS = [
  { key: "wow", label: "Wow", emoji: "😮" },
  { key: "hype", label: "Hype", emoji: "🔥" },
  { key: "cry", label: "Cry", emoji: "😭" },
  { key: "lol", label: "LOL", emoji: "😂" },
  { key: "sleep", label: "Sleep", emoji: "😴" },
] as const;

type Counts = Record<string, number>;

export default function EpisodeReactionBar({ mediaId, episode }: { mediaId: number; episode: number }) {
  const { data: session } = useSession();
  const [counts, setCounts] = useState<Counts>({});
  const [mine, setMine] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;
    fetch(`/api/episodes/${mediaId}/${episode}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) {
          setCounts(d.counts || {});
          setMine(d.mine || null);
          setTotal(d.total || 0);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [mediaId, episode]);

  const react = async (key: string) => {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/episodes/${mediaId}/${episode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction: key }),
    });
    if (res.ok) {
      const d = await res.json();
      setCounts(d.counts || {});
      setMine(d.mine || null);
      setTotal(d.total || 0);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--color-mute)]">
          Ep {episode} reactions <span className="font-mono text-[var(--color-cyan)]">({total})</span>
        </span>
        <div className="flex items-center gap-1">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => react(r.key)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all ${
                mine === r.key
                  ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/15 text-white"
                  : "border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-white"
              }`}
            >
              <span>{r.emoji}</span>
              <span className="font-mono">{counts[r.key] || 0}</span>
            </button>
          ))}
        </div>
      </div>
      {!session?.user?.id && (
        <p className="mt-2 text-[10px] text-[var(--color-mute)]">Sign in to react to this episode.</p>
      )}
    </div>
  );
}