"use client";

import { useState } from "react";

interface HindiNewsItem {
  id: string;
  title: string;
  titleHindi: string;
  summary: string;
  summaryHindi: string;
  image: string;
  source: string;
  category: string;
  publishedAt: string;
  originalUrl?: string;
}

const HINDI_NEWS: HindiNewsItem[] = [
  {
    id: "hindi-news-1",
    title: "Fullmetal Alchemist: Brotherhood Hindi Dub Coming to Crunchyroll",
    titleHindi: "Fullmetal Alchemist: Brotherhood Hindi Dub Crunchyroll par aa raha hai",
    summary: "Crunchyroll announces Hindi, Tamil, and Telugu dubs for Fullmetal Alchemist: Brotherhood starting July 27.",
    summaryHindi: "Crunchyroll ne announce kiya hai ki Fullmetal Alchemist: Brotherhood Hindi, Tamil aur Telugu mein 27 July se available hoga.",
    image: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
    source: "Crunchyroll",
    category: "Dub News",
    publishedAt: "2026-07-21",
    originalUrl: "https://animemirchi.com/fullmetal-alchemist-brotherhood-on-crunchyroll/",
  },
  {
    id: "hindi-news-2",
    title: "Attack on Titan: The Last Attack Box Office Collection",
    titleHindi: "Attack on Titan: The Last Attack Box Office Collection",
    summary: "Attack on Titan final movie earns ₹8.50 Crore in India, becoming one of the highest grossing anime movies.",
    summaryHindi: "Attack on Titan ki final movie ne India mein ₹8.50 Crore kamaye, jo sabse zyada kamane wali anime movies mein se ek hai.",
    image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    source: "ZyniVerse",
    category: "Box Office",
    publishedAt: "2026-07-20",
  },
  {
    id: "hindi-news-3",
    title: "Netflix Summer 2026 Hindi Dub Anime Lineup",
    titleHindi: "Netflix Summer 2026 Hindi Dub Anime Lineup",
    summary: "Netflix reveals its summer 2026 anime lineup with Hindi dubs including new titles.",
    summaryHindi: "Netflix ne apni summer 2026 anime lineup reveal ki hai jisme naye Hindi dubbed titles shamil hain.",
    image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    source: "Netflix",
    category: "Streaming",
    publishedAt: "2026-07-18",
  },
  {
    id: "hindi-news-4",
    title: "Naruto Shippuden Now Streaming on Crunchyroll in Hindi",
    titleHindi: "Naruto Shippuden ab Crunchyroll par Hindi mein available hai",
    summary: "Naruto Shippuden Seasons 1-3 now streaming in Hindi, Tamil, and Telugu on Crunchyroll.",
    summaryHindi: "Naruto Shippuden ke Seasons 1-3 ab Crunchyroll par Hindi, Tamil aur Telugu mein available hain.",
    image: "https://cdn.myanimelist.net/images/anime/1565/111305.jpg",
    source: "Crunchyroll",
    category: "Streaming",
    publishedAt: "2026-07-15",
  },
  {
    id: "hindi-news-5",
    title: "Anime Movies Released in India 2026 - Complete List",
    titleHindi: "2026 mein India mein release hue anime movies - Complete List",
    summary: "All anime movies that have released or will release in Indian theaters in 2026.",
    summaryHindi: "2026 mein Indian theaters mein release hone wali sabhi anime movies ki complete list.",
    image: "https://cdn.myanimelist.net/images/anime/1286/121097.jpg",
    source: "ZyniVerse",
    category: "Theatrical",
    publishedAt: "2026-07-12",
  },
];

export default function HindiNewsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {HINDI_NEWS.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] transition-all hover:border-[var(--color-cyan)]"
        >
          <div className="flex gap-3 p-3">
            <img
              src={item.image}
              alt={item.title}
              className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold line-clamp-1">{item.titleHindi}</h3>
              <p className="mt-0.5 text-xs text-[var(--color-mute)] line-clamp-1">{item.title}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                <span className="rounded bg-[var(--color-cyan)]/10 px-1.5 py-0.5 text-[var(--color-cyan)]">
                  {item.category}
                </span>
                <span>{item.source}</span>
                <span>{item.publishedAt}</span>
              </div>
            </div>
          </div>

          {expandedId === item.id && (
            <div className="border-t border-[var(--color-surface2)] p-3">
              <p className="mb-2 text-xs text-[var(--color-mute)]">{item.summaryHindi}</p>
              <p className="mb-2 text-xs text-[var(--color-mute)] italic">{item.summary}</p>
              {item.originalUrl && (
                <a
                  href={item.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded bg-[var(--color-cyan)]/10 px-3 py-1 text-xs text-[var(--color-cyan)]"
                >
                  Read Full Article →
                </a>
              )}
            </div>
          )}

          <button
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            className="w-full border-t border-[var(--color-surface2)] bg-[var(--color-surface2)]/50 py-1.5 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-text)]"
          >
            {expandedId === item.id ? "▲ Less" : "▼ More"}
          </button>
        </div>
      ))}
    </div>
  );
}
