"use client";

import MangaChapterBrowser from "@/components/MangaChapterBrowser";

export default function MangaChaptersClient({ mangaId }: { mangaId: number }) {
  return (
    <div>
      <div className="neon-rgb-border rounded-xl px-4 py-2 mb-2">
        <h1 className="text-2xl font-bold">Chapters</h1>
      </div>
      <p className="text-white/50 mb-6">Browse all chapters for this manga series</p>
      <div className="neon-rgb-border rounded-xl p-6">
        <MangaChapterBrowser mangaId={mangaId} />
      </div>
    </div>
  );
}
