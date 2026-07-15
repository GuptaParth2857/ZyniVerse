"use client";

import { useState } from "react";

export default function AwardNominationForm({
  year,
  category,
  categories,
  onSubmit,
}: {
  year: number;
  category: string;
  categories: { id: string; name: string; emoji: string }[];
  onSubmit: (data: { category: string; mediaId: number; title: string; image?: string }) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ id: number; title: { userPreferred: string }; coverImage: { medium: string } }[]>([]);
  const [selectedCat, setSelectedCat] = useState(category);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await fetch(`/api/anilist/search?query=${encodeURIComponent(searchQuery)}&type=ANIME&limit=8`);
    const data = await res.json();
    setResults(data.results || []);
  };

  const handleNominate = (anime: { id: number; title: { userPreferred: string }; coverImage: { medium: string } }) => {
    onSubmit({
      category: selectedCat,
      mediaId: anime.id,
      title: anime.title.userPreferred,
      image: anime.coverImage?.medium,
    });
  };

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <h3 className="text-sm font-bold text-white/90 mb-3">Nominate an Anime</h3>
      <select
        value={selectedCat}
        onChange={(e) => setSelectedCat(e.target.value)}
        className="w-full px-3 py-2 mb-3 text-xs bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.emoji} {c.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2 mb-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search anime..."
          className="flex-1 px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
        >
          Search
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-1">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleNominate(r)}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              <img src={r.coverImage?.medium} alt="" className="w-6 h-8 rounded object-cover" />
              <span className="text-xs text-white/70 text-left">{r.title.userPreferred}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
