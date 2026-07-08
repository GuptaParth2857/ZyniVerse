import Link from "next/link";
import Image from "next/image";
import type { VoiceActor } from "@/lib/voice-actors";

export default function VoiceActorCard({ actor }: { actor: VoiceActor }) {
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
