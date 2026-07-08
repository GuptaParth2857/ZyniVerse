"use client";

import { useEffect, useState } from "react";

interface MangaChapter {
  id: string;
  mangaId: number;
  chapterNumber: number;
  title: string | null;
  volume: number | null;
  pages: number | null;
  publishedAt: string | null;
}

export default function MangaChapterBrowser({ mangaId, mangaTitle }: { mangaId: number; mangaTitle?: string }) {
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/manga/chapters/${mangaId}`)
      .then((r) => r.json())
      .then((d) => { setChapters(d.chapters || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mangaId]);

  const filtered = chapters.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="animate-pulse h-48 bg-white/5 rounded-xl" />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-bold">Chapters ({chapters.length})</h3>
        <input type="text" placeholder="Search chapters..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-emerald-500/50" />
      </div>
      <div className="grid gap-2 max-h-96 overflow-y-auto">
        {filtered.slice(0, 50).map((ch) => (
          <div key={ch.id} className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-xs w-8">Ch.{ch.chapterNumber}</span>
              <span className="text-sm">{ch.title || `Chapter ${ch.chapterNumber}`}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              {ch.volume && <span>Vol.{ch.volume}</span>}
              {ch.pages && <span>{ch.pages}p</span>}
              {ch.publishedAt && <span>{new Date(ch.publishedAt).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-white/40 text-sm py-8 text-center">No chapters found</div>}
      </div>
    </div>
  );
}
