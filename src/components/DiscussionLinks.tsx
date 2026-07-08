"use client";

import { useEffect, useState } from "react";

interface Discussion {
  title: string;
  url: string;
  score: number;
  comments: number;
  created: string;
}

export default function DiscussionLinks({ mediaId }: { mediaId: number }) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/episodes/discussion/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setDiscussions(d.discussions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId]);

  if (loading) return <div className="animate-pulse h-24 bg-white/5 rounded-xl" />;
  if (discussions.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Reddit Discussions</h3>
      <div className="space-y-1.5">
        {discussions.map((d, i) => (
          <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
            <span className="text-xs truncate flex-1 group-hover:text-emerald-400">{d.title}</span>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span className="text-[10px] text-white/30">↑{d.score}</span>
              <span className="text-[10px] text-white/30">{d.comments}c</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
