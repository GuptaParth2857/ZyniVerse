"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const REASONS = [
  "inappropriate",
  "spam",
  "harassment",
  "copyright",
  "misinformation",
  "spoiler",
  "other",
];

export function ReportButton({
  contentType,
  contentId,
  authorId,
  label = "Report",
}: {
  contentType: string;
  contentId: string;
  authorId?: string;
  label?: string;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  const submit = useCallback(
    async (reason: string) => {
      if (!session?.user) {
        setStatus("error");
        return;
      }
      setStatus("submitting");
      try {
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType, contentId, authorId, reason, note }),
        });
        if (res.ok) {
          setStatus("done");
        } else {
          const data = await res.json().catch(() => null);
          setStatus(data?.error === "Already reported" ? "done" : "error");
        }
      } catch {
        setStatus("error");
      }
    },
    [contentType, contentId, authorId, note, session]
  );

  if (status === "done") {
    return (
      <span className="inline-block text-xs text-green-400">Reported. Thanks!</span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] transition-colors hover:text-red-400"
        title={label}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        {label}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            className="fixed left-1/2 top-1/2 z-[100] w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-black text-[var(--color-ink)]">
                Report this
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {!session?.user && (
              <p className="mb-3 rounded-lg bg-[var(--color-amber)]/10 p-3 text-xs text-[var(--color-ink)]">
                Please <Link href="/login" className="font-bold underline">log in</Link> to report.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={status === "submitting" || !session?.user}
                  onClick={() => void submit(r)}
                  className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs text-[var(--color-ink)] transition-colors hover:border-red-400 hover:text-red-400 disabled:opacity-50"
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add details (optional)"
              className="glass-input mt-3 w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
              rows={3}
            />

            {status === "error" && (
              <p className="mt-2 text-xs text-red-400">
                Could not submit. Please try again.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}