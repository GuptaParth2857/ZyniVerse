"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

type CharRow = {
  characterId: number;
  name: string;
  image: string | null;
  gender: string | null;
  ageInt: number | null;
  ageLabel: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  favourites: number;
};

const GENDERS = ["Male", "Female", "Non-binary"];
const HAIRS = ["Black", "Brown", "Blonde", "Blue", "Red", "Pink", "Purple", "White", "Green", "Silver"];
const EYES = ["Brown", "Blue", "Green", "Red", "Pink", "Purple", "Hazel", "Black", "Amber"];

export default function CharacterSearchPage() {
  const [gender, setGender] = useState("any");
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [hair, setHair] = useState("any");
  const [eye, setEye] = useState("any");
  const [q, setQ] = useState("");
  const [chars, setChars] = useState<CharRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const buildQuery = (p = 1) => {
    const params = new URLSearchParams();
    if (gender !== "any") params.set("gender", gender);
    if (ageFrom) params.set("ageFrom", ageFrom);
    if (ageTo) params.set("ageTo", ageTo);
    if (hair !== "any") params.set("hair", hair);
    if (eye !== "any") params.set("eye", eye);
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/api/characters/trait-search?${params.toString()}`;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(buildQuery(1))
      .then((r) => r.json())
      .then((d) => {
        setChars(d.characters || []);
        setTotal(d.total || 0);
        setHasMore(d.hasMore || false);
        setPage(1);
      })
      .catch(() => setChars([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, ageFrom, ageTo, hair, eye, q]);

  const loadMore = async () => {
    const next = page + 1;
    const res = await fetch(buildQuery(next));
    const d = await res.json();
    setChars((prev) => [...prev, ...(d.characters || [])]);
    setHasMore(!!d.hasMore);
    setPage(next);
  };

  const chip = (current: string, value: string, setter: (v: string) => void) => (
    <button
      onClick={() => setter(current === value ? "any" : value)}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${current === value ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]" : "border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:text-white"}`}
    >
      {value}
    </button>
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Character Finder</p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Search Characters by Trait</h1>
          </div>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            Filter anime characters by gender, age and appearance. Results come from the community-curated pool — tag appearances on any
            character page to expand what&apos;s searchable.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by character name..."
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)]"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">Gender</p>
              <div className="flex flex-wrap gap-1.5">{GENDERS.map((g) => chip(gender, g, setGender))}</div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">Age Range</p>
              <div className="flex items-center gap-2">
                <input value={ageFrom} onChange={(e) => setAgeFrom(e.target.value)} type="number" placeholder="Min" className="w-20 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-1.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-cyan)]" />
                <span className="text-[var(--color-mute)]">–</span>
                <input value={ageTo} onChange={(e) => setAgeTo(e.target.value)} type="number" placeholder="Max" className="w-20 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-1.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-cyan)]" />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">Hair Color</p>
              <div className="flex flex-wrap gap-1.5">{HAIRS.map((h) => chip(hair, h, setHair))}</div>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">Eye Color</p>
            <div className="flex flex-wrap gap-1.5">{EYES.map((e) => chip(eye, e, setEye))}</div>
          </div>

          <p className="text-[10px] text-[var(--color-mute)]">
            {total.toLocaleString()} characters match{gender === "any" && !ageFrom && !ageTo && hair === "any" && eye === "any" && !q ? " (all traits searchable)" : ""}
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-[var(--color-panel)] animate-pulse" />
            ))}
          </div>
        ) : chars.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon="search"
              title="No characters matched those traits."
              description="Try widening the filters, or the pool may still be building. Adjust gender/age or search by name."
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {chars.map((c) => (
                <Link key={c.characterId} href={`/character/${c.characterId}`} className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-cyan)] transition-all">
                  <div className="relative aspect-[3/4] bg-[var(--color-line)]/40">
                    {c.image && <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="200px" />}
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-[var(--color-cyan)]">
                      ♥ {c.favourites.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium">{c.name}</p>
                    <p className="text-[10px] text-[var(--color-mute)]">
                      {c.gender || ""}
                      {c.ageLabel ? ` · ${c.ageLabel}` : ""}
                    </p>
                    {(c.hairColor || c.eyeColor) && (
                      <p className="mt-0.5 truncate text-[10px] text-[var(--color-magenta)]">
                        {[c.hairColor && `hair ${c.hairColor}`, c.eyeColor && `eyes ${c.eyeColor}`].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="mt-6 text-center">
                <button onClick={loadMore} className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2 text-sm font-medium text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all">
                  Load more ({total - chars.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}