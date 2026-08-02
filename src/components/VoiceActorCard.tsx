import Link from "next/link";
import Image from "next/image";
import type { VoiceActor } from "@/lib/voice-actors";

export default function VoiceActorCard({ actor, neon }: { actor: VoiceActor; neon?: boolean }) {
  if (neon) {
    return (
      <Link href={`/voice-actors/${actor.id}`} className="group block">
        <div className="va-neon-card relative rounded-xl overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-[var(--color-void)] z-[1]">
            {actor.image ? (
              <Image src={actor.image} alt={actor.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl font-bold text-[var(--color-mute)] bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)]">
                {actor.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[2]" />
            {actor.isIndian && (
              <span className="absolute top-2 right-2 z-[3] rounded-full bg-[var(--color-magenta)] px-2 py-0.5 text-[9px] font-bold text-black shadow-[0_0_8px_rgba(255,45,120,0.5)]">
                Indian VA
              </span>
            )}
            {actor.languages && actor.languages.length > 0 && (
              <div className="absolute bottom-2 left-2 z-[3] flex gap-1">
                {actor.languages.map((lang) => (
                  <span key={lang} className="rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[9px] font-medium text-[var(--color-cyan)] border border-[var(--color-cyan)]/30">
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="relative z-[1] p-3 space-y-1 bg-[var(--color-panel)]">
            <p className="text-sm font-bold truncate">{actor.name}</p>
            {actor.nativeName && (
              <p className="text-[11px] text-[var(--color-mute)] truncate">{actor.nativeName}</p>
            )}
            <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
              {actor.roles.length > 0 && (
                <span>{actor.roles.length} role{actor.roles.length !== 1 ? "s" : ""}</span>
              )}
              {actor.birthDate && <span>• {actor.birthDate}</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/voice-actors/${actor.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-[var(--color-void)]">
          {actor.image ? (
            <Image src={actor.image} alt={actor.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-bold text-[var(--color-mute)]">
              {actor.name.charAt(0)}
            </div>
          )}
          {actor.isIndian && (
            <span className="absolute top-2 right-2 rounded-full bg-[var(--color-magenta)] px-2 py-0.5 text-[9px] font-bold text-black">Indian VA</span>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="text-sm font-bold truncate">{actor.name}</p>
          {actor.nativeName && (
            <p className="text-[11px] text-[var(--color-mute)] truncate">{actor.nativeName}</p>
          )}
          <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
            {actor.roles.length > 0 && (
              <span>{actor.roles.length} role{actor.roles.length !== 1 ? "s" : ""}</span>
            )}
            {actor.birthDate && <span>• {actor.birthDate}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
