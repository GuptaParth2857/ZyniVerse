"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AiringAlertButton({
  mediaId,
  nextAiringEpisode,
}: {
  mediaId: number;
  nextAiringEpisode: { airingAt: number; episode: number; timeUntilAiring: number } | null;
}) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/alerts")
      .then(async (res) => {
        if (res.status === 401) {
          if (alive) setSignedIn(false);
          return;
        }
        const data = await res.json();
        if (!alive) return;
        setSignedIn(true);
        const ep = nextAiringEpisode?.episode;
        if (ep && Array.isArray(data.alerts)) {
          setActive(data.alerts.some((a: { mediaId: number; episode: number; airingAt: string }) =>
            a.mediaId === mediaId && a.episode === ep && new Date(a.airingAt).getTime() > Date.now()
          ));
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [mediaId, nextAiringEpisode?.episode]);

  const toggle = useCallback(async () => {
    const ep = nextAiringEpisode?.episode;
    if (!ep) return;
    setBusy(true);
    try {
      const res = await fetch("/api/alerts", {
        method: active ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          active
            ? { mediaId, episode: ep }
            : { mediaId, episode: ep, airingAt: new Date(nextAiringEpisode!.airingAt * 1000).toISOString() }
        ),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (res.ok) setActive(!active && (data.success !== false || data.alert));
    } finally {
      setBusy(false);
    }
  }, [active, mediaId, nextAiringEpisode, router]);

  if (!nextAiringEpisode) return null;
  const ep = nextAiringEpisode.episode;

  if (signedIn === null) {
    return <span className="inline-flex h-8 w-12 animate-pulse rounded-full bg-white/10" aria-hidden />;
  }

  if (!signedIn) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-4 py-1.5 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20"
      >
        🔔 Sign in for Ep {ep} alert
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${
        active
          ? "bg-[var(--color-magenta)] text-black shadow-[0_0_16px_-4px_var(--color-magenta)]"
          : "neon-rgb-border bg-white/5 text-white hover:bg-[var(--color-magenta)]/10 hover:text-[var(--color-magenta)]"
      }`}
    >
      {active ? `🔔 Alert set for Ep ${ep} ✓` : `🔔 Notify me on Ep ${ep}`}
    </button>
  );
}