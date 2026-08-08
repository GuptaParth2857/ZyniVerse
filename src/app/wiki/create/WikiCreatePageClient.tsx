"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import WikiEditor from "@/components/WikiEditor";

export default function WikiCreatePageClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 2}deg) rotateX(${-py * 2}deg) scale(1.005)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Login Required</h1>
        <p className="text-sm text-[var(--color-mute)]">You need to be logged in to create wiki pages.</p>
      </div>
    );
  }

  const handleSave = async (data: { title: string; content: string; summary: string; category: string; tags: string }) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Failed to create page");
        setSaving(false);
        return;
      }
      router.push(`/wiki/${result.page.slug}`);
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  return (
    <div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="neon-premium rounded-[20px] mx-auto max-w-4xl"
        style={{ transition: "transform 0.2s ease-out" }}
      >
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-[20px] px-6 py-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] shadow-[0_0_10px_rgba(0,255,224,0.4)]" />
            <span className="rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-cyan)]">
              {saving ? "Publishing" : "New Wiki Page"}
            </span>
            <span className="ml-auto h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
          </div>
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>
          )}
          <WikiEditor onSave={handleSave} />
        </div>
      </motion.div>
      {saving && (
        <div className="fixed bottom-8 right-8 rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-sm font-bold text-black shadow-lg">
          Creating...
        </div>
      )}
    </div>
  );
}
