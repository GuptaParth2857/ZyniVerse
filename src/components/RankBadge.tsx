"use client";

import { motion } from "framer-motion";
import type { RankInfo } from "@/lib/achievements";

interface RankBadgeProps {
  rank: RankInfo;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

const SIZE_MAP = {
  sm: { w: 28, h: 32, label: "text-[8px]" },
  md: { w: 40, h: 46, label: "text-[10px]" },
  lg: { w: 56, h: 64, label: "text-xs" },
};

function ShieldSVG({ rank, size }: { rank: RankInfo; size: "sm" | "md" | "lg" }) {
  const s = SIZE_MAP[size];
  const w = s.w;
  const h = s.h;

  const isHeroic = rank.tier >= 6;
  const isGrandmaster = rank.tier >= 7;
  const isDiamond = rank.tier >= 5;

  return (
    <svg width={w} height={h} viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`shield-${rank.tier}`} x1="50" y1="0" x2="50" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={rank.color} stopOpacity="0.9" />
          <stop offset="50%" stopColor={rank.color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={rank.color} stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`wing-${rank.tier}`} x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={rank.color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={rank.color} stopOpacity="0.2" />
        </linearGradient>
        <filter id={`glow-${rank.tier}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor={rank.color} floodOpacity="0.6" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Left Wing */}
      <path
        d="M15 45 Q5 35 8 25 Q12 15 20 20 Q25 25 30 35 L35 50 Q25 48 15 45Z"
        fill={`url(#wing-${rank.tier})`}
        stroke={rank.color}
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      {/* Right Wing */}
      <path
        d="M85 45 Q95 35 92 25 Q88 15 80 20 Q75 25 70 35 L65 50 Q75 48 85 45Z"
        fill={`url(#wing-${rank.tier})`}
        stroke={rank.color}
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* Shield Body */}
      <path
        d="M50 5 L85 20 Q90 22 90 28 L90 55 Q90 85 50 110 Q10 85 10 55 L10 28 Q10 22 15 20 Z"
        fill={`url(#shield-${rank.tier})`}
        stroke={rank.color}
        strokeWidth="2"
        strokeOpacity="0.8"
        filter={`url(#glow-${rank.tier})`}
      />

      {/* Shield Inner Border */}
      <path
        d="M50 12 L80 24 Q84 26 84 30 L84 54 Q84 80 50 102 Q16 80 16 54 L16 30 Q16 26 20 24 Z"
        fill="none"
        stroke={rank.color}
        strokeWidth="1"
        strokeOpacity="0.3"
      />

      {/* Rank Icon */}
      {isGrandmaster ? (
        /* Crown for Grandmaster */
        <g transform="translate(32, 28) scale(0.36)">
          <path d="M50 10 L65 35 L95 35 L72 55 L80 85 L50 68 L20 85 L28 55 L5 35 L35 35 Z"
            fill={rank.color} stroke={rank.color} strokeWidth="2" />
          <circle cx="50" cy="45" r="6" fill="#000" fillOpacity="0.3" />
        </g>
      ) : isHeroic ? (
        /* Eagle for Heroic */
        <g transform="translate(30, 26) scale(0.4)">
          <path d="M50 5 Q70 20 85 15 Q80 30 90 40 Q75 35 65 45 Q80 55 70 70 Q55 55 50 65 Q45 55 30 70 Q20 55 35 45 Q25 35 10 40 Q20 30 15 15 Q30 20 50 5Z"
            fill={rank.color} stroke={rank.color} strokeWidth="1.5" />
          <circle cx="42" cy="30" r="2" fill="#000" fillOpacity="0.5" />
          <circle cx="58" cy="30" r="2" fill="#000" fillOpacity="0.5" />
        </g>
      ) : isDiamond ? (
        /* Diamond gem */
        <g transform="translate(32, 28) scale(0.36)">
          <polygon points="50,5 95,40 75,95 25,95 5,40"
            fill={rank.color} fillOpacity="0.8" stroke={rank.color} strokeWidth="2" />
          <polygon points="50,5 65,40 50,95 35,40"
            fill="#fff" fillOpacity="0.15" />
        </g>
      ) : (
        /* Default: rank tier number with decorative elements */
        <g>
          <text x="50" y="68" textAnchor="middle" fill={rank.color}
            fontSize={rank.tier >= 4 ? "32" : "28"} fontWeight="900" fontFamily="monospace"
            style={{ textShadow: `0 0 10px ${rank.color}` } as React.CSSProperties}>
            {rank.tier}
          </text>
        </g>
      )}

      {/* Top accent line */}
      <line x1="35" y1="18" x2="65" y2="18" stroke={rank.color} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

export default function RankBadge({ rank, size = "md", showLabel = false, animate = true }: RankBadgeProps) {
  const s = SIZE_MAP[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        whileHover={animate ? { scale: 1.15, y: -3 } : undefined}
        transition={animate ? { type: "spring", stiffness: 400, damping: 15 } : undefined}
        className="relative"
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-2 rounded-full opacity-50 blur-md"
          style={{ background: `radial-gradient(circle, ${rank.glow}, transparent)` }}
        />
        <ShieldSVG rank={rank} size={size} />
      </motion.div>
      {showLabel && (
        <span
          className={`${s.label} font-mono font-black tracking-wider uppercase`}
          style={{ color: rank.color, textShadow: `0 0 8px ${rank.glow}` }}
        >
          {rank.label}
        </span>
      )}
    </div>
  );
}

export function RankPill({ rank }: { rank: RankInfo }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold"
      style={{
        background: `${rank.color}15`,
        border: `1px solid ${rank.color}40`,
        color: rank.color,
      }}
    >
      <span className="text-xs">{rank.icon}</span>
      <span className="tracking-wider uppercase">{rank.label}</span>
    </div>
  );
}
