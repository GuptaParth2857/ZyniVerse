"use client";

import MangaChapterBrowser from "@/components/MangaChapterBrowser";

export default function MangaChaptersClient({ mangaId }: { mangaId: number }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Chapters</h1>
      <p className="text-white/50 mb-6">Browse all chapters for this manga series</p>
      <div className="bg-white/5 rounded-xl p-6">
        <MangaChapterBrowser mangaId={mangaId} />
      </div>
    </div>
  );
}
