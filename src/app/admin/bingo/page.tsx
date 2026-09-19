"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parsePool, type BingoPoolItem } from "@/lib/bingo";

const PALETTE = ["#ff3366", "#00ffff", "#ffd700", "#8a2be2", "#00ff7c"];

interface Template {
  id: string;
  title: string;
  emoji: string;
  description: string | null;
  squares: string;
  isActive: boolean;
  isFeatured: boolean;
  usesCount: number;
  createdAt: string;
  updatedAt: string;
  creator?: { username: string | null; email: string | null };
}

const EMPTY: { title: string; emoji: string; description: string; squares: BingoPoolItem[] } = {
  title: "",
  emoji: "🎱",
  description: "",
  squares: [],
};

function TemplatePreview({ pool }: { pool: BingoPoolItem[] }) {
  const preview = [...pool].slice(0, 24);
  return (
    <div className="grid grid-cols-5 gap-1">
      {Array.from({ length: 25 }).map((_, i) => {
        const item = i === 12 ? null : preview[i > 12 ? i - 1 : i];
        return (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-md border border-white/[0.07] px-0.5 text-center text-[7px] font-bold leading-tight"
            style={{ background: item ? `${item.color}10` : "rgba(0,0,0,0.2)", borderColor: item ? `${item.color}22` : undefined, color: item ? item.color : "#ffd700" }}
          >
            {item ? item.text.slice(0, 14) : "★"}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminBingoPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bingo/templates");
      if (res.ok) {
        const d = await res.json();
        setTemplates(d.templates || []);
      } else {
        setTemplates([]);
        setMessage("Failed to load templates (admin only).");
      }
    } catch {
      setTemplates([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const flash = (m: string) => {
    setMessage(m);
    setTimeout(() => setMessage(""), 3000);
  };

  const save = async () => {
    if (form.squares.length < 24) {
      flash(`Need at least 24 squares — you have ${form.squares.length}.`);
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, squares: form.squares };
      const res = await fetch(
        editingId ? `/api/admin/bingo/templates/${editingId}` : "/api/admin/bingo/templates",
        { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const d = await res.json();
      if (res.ok) {
        flash(editingId ? "Template updated ✓" : "Template created ✓");
        setForm(EMPTY);
        setEditingId(null);
        load();
      } else {
        flash(d?.error || "Save failed.");
      }
    } catch {
      flash("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (t: Template) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      emoji: t.emoji,
      description: t.description || "",
      squares: parsePool(t.squares),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggle = async (t: Template, field: "isActive" | "isFeatured") => {
    try {
      await fetch(`/api/admin/bingo/templates/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !t[field] }),
      });
      load();
    } catch {
      // ignore
    }
  };

  const remove = async (t: Template) => {
    if (!confirm(`Delete template "${t.title}"?`)) return;
    try {
      await fetch(`/api/admin/bingo/templates/${t.id}`, { method: "DELETE" });
      load();
    } catch {
      // ignore
    }
  };

  const addSquare = (text: string, category: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      flash("Square is empty.");
      return;
    }
    setForm((f) => {
      if (f.squares.some((s) => s.text.toLowerCase() === trimmed.toLowerCase())) {
        flash("Square already exists.");
        return f;
      }
      const colors = PALETTE.filter((c) => !f.squares.some((s) => s.color === c));
      return {
        ...f,
        squares: [...f.squares, { text: trimmed, category: category.trim() || "Challenge", color: colors[0] || PALETTE[f.squares.length % PALETTE.length] }],
      };
    });
  };

  const newSquare = () => {
    setForm((f) => ({ ...f, squares: [...f.squares, { text: "", category: "Challenge", color: PALETTE[f.squares.length % PALETTE.length] }] }));
  };

  const updateItem = (i: number, patch: Partial<BingoPoolItem>) => {
    setForm((f) => ({ ...f, squares: f.squares.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  };

  const removeItem = (i: number) => {
    setForm((f) => ({ ...f, squares: f.squares.filter((_, j) => j !== i) }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin · Bingo</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">Bingo Templates</h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Curated card pools users can play. Each template needs at least 24 squares (+ FREE space).
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2.5 text-sm text-[var(--color-cyan)]">
          {message}
        </div>
      )}

      {/* Editor */}
      <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">{editingId ? "✏️ Edit Template" : "✨ Create Template"}</h2>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setForm(EMPTY); }}
              className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs text-[var(--color-mute)] transition hover:text-white"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Winter 2026 Anime Challenge"
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#00ffff]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Emoji</label>
              <input
                value={form.emoji}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#00ffff]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short blurb shown to players"
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#00ffff]/50"
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-[#00ffff] to-[#ff3366] px-6 py-2.5 text-sm font-black uppercase tracking-wider text-black transition-all hover:brightness-110 disabled:opacity-40"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </motion.button>
          </div>
        </div>

        {form.squares.length > 0 && (
          <div className="mt-4 max-w-xs">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Live Preview ({form.squares.length} squares)</p>
            <TemplatePreview pool={form.squares} />
          </div>
        )}

        {/* Squares editor */}
        <div className="mt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">
              Square Pool — {form.squares.length}/24 minimum
            </p>
            <button onClick={newSquare} className="rounded-lg border border-[#00ffff]/30 bg-[#00ffff]/10 px-3 py-1.5 text-xs font-bold text-[#00ffff] transition hover:bg-[#00ffff]/20">
              + Add Square
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {form.squares.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/[0.12] p-8 text-center text-sm text-[var(--color-mute)] sm:col-span-2 lg:col-span-3">
                  No squares yet — add your challenges.
                </div>
              )}
              {form.squares.map((s, i) => (
                <motion.div
                  key={`${s.text}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/20 p-2"
                  style={{ borderLeft: `3px solid ${s.color}` }}
                >
                  <input
                    value={s.text}
                    placeholder="Square label"
                    onChange={(e) => updateItem(i, { text: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00ffff]/40"
                  />
                  <input
                    value={s.category}
                    placeholder="Category"
                    onChange={(e) => updateItem(i, { category: e.target.value })}
                    className="w-20 rounded-lg border border-white/[0.06] bg-black/30 px-2 py-1.5 text-[10px] text-white outline-none focus:border-[#00ffff]/40 sm:w-24"
                  />
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => updateItem(i, { color: e.target.value })}
                    className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-white/[0.1] bg-transparent"
                    title="Square color"
                  />
                  <button onClick={() => removeItem(i)} className="shrink-0 rounded-lg px-1.5 py-1 text-xs text-[var(--color-mute)] transition hover:text-[#ff5050]">
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Bingeworthy", "Community", "Discovery", "Fun", "90s Classic", "Sports"].map((label) => (
              <button
                key={label}
                onClick={() => addSquare(label, label)}
                className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--color-mute)] transition hover:border-[#00ffff]/30 hover:text-[#00ffff]"
              >
                + {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template list */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold mb-4">Existing Templates</h2>
        {templates === null ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-10 text-center">
            <div className="text-4xl mb-2">🎱</div>
            <p className="text-sm text-[var(--color-mute)]">No templates yet — create your first one above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((t) => {
              const pool = parsePool(t.squares);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-ink)]">
                        <span className="mr-1">{t.emoji}</span>{t.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-[var(--color-mute)]">
                        {pool.length} squares · {t.usesCount} plays · {t.creator?.username ? `by ${t.creator.username}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <button
                        onClick={() => toggle(t, "isActive")}
                        className={`rounded-md px-2 py-1 text-[10px] font-bold ${t.isActive ? "bg-[#00ff7c]/20 text-[#00ff7c]" : "bg-white/5 text-[var(--color-mute)]"}`}
                      >
                        {t.isActive ? "● Live" : "○ Hidden"}
                      </button>
                      <button
                        onClick={() => toggle(t, "isFeatured")}
                        className={`rounded-md px-2 py-1 text-[10px] font-bold ${t.isFeatured ? "bg-[#ffd700]/20 text-[#ffd700]" : "bg-white/5 text-[var(--color-mute)]"}`}
                      >
                        {t.isFeatured ? "★ Featured" : "☆ Feature"}
                      </button>
                      <button onClick={() => edit(t)} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-[var(--color-mute)] transition hover:text-[#00ffff]">
                        Edit
                      </button>
                      <button onClick={() => remove(t)} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-[var(--color-mute)] transition hover:text-[#ff5050]">
                        Del
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 max-w-xs">
                    <TemplatePreview pool={pool} />
                  </div>
                  {t.description && <p className="mt-2 text-[11px] text-[var(--color-mute)]">“{t.description}”</p>}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}