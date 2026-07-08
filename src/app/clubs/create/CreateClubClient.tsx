"use client";

import { useState } from "react";
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

export default function CreateClubClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("discussion");
  const [isPrivate, setIsPrivate] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, category, isPrivate }),
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

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold mb-6">Create a Club</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Club name..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What's this club about?" className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)] resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded border-[var(--color-line)] bg-[var(--color-panel)]" />
          <div>
            <p className="text-sm font-medium">Private club</p>
            <p className="text-[10px] text-[var(--color-mute)]">Members need to request to join</p>
          </div>
        </label>

        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[var(--color-magenta)] py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity disabled:opacity-50">
          {submitting ? "Creating..." : "Create Club"}
        </button>
      </form>
    </div>
  );
}
