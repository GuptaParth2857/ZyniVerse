"use client";

import { useState } from "react";
import { amazonProductUrl, AMAZON_TAG } from "@/lib/affiliate-config";

function extractAsin(input: string): string | null {
  const trimmed = input.trim();
  const clean = trimmed.split(/[?#]/)[0];
  const direct = clean.match(/\/dp\/([A-Z0-9]{10})/i) || clean.match(/\/(gp\/aw\/d|product)\/([A-Z0-9]{10})/i);
  if (direct) return (direct[1]?.length === 10 ? direct[1] : direct[2]).toUpperCase();
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) return trimmed.toUpperCase();
  const fromQuery = trimmed.match(/[?&]asin=([A-Z0-9]{10})/i);
  if (fromQuery) return fromQuery[1].toUpperCase();
  return null;
}

export default function AdminAffiliatePage() {
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [anime, setAnime] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const asin = extractAsin(input);
  const link = asin ? amazonProductUrl(asin) : "";

  const entrySnippet = asin
    ? `{
  id: "${(anime || "anime").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${asin.toLowerCase()}",
  name: "${name || "New Product"}",
  image: "https://m.media-amazon.com/images/PASTE_IMAGE_URL.jpg",
  price: "${price || "₹0"}",
  originalPrice: "${originalPrice || undefined}",
  affiliateUrl: amazonUrl("${asin}"),
  platform: "Amazon",
  category: "Figurines",
  rating: 4.5,
  reviews: 0,
  tags: ["${anime || "Anime"}", "Figurine"],
  anime: "${anime || "Anime"}",
},`
    : "";

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin</p>
      <h1 className="font-display text-3xl font-bold mt-1">Affiliate Link Tool</h1>
      <p className="mt-1 text-sm text-[var(--color-mute)]">
        Amazon product URL ya ASIN paste karo — clean affiliate link turant banta hai. Tag: <span className="text-[var(--color-cyan)]">{AMAZON_TAG}</span>
      </p>

      <div className="mt-8 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-mute)]">Product URL or ASIN</label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://www.amazon.in/dp/B0DV4GRN9Q/... ya B0DV4GRN9Q"
          className="mt-2 w-full rounded-lg bg-[var(--color-surface1)] px-4 py-3 text-sm text-[var(--color-text)] border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]"
        />
        {input && !asin && (
          <p className="mt-2 text-xs text-red-400">ASIN nahi mila. Amazon.in product page ka URL paste karo (URL me /dp/ASIN/ hona chahiye).</p>
        )}
        {asin && (
          <div className="mt-3 rounded-lg bg-[var(--color-surface1)] px-4 py-3 text-sm">
            <span className="text-[var(--color-mute)]">ASIN: </span>
            <span className="font-mono font-bold text-[var(--color-cyan)]">{asin}</span>
          </div>
        )}
      </div>

      {link && (
        <div className="mt-6 rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-cyan)]">Clean Affiliate Link</h2>
            <button
              onClick={() => copy(link, "link")}
              className="rounded-lg bg-[var(--color-cyan)]/20 px-3 py-1.5 text-xs font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/30 transition-colors"
            >
              {copied === "link" ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <p className="break-all font-mono text-xs text-[var(--color-text)]">{link}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Product Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FowWelt Tanjiro Figure 16CM"
                className="mt-1 w-full rounded-lg bg-[var(--color-surface1)] px-3 py-2 text-sm border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Anime</label>
              <input value={anime} onChange={(e) => setAnime(e.target.value)} placeholder="e.g. Demon Slayer"
                className="mt-1 w-full rounded-lg bg-[var(--color-surface1)] px-3 py-2 text-sm border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Price (₹)</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="₹2,499"
                className="mt-1 w-full rounded-lg bg-[var(--color-surface1)] px-3 py-2 text-sm border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)]">Original Price (optional)</label>
              <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="₹3,999"
                className="mt-1 w-full rounded-lg bg-[var(--color-surface1)] px-3 py-2 text-sm border border-[var(--color-line)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]" />
            </div>
          </div>

          {name && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">MerchStore.tsx Entry (copy-paste ready)</h3>
                <button
                  onClick={() => copy(entrySnippet, "entry")}
                  className="rounded-lg bg-[var(--color-magenta)]/20 px-3 py-1.5 text-xs font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30 transition-colors"
                >
                  {copied === "entry" ? "Copied!" : "Copy Entry"}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-[11px] leading-relaxed text-green-400">{entrySnippet}</pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <h3 className="text-sm font-semibold">Quick Tips</h3>
        <ul className="mt-3 space-y-2 text-xs text-[var(--color-mute)]">
          <li>• ASIN sirf amazon.in product pages pe milta hai — URL me <span className="font-mono text-[var(--color-cyan)]">/dp/XXXXXX</span> wala part.</li>
          <li>• Search results me bhi har product ka link ASIN contain karta hai — product page kholne ki zaroorat nahi.</li>
          <li>• Image URL ke liye product page pe image pe right-click → &ldquo;Copy image link&rdquo; karo.</li>
          <li>• Entry copy karke <span className="font-mono">src/components/MerchStore.tsx</span> ke <span className="font-mono">MERCH_ITEMS</span> array me paste karo.</li>
        </ul>
      </div>
    </div>
  );
}
