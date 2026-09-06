"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AccountDataManager() {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    setBusy("export");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/export");
      const blob = await res.blob();
      if (!res.ok) throw new Error("Export failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zyniverse-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("Data export downloaded ✅");
    } catch {
      setError("Export failed, please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (deleteText !== "DELETE") return;
    setBusy("delete");
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Deletion failed");
      setDeleted(true);
      await signOut({ callbackUrl: "/", redirect: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deletion failed");
    } finally {
      setBusy(null);
    }
  }

  if (deleted) {
    return <p className="text-sm text-[var(--color-mute)]">Account deleted. Redirecting…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      {message && <p className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">{message}</p>}

      <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <h3 className="font-display font-bold">Download my data</h3>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          Watchlist, progress, reviews, moments, reels, achievements aur bahut kuch — sab ek JSON file mein.
        </p>
        <button
          onClick={handleExport}
          disabled={busy === "export"}
          className="mt-3 rounded-full neon-rgb-border px-5 py-2 text-sm font-semibold disabled:opacity-40"
        >
          {busy === "export" ? "Preparing…" : "⬇ Export Data"}
        </button>
      </section>

      <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <h3 className="font-display font-bold text-red-400">Delete my account</h3>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          Yeh permanent hai. Saara data, lists, reviews, achievements — sab delete ho jayega. Isse wapas nahi la sakte.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder='Type "DELETE" to confirm'
            className="rounded-lg border border-[var(--color-line)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-red-400/50"
          />
          <button
            onClick={handleDelete}
            disabled={deleteText !== "DELETE" || busy === "delete"}
            className="rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === "delete" ? "Deleting…" : "Delete Forever"}
          </button>
        </div>
      </section>
    </div>
  );
}
