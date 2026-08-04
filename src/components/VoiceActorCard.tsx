import Link from "next/link";
import Image from "next/image";
import type { VoiceActor } from "@/lib/voice-actors";

function hashHue(name = ""): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

export default function VoiceActorCard({ actor, neon }: { actor: VoiceActor; neon?: boolean }) {
  if (neon) {
    const hue = hashHue(actor.name);
    const gradient = `linear-gradient(135deg, hsl(${hue} 72% 48%), hsl(${(hue + 55) % 360} 70% 30%) 55%, hsl(${(hue + 110) % 360} 65% 12%))`;

    return (
      <Link href={`/voice-actors/${actor.id}`} className="group block h-full">
        <div className="va-neon-card relative h-full rounded-xl">
          <div className="relative z-[1] m-[2px] flex h-[calc(100%-4px)] flex-col overflow-hidden rounded-[10px] bg-[var(--color-panel)]">
            {/* Actor portrait */}
            <div
              className="relative flex aspect-square items-center justify-center overflow-hidden"
              style={{ background: gradient }}
            >
              {actor.image ? (
                <Image
                  src={actor.image}
                  alt={actor.name}
                  fill
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <span className="text-6xl font-bold text-white/95 drop-shadow-lg">{actor.name.charAt(0)}</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />

              {actor.isIndian && (
                <span className="absolute top-2 right-2 z-[3] rounded-full bg-[var(--color-magenta)] px-2 py-0.5 text-[9px] font-bold text-black shadow-[0_0_8px_rgba(255,45,120,0.6)]">
                  Indian VA
                </span>
              )}

              {actor.languages && actor.languages.length > 0 && (
                <div className="absolute bottom-2 left-2 z-[3] flex flex-wrap gap-1">
                  {actor.languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full border border-[var(--color-cyan)]/40 bg-black/60 px-2 py-0.5 text-[9px] font-medium text-[var(--color-cyan)] backdrop-blur"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-3">
              <p className="truncate text-sm font-bold">{actor.name}</p>
              <div className="mt-1">
                <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-cyan)]">
                  {actor.roles.length} role{actor.roles.length !== 1 ? "s" : ""}
                </span>
              </div>
              {actor.roles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {actor.roles.slice(0, 2).map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative h-9 w-7 shrink-0 overflow-hidden rounded border border-[var(--color-line)]">
                        {r.animeImage ? (
                          <Image src={r.animeImage} alt={r.animeTitle} fill className="object-cover" sizes="28px" />
                        ) : (
                          <div className="h-full w-full bg-[var(--color-void)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-semibold text-[var(--color-ink)]">{r.characterName}</p>
                        <p className="truncate text-[9px] text-[var(--color-mute)]">{r.animeTitle}</p>
                      </div>
                    </div>
                  ))}
                  {actor.roles.length > 2 && (
                    <p className="pl-9 text-[9px] text-[var(--color-mute)]">+{actor.roles.length - 2} more</p>
                  )}
                </div>
              )}
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
            <Image src={actor.image} alt={actor.name} fill referrerPolicy="no-referrer" className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
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
