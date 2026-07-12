"use client";

import { useEffect, useState } from "react";

interface ForumStatsData {
  totalThreads: number;
  totalMembers: number;
  postsToday: number;
  onlineCount: number;
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function ThreadsIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function MembersIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function PostsIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export default function ForumStats() {
  const [stats, setStats] = useState<ForumStatsData | null>(null);

  useEffect(() => {
    fetch("/api/forum/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const items = [
    { label: "Active Threads", value: stats ? formatCount(stats.totalThreads) : "—", icon: <ThreadsIcon color="#ff00ff" />, color: "#ff00ff", shadow: "rgba(255,0,255,0.5)" },
    { label: "Community Members", value: stats ? formatCount(stats.totalMembers) : "—", icon: <MembersIcon color="#00ffff" />, color: "#00ffff", shadow: "rgba(0,255,255,0.5)" },
    { label: "Posts Today", value: stats ? formatCount(stats.postsToday) : "—", icon: <PostsIcon color="#ff3366" />, color: "#ff3366", shadow: "rgba(255,51,102,0.5)" },
  ];

  return (
    <div className="mt-10 flex flex-wrap gap-6 sm:gap-10">
      {items.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3">
          <div className="neon-premium rounded-lg" style={{ width: 40, height: 40 }}>
            <div className="neon-premium-track rounded-lg" />
            <div className="neon-premium-overlay rounded-[6.5px]" />
            <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {stat.icon}
            </div>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "#fff", textShadow: `0 0 20px ${stat.shadow}` }}>{stat.value}</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "#666" }}>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
