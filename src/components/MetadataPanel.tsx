"use client";

import { useEffect, useState } from "react";

interface AnimeMetadata {
  broadcast: string | null;
  licensors: string[];
  producers: string[];
  rating: string | null;
  demographics: string[];
  duration: string | null;
  season: string | null;
  year: number | null;
  external: { name: string; url: string }[];
  openings: string[];
  endings: string[];
}

export default function MetadataPanel({ mediaId }: { mediaId: number }) {
  const [meta, setMeta] = useState<AnimeMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/anime/metadata/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setMeta(d.metadata); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId]);

  if (loading) return <div className="animate-pulse h-32 bg-white/5 rounded-xl" />;
  if (!meta) return null;

  return (
    <div className="space-y-3 text-sm">
      {meta.broadcast && (
        <div className="flex justify-between">
          <span className="text-white/50">Broadcast</span>
          <span>{meta.broadcast}</span>
        </div>
      )}
      {meta.rating && (
        <div className="flex justify-between">
          <span className="text-white/50">Age Rating</span>
          <span>{meta.rating}</span>
        </div>
      )}
      {meta.season && meta.year && (
        <div className="flex justify-between">
          <span className="text-white/50">Season</span>
          <span className="capitalize">{meta.season} {meta.year}</span>
        </div>
      )}
      {meta.licensors.length > 0 && (
        <div className="flex justify-between">
          <span className="text-white/50">Licensors</span>
          <span className="text-right">{meta.licensors.join(", ")}</span>
        </div>
      )}
      {meta.producers.length > 0 && (
        <div className="flex justify-between">
          <span className="text-white/50">Producers</span>
          <span className="text-right">{meta.producers.join(", ")}</span>
        </div>
      )}
      {meta.demographics.length > 0 && (
        <div className="flex justify-between">
          <span className="text-white/50">Demographics</span>
          <span>{meta.demographics.join(", ")}</span>
        </div>
      )}
      {meta.openings.length > 0 && (
        <div>
          <span className="text-white/50 block mb-1">Openings</span>
          {meta.openings.map((op, i) => <div key={i} className="text-xs text-white/70">OP{i + 1}: {op}</div>)}
        </div>
      )}
      {meta.endings.length > 0 && (
        <div>
          <span className="text-white/50 block mb-1">Endings</span>
          {meta.endings.map((ed, i) => <div key={i} className="text-xs text-white/70">ED{i + 1}: {ed}</div>)}
        </div>
      )}
      {meta.external.length > 0 && (
        <div>
          <span className="text-white/50 block mb-1">External Links</span>
          {meta.external.slice(0, 5).map((e, i) => (
            <a key={i} href={e.url} target="_blank" rel="noopener noreferrer"
              className="block text-xs text-emerald-400 hover:underline truncate">{e.name}</a>
          ))}
        </div>
      )}
    </div>
  );
}
