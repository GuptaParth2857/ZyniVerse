"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  currentUrl?: string | null;
  partyId?: string;
  onUploaded: (url: string) => void;
  label?: string;
  aspect?: string;
  className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageUploader({
  currentUrl, partyId, onUploaded, label = "Cover Image", aspect = "aspect-video", className = "",
}: ImageUploaderProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview || currentUrl;

  const uploadFile = useCallback(async (file: File) => {
    setError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid type. Use JPG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File too large. Max 5MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (partyId) formData.append("partyId", partyId);

      const res = await fetch("/api/upload/watch-party", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      URL.revokeObjectURL(localPreview);
      setPreview(null);
      onUploaded(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [partyId, onUploaded]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleUrlSubmit() {
    if (!urlInput.trim()) return;
    if (!urlInput.match(/^https?:\/\//)) {
      setError("Enter a valid URL starting with http:// or https://");
      return;
    }
    setError("");
    onUploaded(urlInput.trim());
    setUrlInput("");
  }

  function handleRemove() {
    onUploaded("");
    setPreview(null);
    setUrlInput("");
  }

  return (
    <div className={className}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 block">{label}</label>

      <div className="flex gap-1 mb-3">
        <button onClick={() => setMode("upload")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            mode === "upload"
              ? "bg-[rgba(0,255,224,0.1)] text-[#00ffe0] border border-[rgba(0,255,224,0.2)]"
              : "text-white/30 hover:text-white/50 border border-transparent"
          }`}>
          Upload
        </button>
        <button onClick={() => setMode("url")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            mode === "url"
              ? "bg-[rgba(0,255,224,0.1)] text-[#00ffe0] border border-[rgba(0,255,224,0.2)]"
              : "text-white/30 hover:text-white/50 border border-transparent"
          }`}>
          Paste URL
        </button>
      </div>

      {displayUrl && (
        <div className={`relative ${aspect} rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] mb-3 group`}>
          <Image src={displayUrl} alt="" fill className="object-cover" sizes="400px" />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ffe0] border-t-transparent" />
            </div>
          )}
          <button onClick={handleRemove}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {mode === "upload" && !displayUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`${aspect} rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${
            dragOver
              ? "border-[#00ffe0] bg-[rgba(0,255,224,0.05)]"
              : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,255,224,0.2)] hover:bg-[rgba(0,255,224,0.02)]"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,255,224,0.05)] border border-[rgba(0,255,224,0.1)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,224,0.4)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-white/40">
              {dragOver ? "Drop image here" : "Click or drag to upload"}
            </p>
            <p className="text-[10px] text-white/20 mt-1">JPG, PNG, WebP, GIF (max 5MB)</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      )}

      {mode === "url" && !displayUrl && (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] px-3 py-2.5 text-xs text-white outline-none focus:border-[rgba(0,255,224,0.3)] transition-colors placeholder:text-white/20"
          />
          <button onClick={handleUrlSubmit}
            className="rounded-[10px] bg-[rgba(0,255,224,0.1)] border border-[rgba(0,255,224,0.2)] px-4 py-2.5 text-xs font-bold text-[#00ffe0] hover:bg-[rgba(0,255,224,0.2)] transition-all">
            Set
          </button>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-2 text-[10px] text-red-400">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
