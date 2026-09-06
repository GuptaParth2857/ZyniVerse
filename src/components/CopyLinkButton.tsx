"use client";

import { useState } from "react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <button onClick={copy}
      className={`rounded-lg px-4 py-2 text-xs font-bold text-black transition-all hover:scale-105 ${copied ? "bg-emerald-400" : ""}`}
      style={{ background: copied ? undefined : "var(--color-cyan)" }}>
      {copied ? "✓ Copied!" : "Copy Link"}
    </button>
  );
}