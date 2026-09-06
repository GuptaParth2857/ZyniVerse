"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const HAIR = ["Black", "Brown", "Blonde", "Blue", "Red", "Pink", "Purple", "White", "Green", "Silver"];
const EYES = ["Brown", "Blue", "Green", "Red", "Pink", "Purple", "Hazel", "Black", "Amber"];

export default function TraitTagButton({
  characterId,
  characterName,
  characterImage,
}: {
  characterId: number;
  characterName: string;
  characterImage?: string | null;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [hair, setHair] = useState<string | null>(null);
  const [eye, setEye] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setMsg(null);
    const res = await fetch("/api/characters/traits/tag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, characterName, characterImage, hairColor: hair, eyeColor: eye }),
    });
    if (res.ok) {
      setMsg("Trait saved — searchable by filter now ✓");
      setOpen(false);
    } else {
      const d = await res.json();
      setMsg(d.error || "Failed to save");
    }
  };

  const pill = (list: string[], current: string | null, setter: (v: string | null) => void) => (
    <div className="flex flex-wrap gap-1">
      {list.map((c) => (
        <button
          key={c}
          onClick={() => setter(current === c ? null : c)}
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all ${current === c ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]" : "border-[var(--color-line)] bg-[var(--color-void)] text-[var(--color-mute)] hover:text-white"}`}
        >
          {c}
        </button>
      ))}
    </div>
  );

  if (!session?.user?.id) return null;

  return (
    <div className="mt-3">
      {open ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 space-y-3">
          <p className="text-xs text-[var(--color-mute)]">Tag this character&apos;s appearance so others can find them by trait.</p>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">Hair</p>
            {pill(HAIR, hair, setHair)}
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">Eyes</p>
            {pill(EYES, eye, setEye)}
          </div>
          <div className="flex items-center justify-end gap-2">
            {msg && <span className="text-[10px] text-[var(--color-mute)]">{msg}</span>}
            <button onClick={() => setOpen(false)} className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs text-[var(--color-mute)] hover:text-white transition-all">Cancel</button>
            <button onClick={save} className="rounded-lg bg-[var(--color-magenta)] px-4 py-1.5 text-xs font-bold text-black transition-all hover:scale-105">Save Traits</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
        >
          🏷️ Tag Appearance
        </button>
      )}
    </div>
  );
}