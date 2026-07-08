"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import WikiEditor from "@/components/WikiEditor";

export default function WikiCreatePageClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      {error && (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>
        </div>
      )}
      <WikiEditor onSave={handleSave} />
      {saving && (
        <div className="fixed bottom-8 right-8 rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-sm font-bold text-black shadow-lg">
          Creating...
        </div>
      )}
    </div>
  );
}
