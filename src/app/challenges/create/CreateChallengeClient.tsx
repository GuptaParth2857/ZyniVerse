"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const TYPES = [
  { value: "watch", label: "Watch", icon: "\u{1F3AC}", desc: "Anime watching challenge" },
  { value: "read", label: "Read", icon: "\u{1F4DA}", desc: "Manga reading challenge" },
  { value: "mixed", label: "Mixed", icon: "\u{2728}", desc: "Both anime & manga" },
  { value: "custom", label: "Custom", icon: "\u{2699}\u{FE0F}", desc: "Your own rules" },
];

const PERIODS = [
  { value: "yearly", label: "Yearly", icon: "\u{1F30D}" },
  { value: "seasonal", label: "Seasonal", icon: "\u{1F343}" },
  { value: "monthly", label: "Monthly", icon: "\u{1F4C5}" },
  { value: "custom", label: "Custom", icon: "\u{1F52E}" },
];

const SEASONS = [
  { value: "Winter", label: "Winter" },
  { value: "Spring", label: "Spring" },
  { value: "Summer", label: "Summer" },
  { value: "Fall", label: "Fall" },
];

function NeonBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }} />
        <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
      <span className="text-[var(--color-cyan)]">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">{label}</span>
    </div>
  );
}

export default function CreateChallengeClient() {
  const { data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("watch");
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [season, setSeason] = useState("Spring");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goalCount, setGoalCount] = useState("12");
  const [rules, setRules] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageMode, setCoverImageMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Login Required</h1>
        <p className="text-sm text-[var(--color-mute)] mb-6">You need to be logged in to create a challenge.</p>
        <a href="/login" className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity">
          Login
        </a>
      </div>
    );
  }

  async function handleFileUpload(file: File) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Invalid file type. Use JPG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const xhr = new XMLHttpRequest();
      const url = await new Promise<string>((resolve, reject) => {
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
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("POST", "/api/cosplay/upload");
        xhr.send(formData);
      });
      setCoverImage(url);
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!startDate || !endDate) {
      setError("Start and end dates are required");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }
    if (Number(goalCount) < 1) {
      setError("Goal must be at least 1");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          period,
          year: period === "yearly" || period === "seasonal" ? Number(year) : undefined,
          season: period === "seasonal" ? season : undefined,
          startDate,
          endDate,
          goalCount: Number(goalCount),
          isPublic,
          coverImage: coverImage.trim() || undefined,
          rules: rules.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create challenge");
        setSubmitting(false);
        return;
      }
      router.push(`/challenges/${data.challenge.id}`);
    } catch {
      setError("Something went wrong");
      setSubmitting(false);
    }
  };

  const selectedType = TYPES.find((t) => t.value === type);
  const selectedPeriod = PERIODS.find((p) => p.value === period);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Create a Challenge</h1>
        <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
          Set up a custom anime/manga challenge. Pick a type, set your goal, and invite others to compete.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3">
          <NeonBorder>
            <div className="rounded-2xl p-6 sm:p-8 space-y-8">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  {error}
                </div>
              )}

              {/* Type Selection */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>}
                  label="Challenge Type"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`rounded-xl px-3 py-4 text-center transition-all ${
                        type === t.value
                          ? "bg-gradient-to-b from-[var(--color-cyan)]/15 to-transparent text-[var(--color-cyan)] border border-[var(--color-cyan)]/30 shadow-[0_0_20px_-5px_rgba(0,255,224,0.2)]"
                          : "border border-white/8 text-[var(--color-mute)] hover:border-white/20 hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{t.icon}</span>
                      <span className="text-xs font-bold block">{t.label}</span>
                      <span className="text-[10px] opacity-50 block mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
                  label="Period"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPeriod(p.value)}
                      className={`rounded-xl px-3 py-3 text-center transition-all ${
                        period === p.value
                          ? "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)] border border-[var(--color-magenta)]/30 shadow-[0_0_20px_-5px_rgba(255,45,120,0.2)]"
                          : "border border-white/8 text-[var(--color-mute)] hover:border-white/20 hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <span className="text-lg block mb-0.5">{p.icon}</span>
                      <span className="text-xs font-bold">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Year & Season (conditional) */}
              {(period === "yearly" || period === "seasonal") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Year <span className="text-[var(--color-magenta)]">*</span></label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors appearance-none cursor-pointer"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map((y) => (
                        <option key={y} value={y} className="bg-[var(--color-panel)]">{y}</option>
                      ))}
                    </select>
                  </div>
                  {period === "seasonal" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Season <span className="text-[var(--color-magenta)]">*</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {SEASONS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setSeason(s.value)}
                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                              season === s.value
                                ? "bg-[var(--color-violet)]/15 text-[var(--color-violet)] border border-[var(--color-violet)]/30"
                                : "border border-white/8 text-[var(--color-mute)] hover:border-white/20"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dates */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                  label="Duration"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Start Date <span className="text-[var(--color-magenta)]">*</span></label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">End Date <span className="text-[var(--color-magenta)]">*</span></label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
                {startDate && endDate && new Date(endDate) <= new Date(startDate) && (
                  <p className="text-[10px] text-red-400 mt-1.5">End date must be after start date</p>
                )}
                {startDate && endDate && new Date(endDate) > new Date(startDate) && (
                  <p className="text-[10px] text-[var(--color-mute)] mt-1.5">
                    {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days total
                  </p>
                )}
              </div>

              {/* Goal */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>}
                  label="Goal"
                />
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">
                    How many {type === "watch" ? "anime to watch" : type === "read" ? "manga to read" : "entries to complete"}?
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={goalCount}
                      onChange={(e) => setGoalCount(e.target.value)}
                      required
                      className="w-32 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors font-mono"
                    />
                    <span className="text-xs text-[var(--color-mute)]">entries</span>
                    <div className="flex items-center gap-2 ml-auto">
                      {[1, 12, 24, 52].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setGoalCount(n.toString())}
                          className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                            goalCount === n.toString()
                              ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] border border-[var(--color-cyan)]/30"
                              : "border border-white/8 text-[var(--color-mute)] hover:border-white/20"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
                  label="Details"
                />
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Title <span className="text-[var(--color-magenta)]">*</span></label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={100}
                      placeholder="e.g. Spring 2026 Anime Marathon"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors placeholder:text-[var(--color-mute)]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Describe your challenge. What's the theme? Why should people join?"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors resize-none placeholder:text-[var(--color-mute)]/40"
                    />
                    <p className="text-[10px] text-[var(--color-mute)]/40 mt-1">{description.length}/500</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Cover Image</label>
                    {/* Mode toggle */}
                    <div className="flex gap-1 mb-2 p-0.5 rounded-lg border border-white/10 bg-white/5 w-fit">
                      <button type="button" onClick={() => setCoverImageMode("url")}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${coverImageMode === "url" ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-white"}`}>
                        <span className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                          URL
                        </span>
                      </button>
                      <button type="button" onClick={() => setCoverImageMode("upload")}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${coverImageMode === "upload" ? "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-white"}`}>
                        <span className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          Upload
                        </span>
                      </button>
                    </div>

                    {coverImageMode === "url" ? (
                      <input
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://example.com/cover.jpg (optional)"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors placeholder:text-[var(--color-mute)]/40"
                      />
                    ) : (
                      <div className="space-y-3">
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                          className="w-full rounded-xl border-2 border-dashed border-white/10 bg-white/3 p-6 text-center hover:border-[var(--color-magenta)]/30 hover:bg-[var(--color-magenta)]/5 transition-all disabled:opacity-50">
                          {uploading ? (
                            <div className="space-y-3">
                              <div className="mx-auto h-10 w-10 rounded-full border-2 border-[var(--color-magenta)]/30 border-t-[var(--color-magenta)] animate-spin" />
                              <p className="text-xs text-[var(--color-mute)]">Uploading... {uploadProgress}%</p>
                              <div className="mx-auto h-1 w-48 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            </div>
                          ) : (
                            <>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-[var(--color-mute)]">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              <p className="text-xs text-[var(--color-mute)]">Click to upload or drag & drop</p>
                              <p className="text-[10px] text-[var(--color-mute)]/50 mt-1">JPG, PNG, WebP, GIF (max 5MB)</p>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Image preview */}
                    {coverImage && (
                      <div className="mt-3 relative group">
                        <img src={coverImage} alt="Cover preview" className="w-full h-32 object-cover rounded-xl border border-white/10" />
                        <button type="button" onClick={() => setCoverImage("")}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-1.5">Rules</label>
                    <textarea
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      rows={3}
                      placeholder="e.g. Must complete each entry. No dropping halfway..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors resize-none placeholder:text-[var(--color-mute)]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <SectionLabel
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                  label="Visibility"
                />
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${isPublic ? "bg-[var(--color-cyan)]" : "bg-white/10"}`}
                      onClick={() => setIsPublic(!isPublic)}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? "left-5" : "left-1"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{isPublic ? "Public" : "Private"}</p>
                      <p className="text-[10px] text-[var(--color-mute)]">{isPublic ? "Anyone can find and join" : "Only people with the link"}</p>
                    </div>
                  </div>
                  {isPublic && (
                    <span className="rounded-full bg-[var(--color-cyan)]/10 px-2.5 py-1 text-[10px] font-bold text-[var(--color-cyan)] ring-1 ring-[var(--color-cyan)]/20">
                      Public
                    </span>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] py-3.5 text-sm font-bold text-black shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Creating Challenge...
                    </span>
                  ) : (
                    "Create Challenge"
                  )}
                </button>
              </div>
            </div>
          </NeonBorder>
        </form>

        {/* Live Preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-mute)] mb-3 flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            Live Preview
          </p>
          <NeonBorder>
            <div className="rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-bold text-black shadow-lg ${
                    type === "watch" ? "from-blue-500 to-cyan-400" : type === "read" ? "from-green-500 to-emerald-400" : type === "mixed" ? "from-purple-500 to-violet-400" : "from-amber-500 to-yellow-400"
                  }`}>
                    {selectedType?.icon} {selectedType?.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-medium text-[var(--color-mute)]">
                    {selectedPeriod?.label}
                  </span>
                </div>
                {(period === "yearly" || period === "seasonal") && (
                  <span className="text-[11px] font-mono font-bold text-[var(--color-magenta)]">{year}</span>
                )}
              </div>

              <h3 className="text-base font-display font-bold mb-1 leading-tight">
                {title.trim() || "Challenge Title"}
              </h3>
              {description.trim() && (
                <p className="text-xs text-[var(--color-mute)] line-clamp-2 mb-3 leading-relaxed">{description}</p>
              )}

              <div className="flex items-center gap-3 text-[10px] text-[var(--color-mute)] mb-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  {goalCount} goal
                </span>
                {startDate && endDate && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {rules.trim() && (
                <div className="rounded-lg bg-white/5 border border-white/8 px-3 py-2 mb-3">
                  <p className="text-[10px] font-bold text-[var(--color-cyan)] mb-0.5">Rules</p>
                  <p className="text-[10px] text-[var(--color-mute)] line-clamp-2">{rules}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${isPublic ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] ring-[var(--color-cyan)]/20" : "bg-white/5 text-[var(--color-mute)] ring-white/10"}`}>
                  {isPublic ? "Public" : "Private"}
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-[var(--color-mute)] ring-1 ring-white/10">
                  0 participants
                </span>
              </div>
            </div>
          </NeonBorder>
          <p className="text-[10px] text-center text-[var(--color-mute)] mt-3 opacity-60">This is how your challenge card will look</p>
        </div>
      </div>
    </div>
  );
}
