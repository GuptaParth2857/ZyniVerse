"use client";

import { useState, useRef, useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const ART_TYPES = [
  { value: "digital", label: "Digital Art", icon: "🎨" },
  { value: "traditional", label: "Traditional", icon: "🖌️" },
  { value: "sketch", label: "Sketch", icon: "✏️" },
  { value: "manga", label: "Manga Style", icon: "📖" },
  { value: "pixel", label: "Pixel Art", icon: "👾" },
];

const DRAFT_KEY = "zyniverse_fanart_draft";

/**
 * Downscale + re-encode a picked image in the browser (max 1600px, WebP) so we
 * don't push multi-MB originals over the network — the server re-encodes again.
 * GIFs (possible animation) and anything we can't decode are returned as-is.
 */
async function downscaleImage(file: File): Promise<File> {
  try {
    if (file.type === "image/gif" || !file.type.startsWith("image/")) return file;
    if (typeof createImageBitmap !== "function") return file;
    const bitmap = await createImageBitmap(file);
    const MAX = 1600;
    const { width, height } = bitmap;
    if (width <= MAX && height <= MAX && file.size <= 900 * 1024) {
      bitmap.close?.();
      return file;
    }
    const scale = Math.min(1, MAX / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", 0.82)
    );
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") || "fanart";
    return new File([blob], `${name}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Preview that shows a placeholder instead of a broken image. */
function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-video max-h-64">
      {failed ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Image couldn&apos;t be loaded</p>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="640px"
          className="object-contain"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
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
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
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
  if (!mounted) return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
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

export default function FanArtUpload({ initialData, onUpdate }: {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    animeTitle: string | null;
    character: string | null;
    imageUrl: string;
    artType: string;
    tags: string;
  };
  onUpdate?: () => void;
} = {}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    animeTitle: initialData?.animeTitle || "",
    character: initialData?.character || "",
    artType: initialData?.artType || "digital",
    tags: initialData?.tags || "",
    imageUrl: initialData?.imageUrl || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [imageMode, setImageMode] = useState<"url" | "upload">(initialData?.imageUrl ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draftRestored, setDraftRestored] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const hasContentRef = useRef(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Restore an in-progress draft (create flow only).
  useEffect(() => {
    if (isEdit) return;
    let raw: string | null = null;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch { return; }
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (!d || typeof d !== "object") return;
      const hasContent = ["title", "description", "animeTitle", "character", "tags", "imageUrl"].some(
        (k) => typeof d[k] === "string" && d[k].trim().length > 0
      );
      if (!hasContent) return;
      /* eslint-disable react-hooks/set-state-in-effect */
      setForm({
        title: d.title || "",
        description: d.description || "",
        animeTitle: d.animeTitle || "",
        character: d.character || "",
        artType: d.artType || "digital",
        tags: d.tags || "",
        imageUrl: d.imageUrl || "",
      });
      setDraftRestored(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // Malformed draft — ignore it.
    }
  }, [isEdit]);

  // Persist the draft as the user types (debounced).
  useEffect(() => {
    if (isEdit || success) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* ignore */ }
    }, 600);
    return () => clearTimeout(t);
  }, [isEdit, success, form]);

  // Track whether there's unsaved content so we can warn before leaving.
  useEffect(() => {
    hasContentRef.current =
      !isEdit && !success && Object.values(form).some((v) => v.trim().length > 0);
  });

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (isEdit) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasContentRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isEdit]);

  // Tag autocomplete from existing art.
  useEffect(() => {
    fetch("/api/fanart/tags")
      .then((r) => r.json())
      .then((d) => setAllTags(d.tags || []))
      .catch(() => {});
  }, []);

  // Close the tag dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) setShowTagDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectTag(tag: string) {
    const parts = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
    parts[parts.length - 1] = tag;
    setForm((prev) => ({ ...prev, tags: parts.join(", ") + ", " }));
    setTagSuggestions([]);
    setShowTagDropdown(false);
  }

  function removeTag(tag: string) {
    const parts = form.tags.split(",").map((s) => s.trim()).filter(Boolean).filter((t) => t !== tag);
    setForm((prev) => ({ ...prev, tags: parts.join(", ") }));
  }

  function commitTag() {
    const parts = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    setForm((prev) => ({ ...prev, tags: parts.map((t) => t.trim()).join(", ") + ", " }));
    setTagSuggestions([]);
    setShowTagDropdown(false);
  }

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setForm({ title: "", description: "", animeTitle: "", character: "", artType: "digital", tags: "", imageUrl: "" });
    setDraftRestored(false);
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Invalid file type. Use JPG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB allowed.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Shrink in the browser first so we don't upload a multi-MB original.
      const optimized = await downscaleImage(file);
      const formData = new FormData();
      formData.append("file", optimized);

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200 && data.url) resolve(data.url);
            else reject(new Error(data.error || "Upload failed"));
          } catch { reject(new Error("Upload failed")); }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("POST", "/api/fanart/upload");
        xhr.send(formData);
      });

      setForm((prev) => ({ ...prev, imageUrl: url }));
      setUploadProgress(100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileUpload(file);
  }

  // Paste an image straight from the clipboard to upload it.
  useEffect(() => {
    if (isEdit) return;
    function onPaste(e: ClipboardEvent) {
      const file = e.clipboardData?.files?.[0];
      if (file && file.type.startsWith("image/")) {
        e.preventDefault();
        setImageMode("upload");
        handleFileUpload(file);
      }
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [isEdit, handleFileUpload]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.imageUrl.trim()) {
      setError("Title and Image are required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/fanart/${initialData.id}` : "/api/fanart";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      if (isEdit) {
        onUpdate?.();
      } else {
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        setSuccess(true);
        setTimeout(() => router.push(`/fanart/${data.fanArt.id}`), 1500);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  const tagChips = form.tags.split(",").map((s) => s.trim()).filter(Boolean);

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
            {isEdit ? "Editing" : "New Fan Art"}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
            {isEdit ? "Edit Fan Art" : "Share Your Art"}
          </h1>
          <p className="mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            {isEdit ? "Update your artwork details" : "Share your amazing fan art with the community"}
          </p>
        </motion.div>

        {draftRestored && !success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 px-4 py-3"
          >
            <p className="flex items-center gap-2 text-xs text-[var(--color-cyan)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Restored your unsaved draft.
            </p>
            <button
              type="button"
              onClick={clearDraft}
              className="text-[11px] font-semibold text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
            >
              Discard
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <NeonBorder>
                <div className="px-8 py-12 text-center rounded-[24px]">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-bold text-emerald-400 mb-2">Uploaded Successfully!</h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Redirecting to your art...</p>
                </div>
              </NeonBorder>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.2 }}>
              <NeonBorder>
                <form onSubmit={handleSubmit} className="neon-rgb-border rounded-[24px] p-8 space-y-5">
                  {/* Image Upload / URL */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Image *</label>
                    <div className="flex gap-2 mb-3">
                      <button type="button" onClick={() => setImageMode("upload")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === "upload" ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]" : "bg-white/5 text-white/40"}`}>
                        📤 Upload
                      </button>
                      <button type="button" onClick={() => setImageMode("url")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === "url" ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]" : "bg-white/5 text-white/40"}`}>
                        🔗 URL
                      </button>
                    </div>

                    {form.imageUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-white/10">
                        <PreviewImage key={form.imageUrl} src={form.imageUrl} alt="Preview" />
                        <button type="button" onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                          className="absolute top-2 right-2 rounded-lg bg-black/60 px-3 py-1 text-xs text-white/80 hover:bg-red-500/60 transition-colors backdrop-blur">
                          Remove
                        </button>
                      </div>
                    ) : imageMode === "upload" ? (
                      <div onDragOver={(e) => { e.preventDefault(); }} onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--color-cyan)]/40 p-8 cursor-pointer transition-all">
                        {uploading ? (
                          <div className="text-center w-full">
                            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-2">
                              <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <p className="text-xs text-white/40">{uploadProgress}%</p>
                          </div>
                        ) : (
                          <>
                            <span className="text-3xl mb-2">🎨</span>
                            <p className="text-sm text-white/40">Drop your art here or click to browse</p>
                            <p className="text-[10px] text-white/20 mt-1">PNG, JPG, GIF, WebP up to 10MB · or paste (Ctrl+V)</p>
                          </>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rgb-border">
                          <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
                              aria-label="Image URL"
                              placeholder="https://example.com/art.jpg"
                              className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-white/20 outline-none" />
                          </div>
                        </div>
                        {form.imageUrl.trim().length > 0 && (
                          <div className="relative rounded-xl overflow-hidden border border-[var(--color-cyan)]/15">
                            <PreviewImage key={form.imageUrl} src={form.imageUrl} alt="URL preview" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Title *</label>
                    <div className="rgb-border">
                      <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <input name="title" value={form.title} onChange={handleChange}
                          placeholder="Give your art a title"
                          className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-white/20 outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Art Type */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Art Type</label>
                    <div className="flex flex-wrap gap-2">
                      {ART_TYPES.map((t) => (
                        <button key={t.value} type="button" onClick={() => setForm((p) => ({ ...p, artType: t.value }))}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            form.artType === t.value
                              ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] border border-[var(--color-magenta)]/30"
                              : "bg-white/5 text-white/40 border border-white/[0.06] hover:border-white/[0.14]"
                          }`}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Anime + Character row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Anime (Optional)</label>
                      <div className="rgb-border">
                        <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                          <input name="animeTitle" value={form.animeTitle} onChange={handleChange}
                            placeholder="e.g. Naruto"
                            className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-white/20 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Character (Optional)</label>
                      <div className="rgb-border">
                        <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <input name="character" value={form.character} onChange={handleChange}
                            placeholder="e.g. Naruto Uzumaki"
                            className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-white/20 outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange}
                      placeholder="Tell us about your art..."
                      rows={3}
                      className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none" />
                  </div>

                  {/* Tags */}
                  <div ref={tagRef} className="relative">
                    <label htmlFor="fanart-tags" className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Tags</label>
                    <div className="rgb-border">
                      <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className="ml-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        <input id="fanart-tags" name="tags" value={form.tags} onChange={handleChange}
                          onFocus={() => {
                            const parts = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
                            const last = parts[parts.length - 1] || "";
                            if (last.length >= 1) {
                              const filtered = allTags.filter((t) => t.toLowerCase().startsWith(last.toLowerCase()) && !parts.includes(t));
                              setTagSuggestions(filtered.slice(0, 5));
                              setShowTagDropdown(filtered.length > 0);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Tab") {
                              if (showTagDropdown && tagSuggestions.length > 0) return;
                              e.preventDefault();
                              commitTag();
                            }
                          }}
                          placeholder="e.g. shonen, digital, fanart"
                          className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-white/20 outline-none" />
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
                    {tagChips.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tagChips.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove tag ${tag}`}
                            className="glass-tag transition-colors hover:text-red-400 hover:ring-red-500/30"
                          >
                            {tag}
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                      {error}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button type="submit"
                    disabled={!form.title.trim() || !form.imageUrl.trim() || submitting}
                    className="w-full relative overflow-hidden rounded-xl py-3.5 text-sm font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] group-hover:opacity-90 transition-opacity" />
                    <div className="absolute inset-0 neon-rgb-border rounded-xl" />
                    <span className="relative z-10">
                      {submitting ? "Saving..." : isEdit ? "Update Art" : "Share Art"}
                    </span>
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
