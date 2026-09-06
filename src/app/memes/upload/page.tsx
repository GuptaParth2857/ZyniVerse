"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function MemeUploadPage() {
  const router = useRouter();
  const { status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    mediaTitle: "",
    tags: "",
  });
  const [imageMode, setImageMode] = useState<"url" | "upload">("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleFileUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB allowed.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

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
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileUpload(file);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.imageUrl.trim()) {
      setError("Title and image are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          imageUrl: form.imageUrl,
          mediaTitle: form.mediaTitle.trim() || undefined,
          tags: form.tags.trim() || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload meme");

      router.push("/memes");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to upload meme");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Sign in Required</h1>
          <p className="text-[var(--color-mute)] mb-6">You need to be logged in to upload a meme.</p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black"
          >
            Sign In
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <ErrorBoundary label="Upload Meme">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <div className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)] mb-2">Upload</p>
            <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
              Share a Meme
            </h1>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Make the community laugh!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Image *</label>

              {form.imageUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-white/10">
                  <div className="relative aspect-video">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-contain bg-[#0a0a14]" />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setForm((p) => ({ ...p, imageUrl: "" })); setImageMode("url"); }}
                    className="absolute top-2 right-2 rounded-lg bg-black/60 px-3 py-1 text-xs text-white/80 hover:bg-red-500/60 transition-colors backdrop-blur"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === "upload" ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]" : "bg-white/5 text-white/40"}`}
                    >
                      📤 Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === "url" ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]" : "bg-white/5 text-white/40"}`}
                    >
                      🔗 URL
                    </button>
                  </div>

                  {imageMode === "upload" ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all ${
                        dragging
                          ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/5"
                          : "border-white/10 hover:border-[var(--color-cyan)]/40"
                      }`}
                    >
                      {uploading ? (
                        <div className="text-center w-full">
                          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-2">
                            <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-xs text-white/40">{uploadProgress}%</p>
                        </div>
                      ) : (
                        <>
                          <span className="text-4xl mb-2">🤣</span>
                          <p className="text-sm text-white/40">Drag & drop your meme here, or click to browse</p>
                          <p className="text-[10px] text-white/20 mt-1">PNG, JPG, GIF, WebP up to 10MB</p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3">
                      <input
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/meme.jpg"
                        className="w-full bg-transparent text-sm text-white placeholder-white/20 outline-none"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Give your meme a funny title"
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Media Title (Optional)</label>
              <input
                name="mediaTitle"
                value={form.mediaTitle}
                onChange={handleChange}
                placeholder="e.g. Naruto, Attack on Titan"
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Tags (comma separated)</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="e.g. funny, cringe, shonen"
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !form.title.trim() || !form.imageUrl.trim()}
              className="w-full rounded-xl py-3.5 text-sm font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)]"
            >
              {submitting ? "Uploading..." : "Share Meme"}
            </button>
          </form>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
