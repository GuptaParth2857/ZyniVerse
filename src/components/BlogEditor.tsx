"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [tags, setTags] = useState(post?.tags || "");
  const [isDraft, setIsDraft] = useState(post?.isDraft ?? true);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);

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

  const handleSave = async (draft: boolean) => {
    if (!title.trim() || !content.trim()) return;
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

        {/* Cover Image */}
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="Cover image URL (optional)"
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        />

        {/* Excerpt */}
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short excerpt / summary (optional)"
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        />

        {/* Tags */}
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated): anime, review, action"
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        />

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
