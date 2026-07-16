"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const CATEGORIES = [
  { value: "fan_club", label: "Fan Club" },
  { value: "discussion", label: "Discussion" },
  { value: "watching", label: "Watching" },
  { value: "reading", label: "Reading" },
  { value: "region", label: "Region" },
  { value: "language", label: "Language" },
  { value: "other", label: "Other" },
];

const CATEGORY_LABELS: Record<string, string> = {
  fan_club: "Fan Club", discussion: "Discussion", watching: "Watching",
  reading: "Reading", region: "Region", language: "Language", other: "Other",
};

function NeonBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[24px]">
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

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--color-line)]">
      <span className="text-[var(--color-cyan)]">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">{label}</span>
    </div>
  );
}

export default function CreateClubClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const coverRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [category, setCategory] = useState("discussion");
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [icon, setIcon] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");
  const [uploading, setUploading] = useState<"cover" | "icon" | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Login Required</h1>
        <p className="text-sm text-[var(--color-mute)] mb-6">You need to be logged in to create a club.</p>
        <a href="/login" className="rounded-xl bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity">
          Login
        </a>
      </div>
    );
  }

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "icon") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Max 5MB allowed"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === "cover") setCoverPreview(ev.target?.result as string);
      else setIconPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(type);
    try {
      const url = await uploadImage(file, `clubs/${type}`);
      if (type === "cover") setCoverImage(url!);
      else setIcon(url!);
    } catch { setError("Image upload failed"); }
    setUploading(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          rules: rules.trim() || undefined,
          category,
          isPrivate,
          coverImage: coverImage || undefined,
          icon: icon || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create club");
        setSubmitting(false);
        return;
      }
      router.push(`/clubs/${data.club.slug}`);
    } catch {
      setError("Something went wrong");
      setSubmitting(false);
    }
  };

  const showCover = coverPreview || coverImage;
  const showIcon = iconPreview || icon;
  const previewName = name.trim() || "Club Name";
  const previewDesc = description.trim() || "Your club description will appear here...";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 animate-page-in">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Create a Club</h1>
        <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
          Fill in the details below and see a live preview of your club card.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form - 3 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-3">
          <NeonBorder>
            <div className="rounded-[24px] p-6 sm:p-8 space-y-8">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  {error}
                </div>
              )}

              {/* Images Section */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>}
                  label="Images"
                />
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Cover Image</label>
                    <div
                      onClick={() => coverRef.current?.click()}
                      className="relative h-36 w-full rounded-xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-panel)] cursor-pointer overflow-hidden hover:border-[var(--color-cyan)] transition-colors group"
                    >
                      {showCover ? (
                        <>
                          <div className="h-full w-full" style={{ background: `url(${showCover}) center/cover` }} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs text-white font-medium bg-black/60 px-3 py-1.5 rounded-lg">Change Cover</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-[var(--color-mute)] group-hover:text-[var(--color-cyan)] transition-colors">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                          <span className="text-xs mt-2 font-medium">Click to upload cover image</span>
                          <span className="text-[10px] mt-1 opacity-50">1200x400 recommended</span>
                        </div>
                      )}
                      {uploading === "cover" && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex items-center gap-2 text-xs text-white">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Uploading...
                          </div>
                        </div>
                      )}
                    </div>
                    <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Club Icon</label>
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => iconRef.current?.click()}
                        className="relative h-20 w-20 rounded-xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-panel)] cursor-pointer overflow-hidden hover:border-[var(--color-cyan)] transition-colors group shrink-0"
                      >
                        {showIcon ? (
                          <>
                            <div className="h-full w-full" style={{ background: `url(${showIcon}) center/cover` }} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-[var(--color-mute)] group-hover:text-[var(--color-cyan)] transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                          </div>
                        )}
                        {uploading === "icon" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          </div>
                        )}
                      </div>
                      <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "icon")} />
                      <div>
                        <p className="text-[11px] text-[var(--color-mute)]">Square image recommended</p>
                        <p className="text-[10px] text-[var(--color-mute)] opacity-50">Max 5MB, JPG/PNG/WebP</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
                  label="Details"
                />
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Club Name <span className="text-[var(--color-magenta)]">*</span></label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Naruto Fans India"
                      className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors placeholder:text-[var(--color-mute)]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="What's this club about? Tell potential members why they should join..."
                      className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors resize-none placeholder:text-[var(--color-mute)]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Club Rules</label>
                    <textarea
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      rows={3}
                      placeholder="Be respectful, no spam, no spoilers without tags..."
                      className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors resize-none placeholder:text-[var(--color-mute)]/50"
                    />
                    <p className="text-[10px] text-[var(--color-mute)]/50 mt-1">Optional. Rules will be shown on the club page.</p>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>}
                  label="Settings"
                />
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Category <span className="text-[var(--color-magenta)]">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                            category === c.value
                              ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] border border-[var(--color-cyan)]/30 shadow-[0_0_15px_-5px_rgba(0,255,224,0.2)]"
                              : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)]"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${isPrivate ? "bg-[var(--color-magenta)]" : "bg-[var(--color-line)]"}`} onClick={() => setIsPrivate(!isPrivate)}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPrivate ? "left-5" : "left-1"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Private Club</p>
                        <p className="text-[10px] text-[var(--color-mute)]">Members need to request to join</p>
                      </div>
                    </div>
                    {isPrivate && (
                      <span className="rounded-full bg-[var(--color-magenta)]/10 px-2.5 py-1 text-[10px] font-medium text-[var(--color-magenta)]">
                        Invite Only
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !!uploading}
                  className="w-full rounded-xl bg-gradient-to-r from-[var(--color-magenta)] via-[#7000ff] to-[var(--color-cyan)] py-3.5 text-sm font-bold text-white shadow-[0_0_30px_-8px_rgba(255,0,230,0.3)] hover:shadow-[0_0_50px_-6px_rgba(255,0,230,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Creating Club...
                    </span>
                  ) : uploading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Uploading Image...
                    </span>
                  ) : (
                    "Create Club"
                  )}
                </button>
              </div>
            </div>
          </NeonBorder>
        </form>

        {/* Live Preview - 2 cols */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-mute)] mb-3 flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            Live Preview
          </p>
          <NeonBorder>
            <div className="relative rounded-[24px] overflow-hidden">
              {showCover ? (
                <div className="relative h-40 w-full">
                  <div className="h-full w-full" style={{ background: `url(${showCover}) center/cover` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.95)] via-[rgba(10,10,15,0.3)] to-transparent" />
                </div>
              ) : (
                <div className="h-40 w-full bg-gradient-to-br from-[rgba(0,255,224,0.08)] via-[rgba(112,0,255,0.06)] to-[rgba(255,0,230,0.08)] flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                </div>
              )}

              <div className="px-5 pb-5 -mt-10 relative z-10">
                <div className="flex items-end gap-3 mb-3">
                  {showIcon ? (
                    <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden ring-2 ring-[rgba(0,255,224,0.3)] shadow-[0_0_20px_-5px_rgba(0,255,224,0.3)]" style={{ background: `url(${showIcon}) center/cover` }} />
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] flex items-center justify-center text-2xl font-bold text-black ring-2 ring-[rgba(0,255,224,0.2)]">
                      {previewName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 pb-1">
                    <h3 className="font-display text-base font-bold text-white truncate">{previewName}</h3>
                    <p className="text-[10px] text-white/40">{session.user?.name || "You"} · 1 member</p>
                  </div>
                </div>

                {previewDesc && (
                  <p className="text-xs text-white/40 mb-3 line-clamp-2">{previewDesc}</p>
                )}

                <div className="flex items-center gap-2">
                  <span className="rounded-full px-3 py-1 text-[10px] font-medium ring-1" style={{ background: "rgba(0,255,224,0.1)", color: "#00ffe0", borderColor: "rgba(0,255,224,0.2)" }}>
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  {isPrivate && (
                    <span className="rounded-full px-3 py-1 text-[10px] font-medium ring-1" style={{ background: "rgba(255,0,230,0.1)", color: "#ff00e6", borderColor: "rgba(255,0,230,0.2)" }}>
                      Private
                    </span>
                  )}
                </div>
              </div>
            </div>
          </NeonBorder>
          <p className="text-[10px] text-center text-[var(--color-mute)] mt-3 opacity-60">This is how your club card will look on the listing page</p>
        </div>
      </div>
    </div>
  );
}
