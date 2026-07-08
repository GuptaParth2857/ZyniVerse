"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import WikiPageView from "@/components/WikiPage";

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

export default function WikiDetailPageClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = useParams();
  const slug = resolvedParams?.slug as string;

  const [page, setPage] = useState<WikiPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof slug !== "string") return;
    setLoading(true);
    fetch(`/api/wiki/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setPage(data.page);
      })
      .catch(() => setError("Failed to load page"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-[var(--color-line)] rounded" />
          <div className="h-4 w-1/2 bg-[var(--color-line)] rounded" />
          <div className="h-64 bg-[var(--color-line)] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-[var(--color-mute)]">{error || "Page not found"}</p>
      </div>
    );
  }

  return <WikiPageView page={page} />;
}
