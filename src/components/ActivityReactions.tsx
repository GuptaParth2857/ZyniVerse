"use client";

import { useState } from "react";

interface ReactionProps {
  activityId: string;
  reactions: Record<string, number>;
  myReactions: string[];
  onReact: (activityId: string, type: string) => void;
}

const REACTION_TYPES = [
  { type: "heart", emoji: "❤️", label: "Heart" },
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "laugh", emoji: "😂", label: "Laugh" },
];

export default function ActivityReactions({
  activityId,
  reactions,
  myReactions,
  onReact,
}: ReactionProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="flex items-center gap-1 relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {REACTION_TYPES.map((r) => {
        const count = reactions[r.type] || 0;
        const isActive = myReactions.includes(r.type);
        return (
          <button
            key={r.type}
            onClick={() => onReact(activityId, r.type)}
            className={`flex items-center gap-0.5 px-2 py-0.5 text-xs rounded-full transition-all ${
              isActive
                ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400"
                : hovering
                ? "bg-white/5 border border-white/10 text-white/50 hover:text-white/80"
                : "text-white/30"
            }`}
          >
            <span>{r.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
