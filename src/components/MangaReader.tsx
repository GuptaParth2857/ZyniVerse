"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { searchMangaDex, getMangaDexChapters, getMangaDexChapterPages } from "@/lib/manga-reader";
import type { MangaChapter, MangaPage, MangaDexManga } from "@/lib/manga-reader";
import Loader from "./Loader";

interface Props {
  mangaTitle?: string;
  mangaId?: string;
  initialChapterId?: string;
}

export default function MangaReader({ mangaTitle, mangaId: propMangaId, initialChapterId }: Props) {
  const [manga, setManga] = useState<MangaDexManga | null>(null);
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<MangaChapter | null>(null);
  const [pages, setPages] = useState<MangaPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollMode, setScrollMode] = useState(false);
  const [showChapters, setShowChapters] = useState(true);
  const [searchQuery, setSearchQuery] = useState(mangaTitle || "");

  const loadPages = useCallback(async (chapter: MangaChapter) => {
    setLoading(true);
    setError(null);
    try {
      const pageData = await getMangaDexChapterPages(chapter.id);
      if (pageData.length > 0) {
        setPages(pageData);
        setCurrentPage(0);
      } else {
        setError("No pages available for this chapter.");
      }
    } catch {
      setError("Failed to load chapter pages.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Search for manga on mount if title provided
  useEffect(() => {
    if (propMangaId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setManga({ id: propMangaId, title: mangaTitle || "", altTitles: [], description: "", status: "" });
      return;
    }
    if (!mangaTitle) return;
    searchMangaDex(mangaTitle).then((results) => {
      if (results.length > 0) {
        setManga(results[0]);
      }
    });
  }, [mangaTitle, propMangaId]);

  // Load chapters when manga selected
  useEffect(() => {
    if (!manga?.id) return;
    getMangaDexChapters(manga.id).then((ch) => {
      setChapters(ch);
      if (initialChapterId) {
        const found = ch.find((c) => c.id === initialChapterId);
        if (found) {
          setCurrentChapter(found);
        }
      } else if (ch.length > 0) {
        setCurrentChapter(ch[0]);
      }
    });
  }, [manga?.id, initialChapterId]);

  // Load pages when chapter selected
  useEffect(() => {
    if (!currentChapter) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPages(currentChapter);
  }, [currentChapter, loadPages]);

  function handleChapterSelect(chapter: MangaChapter) {
    setCurrentChapter(chapter);
    setShowChapters(false);
  }

  function nextPage() {
    if (currentPage < pages.length - 1) {
      setCurrentPage((p) => p + 1);
    }
  }

  function prevPage() {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  }

  function nextChapter() {
    const idx = chapters.findIndex((c) => c.id === currentChapter?.id);
    if (idx > 0) {
      handleChapterSelect(chapters[idx - 1]);
    }
  }

  function prevChapter() {
    const idx = chapters.findIndex((c) => c.id === currentChapter?.id);
    if (idx < chapters.length - 1) {
      handleChapterSelect(chapters[idx + 1]);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      {/* Disclaimer */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <p className="text-[10px] text-amber-400/80">
          This manga reader only aggregates links to legal free sources. All content is hosted by third-party services (MangaDex, MangaPlus, etc.). We do not host, upload, or distribute any copyrighted material.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        {/* Search/Select Manga */}
        {!manga && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold mb-3">Read Manga Online</h2>
            <p className="text-sm text-[var(--color-mute)] mb-4">
              Search for a manga to read chapters from legal free sources.
            </p>
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setManga(null);
                    searchMangaDex(searchQuery.trim()).then((results) => {
                      if (results.length > 0) setManga(results[0]);
                    });
                  }
                }}
                placeholder="Search manga on MangaDex..."
                className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    setManga(null);
                    searchMangaDex(searchQuery.trim()).then((results) => {
                      if (results.length > 0) setManga(results[0]);
                    });
                  }
                }}
                className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* Manga header */}
        {manga && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">{manga.title}</h2>
              <p className="text-xs text-[var(--color-mute)]">
                Reading via <span className="text-[var(--color-cyan)]">MangaDex</span>
              </p>
            </div>
            <button
              onClick={() => setShowChapters((o) => !o)}
              className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
            >
              {showChapters ? "Hide" : "Show"} Chapters
            </button>
          </div>
        )}

        {/* Chapter list */}
        {showChapters && chapters.length > 0 && (
          <div className="mb-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] max-h-80 overflow-y-auto">
            <div className="sticky top-0 bg-[var(--color-panel)] border-b border-[var(--color-line)] px-4 py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">
                Chapters ({chapters.length})
              </span>
            </div>
            {chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleChapterSelect(ch)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${
                  currentChapter?.id === ch.id ? "bg-white/10" : ""
                }`}
              >
                <span className="font-mono text-xs text-[var(--color-mute)] w-16">
                  Ch. {ch.chapter}
                </span>
                <span className="flex-1 truncate">{ch.title}</span>
                {ch.language && (
                  <span className="text-[10px] uppercase text-[var(--color-mute)]">{ch.language}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Reader */}
        {currentChapter && (
          <div>
            {/* Chapter header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevChapter}
                  disabled={chapters.findIndex((c) => c.id === currentChapter.id) >= chapters.length - 1}
                  className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] disabled:opacity-30 transition-colors"
                >
                  Prev
                </button>
                <span className="text-sm font-medium">
                  Ch. {currentChapter.chapter}
                </span>
                <button
                  onClick={nextChapter}
                  disabled={chapters.findIndex((c) => c.id === currentChapter.id) <= 0}
                  className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScrollMode((o) => !o)}
                  className={`rounded-lg border px-5 py-2.5 text-xs transition-colors ${
                    scrollMode
                      ? "border-[var(--color-cyan)] text-[var(--color-cyan)]"
                      : "border-[var(--color-line)] text-[var(--color-mute)]"
                  }`}
                >
                  {scrollMode ? "Single" : "Scroll"}
                </button>
                <a
                  href={currentChapter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] underline"
                >
                  Read via MangaDex ↗
                </a>
              </div>
            </div>

            {/* Page viewer */}
            {loading ? (
              <Loader label="Loading pages..." />
            ) : error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={() => currentChapter && loadPages(currentChapter)}
                  className="mt-3 rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                {scrollMode ? (
                  /* Scroll mode: show all pages */
                  <div className="space-y-4">
                    {pages.map((page) => (
                      <div key={page.page} className="mx-auto max-w-3xl">
                        <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                          <Image
                            src={page.url}
                            alt={`Page ${page.page}`}
                            fill
                            className="object-contain rounded-lg"
                            sizes="(max-width: 768px) 100vw, 60vw"
                            unoptimized
                          />
                        </div>
                        <p className="text-center text-[10px] text-[var(--color-mute)] mt-1">
                          Page {page.page} of {pages.length}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Single page mode */
                  <div className="mx-auto max-w-3xl">
                    <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                      <Image
                        src={pages[currentPage]?.url || ""}
                        alt={`Page ${currentPage + 1}`}
                        fill
                        className="object-contain rounded-lg"
                        sizes="(max-width: 768px) 100vw, 60vw"
                        unoptimized
                      />
                    </div>

                    {/* Page nav */}
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] disabled:opacity-30 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-mono text-[var(--color-mute)]">
                        Page {currentPage + 1} of {pages.length}
                      </span>
                      <button
                        onClick={nextPage}
                        disabled={currentPage >= pages.length - 1}
                        className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] disabled:opacity-30 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Source credit */}
            <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
              <p className="text-xs text-[var(--color-mute)]">
                Read via <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyan)] underline">MangaDex</a>.
                All content is hosted by MangaDex. We do not host any copyrighted content.
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!manga && !mangaTitle && (
          <div className="py-20 text-center">
            <div className="mb-4 text-4xl">📚</div>
            <h3 className="font-display text-xl font-bold mb-2">Read Manga Online</h3>
            <p className="text-sm text-[var(--color-mute)] max-w-md mx-auto">
              Search for any manga above to find chapters from legal free sources including MangaDex and MangaPlus.
            </p>
            <div className="mt-6 flex justify-center gap-4 text-xs text-[var(--color-mute)]">
              <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">MangaDex</a>
              <a href="https://mangaplus.shueisha.co.jp" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">MangaPlus</a>
              <a href="https://www.crunchyroll.com/manga" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">Crunchyroll Manga</a>
              <a href="https://comikey.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">Comikey</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
