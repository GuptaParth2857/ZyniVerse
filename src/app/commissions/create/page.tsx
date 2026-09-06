"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const CATEGORIES = [
  { value: "fanart", label: "Fan Art", icon: "🎨" },
  { value: "cosplay", label: "Cosplay", icon: "📸" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "editing", label: "Editing", icon: "✂️" },
  { value: "other", label: "Other", icon: "✨" },
];

const TURNAROUNDS = ["1-3 days", "3-5 days", "1 week", "2 weeks", "1 month"];

export default function CreateCommissionPage() {
  const router = useRouter();
  const { status } = useSession();

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "fanart",
    priceMin: "",
    priceMax: "",
    turnaround: "3-5 days",
  });
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [portfolioInput, setPortfolioInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addPortfolio = () => {
    const url = portfolioInput.trim();
    if (!url) return;
    setPortfolio((p) => [...p, url]);
    setPortfolioInput("");
  };

  const removePortfolio = (index: number) => {
    setPortfolio((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl || null,
          category: form.category,
          priceMin: form.priceMin ? Number(form.priceMin) : null,
          priceMax: form.priceMax ? Number(form.priceMax) : null,
          turnaround: form.turnaround,
          portfolio,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");

      router.push(`/commissions/${data.commission.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Sign in Required</h1>
          <p className="text-[var(--color-mute)] mb-6">You need to be logged in to create a commission listing.</p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black"
          >
            Sign In
          </button>
        </div>
      </PageTransition>
    );
  }

  const priceMin = form.priceMin ? Number(form.priceMin) : null;
  const priceMax = form.priceMax ? Number(form.priceMax) : null;
  const displayImage = form.imageUrl || portfolio[0];

  return (
    <PageTransition>
      <ErrorBoundary label="Create Commission">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)] mb-2">Commission</p>
            <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
              Create Your Listing
            </h1>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Showcase your skills and start accepting commissions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Anime Portrait Commission"
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what you offer, your style, and what clients can expect..."
                  rows={4}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-[var(--color-cyan)] transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Cover Image URL</label>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Category *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: c.value }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        form.category === c.value
                          ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] border border-[var(--color-magenta)]/30"
                          : "bg-white/5 text-white/40 border border-white/[0.06] hover:border-white/[0.14]"
                      }`}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Price Range (INR)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="priceMin"
                    value={form.priceMin}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    placeholder="Min ₹"
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                  <input
                    name="priceMax"
                    value={form.priceMax}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    placeholder="Max ₹"
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Turnaround Time</label>
                <select
                  name="turnaround"
                  value={form.turnaround}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-cyan)] transition-colors cursor-pointer"
                >
                  {TURNAROUNDS.map((t) => (
                    <option key={t} value={t} className="bg-[var(--color-panel)]">{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Portfolio Images (URLs)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={portfolioInput}
                    onChange={(e) => setPortfolioInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPortfolio(); } }}
                    placeholder="https://example.com/art.jpg"
                    className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addPortfolio}
                    className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-4 py-2.5 text-sm font-bold text-black"
                  >
                    Add
                  </button>
                </div>
                {portfolio.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {portfolio.map((img, i) => (
                      <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10 group/p">
                        <Image src={img} alt={`Portfolio ${i + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removePortfolio(i)}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 group-hover/p:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !form.title.trim() || !form.description.trim()}
                className="w-full rounded-xl py-3.5 text-sm font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)]"
              >
                {submitting ? "Creating..." : "Create Listing"}
              </button>
            </form>

            <div className="lg:sticky lg:top-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-mute)] mb-3">Preview</p>
              <div className="card-glow overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0a14]">
                  {displayImage ? (
                    <Image src={displayImage} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-violet)]/20 to-[var(--color-magenta)]/20">
                      <span className="text-5xl opacity-60">🎨</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />
                  <span className="glass-badge absolute left-2.5 top-2.5">
                    {CATEGORIES.find((c) => c.value === form.category)?.icon}{" "}
                    {CATEGORIES.find((c) => c.value === form.category)?.label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold">{form.title || "Your Commission Title"}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--color-mute)]">
                    {form.description || "Your description will appear here..."}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {priceMin != null && (
                      <span className="rounded-lg bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                        ₹{priceMin.toLocaleString("en-IN")}{priceMax != null ? ` - ₹${priceMax.toLocaleString("en-IN")}` : "+"}
                      </span>
                    )}
                    <span className="rounded-lg bg-[var(--color-cyan)]/10 px-3 py-1 text-xs text-[var(--color-cyan)]">
                      {form.turnaround}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-mute)]">Portfolio Preview</p>
                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {portfolio.slice(0, 6).map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                        <Image src={img} alt="Portfolio" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-mute)]/60">Add portfolio images to show off your work</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
