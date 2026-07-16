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
  provider?: string;
  hasPassword?: boolean;
}

interface ProfileEditorProps {
  user: User;
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

export default function ProfileEditor({ user: initial }: ProfileEditorProps) {
  const [user, setUser] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isCredentialsUser = initial.provider === "credentials";
  const canChangePassword = isCredentialsUser || initial.hasPassword;

  const save = async (field: string, value: string) => {
    if (field === "username") {
      setUsernameError(null);
      if (!value || value.trim().length < 3) {
        setUsernameError("Username must be at least 3 characters");
        return;
      }
      if (value.trim().length > 30) {
        setUsernameError("Username must be 30 characters or less");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
        setUsernameError("Username can only contain letters, numbers, and underscores");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (field === "username") {
          setUsernameError(data.error || "Failed to update username");
          return;
        }
        throw new Error(data.error || "Failed to update");
      }
      setUser((prev) => ({ ...prev, [field]: value }));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password." });
        return;
      }
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch {
      setPasswordMessage({ type: "error", text: "Failed to change password. Please try again." });
    } finally {
      setIsSavingPassword(false);
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
        <label className="block text-sm text-white/60 mb-2">Username</label>
        <input
          type="text"
          defaultValue={user.username}
          onBlur={(e) => save("username", e.target.value)}
          placeholder="Choose a username"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-colors"
        />
        {usernameError && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
            {usernameError}
          </p>
        )}
        <p className="text-xs text-white/30 mt-1">3-30 characters. Letters, numbers, and underscores only.</p>
      </div>

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

      {canChangePassword && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Change Password
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showCurrentPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Enter new password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showNewPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="Confirm new password"
              />
            </div>

            {passwordMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                passwordMessage.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}>
                {passwordMessage.type === "success" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                )}
                {passwordMessage.text}
              </div>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={isSavingPassword}
              className="w-full p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSavingPassword ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              )}
              {isSavingPassword ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
