"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import WikiEditor from "@/components/WikiEditor";

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
}

export default function WikiEditPageClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = useParams();
  const slug = resolvedParams?.slug as string;
  const router = useRouter();
  const { data: session } = useSession();

  const [page, setPage] = useState<WikiPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof slug !== "string") return;
    fetch(`/api/wiki/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.page) setPage(data.page);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Login Required</h1>
        <p className="text-sm text-[var(--color-mute)]">You need to be logged in to edit wiki pages.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><div className="animate-pulse h-64 bg-[var(--color-line)] rounded-xl" /></div>;
  }

  if (!page) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center"><p className="text-[var(--color-mute)]">Page not found</p></div>;
  }

  const handleSave = async (data: { title: string; content: string; summary: string; category: string; tags: string }) => {
    setSaving(true);
    const res = await fetch(`/api/wiki/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      router.push(`/wiki/${result.page.slug}`);
    }
    setSaving(false);
  };

  return (
    <div>
      <WikiEditor
        initialData={{
          title: page.title,
          content: page.content,
          summary: page.summary,
          category: page.category,
          tags: page.tags,
        }}
        onSave={handleSave}
        isEditing
      />
      {saving && (
        <div className="fixed bottom-8 right-8 rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-sm font-bold text-black shadow-lg">
          Saving...
        </div>
      )}
    </div>
  );
}
