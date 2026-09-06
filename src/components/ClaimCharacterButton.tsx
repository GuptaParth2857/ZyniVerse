"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClaimButtonProps = {
  characterId: number;
  characterName: string;
  characterImage?: string | null;
  accent?: string;
  size?: "sm" | "md";
};

export default function ClaimCharacterButton({ characterId, characterName, characterImage, accent = "#ffb6c1", size = "sm" }: ClaimButtonProps) {
  const [claimed, setClaimed] = useState(false);
  const [kind, setKind] = useState("favorite");
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/character-favorites")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const mine = (d.favorites || []).filter((f: { characterId: number }) => f.characterId === characterId);
        setClaimed(mine.length > 0);
        if (mine[0]) setKind(mine[0].kind);
        setCount(d.favorites?.length ?? 0);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [characterId]);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/character-favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, characterName, characterImage }),
      });
      const d = await res.json();
      if (res.ok) {
        setClaimed(!!d.favorite);
        setCount(d.favorites?.length ?? count);
      }
    } finally {
      setBusy(false);
    }
  };

  const setClaimKind = async (k: string) => {
    if (!claimed) return;
    setBusy(true);
    try {
      await fetch("/api/character-favorites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, kind: k }),
      });
      setKind(k);
    } finally {
      setBusy(false);
    }
  };

  const pad = size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className={`rounded-full font-semibold transition-all disabled:opacity-50 ${pad} ${
          claimed
            ? "text-black"
            : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
        }`}
        style={claimed ? { background: accent, boxShadow: `0 0 18px -4px ${accent}` } : undefined}
      >
        {busy ? "..." : claimed ? "✓ Claimed" : "♥ Claim"}
      </button>

      {claimed && (
        <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-0.5">
          {["favorite", "waifu", "husbando"].map((k) => (
            <button
              key={k}
              onClick={() => setClaimKind(k)}
              disabled={busy}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize transition-all ${kind === k ? "bg-white/20 text-white" : "text-white/40 hover:text-white/80"}`}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {count != null && (
        <Link href="/my-characters" className="text-[10px] text-white/30 hover:text-white/70 transition-colors">
          {count} claimed
        </Link>
      )}
    </div>
  );
}