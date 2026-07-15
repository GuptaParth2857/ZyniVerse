"use client";

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

const CONDITION_COLORS: Record<string, string> = {
  new: "bg-emerald-500/20 text-emerald-400",
  opened: "bg-cyan-500/20 text-cyan-400",
  damaged: "bg-pink-500/20 text-pink-400",
};

export default function FigureCard({
  figure,
  onEdit,
  onDelete,
}: {
  figure: Figure;
  onEdit: (f: Figure) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors">
      {figure.image && (
        <img
          src={figure.image}
          alt={figure.name}
          className="w-full h-40 rounded-lg object-cover mb-3"
        />
      )}
      <h4 className="text-sm font-semibold text-white/90 mb-1">{figure.name}</h4>
      {figure.anime && <p className="text-xs text-white/50 mb-1">{figure.anime}</p>}
      <div className="flex flex-wrap gap-2 mb-2">
        {figure.manufacturer && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
            {figure.manufacturer}
          </span>
        )}
        {figure.scale && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
            {figure.scale}
          </span>
        )}
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${CONDITION_COLORS[figure.condition] || "bg-white/10 text-white/60"}`}>
          {figure.condition}
        </span>
        {figure.isForSale && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
            For Sale
          </span>
        )}
      </div>
      {figure.price != null && (
        <p className="text-sm font-bold text-white/80 mb-2">
          {figure.currency === "INR" ? "₹" : "$"}{figure.price.toLocaleString()}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(figure)}
          className="flex-1 py-1.5 text-xs bg-white/5 text-white/60 rounded-lg hover:bg-white/10"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(figure.id)}
          className="py-1.5 px-3 text-xs bg-pink-500/10 text-pink-400 rounded-lg hover:bg-pink-500/20"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
