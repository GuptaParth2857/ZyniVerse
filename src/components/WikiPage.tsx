"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface WikiPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  category: string;
  tags: string;
  version: number;
  updatedAt: string;
  createdAt: string;
  editor: { id: string; username: string; avatar?: string | null };
  _count: { history: number };
}

interface Props {
  page: WikiPageData;
}

const CATEGORY_LABELS: Record<string, string> = {
  anime: "Anime", manga: "Manga", character: "Character",
  studio: "Studio", genre: "Genre", guide: "Guide", help: "Help",
};

export default function WikiPage({ page }: Props) {
  const { data: session } = useSession();
  const [showRaw, setShowRaw] = useState(false);

  const tags = page.tags ? page.tags.split(",").filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-mute)] mb-2">
          <Link href="/wiki" className="hover:text-[var(--color-cyan)]">Wiki</Link>
          <span>/</span>
          <span className="text-[var(--color-cyan)]">{CATEGORY_LABELS[page.category] || page.category}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">{page.title}</h1>
            {page.summary && <p className="mt-2 text-sm text-[var(--color-mute)]">{page.summary}</p>}
          </div>
          {session && (
            <Link
              href={`/wiki/${page.slug}/edit`}
              className="shrink-0 rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity"
            >
              Edit
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-[var(--color-mute)]">
          <span>v{page.version}</span>
          <span>·</span>
          <span>Last edited by {page.editor.username}</span>
          <span>·</span>
          <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
          <span>·</span>
          <Link href={`/wiki/${page.slug}/history`} className="hover:text-[var(--color-cyan)]">
            {page._count.history} revision{page._count.history !== 1 ? "s" : ""}
          </Link>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--color-cyan)]">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        {showRaw ? (
          <pre className="text-sm whitespace-pre-wrap font-mono text-[var(--color-mute)]">{page.content}</pre>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            {page.content.split("\n").map((line, i) => {
              if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold mt-5 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(4)}</h3>;
              if (line.startsWith("- ")) return <li key={i} className="text-sm text-[var(--color-mute)] ml-4">{line.slice(2)}</li>;
              if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-[var(--color-cyan)] pl-4 text-sm text-[var(--color-mute)] italic my-2">{line.slice(2)}</blockquote>;
              if (line.match(/^```/)) return <pre key={i} className="bg-[var(--color-void)] rounded-lg p-3 text-xs overflow-x-auto my-2">{line.replace(/^```\w*/, "")}</pre>;
              if (line.trim() === "") return <div key={i} className="h-2" />;
              return <p key={i} className="text-sm text-[var(--color-mute)] leading-relaxed">{line}</p>;
            })}
          </div>
        )}
      </div>

      {/* Raw toggle */}
      <button onClick={() => setShowRaw(!showRaw)} className="mt-4 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">
        {showRaw ? "View rendered" : "View raw markdown"}
      </button>

      {/* History link */}
      <div className="mt-8 text-center">
        <Link href={`/wiki/${page.slug}/history`} className="text-sm text-[var(--color-cyan)] hover:underline">
          View revision history ({page._count.history} revision{page._count.history !== 1 ? "s" : ""})
        </Link>
      </div>
    </div>
  );
}
