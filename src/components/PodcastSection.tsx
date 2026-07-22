"use client";

import { useState } from "react";

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  image: string;
  tags: string[];
}

const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: "podcast-1",
    title: "Best Hindi Dubbed Anime of 2026",
    description: "We discuss the best Hindi dubbed anime releases of 2026, including Attack on Titan, Frieren, and more.",
    duration: "45:22",
    publishDate: "2026-07-20",
    youtubeUrl: "https://www.youtube.com/results?search_query=anime+podcast+hindi+2026",
    image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    tags: ["Hindi Dub", "2026", "Review"],
  },
  {
    id: "podcast-2",
    title: "Anime Movies in Indian Theaters",
    description: "Discussion about anime movies releasing in Indian theaters and their box office performance.",
    duration: "38:15",
    publishDate: "2026-07-15",
    youtubeUrl: "https://www.youtube.com/results?search_query=anime+movies+india+theater",
    image: "https://cdn.myanimelist.net/images/anime/1286/121097.jpg",
    tags: ["Movies", "India", "Box Office"],
  },
  {
    id: "podcast-3",
    title: "Crunchyroll vs Netflix for Anime in India",
    description: "Which platform is better for watching anime in India? We compare Crunchyroll and Netflix.",
    duration: "52:30",
    publishDate: "2026-07-10",
    youtubeUrl: "https://www.youtube.com/results?search_query=crunchyroll+netflix+anime+india",
    image: "https://static.crunchyroll.com/fos/v2/poweredby.png",
    tags: ["Streaming", "Comparison", "India"],
  },
  {
    id: "podcast-4",
    title: "Top 10 Anime to Watch in Hindi",
    description: "Our definitive list of the top 10 anime you should watch in Hindi dub right now.",
    duration: "41:08",
    publishDate: "2026-07-05",
    youtubeUrl: "https://www.youtube.com/results?search_query=top+10+anime+hindi+dub",
    image: "https://cdn.myanimelist.net/images/anime/13/75197.jpg",
    tags: ["Top 10", "Hindi Dub", "Recommendations"],
  },
  {
    id: "podcast-5",
    title: "Indian Anime Convention Scene",
    description: "Exploring the growing anime convention scene in India - Comic Con, Anime Expo India, and more.",
    duration: "35:45",
    publishDate: "2026-06-28",
    youtubeUrl: "https://www.youtube.com/results?search_query=anime+convention+india",
    image: "https://upload.wikimedia.org/wikipedia/en/5/56/Chhota_Bheem.jpg",
    tags: ["Conventions", "India", "Community"],
  },
];

export default function PodcastSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {PODCAST_EPISODES.map((episode) => (
        <div
          key={episode.id}
          className="overflow-hidden rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] transition-all hover:border-[var(--color-cyan)]"
        >
          <div className="flex gap-4 p-4">
            <img
              src={episode.image}
              alt={episode.title}
              className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold line-clamp-1">{episode.title}</h3>
              <p className="mt-1 text-xs text-[var(--color-mute)] line-clamp-2">{episode.description}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--color-mute)]">
                <span>{episode.duration}</span>
                <span>{episode.publishDate}</span>
                <div className="flex gap-1">
                  {episode.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded bg-[var(--color-surface2)] px-1.5 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === episode.id && (
            <div className="border-t border-[var(--color-surface2)] p-4">
              <p className="mb-3 text-xs text-[var(--color-mute)]">{episode.description}</p>
              <div className="flex gap-2">
                {episode.youtubeUrl && (
                  <a
                    href={episode.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    YouTube
                  </a>
                )}
                {episode.spotifyUrl && (
                  <a
                    href={episode.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/30"
                  >
                    Spotify
                  </a>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => setExpandedId(expandedId === episode.id ? null : episode.id)}
            className="w-full border-t border-[var(--color-surface2)] bg-[var(--color-surface2)]/50 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-text)]"
          >
            {expandedId === episode.id ? "Show Less" : "Show More"}
          </button>
        </div>
      ))}
    </div>
  );
}
