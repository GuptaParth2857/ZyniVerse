"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

type Fav = {
  characterId: number;
  characterName: string;
  characterImage: string | null;
  kind: string;
  rank: number;
};

export default function MyCharactersPage() {
  const [favs, setFavs] = useState<Fav[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/character-favorites")
      .then((r) => r.json())
      .then((d) => {
        if (active) setFavs(d.favorites || []);
      })
      .catch(() => {
        if (active) setFavs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const setKind = async (characterId: number, kind: string) => {
    await fetch("/api/character-favorites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, kind }),
    });
    setFavs((prev) => (prev || []).map((f) => (f.characterId === characterId ? { ...f, kind } : f)));
  };

  const unclaim = async (characterId: number) => {
    await fetch("/api/character-favorites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, characterName: "x" }),
    });
    setFavs((prev) => (prev || []).filter((f) => f.characterId !== characterId));
  };

  const waifus = (favs || []).filter((f) => f.kind === "waifu");
  const husbandos = (favs || []).filter((f) => f.kind === "husbando");
  const others = (favs || []).filter((f) => f.kind === "favorite");

  const renderGrid = (list: Fav[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {list.map((f) => (
        <div key={f.characterId} className="group relative rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
          <Link href={`/character/${f.characterId}`} className="block">
            <div className="relative aspect-[3/4] bg-[var(--color-line)]/40">
              {f.characterImage && <Image src={f.characterImage} alt={f.characterName} fill className="object-cover" sizes="200px" />}
            </div>
            <div className="p-2">
              <p className="text-xs font-medium truncate">{f.characterName}</p>
            </div>
          </Link>
          <div className="flex items-center justify-between gap-1 border-t border-[var(--color-line)]/50 p-2">
            <div className="flex rounded-full border border-[var(--color-line)] p-0.5">
              {["favorite", "waifu", "husbando"].map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(f.characterId, k)}
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium capitalize transition-all ${f.kind === k ? "bg-[var(--color-cyan)] text-black" : "text-[var(--color-mute)] hover:text-white"}`}
                >
                  {k[0]}
                </button>
              ))}
            </div>
            <button onClick={() => unclaim(f.characterId)} className="text-[10px] text-red-400/70 hover:text-red-400">✕</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Your Characters</p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">My Characters</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          Claim characters as favorites, waifus or husbandos. Browse in{" "}
          <Link href="/popular-characters" className="text-[var(--color-cyan)] hover:underline">Popular Characters</Link>.
        </p>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-[var(--color-panel)] animate-pulse" />
            ))}
          </div>
        ) : !favs || favs.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon="bookmark"
              title="No characters claimed yet."
              description="Claim your favorite characters to build your waifu/husbando list."
              actionLabel="Browse Characters"
              actionHref="/popular-characters"
            />
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {waifus.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-bold text-pink-400">Waifus ({waifus.length})</h2>
                {renderGrid(waifus)}
              </section>
            )}
            {husbandos.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-bold text-cyan-400">Husbandos ({husbandos.length})</h2>
                {renderGrid(husbandos)}
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-bold text-white/80">Favorites ({others.length})</h2>
                {renderGrid(others)}
              </section>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}