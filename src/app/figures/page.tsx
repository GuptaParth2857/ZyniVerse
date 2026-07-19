"use client";

import { useEffect, useState } from "react";
import FigureCard from "@/components/FigureCard";
import FigureForm from "@/components/FigureForm";
import FigureCollectionStats from "@/components/FigureCollectionStats";

interface Figure {
  id: string;
  name: string;
  anime: string | null;
  manufacturer: string | null;
  scale: string | null;
  price: number | null;
  currency: string;
  purchaseDate: string | null;
  image: string | null;
  condition: string;
  isForSale: boolean;
}

export default function FiguresPage() {
  const [figures, setFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editFigure, setEditFigure] = useState<Figure | null>(null);
  const [filter, setFilter] = useState("");

  const fetchFigures = async () => {
    try {
      const res = await fetch("/api/figures");
      const data = await res.json();
      setFigures(data.figures || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFigures(); }, []);

  const handleSubmit = async (data: { name: string; anime?: string; manufacturer?: string; scale?: string; price?: string; currency?: string; purchaseDate?: string; image?: string; condition?: string; isForSale?: boolean }) => {
    if (editFigure) {
      await fetch(`/api/figures/${editFigure.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/figures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setShowForm(false);
    setEditFigure(null);
    fetchFigures();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this figure?")) return;
    await fetch(`/api/figures/${id}`, { method: "DELETE" });
    fetchFigures();
  };

  const filtered = filter
    ? figures.filter((f) => f.anime?.toLowerCase().includes(filter.toLowerCase()) || f.name.toLowerCase().includes(filter.toLowerCase()))
    : figures;

  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Figure Collection
            </h1>
            <p className="text-sm text-white/40 mt-1">Track your anime figure collection</p>
          </div>
          <button
            onClick={() => { setEditFigure(null); setShowForm(true); }}
            className="px-4 py-2 text-sm bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 border border-cyan-500/30"
          >
            + Add Figure
          </button>
        </div>

        <FigureCollectionStats />

        <div className="mt-6 mb-4">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name or anime..."
            className="w-full max-w-md px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse h-64 bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg mb-2">No figures yet</p>
            <p className="text-white/20 text-sm">Add your first figure to start tracking your collection!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f) => (
              <FigureCard
                key={f.id}
                figure={f}
                onEdit={(fig) => { setEditFigure(fig); setShowForm(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {(showForm || editFigure) && (
          <FigureForm
            initial={editFigure ? {
              name: editFigure.name,
              anime: editFigure.anime ?? undefined,
              manufacturer: editFigure.manufacturer ?? undefined,
              scale: editFigure.scale ?? undefined,
              price: String(editFigure.price ?? ""),
              currency: editFigure.currency,
              purchaseDate: editFigure.purchaseDate ?? "",
              image: editFigure.image ?? undefined,
              condition: editFigure.condition,
              isForSale: editFigure.isForSale,
              id: editFigure.id,
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditFigure(null); }}
          />
        )}
      </div>
    </div>
  );
}
