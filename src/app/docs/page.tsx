"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    endpoint: null,
    content: (
      <>
        <p className="text-sm text-[var(--color-mute)] leading-relaxed">
          The ZyniVerse Public API provides programmatic access to anime filler guides, airing schedules,
          dub status information, and anime metadata. All endpoints return JSON and are accessible via
          standard HTTP GET requests with Bearer token authentication.
        </p>
        <p className="text-sm text-[var(--color-mute)] leading-relaxed mt-4">
          Base URL: <code className="rounded bg-[var(--color-panel)] px-2 py-0.5 text-[var(--color-cyan)]">https://zyniverse.vercel.app/api/v1</code>
        </p>
      </>
    ),
  },
  {
    id: "authentication",
    title: "Authentication",
    endpoint: null,
    content: (
      <>
        <p className="text-sm text-[var(--color-mute)] leading-relaxed">
          All API requests require a valid API key sent via the <code className="rounded bg-[var(--color-panel)] px-2 py-0.5 text-[var(--color-cyan)]">Authorization</code> header.
        </p>
        <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 mt-4">
          <p className="text-xs font-semibold mb-2">Request Header</p>
          <pre className="text-xs text-[var(--color-cyan)] overflow-x-auto">Authorization: Bearer zvn_abc123def456...</pre>
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold">Getting an API Key</h4>
          <ol className="list-decimal pl-5 text-sm text-[var(--color-mute)] space-y-1">
            <li>Create a free account at{" "}<Link href="/register" className="text-[var(--color-cyan)] hover:underline">/register</Link></li>
            <li>Go to your{" "}<Link href="/profile" className="text-[var(--color-cyan)] hover:underline">Profile → API Keys</Link></li>
            <li>Click &quot;Create API Key&quot; and copy the generated key</li>
            <li>Use it in the <code className="rounded bg-[var(--color-panel)] px-1 text-[var(--color-cyan)]">Authorization</code> header of every request</li>
          </ol>
        </div>
        <div className="mt-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
          <p className="text-xs font-semibold mb-2">Error Response (401 — Missing Key)</p>
          <pre className="text-xs text-[var(--color-mute)] overflow-x-auto">{JSON.stringify({ error: "Missing or invalid API key. Use header: Authorization: Bearer <key>" }, null, 2)}</pre>
        </div>
      </>
    ),
  },
  {
    id: "rate-limits",
    title: "Rate Limits & Tiers",
    endpoint: null,
    content: (
      <>
        <p className="text-sm text-[var(--color-mute)] leading-relaxed">
          Rate limits are enforced per API key on a daily rolling window. Limits reset at midnight UTC.
          Each tier also has a per-minute rate limit and a maximum number of keys per account.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)]">
                <th className="text-left py-2 pr-4 font-semibold">Tier</th>
                <th className="text-left py-2 pr-4 font-semibold">Requests / Day</th>
                <th className="text-left py-2 pr-4 font-semibold">Requests / Min</th>
                <th className="text-left py-2 pr-4 font-semibold">Max Keys</th>
                <th className="text-left py-2 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-mute)]">
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4">Free</td>
                <td className="py-2 pr-4">100</td>
                <td className="py-2 pr-4">10</td>
                <td className="py-2 pr-4">10</td>
                <td className="py-2">₹0</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4">Pro</td>
                <td className="py-2 pr-4">10,000</td>
                <td className="py-2 pr-4">100</td>
                <td className="py-2 pr-4">25</td>
                <td className="py-2">₹499/mo</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Enterprise</td>
                <td className="py-2 pr-4">100,000</td>
                <td className="py-2 pr-4">1,000</td>
                <td className="py-2 pr-4">100</td>
                <td className="py-2">₹4,999/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { name: "Free", price: "₹0", requests: "100/day", features: ["Basic endpoints", "Community support"] },
            { name: "Pro", price: "₹499/mo", requests: "10,000/day", features: ["All endpoints", "Priority support", "Usage analytics"] },
            { name: "Enterprise", price: "₹4,999/mo", requests: "100,000/day", features: ["SLA guarantee", "Dedicated support", "Custom integrations"] },
          ].map((tier) => (
            <motion.div key={tier.name} whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center transition-shadow hover:shadow-lg hover:border-[var(--color-cyan)]/30"
            >
              <h4 className="font-bold text-sm">{tier.name}</h4>
              <p className="text-lg font-bold font-mono text-[var(--color-magenta)] mt-1">{tier.price}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-1">{tier.requests}</p>
              <ul className="mt-2 space-y-1">
                {tier.features.map((f) => (
                  <li key={f} className="text-[10px] text-[var(--color-mute)]">✓ {f}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-[var(--color-mute)] mt-4">
          When you exceed your daily limit, the API returns a 429 response.{" "}
          <Link href="/premium" className="text-[var(--color-cyan)] hover:underline">Upgrade your plan →</Link>
        </p>
      </>
    ),
  },
  {
    id: "filler",
    title: "Filler Guide",
    endpoint: { method: "GET", path: "/api/v1/filler/:id" },
    content: (
      <>
        <div className="rounded-lg border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 p-4">
          <p className="text-xs font-semibold mb-1">
            <span className="text-green-400">GET</span>{" "}
            <span className="text-[var(--color-ink)]">/api/v1/filler/</span>
            <span className="text-[var(--color-cyan)]">:id</span>
          </p>
          <p className="text-xs text-[var(--color-mute)] mt-1">Get filler/episode guide for a specific anime by AniList ID.</p>
        </div>
        <div className="mt-4 space-y-1 text-sm text-[var(--color-mute)]">
          <p><span className="font-semibold text-[var(--color-ink)]">Path Parameters</span></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="text-left py-2 pr-4 font-semibold">Parameter</th>
                  <th className="text-left py-2 pr-4 font-semibold">Type</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-mute)]">
                <tr className="border-b border-[var(--color-line)]">
                  <td className="py-2 pr-4"><code className="text-[var(--color-cyan)]">id</code></td>
                  <td className="py-2 pr-4">number</td>
                  <td className="py-2">AniList media ID</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm text-[var(--color-mute)]">
          <p><span className="font-semibold text-[var(--color-ink)]">Query Parameters</span></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="text-left py-2 pr-4 font-semibold">Parameter</th>
                  <th className="text-left py-2 pr-4 font-semibold">Type</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-mute)]">
                <tr className="border-b border-[var(--color-line)]">
                  <td className="py-2 pr-4"><code className="text-[var(--color-cyan)]">title</code></td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2">Optional. Helps disambiguate when AniList ID maps to multiple entries.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-semibold text-[var(--color-ink)]">Example Request</span></p>
          <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-xs overflow-x-auto mt-2">curl -H &quot;Authorization: Bearer zvn_your_key_here&quot; \
  https://zyniverse.vercel.app/api/v1/filler/21</pre>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-semibold text-[var(--color-ink)]">Example Response</span></p>
          <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-xs overflow-x-auto mt-2">{JSON.stringify({
            found: true,
            data: {
              title: "One Piece",
              total: 1100,
              filler: 99,
              mangaCanon: 1001,
              animeCanon: 0,
              mixed: 0,
              fillerPercent: 9,
              quickList: ["2", "3", "4"],
              episodes: [
                { number: 1, title: "I'm Luffy! The Man Who Will Become the Pirate King!", type: "manga-canon" },
                { number: 2, title: "Enter the Great Swordsman!", type: "filler" },
              ],
              communityVotes: {
                "2": { filler: 6, "manga-canon": 1 },
              },
            },
          }, null, 2)}</pre>
        </div>
      </>
    ),
  },
  {
    id: "schedule",
    title: "Airing Schedule",
    endpoint: { method: "GET", path: "/api/v1/schedule" },
    content: (
      <>
        <div className="rounded-lg border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 p-4">
          <p className="text-xs font-semibold mb-1">
            <span className="text-green-400">GET</span>{" "}
            <span className="text-[var(--color-ink)]">/api/v1/schedule</span>
          </p>
          <p className="text-xs text-[var(--color-mute)] mt-1">Get airing schedule for currently airing anime within a configurable time window.</p>
        </div>
        <div className="mt-4 space-y-1 text-sm text-[var(--color-mute)]">
          <p><span className="font-semibold text-[var(--color-ink)]">Query Parameters</span></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="text-left py-2 pr-4 font-semibold">Parameter</th>
                  <th className="text-left py-2 pr-4 font-semibold">Type</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-mute)]">
                <tr className="border-b border-[var(--color-line)]">
                  <td className="py-2 pr-4"><code className="text-[var(--color-cyan)]">hours_back</code></td>
                  <td className="py-2 pr-4">number</td>
                  <td className="py-2">How far back to look (default: 6)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code className="text-[var(--color-cyan)]">hours_ahead</code></td>
                  <td className="py-2 pr-4">number</td>
                  <td className="py-2">How far ahead to look (default: 72)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-semibold text-[var(--color-ink)]">Example Request</span></p>
          <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-xs overflow-x-auto mt-2">curl -H &quot;Authorization: Bearer zvn_your_key_here&quot; \
  &quot;https://zyniverse.vercel.app/api/v1/schedule?hours_back=12&hours_ahead=48&quot;</pre>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-semibold text-[var(--color-ink)]">Example Response</span></p>
          <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-xs overflow-x-auto mt-2">{JSON.stringify({
            data: [
              {
                mediaId: 21,
                title: "One Piece",
                episode: 1112,
                airingAt: 1712345678,
                timeUntilAiring: 3600,
                coverImage: "https://example.com/cover.jpg",
                format: "TV",
                genres: ["Action", "Adventure", "Fantasy"],
              },
            ],
            count: 1,
            timeRange: { from: 1712340000, to: 1712430000 },
          }, null, 2)}</pre>
        </div>
      </>
    ),
  },
  {
    id: "dub-status",
    title: "Dub Status",
    endpoint: { method: "GET", path: "/api/v1/dub-status/:malId" },
    content: (
      <>
        <div className="rounded-lg border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 p-4">
          <p className="text-xs font-semibold mb-1">
            <span className="text-green-400">GET</span>{" "}
            <span className="text-[var(--color-ink)]">/api/v1/dub-status/</span>
            <span className="text-[var(--color-cyan)]">:malId</span>
          </p>
          <p className="text-xs text-[var(--color-mute)] mt-1">Get available dub languages for an anime by MyAnimeList ID.</p>
        </div>
        <div className="mt-4 space-y-1 text-sm text-[var(--color-mute)]">
          <p><span className="font-semibold text-[var(--color-ink)]">Path Parameters</span></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="text-left py-2 pr-4 font-semibold">Parameter</th>
                  <th className="text-left py-2 pr-4 font-semibold">Type</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-mute)]">
                <tr className="border-b border-[var(--color-line)]">
                  <td className="py-2 pr-4"><code className="text-[var(--color-cyan)]">malId</code></td>
                  <td className="py-2 pr-4">number</td>
                  <td className="py-2">MyAnimeList media ID</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-semibold text-[var(--color-ink)]">Example Request</span></p>
          <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-xs overflow-x-auto mt-2">curl -H &quot;Authorization: Bearer zvn_your_key_here&quot; \
  https://zyniverse.vercel.app/api/v1/dub-status/21</pre>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-semibold text-[var(--color-ink)]">Example Response</span></p>
          <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-xs overflow-x-auto mt-2">{JSON.stringify({
            malId: 21,
            available: ["Hindi", "Tamil", "Telugu", "English"],
            total_dub_requests: 42,
            last_updated: "2026-07-06T12:00:00.000Z",
          }, null, 2)}</pre>
        </div>
      </>
    ),
  },
  {
    id: "anime",
    title: "Anime Details",
    endpoint: { method: "GET", path: "/api/v1/anime/:id" },
    content: (
      <>
        <div className="rounded-lg border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 p-4">
          <p className="text-xs font-semibold mb-1">
            <span className="text-green-400">GET</span>{" "}
            <span className="text-[var(--color-ink)]">/api/v1/anime/</span>
            <span className="text-[var(--color-cyan)]">:id</span>
          </p>
          <p className="text-xs text-[var(--color-mute)] mt-1">Get full anime details including metadata, characters, and a summary of filler data.</p>
        </div>
        <div className="mt-4 space-y-1 text-sm text-[var(--color-mute)]">
          <p><span className="font-semibold text-[var(--color-ink)]">Path Parameters</span></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="text-left py-2 pr-4 font-semibold">Parameter</th>
                  <th className="text-left py-2 pr-4 font-semibold">Type</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-mute)]">
                <tr className="border-b border-[var(--color-line)]">
                  <td className="py-2 pr-4"><code className="text-[var(--color-cyan)]">id</code></td>
                  <td className="py-2 pr-4">number</td>
                  <td className="py-2">AniList media ID</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-semibold text-[var(--color-ink)]">Example Request</span></p>
          <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-xs overflow-x-auto mt-2">curl -H &quot;Authorization: Bearer zvn_your_key_here&quot; \
  https://zyniverse.vercel.app/api/v1/anime/21</pre>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-semibold text-[var(--color-ink)]">Example Response</span></p>
          <pre className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-xs overflow-x-auto mt-2">{JSON.stringify({
            data: {
              id: 21,
              idMal: 21,
              title: { romaji: "One Piece", english: "One Piece" },
              format: "TV",
              status: "RELEASING",
              episodes: null,
              genres: ["Action", "Adventure"],
              averageScore: 86,
              popularity: 1000000,
              studios: [{ id: 1, name: "Toei Animation" }],
              filler: { total: 1100, filler: 99, fillerPercent: 9 },
            },
          }, null, 2)}</pre>
        </div>
      </>
    ),
  },
  {
    id: "errors",
    title: "Error Handling",
    endpoint: null,
    content: (
      <>
        <p className="text-sm text-[var(--color-mute)] leading-relaxed">
          The API uses conventional HTTP response codes to indicate success or failure.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)]">
                <th className="text-left py-2 pr-4 font-semibold">Status</th>
                <th className="text-left py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-mute)]">
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4">200</td>
                <td className="py-2">Success</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4">400</td>
                <td className="py-2">Bad request (invalid parameters)</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4">401</td>
                <td className="py-2">Missing or invalid API key</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4">403</td>
                <td className="py-2">Key disabled or expired</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4">429</td>
                <td className="py-2">Rate limit exceeded</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">500</td>
                <td className="py-2">Internal server error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
];

function EndpointBadge({ method }: { method: string }) {
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
      method === "GET" ? "bg-green-500/15 text-green-400" : "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]"
    }`}>
      {method}
    </span>
  );
}

export default function DocsPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("overview");

  function copyCode(text: string, idx: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }).catch(() => {});
  }

  return (
    <PageTransition>
      <ErrorBoundary label="Docs">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-magenta)]"
            >
              <span className="text-[var(--color-cyan)]">✦</span> API v1 <span className="text-[var(--color-cyan)]">✦</span>
            </motion.p>
            <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="font-display text-5xl sm:text-7xl font-black tracking-tight mt-2"
            >
              Developer Docs
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="mt-4 text-[var(--color-mute)] max-w-lg mx-auto"
            >
              Build anime apps, bots, and tools with the ZyniVerse Public API. Free tier available.
            </motion.p>
          </motion.div>

          {/* Quick Nav */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 justify-center mb-12"
          >
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeSection === s.id
                    ? "bg-[var(--color-magenta)] text-black shadow-lg"
                    : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
                }`}
                onClick={() => setActiveSection(s.id)}
              >
                {s.title}
              </a>
            ))}
            <Link href="/docs/changelog"
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
            >
              Changelog
            </Link>
            <Link href="/status"
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
            >
              Status
            </Link>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {SECTIONS.map((section, idx) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="scroll-mt-24 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8 hover:border-[var(--color-cyan)]/20 transition-colors"
                onViewportEnter={() => setActiveSection(section.id)}
              >
                <div className="flex items-center gap-3 mb-6">
                  {section.endpoint ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <EndpointBadge method={section.endpoint.method} />
                      <code className="text-xs font-mono text-[var(--color-cyan)] bg-[var(--color-void)] px-2 py-1 rounded">{section.endpoint.path}</code>
                    </div>
                  ) : (
                    <span className="h-6 w-1 rounded-full bg-[var(--color-magenta)]" />
                  )}
                  <h2 className="font-display text-xl font-bold">{section.title}</h2>
                </div>
                {section.content}
              </motion.section>
            ))}
          </div>

          {/* Quickstart */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 border-t border-[var(--color-line)] pt-12"
          >
            <h2 className="font-display text-2xl font-bold mb-6">Quickstart Examples</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { lang: "JavaScript / TypeScript", icon: "⎈",
                  code: `const API_KEY = "zvn_your_key_here";
      const BASE = "https://zyniverse.vercel.app/api/v1";

      async function getFiller(anilistId) {
        const url = BASE + "/filler/" + anilistId;
        const res = await fetch(url, {
          headers: { Authorization: "Bearer " + API_KEY },
        });
        return res.json();
      }

      // Get One Piece filler guide
      getFiller(21).then(console.log);` },
                { lang: "Python", icon: "🐍",
                  code: `import requests

      API_KEY = "zvn_your_key_here"
      BASE = "https://zyniverse.vercel.app/api/v1"

      headers = {"Authorization": "Bearer " + API_KEY}

      # Get airing schedule
      resp = requests.get(BASE + "/schedule?hours_ahead=24", headers=headers)
      data = resp.json()
      print(data)` },
              ].map((ex, i) => (
                <motion.div key={ex.lang} whileHover={{ y: -2 }}
                  className="group relative rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] overflow-hidden transition-shadow hover:shadow-lg hover:border-[var(--color-cyan)]/30"
                >
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-line)] bg-[var(--color-panel)]">
                    <p className="text-xs font-semibold flex items-center gap-2">
                      <span>{ex.icon}</span> {ex.lang}
                    </p>
                    <button onClick={() => copyCode(ex.code, i)}
                      className="text-[10px] font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                    >
                      {copiedIdx === i ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="p-4 text-xs overflow-x-auto">{ex.code}</pre>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 text-center rounded-2xl border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8 relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,45,120,0.06) 0%, transparent 60%)" }}
            />
            <div className="relative">
              <h2 className="font-display text-xl font-bold mb-2">Ready to Build?</h2>
              <p className="text-sm text-[var(--color-mute)] mb-6">
                Get your free API key and start integrating anime data into your app.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/register" className="rounded-xl bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition">
                  Create Account
                </Link>
                <Link href="/profile" className="rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors">
                  API Keys
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
