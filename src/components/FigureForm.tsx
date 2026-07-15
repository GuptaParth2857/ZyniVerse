"use client";

import { useState } from "react";

interface FigureInput {
  name: string;
  anime: string;
  manufacturer: string;
  scale: string;
  price: string;
  currency: string;
  purchaseDate: string;
  image: string;
  condition: string;
  isForSale: boolean;
}

export default function FigureForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<FigureInput> & { id?: string };
  onSubmit: (data: FigureInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FigureInput>({
    name: initial?.name || "",
    anime: initial?.anime || "",
    manufacturer: initial?.manufacturer || "",
    scale: initial?.scale || "",
    price: initial?.price || "",
    currency: initial?.currency || "INR",
    purchaseDate: initial?.purchaseDate || "",
    image: initial?.image || "",
    condition: initial?.condition || "new",
    isForSale: initial?.isForSale || false,
  });

  const update = (key: keyof FigureInput, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#12111e] border border-white/10 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-4">
          {initial?.id ? "Edit Figure" : "Add Figure"}
        </h3>
        {[
          { key: "name", label: "Name *", placeholder: "Nendoroid Rem" },
          { key: "anime", label: "Anime", placeholder: "Re:Zero" },
          { key: "manufacturer", label: "Manufacturer", placeholder: "Good Smile Company" },
          { key: "scale", label: "Scale", placeholder: "1/7, Nendoroid, Figma..." },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="mb-3">
            <label className="text-xs text-white/40 mb-1 block">{label}</label>
            <input
              value={String(form[key as keyof FigureInput] || "")}
              onChange={(e) => update(key as keyof FigureInput, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs text-white/40 mb-1 block">Image URL</label>
          <input
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => update("condition", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
            >
              <option value="new">New</option>
              <option value="opened">Opened</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          <label className="flex items-center gap-2 mt-5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isForSale}
              onChange={(e) => update("isForSale", e.target.checked)}
            />
            <span className="text-xs text-white/60">For Sale</span>
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs text-white/60 hover:text-white/80">
            Cancel
          </button>
          <button
            onClick={() => form.name && onSubmit(form)}
            disabled={!form.name}
            className="px-4 py-2 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 disabled:opacity-30"
          >
            {initial?.id ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
