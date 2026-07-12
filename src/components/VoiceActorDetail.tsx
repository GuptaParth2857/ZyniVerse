"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getVoiceActor } from "@/lib/voice-actors";
import Loader, { ErrorState } from "@/components/Loader";
import type { VoiceActor, VoiceActorRole } from "@/lib/voice-actors";

function hashColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 55%, 50%)`;
}

export default function VoiceActorDetail({ id }: { id: string }) {
  const [actor, setActor] = useState<VoiceActor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getVoiceActor(parseInt(id))
      .then((d) => { if (!cancelled) setActor(d); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const accent = useMemo(() => hashColor(actor?.name), [actor?.name]);

  const languages = useMemo(() => {
    if (!actor) return [];
    const set = new Set(actor.roles.map((r) => r.language));
    return ["all", ...Array.from(set)];
  }, [actor]);

  const filteredRoles = useMemo(() => {
    if (!actor) return [];
    if (languageFilter === "all") return actor.roles;
    return actor.roles.filter((r) => r.language === languageFilter);
  }, [actor, languageFilter]);

  if (loading) return <Loader label="Loading voice actor..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!actor) return null;

  return (
    <div>
      <div className="relative min-h-[40vh] border-b border-[var(--color-line)] overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 40%, ${accent}33, transparent 70%)` }} />
        <div className="relative z-10 mx-auto flex h-full min-h-[40vh] max-w-7xl items-center px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 w-full">
            <div className="shrink-0 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full opacity-40 blur-2xl" style={{ background: accent }} />
                <div className="relative h-40 w-40 sm:h-48 sm:w-48 overflow-hidden rounded-full border-4" style={{ borderColor: accent }}>
                  <Image src={actor.image || ""} alt={actor.name} fill className="object-cover" sizes="(max-width: 640px) 160px, 192px" />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-bold sm:text-4xl drop-shadow-lg">{actor.name}</h1>
                {actor.isIndian && (
                  <span className="rounded-full bg-[var(--color-magenta)] px-3 py-1 text-xs font-bold text-black">Indian VA</span>
                )}
              </div>
              {actor.nativeName && <p className="mt-1 text-lg text-[var(--color-mute)]">{actor.nativeName}</p>}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {actor.age && <StatCard accent={accent} label="Age" value={String(actor.age)} />}
                {actor.birthDate && <StatCard accent={accent} label="Birthday" value={actor.birthDate} />}
                {actor.birthplace && <StatCard accent={accent} label="Birthplace" value={actor.birthplace} />}
                {actor.agency && <StatCard accent={accent} label="Agency" value={actor.agency} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {actor.bio && (
          <section>
            <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full" style={{ background: accent }} />
              Biography
            </h2>
            <p className="text-sm text-[var(--color-mute)] leading-relaxed whitespace-pre-line">{actor.bio}</p>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <span className="h-4 w-1 rounded-full" style={{ background: accent }} />
              Roles ({filteredRoles.length})
            </h2>
            <div className="flex items-center gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguageFilter(lang)}
                  className={`rounded-full px-5 py-2.5 text-xs font-medium border transition-colors ${
                    languageFilter === lang
                      ? "border-[var(--color-cyan)] text-[var(--color-cyan)] bg-[var(--color-cyan)]/10"
                      : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]"
                  }`}
                >
                  {lang === "all" ? "All" : lang}
                </button>
              ))}
            </div>
          </div>

          {filteredRoles.length === 0 ? (
            <p className="text-sm text-[var(--color-mute)] py-8 text-center">No roles found for this filter.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredRoles.map((role, i) => (
                <RoleCard key={`${role.animeId}-${i}`} role={role} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ accent, label, value }: { accent: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-center">
      <div className="text-sm font-bold font-mono" style={{ color: accent }}>{value}</div>
      <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

function RoleCard({ role }: { role: VoiceActorRole }) {
  return (
    <Link href={`/anime/${role.animeId}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-void)]">
          {role.animeImage ? (
            <Image src={role.animeImage} alt={role.animeTitle} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-xs text-[var(--color-mute)]">
              {role.animeTitle}
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold capitalize backdrop-blur">
              {role.roleType}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="rounded-full bg-[var(--color-magenta)]/80 px-2 py-0.5 text-[9px] font-semibold text-black backdrop-blur">
              {role.language}
            </span>
          </div>
        </div>
        <div className="p-2.5 space-y-1">
          <p className="text-xs font-bold truncate">{role.characterName}</p>
          <p className="text-[10px] text-[var(--color-mute)] truncate">{role.animeTitle}</p>
        </div>
      </div>
    </Link>
  );
}
