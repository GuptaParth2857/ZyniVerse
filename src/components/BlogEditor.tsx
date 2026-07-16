"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hasValidAnimeTag, getAnimeTagError } from "@/lib/blog-tags";

interface BlogEditorProps {
  post?: {
    id: string;
    title: string;
    content: string;
    excerpt?: string | null;
    coverImage?: string | null;
    tags: string;
    isDraft: boolean;
  };
}

const TOOLBAR_BUTTONS = [
  { label: "B", action: "**", wrap: "**", title: "Bold" },
  { label: "I", action: "*", wrap: "*", title: "Italic" },
  { label: "H", action: "# ", title: "Heading" },
  { label: ">", action: "> ", title: "Quote" },
  { label: "-", action: "- ", title: "List" },
  { label: "🔗", action: "[text](url)", title: "Link" },
  { label: "`", action: "`", wrap: "`", title: "Code" },
];

function insertMarkdown(textarea: HTMLTextAreaElement, action: string, wrap?: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);

  if (selected) {
    const w = wrap || "";
    return text.substring(0, start) + w + selected + w + text.substring(end);
  }
  return text.substring(0, start) + action + text.substring(end);
}

export default function BlogEditor({ post }: BlogEditorProps) {
  const { status } = useSession();
  const router = useRouter();
  const isEdit = !!post;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [tags, setTags] = useState(post?.tags || "");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [tagError, setTagError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (isEdit) return;
    const saved = localStorage.getItem("blog-draft");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setTitle(d.title || "");
        setContent(d.content || "");
        setExcerpt(d.excerpt || "");
        setCoverImage(d.coverImage || "");
        setTags(d.tags || "");
      } catch {}
    }
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) return;
    const timer = setInterval(() => {
      localStorage.setItem("blog-draft", JSON.stringify({ title, content, excerpt, coverImage, tags }));
    }, 30000);
    return () => clearInterval(timer);
  }, [isEdit, title, content, excerpt, coverImage, tags]);

  const handleToolbar = useCallback((action: string, wrap?: string) => {
    const textarea = document.getElementById("blog-content") as HTMLTextAreaElement;
    if (!textarea) return;
    const newContent = insertMarkdown(textarea, action, wrap);
    setContent(newContent);
    textarea.focus();
  }, []);

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/blog", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverImage(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadImage(file);
  };

  const handleSave = async (draft: boolean) => {
    if (!title.trim() || !content.trim()) return;
    if (!draft && !hasValidAnimeTag(tags)) {
      setTagError(getAnimeTagError());
      return;
    }
    setTagError("");
    setSaving(true);
    try {
      const url = isEdit ? `/api/blog/${post!.id}` : "/api/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          coverImage: coverImage.trim() || null,
          tags: tags.trim(),
          isDraft: draft,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      if (!isEdit) localStorage.removeItem("blog-draft");
      router.push(`/blog/${data.post.slug}`);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  function renderMarkdown(text: string): string {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-black/30 rounded-lg p-3 my-2 text-xs overflow-x-auto font-mono'>$1</pre>");
    html = html.replace(/`([^`]+)`/g, "<code class='bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono'>$1</code>");
    html = html.replace(/^### (.+)$/gm, "<h3 class='font-display text-lg font-bold mt-6 mb-2'>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2 class='font-display text-xl font-bold mt-6 mb-2'>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1 class='font-display text-2xl font-bold mt-6 mb-2'>$1</h1>");
    html = html.replace(/^> (.+)$/gm, "<blockquote class='border-l-2 border-[var(--color-cyan)] pl-4 my-2 text-[var(--color-mute)] italic'>$1</blockquote>");
    html = html.replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-[var(--color-mute)]'>$1</li>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-[var(--color-cyan)] hover:underline'>$1</a>");
    html = html.replace(/\n\n/g, "</p><p class='my-3 leading-relaxed text-[var(--color-mute)]'>");
    html = `<p class='my-3 leading-relaxed text-[var(--color-mute)]'>${html}</p>`;
    return html;
  }

  if (status === "loading") return <div className="py-16 text-center text-sm text-[var(--color-mute)]">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold mb-6">{isEdit ? "Edit Post" : "Create Blog Post"}</h1>

      <div className="space-y-4">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-lg font-semibold outline-none focus:border-[var(--color-cyan)] transition-colors"
        />

        {/* Cover Image — Premium Card */}
        <div className="relative rounded-[16px]">
          <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
            <div className="absolute inset-0"
              style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
            />
            <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
          </div>
          <div className="relative z-10 p-4">
            <p className="text-xs font-semibold text-[var(--color-mute)] uppercase tracking-wider mb-3">Cover Image</p>

            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden group">
                <div className="h-48 w-full" style={{ background: `url(${coverImage}) center/cover` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-[var(--color-cyan)]/20 backdrop-blur-sm border border-[var(--color-cyan)]/30 px-3 py-1.5 text-[10px] font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/30 transition-colors"
                  >Replace</button>
                  <button
                    onClick={() => { setCoverImage(""); setUploadError(""); }}
                    className="rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-500/30 transition-colors"
                  >Remove</button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center h-40 ${
                  dragOver
                    ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/5"
                    : "border-[var(--color-line)] hover:border-[var(--color-cyan)]/40 bg-[var(--color-panel)]"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-[var(--color-cyan)]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-xs text-[var(--color-mute)]">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-[var(--color-mute)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <span className="text-xs text-[var(--color-mute)]">Drop image or click to upload</span>
                    <span className="text-[10px] text-[var(--color-mute)]/50 mt-1">JPG, PNG, WebP, GIF — Max 5MB</span>
                  </>
                )}
              </div>
            )}

            {uploadError && <p className="mt-2 text-xs text-red-400">{uploadError}</p>}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-3">
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or paste image URL..."
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-xs outline-none focus:border-[var(--color-cyan)] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short excerpt / summary (optional)"
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        />

        {/* Tags */}
        <div>
          <input
            value={tags}
            onChange={(e) => { setTags(e.target.value); setTagError(""); }}
            placeholder="Tags (comma-separated): anime, review, action"
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
          />
          {tagError && <p className="mt-1 text-xs text-red-400">{tagError}</p>}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 flex-wrap">
          {TOOLBAR_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => handleToolbar(btn.action, btn.wrap)}
              title={btn.title}
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-2.5 py-1.5 text-xs font-mono font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
            >{btn.label}</button>
          ))}
        </div>

        {/* Tabs: Edit / Preview */}
        <div className="flex gap-4 border-b border-[var(--color-line)]">
          <button onClick={() => setTab("edit")}
            className={`pb-2 text-sm font-semibold transition-colors ${tab === "edit" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)]"}`}
          >Edit</button>
          <button onClick={() => setTab("preview")}
            className={`pb-2 text-sm font-semibold transition-colors ${tab === "preview" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)]"}`}
          >Preview</button>
        </div>

        {/* Content area */}
        {tab === "edit" ? (
          <textarea
            id="blog-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post in markdown..."
            rows={16}
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--color-cyan)] transition-colors resize-y"
          />
        ) : (
          <div className="min-h-[300px] rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 overflow-y-auto">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
            ) : (
              <p className="text-sm text-[var(--color-mute)]">Nothing to preview.</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => router.back()}
            className="text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >← Back</button>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !title.trim() || !content.trim()}
              className="rounded-lg border border-[var(--color-line)] px-5 py-2 text-sm font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all disabled:opacity-50"
            >{saving ? "Saving..." : "Save Draft"}</button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving || !title.trim() || !content.trim()}
              className="rounded-lg bg-[var(--color-magenta)] px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >{saving ? "Publishing..." : "Publish"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
