"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

function NeonOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute top-[15%] left-[5%] w-[350px] h-[350px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,255,224,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute top-[40%] right-[10%] w-[280px] h-[280px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,0,230,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute bottom-[15%] left-[35%] w-[250px] h-[250px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(112,0,255,0.05) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Particles() {
  const [pts] = useState(() => {
    const colors = ["#00ffe0", "#ff00e6", "#7000ff"];
    const particles: { x: number; y: number; s: number; d: number; o: number; c: string; ty: number; delay: number }[] = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * 100, y: Math.random() * 100,
        s: Math.random() * 2.5 + 0.5, d: Math.random() * 6 + 4, o: Math.random() * 0.4 + 0.1,
        c: colors[i % 3], ty: -(Math.random() * 40 + 8), delay: Math.random() * 5,
      });
    }
    return particles;
  });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map((p, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s,
            background: p.c, opacity: p.o,
            boxShadow: i % 2 === 0 ? "0 0 6px rgba(0,255,224,0.3)" : "0 0 6px rgba(255,0,230,0.3)",
            willChange: "transform, opacity",
          }}
          animate={{ y: [0, p.ty, 0], opacity: [p.o * 0.2, p.o, p.o * 0.2] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}

function NeonBorder({ children, highlighted = false }: { children: React.ReactNode; highlighted?: boolean }) {
  return (
    <div className={`relative rounded-[24px] ${highlighted ? "shadow-[0_0_60px_-20px_rgba(0,255,224,0.15),0_0_80px_-30px_rgba(255,0,230,0.1)]" : ""}`}>
      <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
        />
        <div className="absolute inset-[1.5px] rounded-[22.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
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

  const [imageMode, setImageMode] = useState<"url" | "upload">(initialData?.imageUrl ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const animeRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const animeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const charTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleFileUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB allowed.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Invalid file type. Use JPG, PNG, WebP, or GIF.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      const url = await new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200 && data.url) resolve(data.url);
            else reject(new Error(data.error || "Upload failed"));
          } catch {
            reject(new Error("Upload failed"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("POST", "/api/cosplay/upload");
        xhr.send(formData);
      });

      setForm((prev) => ({ ...prev, imageUrl: url }));
      setUploadProgress(100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.character.trim() || !form.animeTitle.trim() || !form.imageUrl.trim()) {
      setError("Title, Character, Anime Title, and Image are required.");
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />
      <NeonOrbs />
      <Particles />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)] mb-2">
            {isEdit ? "Editing" : "New Cosplay"}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
            {isEdit ? "Edit Cosplay" : "Upload Cosplay"}
          </h1>
          <p className="mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            {isEdit ? "Update your cosplay details" : "Share your amazing cosplay with the community"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <NeonBorder>
                <div className="px-8 py-12 text-center rounded-[24px]">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-bold text-emerald-400 mb-2">Uploaded Successfully!</h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Redirecting to your cosplay...</p>
                </div>
              </NeonBorder>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NeonBorder>
                <form onSubmit={handleSubmit} className="rounded-[24px] p-8 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Title *</label>
                    <div className="rgb-border">
                      <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <input
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          placeholder="My awesome cosplay"
                          className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Anime + Character row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Anime Title with RGB border */}
                    <div ref={animeRef} className="relative">
                      <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Anime Title *</label>
                      <div className="rgb-border">
                        <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                          <input
                            name="animeTitle"
                            value={form.animeTitle}
                            onChange={handleChange}
                            onFocus={() => animeResults.length > 0 && setShowAnimeDropdown(true)}
                            placeholder="e.g. Naruto"
                            className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none"
                          />
                        </div>
                      </div>
                      {showAnimeDropdown && animeResults.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl">
                          {animeResults.map((a) => (
                            <button key={a.mal_id} type="button" onClick={() => selectAnime(a)}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors">
                              <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-void)]">
                                <Image src={a.images.jpg.large_image_url} alt={a.title} fill className="object-cover" sizes="36px" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{a.title_english || a.title}</p>
                                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                  {a.type && `${a.type}`}{a.year && ` (${a.year})`}
                                  {a.title_english && a.title_english !== a.title && <span className="ml-1 opacity-60">— {a.title}</span>}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Character with RGB border */}
                    <div ref={charRef} className="relative">
                      <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Character Name *</label>
                      <div className="rgb-border">
                        <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <input
                            name="character"
                            value={form.character}
                            onChange={handleChange}
                            onFocus={() => charResults.length > 0 && setShowCharDropdown(true)}
                            placeholder="e.g. Naruto Uzumaki"
                            className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none"
                          />
                        </div>
                      </div>
                      {showCharDropdown && charResults.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl">
                          {charResults.map((c) => (
                            <button key={c.mal_id} type="button" onClick={() => selectCharacter(c)}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors">
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-void)]">
                                <Image src={c.images.jpg.image_url} alt={c.name} fill className="object-cover" sizes="40px" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{c.name}</p>
                                {c.anime.length > 0 && (
                                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                    {c.anime[0].anime.title}{c.anime.length > 1 && ` +${c.anime.length - 1} more`}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Section */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Image *</label>

                    {/* Mode Toggle */}
                    <div className="flex rounded-[12px] border border-[rgba(0,255,224,0.1)] p-0.5 mb-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <button type="button" onClick={() => setImageMode("upload")}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-xs font-medium transition-all duration-200 ${
                          imageMode === "upload"
                            ? "bg-gradient-to-r from-[#00ffe0]/10 to-[#ff00e6]/10 text-[#00ffe0] shadow-[0_0_15px_-5px_rgba(0,255,224,0.3)]"
                            : "text-white/30 hover:text-white/50"
                        }`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload File
                      </button>
                      <button type="button" onClick={() => setImageMode("url")}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-xs font-medium transition-all duration-200 ${
                          imageMode === "url"
                            ? "bg-gradient-to-r from-[#ff00e6]/10 to-[#7000ff]/10 text-[#ff00e6] shadow-[0_0_15px_-5px_rgba(255,0,230,0.3)]"
                            : "text-white/30 hover:text-white/50"
                        }`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Paste URL
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {imageMode === "upload" ? (
                        <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} />

                          {!form.imageUrl ? (
                            <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                              className="relative flex flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed p-8 cursor-pointer transition-all duration-300 group"
                              style={{ borderColor: "rgba(0,255,224,0.15)", background: "rgba(0,0,0,0.2)" }}>
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00ffe0]/10 to-[#7000ff]/10 border flex items-center justify-center transition-all"
                                style={{ borderColor: "rgba(0,255,224,0.15)" }}>
                                {uploading ? (
                                  <div className="w-6 h-6 border-2 border-[#00ffe0]/30 border-t-[#00ffe0] rounded-full animate-spin" />
                                ) : (
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#00ffe0]">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                  </svg>
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-white">
                                  {uploading ? `Uploading... ${uploadProgress}%` : "Drop your image here"}
                                </p>
                                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                                  {uploading ? "Please wait" : "or click to browse (JPG, PNG, WebP, GIF — max 5MB)"}
                                </p>
                              </div>
                              {uploading && (
                                <div className="w-full max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }}
                                    className="h-full rounded-full bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6]" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="relative rounded-[16px] overflow-hidden" style={{ border: "1px solid rgba(0,255,224,0.15)" }}>
                              <div className="relative aspect-video max-h-56">
                                <img src={form.imageUrl} alt="Preview"
                                  className="w-full h-full object-contain" style={{ background: "rgba(0,0,0,0.4)" }}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-between">
                                <span className="text-[10px] font-mono truncate max-w-[70%]" style={{ color: "rgba(255,255,255,0.4)" }}>{form.imageUrl}</span>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-white/80 hover:bg-white/10 transition-colors"
                                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="23 4 23 10 17 10" />
                                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                    </svg>
                                    Replace
                                  </button>
                                  <button type="button" onClick={() => { setForm((prev) => ({ ...prev, imageUrl: "" })); setUploadProgress(0); }}
                                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div key="url" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                          <div className="rgb-border">
                            <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                              <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
                                placeholder="https://example.com/my-cosplay.jpg"
                                className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none" />
                            </div>
                          </div>
                          {form.imageUrl && (
                            <div className="relative rounded-[16px] overflow-hidden" style={{ border: "1px solid rgba(0,255,224,0.1)" }}>
                              <div className="relative aspect-video max-h-48">
                                <img src={form.imageUrl} alt="Preview"
                                  className="w-full h-full object-contain" style={{ background: "rgba(0,0,0,0.4)" }}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Description</label>
                    <div className="rgb-border">
                      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
                        <textarea name="description" value={form.description} onChange={handleChange}
                          placeholder="Tell us about your cosplay..." rows={3}
                          className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none resize-none" />
                      </div>
                    </div>
                  </div>

                  {/* Tags with RGB border */}
                  <div ref={tagRef} className="relative">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Tags</label>
                    <div className="rgb-border">
                      <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        <input name="tags" value={form.tags} onChange={handleChange}
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
                          className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none" />
                      </div>
                    </div>
                    {showTagDropdown && tagSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl">
                        {tagSuggestions.map((tag) => (
                          <button key={tag} type="button" onClick={() => selectTag(tag)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
                            <span className="glass-tag text-[10px]">{tag}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-[12px] p-3 text-sm text-red-400"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      {error}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={submitting || uploading}
                    className="block w-full rounded-[16px] bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] px-5 py-3.5 text-center text-sm font-bold text-white shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5),0_0_80px_-20px_rgba(255,0,230,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wide">
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {isEdit ? "Saving..." : "Uploading..."}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {isEdit ? "Save Changes" : "Upload Cosplay"}
                      </span>
                    )}
                  </button>
                </form>
              </NeonBorder>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
