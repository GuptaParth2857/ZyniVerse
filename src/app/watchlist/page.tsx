"use client";

import { useState } from "react";
import Image from "next/image";
import { useWatchlist } from "@/components/WatchlistProvider";
import { DynamicWatchlistCarousel3D as WatchlistCarousel3D } from "@/components/lazy";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import NativeBannerAd from "@/components/NativeBannerAd";

type ListStatus = "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REWATCHING";

const STATUS_OPTIONS: { label: string; value: ListStatus }[] = [
  { label: "Currently Watching", value: "CURRENT" },
  { label: "Plan to Watch", value: "PLANNING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "On Hold", value: "PAUSED" },
  { label: "Dropped", value: "DROPPED" },
  { label: "Rewatching", value: "REWATCHING" },
];

export default function WatchlistPage() {
  const { items, setStatus } = useWatchlist();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ListStatus>("COMPLETED");
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  const applyBulkStatus = () => {
    for (const id of selected) {
      setStatus(id, bulkStatus);
    }
    setSelected(new Set());
  };

  const handleExport = async (format: "csv" | "json") => {
    setExporting(true);
    try {
      const res = await fetch(`/api/watchlist/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zyniverse-watchlist-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    }
    setExporting(false);
  };

  return (
    <PageTransition><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">{/* Saved */}</p>
      <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">My List</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--color-mute)]">
        Saved items are synced to your account when logged in.
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon="box"
          title="Your list is empty."
          description="Saved items are synced to your account when logged in."
          actionLabel="Explore Anime"
          actionHref="/search"
        />
      ) : (
        <>
          {/* Action Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-sm text-[var(--color-mute)]">{items.length} saved</span>

            <div className="flex items-center gap-2 ml-auto">
              {/* Export buttons */}
              <button
                onClick={() => handleExport("csv")}
                disabled={exporting}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all disabled:opacity-50"
              >
                {exporting ? "..." : "Export CSV"}
              </button>
              <button
                onClick={() => handleExport("json")}
                disabled={exporting}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all disabled:opacity-50"
              >
                {exporting ? "..." : "Export JSON"}
              </button>

              {/* Mass edit toggle */}
              <button
                onClick={() => {
                  setShowBulkToolbar(!showBulkToolbar);
                  if (showBulkToolbar) setSelected(new Set());
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  showBulkToolbar
                    ? "bg-[var(--color-magenta)] text-black"
                    : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-text)] hover:border-[var(--color-magenta)]"
                }`}
              >
                {showBulkToolbar ? "Cancel Edit" : "Bulk Edit"}
              </button>
            </div>
          </div>

          {/* Bulk Edit Toolbar */}
          {showBulkToolbar && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-magenta)]/30 bg-[var(--color-panel)] p-3 animate-slide-in-down">
              <button onClick={selectAll} className="rounded-lg bg-[var(--color-line)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-line)]/70 transition-all">
                {selected.size === items.length ? "Deselect All" : "Select All"}
              </button>
              <span className="text-xs text-[var(--color-mute)]">{selected.size} selected</span>

              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as ListStatus)}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-1.5 text-xs text-[var(--color-text)] outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <button
                onClick={applyBulkStatus}
                disabled={selected.size === 0}
                className="rounded-lg px-4 py-1.5 text-xs font-bold text-black transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                style={{ background: "var(--color-magenta)" }}
              >
                Apply to {selected.size}
              </button>
            </div>
          )}

          {/* Watchlist */}
          <div className="mt-6">
            {showBulkToolbar ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const isSelected = selected.has(item.id);
                  const title = item.title.english || item.title.romaji || `Anime #${item.id}`;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/10"
                          : "border-[var(--color-line)] bg-[var(--color-panel)] hover:border-[var(--color-line)]/70"
                      }`}
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-line)]">
                        {item.coverImage?.large && <Image src={item.coverImage.large} alt="" width={40} height={56} className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{title}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]" : "border-[var(--color-line)]"}`}>
                        {isSelected && <span className="text-[10px] text-black font-bold">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <WatchlistCarousel3D items={items} />
            )}
          </div>
        </>
      )}
      <div className="mx-auto max-w-7xl pb-6 mt-8">
        <NativeBannerAd />
      </div>
    </div></PageTransition>
  );
}
