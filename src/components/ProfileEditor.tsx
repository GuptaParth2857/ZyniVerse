"use client";

import { useState, useRef, useCallback } from "react";

const THEME_COLORS = ["emerald", "blue", "purple", "pink", "amber", "teal", "rose", "indigo"];

interface User {
  id: string;
  username: string;
  bio: string | null;
  banner: string | null;
  themeColor: string | null;
  signature: string | null;
  avatar: string | null;
}

function ImageUpload({
  label,
  currentUrl,
  folder,
  onUploaded,
  aspect = "landscape",
  previewClass = "",
}: {
  label: string;
  currentUrl: string | null;
  folder: string;
  onUploaded: (url: string) => void;
  aspect?: "landscape" | "square";
  previewClass?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onUploaded(data.url);
      setPreview(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [folder, onUploaded]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Not an image"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Max 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    upload(file);
  };

  const displayUrl = preview || currentUrl;

  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-all ${
          dragOver ? "border-emerald-400 bg-emerald-500/10" : "border-white/10 hover:border-white/20"
        } ${aspect === "square" ? "aspect-square" : "aspect-[3/1]"} overflow-hidden group`}
      >
        {displayUrl ? (
          <img src={displayUrl} alt={label} className={`w-full h-full object-cover ${previewClass}`} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-xs">{uploading ? "Uploading..." : "Click or drag image"}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-xs text-white bg-black/60 px-3 py-1 rounded-full">Change</span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export default function ProfileEditor({ user: initial }: { user: User }) {
  const [user, setUser] = useState(initial);
  const [saving, setSaving] = useState(false);

  const save = async (field: string, value: string) => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value || null }),
      });
      setUser((prev) => ({ ...prev, [field]: value }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <ImageUpload
        label="Banner"
        currentUrl={user.banner}
        folder="banners"
        aspect="landscape"
        onUploaded={(url) => save("banner", url)}
      />

      <ImageUpload
        label="Avatar"
        currentUrl={user.avatar}
        folder="avatars"
        aspect="square"
        previewClass="rounded-full"
        onUploaded={(url) => save("avatar", url)}
      />

      <div>
        <label className="block text-sm text-white/60 mb-2">Bio</label>
        <textarea defaultValue={user.bio || ""} onBlur={(e) => save("bio", e.target.value)} rows={3}
          placeholder="Tell us about yourself..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-emerald-500/50 resize-none transition-colors" />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Theme Color</label>
        <div className="flex gap-3">
          {THEME_COLORS.map((color) => (
            <button key={color} onClick={() => save("themeColor", color)}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                user.themeColor === color ? "border-white scale-110 ring-2 ring-white/20" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: `var(--color-${color})` }} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Forum Signature</label>
        <textarea defaultValue={user.signature || ""} onBlur={(e) => save("signature", e.target.value)} rows={2}
          placeholder="Your forum signature (displayed below forum posts)"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-emerald-500/50 resize-none transition-colors" />
      </div>

      {saving && (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
