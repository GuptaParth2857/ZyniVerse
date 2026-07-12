"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AnimeResult {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: { jpg: { large_image_url: string } };
  type: string | null;
  year: number | null;
}

interface CharacterResult {
  mal_id: number;
  name: string;
  images: { jpg: { image_url: string } };
  anime: { anime: { mal_id: number; title: string } }[];
}

export default function CosplayUpload({ initialData, onUpdate }: {
  initialData?: {
    id: string;
    title: string;
    character: string;
    animeTitle: string;
    animeId: number | null;
    imageUrl: string;
    description: string | null;
    tags: string;
  };
  onUpdate?: () => void;
} = {}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    character: initialData?.character || "",
    animeTitle: initialData?.animeTitle || "",
    imageUrl: initialData?.imageUrl || "",
    description: initialData?.description || "",
    tags: initialData?.tags || "",
  });
  const [animeId, setAnimeId] = useState<number | null>(initialData?.animeId ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [animeResults, setAnimeResults] = useState<AnimeResult[]>([]);
  const [charResults, setCharResults] = useState<CharacterResult[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  const [showAnimeDropdown, setShowAnimeDropdown] = useState(false);
  const [showCharDropdown, setShowCharDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const animeRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const animeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const charTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    fetch("/api/cosplay/tags")
      .then((r) => r.json())
      .then((d) => setAllTags(d.tags || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (animeRef.current && !animeRef.current.contains(e.target as Node)) setShowAnimeDropdown(false);
      if (charRef.current && !charRef.current.contains(e.target as Node)) setShowCharDropdown(false);
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) setShowTagDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAnime = useCallback((q: string) => {
    clearTimeout(animeTimer.current);
    if (q.trim().length < 2) { setAnimeResults([]); return; }
    animeTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cosplay/search-anime?q=${encodeURIComponent(q)}`);
        const d = await res.json();
        setAnimeResults(d.results || []);
        setShowAnimeDropdown(true);
      } catch { setAnimeResults([]); }
    }, 300);
  }, []);

  const fetchCharacter = useCallback((q: string) => {
    clearTimeout(charTimer.current);
    if (q.trim().length < 2) { setCharResults([]); return; }
    charTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cosplay/search-character?q=${encodeURIComponent(q)}`);
        const d = await res.json();
        setCharResults(d.results || []);
        setShowCharDropdown(true);
      } catch { setCharResults([]); }
    }, 300);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "animeTitle") {
      setAnimeId(null);
      fetchAnime(value);
    }
    if (name === "character") fetchCharacter(value);
    if (name === "tags") {
      const parts = value.split(",").map((s) => s.trim());
      const last = parts[parts.length - 1];
      if (last.length >= 1) {
        const filtered = allTags.filter((t) => t.toLowerCase().startsWith(last.toLowerCase()) && !parts.includes(t));
        setTagSuggestions(filtered.slice(0, 5));
        setShowTagDropdown(filtered.length > 0);
      } else {
        setTagSuggestions([]);
        setShowTagDropdown(false);
      }
    }
  }

  function selectAnime(a: AnimeResult) {
    setForm((prev) => ({ ...prev, animeTitle: a.title_english || a.title }));
    setAnimeId(a.mal_id);
    setShowAnimeDropdown(false);
    setAnimeResults([]);
  }

  function selectCharacter(c: CharacterResult) {
    setForm((prev) => ({ ...prev, character: c.name }));
    setShowCharDropdown(false);
    setCharResults([]);
  }

  function selectTag(tag: string) {
    const parts = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
    parts[parts.length - 1] = tag;
    setForm((prev) => ({ ...prev, tags: parts.join(", ") + ", " }));
    setTagSuggestions([]);
    setShowTagDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.character.trim() || !form.animeTitle.trim() || !form.imageUrl.trim()) {
      setError("Title, Character, Anime Title, and Image URL are required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/cosplay/${initialData.id}` : "/api/cosplay";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, animeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      if (isEdit) {
        onUpdate?.();
      } else {
        setSuccess(true);
        setTimeout(() => router.push(`/cosplay/${data.cosplay.id}`), 1500);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-center mb-2">
        {isEdit ? "Edit Cosplay" : "Upload Cosplay"}
      </h1>
      <p className="text-center text-sm text-[var(--color-mute)] mb-8">
        {isEdit ? "Update your cosplay details" : "Share your cosplay with the community"}
      </p>

      {success ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
          <p className="text-green-400 font-semibold">Cosplay uploaded successfully! Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="My cosplay title"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div ref={animeRef} className="relative">
              <label className="block text-xs font-semibold mb-1">Anime Title *</label>
              <input
                name="animeTitle"
                value={form.animeTitle}
                onChange={handleChange}
                onFocus={() => animeResults.length > 0 && setShowAnimeDropdown(true)}
                placeholder="e.g. Naruto"
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
              />
              {showAnimeDropdown && animeResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl">
                  {animeResults.map((a) => (
                    <button
                      key={a.mal_id}
                      type="button"
                      onClick={() => selectAnime(a)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-void)] transition-colors"
                    >
                      <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-[var(--color-void)]">
                        <Image
                          src={a.images.jpg.large_image_url}
                          alt={a.title}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.title_english || a.title}</p>
                        <p className="text-[10px] text-[var(--color-mute)]">
                          {a.type && `${a.type}`}
                          {a.year && ` (${a.year})`}
                          {a.title_english && a.title_english !== a.title && (
                            <span className="ml-1 opacity-60">— {a.title}</span>
                          )}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={charRef} className="relative">
              <label className="block text-xs font-semibold mb-1">Character Name *</label>
              <input
                name="character"
                value={form.character}
                onChange={handleChange}
                onFocus={() => charResults.length > 0 && setShowCharDropdown(true)}
                placeholder="e.g. Naruto Uzumaki"
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
              />
              {showCharDropdown && charResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl">
                  {charResults.map((c) => (
                    <button
                      key={c.mal_id}
                      type="button"
                      onClick={() => selectCharacter(c)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-void)] transition-colors"
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-void)]">
                        <Image
                          src={c.images.jpg.image_url}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        {c.anime.length > 0 && (
                          <p className="text-[10px] text-[var(--color-mute)] truncate">
                            {c.anime[0].anime.title}
                            {c.anime.length > 1 && ` +${c.anime.length - 1} more`}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Image URL *</label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/my-cosplay.jpg"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
            />
            {form.imageUrl && (
              <div className="mt-2 relative aspect-video max-h-48 overflow-hidden rounded-lg border border-[var(--color-line)]">
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-contain bg-[var(--color-void)]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell us about your cosplay..."
              rows={3}
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] resize-none"
            />
          </div>

          <div ref={tagRef} className="relative">
            <label className="block text-xs font-semibold mb-1">Tags (comma separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              onFocus={() => {
                const parts = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
                const last = parts[parts.length - 1] || "";
                if (last.length >= 1) {
                  const filtered = allTags.filter((t) => t.toLowerCase().startsWith(last.toLowerCase()) && !parts.includes(t));
                  setTagSuggestions(filtered.slice(0, 5));
                  setShowTagDropdown(filtered.length > 0);
                }
              }}
              placeholder="handmade, convention, 2024"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
            />
            {showTagDropdown && tagSuggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => selectTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-void)] transition-colors flex items-center gap-2"
                  >
                    <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[10px] text-[var(--color-mute)]">
                      {tag}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-magenta)]/20 border border-[var(--color-magenta)]/30 py-3 text-sm font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30 transition-colors disabled:opacity-50"
          >
            {submitting ? (isEdit ? "Saving..." : "Uploading...") : (isEdit ? "Save Changes" : "Upload Cosplay")}
          </button>
        </form>
      )}
    </div>
  );
}
