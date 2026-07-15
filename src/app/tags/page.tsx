"use client";

import { useEffect, useState } from "react";

interface TrendingTag {
  tag: string;
  mediaCount: number;
  totalScore: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community-tags/trending")
      .then((r) => r.json())
      .then((d) => { setTags(d.tags || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Community Tags
        </h1>
        <p className="text-sm text-white/40 mb-8">
          Browse and discover anime by community-created tags
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse h-20 bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30">No tags yet. Create tags on anime detail pages!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tags.map((t) => (
              <div
                key={t.tag}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors cursor-pointer"
              >
                <div className="text-sm font-semibold text-white/80 mb-1">#{t.tag}</div>
                <div className="text-xs text-white/40">
                  {t.mediaCount} anime · score {t.totalScore}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
