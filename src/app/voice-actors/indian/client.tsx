"use client";

import { useState, useEffect } from "react";
import { getIndianVoiceActors } from "@/lib/voice-actors";
import type { VoiceActor } from "@/lib/voice-actors";
import VoiceActorCard from "@/components/VoiceActorCard";
import { PageTransition } from "@/components/PageTransition";

export default function IndianVoiceActorsClient() {
  const [actors, setActors] = useState<VoiceActor[]>([]);

  useEffect(() => {
    getIndianVoiceActors().then(setActors).catch(() => {});
  }, []);

  return (
    <PageTransition>
      <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-10 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold">Indian Voice Actors</h1>
          <p className="mt-2 text-[var(--color-mute)] text-sm">
            Hindi, Tamil &amp; Telugu anime dubbing artists
          </p>
        </div>

        {actors.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-mute)] py-12">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {actors.map((actor) => (
              <VoiceActorCard key={actor.id} actor={actor} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
