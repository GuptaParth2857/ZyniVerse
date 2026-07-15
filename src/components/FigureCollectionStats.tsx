"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalFigures: number;
  totalValue: number;
  currency: string;
  byAnime: { anime: string; count: number }[];
  byCondition: { condition: string; count: number }[];
  byManufacturer: { manufacturer: string; count: number }[];
  recentAdditions: number;
}

export default function FigureCollectionStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/figures/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats || stats.totalFigures === 0) return null;

  const currencySymbol = stats.currency === "INR" ? "₹" : stats.currency === "JPY" ? "¥" : "$";

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <h3 className="text-sm font-bold text-white/90 mb-3">Collection Stats</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/5 text-center">
          <div className="text-xl font-bold text-cyan-400">{stats.totalFigures}</div>
          <div className="text-[10px] text-white/40">Total Figures</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 text-center">
          <div className="text-xl font-bold text-emerald-400">
            {currencySymbol}{stats.totalValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-white/40">Total Value</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 text-center">
          <div className="text-xl font-bold text-amber-400">{stats.recentAdditions}</div>
          <div className="text-[10px] text-white/40">Last 30 Days</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 text-center">
          <div className="text-xl font-bold text-violet-400">{stats.byAnime.length}</div>
          <div className="text-[10px] text-white/40">Anime Covered</div>
        </div>
      </div>
      {stats.byAnime.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs text-white/50 mb-2">Top Anime</h4>
          <div className="flex flex-wrap gap-2">
            {stats.byAnime.slice(0, 5).map((a) => (
              <span key={a.anime} className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/60">
                {a.anime} ({a.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
