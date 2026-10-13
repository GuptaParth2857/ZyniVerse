"use client";

import { useState } from "react";

export default function ReelShare({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — nothing more we can do
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-full neon-rgb-border px-4 py-2 text-xs font-semibold text-[var(--color-magenta)] transition-colors hover:border-[var(--color-magenta)]"
    >
      {copied ? "Link copied ✓" : "Share / Copy link"}
    </button>
  );
}
