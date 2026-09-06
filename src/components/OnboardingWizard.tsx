"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_GENRES, ONBOARDING_MOODS, MAX_ONBOARDING_GENRES } from "@/lib/onboarding";

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleGenres(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < MAX_ONBOARDING_GENRES ? [...prev, g] : prev
    );
  }

  function toggleMoods(m: string) {
    setMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function submit(skip: boolean) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteGenres: genres, favoriteMoods: moods, skip }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error, try again");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Let&apos;s tune your <span className="text-[var(--color-magenta)]">ZyniVerse</span>
        </h1>
        <p className="mt-2 text-[var(--color-mute)]">
          Chuno kya pasand hai — recommendations har session mein tumhare taste ke hisaab se banengi.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-2">
        {[0, 1].map((i) => (
          <span key={i} className={`h-1.5 w-16 rounded-full transition-colors ${i <= step ? "bg-[var(--color-cyan)]" : "bg-[var(--color-line)]"}`} />
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      {step === 0 ? (
        <section className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
          <h2 className="mb-1 font-display text-lg font-bold">Favourite genres</h2>
          <p className="mb-4 text-sm text-[var(--color-mute)]">
            Pick {MAX_ONBOARDING_GENRES} (ya kam) genres — {genres.length}/{MAX_ONBOARDING_GENRES}
          </p>
          <div className="flex flex-wrap gap-2">
            {ONBOARDING_GENRES.map((g) => {
              const active = genres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenres(g)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    active
                      ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-cyan)]/40"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={genres.length === 0}
              className="rounded-full neon-rgb-border bg-[var(--color-cyan)]/15 px-6 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
          <h2 className="mb-1 font-display text-lg font-bold">Binge mood?</h2>
          <p className="mb-4 text-sm text-[var(--color-mute)]">Chuno kaunsa vibe chahiye (optional).</p>
          <div className="flex flex-wrap gap-2">
            {ONBOARDING_MOODS.map((m) => {
              const active = moods.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => toggleMoods(m)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    active
                      ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-magenta)]/40"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep(0)}
              className="rounded-full border border-[var(--color-line)] px-5 py-2 text-sm hover:border-[var(--color-cyan)]/40"
            >
              ← Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => submit(true)}
                disabled={loading}
                className="rounded-full border border-[var(--color-line)] px-5 py-2 text-sm disabled:opacity-40"
              >
                Skip
              </button>
              <button
                onClick={() => submit(false)}
                disabled={loading}
                className="rounded-full neon-rgb-border bg-[var(--color-magenta)]/15 px-6 py-2 text-sm font-semibold disabled:opacity-40"
              >
                {loading ? "Saving…" : "Finish ✨"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
