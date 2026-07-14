"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { searchVoiceActors, getIndianVoiceActors } from "@/lib/voice-actors";
import type { VoiceActor } from "@/lib/voice-actors";
import VoiceActorCard from "@/components/VoiceActorCard";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";

export default function VoiceActorsClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VoiceActor[]>([]);
  const [loading, setLoading] = useState(false);
  const [indianVAs, setIndianVAs] = useState<VoiceActor[]>([]);

  useEffect(() => {
    getIndianVoiceActors().then(setIndianVAs).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchVoiceActors(query.trim());
        setResults(data.actors);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <PageTransition>
      <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold">Voice Actors</h1>
          <p className="mt-2 text-[var(--color-mute)] text-sm">Anime seiyuu, Japanese &amp; Indian dubbing artists</p>
        </div>

        <div className="mx-auto max-w-lg mb-8">
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] opacity-0 group-focus-within:opacity-100 blur-sm transition-all duration-700" />
            <div className="relative flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search voice actors by name..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-[var(--color-mute)] hover:text-[var(--color-ink)] text-xs">✕</button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-6">
          {query.trim() ? `Results for "${query}"` : "Popular Voice Actors"}
        </p>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
            {results.map((actor) => (
              <VoiceActorCard key={actor.id} actor={actor} />
            ))}
          </div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <p className="text-center text-sm text-[var(--color-mute)] py-12">No voice actors found for &ldquo;{query}&rdquo;</p>
        )}

        {!query.trim() && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
                Indian Voice Actors
              </h2>
              <Link href="/voice-actors/indian" className="text-xs text-[var(--color-cyan)] hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {indianVAs.slice(0, 10).map((actor) => (
                <VoiceActorCard key={actor.id} actor={actor} />
              ))}
            </div>
          </section>
        )}
        <div className="mx-auto max-w-7xl pb-6 mt-8">
          <NativeBannerAd />
        </div>
      </div>
    </PageTransition>
  );
}
