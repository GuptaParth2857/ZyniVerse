"use client";

import { useState } from "react";

interface Props {
  initialData?: {
    title: string;
    content: string;
    summary?: string | null;
    category: string;
    tags: string;
  };
  onSave: (data: {
    title: string;
    content: string;
    summary: string;
    category: string;
    tags: string;
  }) => void;
  isEditing?: boolean;
}

const CATEGORIES = [
  { value: "anime", label: "Anime" },
  { value: "manga", label: "Manga" },
  { value: "character", label: "Character" },
  { value: "studio", label: "Studio" },
  { value: "genre", label: "Genre" },
  { value: "guide", label: "Guide" },
  { value: "help", label: "Help" },
];

export default function WikiEditor({ initialData, onSave, isEditing }: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [category, setCategory] = useState(initialData?.category || "guide");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [preview, setPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), summary: summary.trim(), category, tags });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold mb-6">{isEditing ? "Edit Wiki Page" : "Create Wiki Page"}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Page title..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]">
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1">Tags (comma-separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="anime, one-piece, guide" className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1">Summary</label>
          <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief description..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-[var(--color-mute)]">Content (Markdown)</label>
            <button type="button" onClick={() => setPreview(!preview)} className="text-[10px] text-[var(--color-cyan)] hover:underline">
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 min-h-[300px] text-sm text-[var(--color-mute)] whitespace-pre-wrap">
              {content || "Nothing to preview"}
            </div>
          ) : (
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={16} placeholder="Write wiki content in markdown..." className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)] resize-y font-mono" />
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="submit" className="rounded-xl bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
            {isEditing ? "Update Page" : "Publish Page"}
          </button>
        </div>
      </form>
    </div>
  );
}
