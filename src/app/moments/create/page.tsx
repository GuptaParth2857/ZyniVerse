"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getSuggestions, bestTitle } from "@/lib/anilist";
import type { Suggestion } from "@/lib/anilist";
import MomentCard from "@/components/MomentCard";
import { generateMomentPng } from "@/lib/moment-canvas";
import { PageTransition } from "@/components/PageTransition";
import { logError } from "@/lib/logger";

const STYLES = ["classic", "neon", "minimal", "sakura", "dark"] as const;
type StyleKey = typeof STYLES[number];

const STYLE_LABELS: Record<StyleKey, string> = {
  classic: "Classic",
  neon: "Neon",
  minimal: "Minimal",
  sakura: "Sakura",
  dark: "Dark",
};

const PROXY = "/api/proxy-image?url=";

function UserAvatar() {
  const { data: session } = useSession();
  const [failed, setFailed] = useState(false);
  const name = session?.user?.name || "U";
  const initial = name.charAt(0).toUpperCase();

  if (session?.user?.image && !failed) {
    return (
      <Image
        src={session.user.image}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover border border-white/20"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] flex items-center justify-center text-black text-xs font-bold shrink-0">
      {initial}
    </div>
  );
}

export default function CreateMomentPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [quote, setQuote] = useState("");
  const [character, setCharacter] = useState("");
  const [episode, setEpisode] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [style, setStyle] = useState<StyleKey>("classic");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setSuggestions([]); return; }
    try {
      const res = await getSuggestions(q.trim());
      setSuggestions(res);
    } catch { setSuggestions([]); }
  };

  const handleDownload = useCallback(async () => {
    if (!selected || !quote.trim() || !character.trim()) return;
    setCapturing(true);
    try {
      const blob = await generateMomentPng({
        quote: quote.trim(),
        character: character.trim(),
        animeTitle: bestTitle({ romaji: selected.titleRomaji }),
        animeCover: selected.poster,
        episode: episode || null,
        timestamp: timestamp || null,
        style,
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `zyniverse-moment-${selected.id}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) { logError(e); }
    finally { setCapturing(false); }
  }, [selected, quote, character, episode, timestamp, style]);

  const handleSave = async () => {
    if (!selected || !quote.trim() || !character.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user",
          animeId: selected.id,
          animeTitle: bestTitle({ romaji: selected.titleRomaji }),
          animeCover: selected.poster,
          quote: quote.trim(),
          character: character.trim(),
          episode: episode || null,
          timestamp: timestamp || null,
          style,
        }),
      });
      setSaved(true);
    } catch (e) { logError(e); }
    finally { setSaving(false); }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Link href="/moments" className="text-sm text-[var(--color-mute)] hover:text-white transition-colors mb-6 inline-block">← Back to Moments</Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <UserAvatar />
          <h1 className="font-display text-3xl font-bold">
            <span className="bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] bg-clip-text text-transparent">
              Create Moment
            </span>
          </h1>
        </div>

        {!selected ? (
          /* Step 1: Pick anime */
          <div className="max-w-lg mx-auto">
            <div className="neon-rgb-border rounded-2xl p-6 bg-[var(--color-panel)]">
              <h2 className="font-display text-lg font-bold text-white mb-4">Pick an Anime</h2>
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search anime..."
                  className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-3 text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none"
                  autoFocus
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl neon-rgb-border bg-[var(--color-panel)] shadow-2xl z-20">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSelected(s); setSuggestions([]); setQuery(""); }}
                        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        {s.poster && (
                          <div className="relative h-14 w-10 rounded overflow-hidden border border-[var(--color-line)] shrink-0">
                            <Image src={`${PROXY}${encodeURIComponent(s.poster)}`} alt="" fill className="object-cover" sizes="40px" unoptimized />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{s.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                            {s.format && <span>{s.format}</span>}
                            {s.year && <span>{s.year}</span>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Create */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <div className="flex-1 space-y-5">
              <div className="neon-rgb-border rounded-2xl p-6 bg-[var(--color-panel)]">
                <div className="flex items-center gap-3 mb-5">
                  {selected.poster && (
                    <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-[var(--color-line)] shrink-0">
                      <Image src={`${PROXY}${encodeURIComponent(selected.poster)}`} alt="" fill className="object-cover" sizes="48px" unoptimized />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">{selected.title}</p>
                    <button onClick={() => setSelected(null)} className="text-xs text-[var(--color-magenta)] hover:underline">Change anime</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="neon-rgb-border rounded-xl">
                    <div className="m-[1px] rounded-[11px] bg-[var(--color-void)] p-4">
                      <label className="block text-xs font-medium text-[var(--color-mute)] mb-1.5 uppercase tracking-wider">Quote *</label>
                      <textarea
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        rows={4}
                        placeholder="Enter the quote..."
                        className="w-full bg-transparent text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none resize-none border-0 p-0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="neon-rgb-border rounded-xl">
                      <div className="m-[1px] rounded-[11px] bg-[var(--color-void)] p-4">
                        <label className="block text-xs font-medium text-[var(--color-mute)] mb-1 uppercase tracking-wider">Character *</label>
                        <input value={character} onChange={(e) => setCharacter(e.target.value)} placeholder="Character name" className="w-full bg-transparent text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none border-0 p-0" />
                      </div>
                    </div>
                    <div className="neon-rgb-border rounded-xl">
                      <div className="m-[1px] rounded-[11px] bg-[var(--color-void)] p-4">
                        <label className="block text-xs font-medium text-[var(--color-mute)] mb-1 uppercase tracking-wider">Episode</label>
                        <input value={episode} onChange={(e) => setEpisode(e.target.value)} placeholder="e.g. 12" className="w-full bg-transparent text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none border-0 p-0" />
                      </div>
                    </div>
                  </div>
                  <div className="neon-rgb-border rounded-xl">
                    <div className="m-[1px] rounded-[11px] bg-[var(--color-void)] p-4">
                      <label className="block text-xs font-medium text-[var(--color-mute)] mb-1 uppercase tracking-wider">Timestamp <span className="text-[10px] font-normal normal-case opacity-50">(optional)</span></label>
                      <input value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="e.g. 12:30" className="w-full bg-transparent text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none border-0 p-0" />
                    </div>
                  </div>
                </div>

                {/* Style selector */}
                <div className="mt-5 pt-5 border-t border-white/5">
                  <label className="block text-xs font-medium text-[var(--color-mute)] mb-3 uppercase tracking-wider">Card Style</label>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        className={`neon-rgb-border rounded-xl px-4 py-2 text-xs font-semibold transition-all capitalize ${
                          style === s ? "text-white" : "text-[var(--color-mute)]"
                        }`}
                      >
                        <span className="m-[1px] rounded-[11px] block px-1 py-0.5">{STYLE_LABELS[s]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || saved || !quote.trim() || !character.trim()}
                  className="rounded-full bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:brightness-110 transition-all disabled:opacity-40"
                >
                  {saved ? "✓ Saved!" : saving ? "Saving..." : "Save to Gallery"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={capturing || !quote.trim() || !character.trim()}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-40"
                >
                  {capturing ? "Generating..." : "Download PNG"}
                </button>
                <button
                  onClick={() => {
                    const text = `"${quote}" — ${character} (${selected?.title || ""})`;
                    const url = `https://zyverse.in/moments`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "width=600,height=400");
                  }}
                  disabled={!quote.trim() || !character.trim()}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-40"
                >
                  Share on Twitter/X
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:w-[500px] shrink-0">
              <div className="sticky top-24">
                <p className="text-xs text-[var(--color-mute)] mb-3 uppercase tracking-wider font-medium">Live Preview</p>
                <div className="rounded-2xl border border-[var(--color-line)] overflow-hidden shadow-2xl">
                  <div>
                    <MomentCard
                      quote={quote || "Your quote will appear here"}
                      character={character || "Character Name"}
                      animeTitle={bestTitle({ romaji: selected.titleRomaji })}
                      animeCover={selected.poster}
                      episode={episode || null}
                      timestamp={timestamp || null}
                      animeId={selected.id}
                      style={style}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
