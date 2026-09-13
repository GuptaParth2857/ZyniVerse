"use client";

import { useEffect, useState } from "react";

type DeferredPrompt = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<DeferredPrompt | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const onInstall = (e: Event) => {
      e.preventDefault();
      setPrompt(e as unknown as DeferredPrompt);
    };
    const onInstalled = () => setPrompt(null);

    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!prompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full neon-rgb-border bg-[var(--color-panel)]/95 p-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur">
      <button
        onClick={async () => {
          setPrompt(null);
          await prompt.prompt();
        }}
        className="text-sm font-bold text-white hover:text-[var(--color-cyan)]"
      >
        Add ZyniVerse to your screen
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss install prompt"
        className="rounded-full px-2 py-1 text-xs font-bold text-[var(--color-mute)] hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}