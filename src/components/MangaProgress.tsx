"use client";

import { useState } from "react";

interface Props {
  mediaId: number;
  chapters: number;
  volumes: number;
  totalChapters?: number | null;
  totalVolumes?: number | null;
  onUpdate: (chapters: number, volumes: number) => void;
}

export default function MangaProgress({ mediaId, chapters, volumes, totalChapters, totalVolumes, onUpdate }: Props) {
  const [ch, setCh] = useState(chapters);
  const [vol, setVol] = useState(volumes);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/manga/list/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapters: ch, volumes: vol }),
      });
      if (res.ok) onUpdate(ch, vol);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-sm font-bold mb-4">Progress</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[var(--color-mute)] block mb-1">Chapters</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCh(Math.max(0, ch - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-line)] hover:border-[var(--color-violet)] text-sm"
            >−</button>
            <input
              type="number"
              value={ch}
              onChange={(e) => setCh(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded-lg border border-[var(--color-line)] bg-transparent px-2 py-1 text-center text-sm outline-none focus:border-[var(--color-violet)]"
              min={0}
              max={totalChapters || undefined}
            />
            <button
              onClick={() => setCh(Math.min(totalChapters || Infinity, ch + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-line)] hover:border-[var(--color-violet)] text-sm"
            >+</button>
            {totalChapters && <span className="text-xs text-[var(--color-mute)]">/ {totalChapters}</span>}
          </div>
        </div>
        <div>
          <label className="text-xs text-[var(--color-mute)] block mb-1">Volumes</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVol(Math.max(0, vol - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-line)] hover:border-[var(--color-violet)] text-sm"
            >−</button>
            <input
              type="number"
              value={vol}
              onChange={(e) => setVol(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded-lg border border-[var(--color-line)] bg-transparent px-2 py-1 text-center text-sm outline-none focus:border-[var(--color-violet)]"
              min={0}
              max={totalVolumes || undefined}
            />
            <button
              onClick={() => setVol(Math.min(totalVolumes || Infinity, vol + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-line)] hover:border-[var(--color-violet)] text-sm"
            >+</button>
            {totalVolumes && <span className="text-xs text-[var(--color-mute)]">/ {totalVolumes}</span>}
          </div>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full rounded-lg bg-[var(--color-violet)] py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Saving..." : "Update Progress"}
      </button>
    </div>
  );
}
