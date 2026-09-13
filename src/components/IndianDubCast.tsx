"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Role {
  characterName: string;
  language: string;
  roleType: "main" | "supporting" | "guest";
  actor: { id: number; name: string; image: string };
}

export default function IndianDubCast({ mediaId }: { mediaId: number }) {
  const [roles, setRoles] = useState<Role[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/anime/${mediaId}/dub-cast`)
      .then((res) => (res.ok ? res.json() : { roles: [] }))
      .then((data: { roles?: Role[] }) => {
        if (alive) setRoles(data.roles ?? []);
      })
      .catch(() => {
        if (alive) setRoles([]);
      });
    return () => { alive = false; };
  }, [mediaId]);

  if (roles === null) return null;
  if (roles.length === 0) return null;

  const byLanguage = roles.reduce<Record<string, Role[]>>((acc, role) => {
    (acc[role.language] ||= []).push(role);
    return acc;
  }, {});

  return (
    <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-extrabold text-white">🇮🇳 India Dub Cast</h2>
        <span className="rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan)]">
          ZyniVerse Exclusive
        </span>
      </div>

      {Object.entries(byLanguage).map(([lang, langRoles]) => (
        <div key={lang} className="mb-4 last:mb-0">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">{lang} Dub</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {langRoles.map((role, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <img
                  src={role.actor.image}
                  alt={role.actor.name}
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{role.characterName}</p>
                  <Link
                    href={`/voice-actors/${role.actor.id}`}
                    className="truncate text-xs text-[var(--color-cyan)] hover:underline"
                  >
                    {role.actor.name}
                    {role.roleType === "main" && <span className="ml-1 text-white/40">· main</span>}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}