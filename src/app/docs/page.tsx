"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function useTypewriter(words: string[]): string {
  const [text, setText] = useState("");
  const wordIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    const tick = () => {
      const word = words[wordIndex.current % words.length];
      if (!deleting.current) {
        charIndex.current++;
        if (charIndex.current === word.length + 1) deleting.current = true;
      } else {
        charIndex.current--;
        if (charIndex.current === 0) {
          deleting.current = false;
          wordIndex.current++;
        }
      }
      setText(word.slice(0, Math.max(0, charIndex.current)));
    };
    const id = setInterval(tick, 60);
    return () => clearInterval(id);
  }, [words]);

  return text;
}

async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await copyText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-[var(--color-line)] bg-black/30 px-2.5 py-1 font-mono text-[10px] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

function CodeBlock({ copyValue, label = "bash", children }: { copyValue: string; label?: string; children: ReactNode }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[var(--color-line)] bg-black/50">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[10px] text-[var(--color-mute)]">{label}</span>
        <span className="ml-auto">
          <CopyButton value={copyValue} />
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--color-cyan)]">{children}</pre>
    </div>
  );
}

function JsonBlock({ json, title = "Example Response" }: { json: unknown; title?: string }) {
  const pretty = JSON.stringify(json, null, 2);
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[var(--color-line)] bg-black/50">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[10px] text-[var(--color-mute)]">{title}</span>
        <span className="ml-auto">
          <CopyButton value={pretty} />
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--color-mute)]">{pretty}</pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const isGet = method === "GET";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
        isGet ? "bg-green-400/15 text-green-400" : "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]"
      }`}
    >
      {method}
    </span>
  );
}

function EndpointCard({ method, path, desc }: { method: string; path: string; desc: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 p-4">
      <MethodBadge method={method} />
      <code className="font-mono text-xs text-[var(--color-cyan)]">{path}</code>
      <p className="w-full text-xs text-[var(--color-mute)] sm:ml-auto sm:w-auto">{desc}</p>
    </div>
  );
}

function ParamTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-line)]">
            <th className="py-2 pr-4 text-left font-semibold text-[var(--color-ink)]">Parameter</th>
            <th className="py-2 pr-4 text-left font-semibold text-[var(--color-ink)]">Type</th>
            <th className="py-2 text-left font-semibold text-[var(--color-ink)]">Description</th>
          </tr>
        </thead>
        <tbody className="text-[var(--color-mute)]">
          {rows.map(([p, t, d]) => (
            <tr key={p} className="border-b border-[var(--color-line)] last:border-0">
              <td className="py-2 pr-4"><code className="font-mono text-xs text-[var(--color-cyan)]">{p}</code></td>
              <td className="py-2 pr-4">{t}</td>
              <td className="py-2">{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold text-[var(--color-ink)]">
      <span className="mr-2 inline-block h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
      {children}
    </p>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    endpoint: null,
    content: (
      <>
        <p className="text-sm leading-relaxed text-[var(--color-mute)]">
          The ZyniVerse Public API provides programmatic access to anime filler guides, airing schedules,
          dub status information, and anime metadata. All endpoints return JSON and are accessible via
          standard HTTP GET requests with Bearer token authentication.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-line)] bg-black/20 p-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Base URL</span>
          <code className="rounded-lg bg-black/40 px-3 py-1.5 font-mono text-xs text-[var(--color-cyan)]">https://zyverse.in/api/v1</code>
          <CopyButton value="https://zyverse.in/api/v1" />
        </div>
      </>
    ),
  },
  {
    id: "authentication",
    title: "Authentication",
    endpoint: null,
    content: (
      <>
        <p className="text-sm leading-relaxed text-[var(--color-mute)]">
          All API requests require a valid API key sent via the{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-[var(--color-cyan)]">Authorization</code> header.
        </p>
        <CodeBlock copyValue={"Authorization: Bearer zvn_abc123def456"} label="Request Header">
          Authorization: Bearer <span className="text-[var(--color-magenta)]">zvn_abc123def456</span>
        </CodeBlock>
        <div className="mt-5 space-y-2">
          <SubHeading>Getting an API Key</SubHeading>
          <ol className="space-y-2.5 text-sm text-[var(--color-mute)]">
            {[
              <>
                Create a free account at <Link href="/register" className="text-[var(--color-cyan)] hover:underline">/register</Link>
              </>,
              <>
                Go to your <Link href="/profile" className="text-[var(--color-cyan)] hover:underline">Profile → API Keys</Link>
              </>,
              <>
                Click <span className="font-mono text-[var(--color-ink)]">&quot;Create API Key&quot;</span> and copy the generated key
              </>,
              <>
                Use it in the <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-[var(--color-cyan)]">Authorization</code> header of every request
              </>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] font-mono text-xs font-bold text-black shadow-[0_0_12px_rgba(138,92,255,0.35)]">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-5">
          <SubHeading>Error Response (401 — Missing Key)</SubHeading>
          <JsonBlock json={{ error: "Missing or invalid API key. Use header: Authorization: Bearer <key>" }} title="401 Response" />
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
        <p className="text-sm leading-relaxed text-[var(--color-mute)]">
          Rate limits are enforced per API key on a daily rolling window. Limits reset at midnight UTC.
          Each tier also has a per-minute rate limit and a maximum number of keys per account.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { name: "Free", price: "₹0", requests: "100/day", min: "10/min", keys: "10 keys", features: ["Basic endpoints", "Community support"], accent: "var(--color-cyan)" },
            { name: "Pro", price: "₹499/mo", requests: "10,000/day", min: "100/min", keys: "25 keys", features: ["All endpoints", "Priority support", "Usage analytics"], accent: "#ff2d78" },
            { name: "Enterprise", price: "₹4,999/mo", requests: "100,000/day", min: "1,000/min", keys: "100 keys", features: ["SLA guarantee", "Dedicated support", "Custom integrations"], accent: "#8a5cff" },
          ].map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="neon-premium rounded-[20px]"
            >
              <div className="neon-premium-track" />
              <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
              <div className="neon-premium-content rounded-[20px] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: tier.accent }}>{tier.name}</p>
                <p className="mt-1 font-mono text-2xl font-bold" style={{ color: tier.accent }}>{tier.price}</p>
                <div className="mt-4 space-y-2">
                  {[
                    [tier.requests, "Requests / Day"],
                    [tier.min, "Requests / Min"],
                    [tier.keys, "Max Keys"],
                  ].map(([v, l]) => (
                    <div key={l as string} className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[var(--color-mute)]">{l}</span>
                      <span className="font-mono text-xs text-[var(--color-ink)]">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[var(--color-line)] to-transparent" />
                <ul className="mt-4 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[var(--color-mute)]">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold" style={{ color: tier.accent, border: `1px solid ${tier.accent}55`, background: `${tier.accent}14` }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-line)] bg-black/20 p-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)]">
                <th className="py-2 pr-4 text-left font-semibold text-[var(--color-ink)]">Tier</th>
                <th className="py-2 pr-4 text-left font-semibold text-[var(--color-ink)]">Requests / Day</th>
                <th className="py-2 pr-4 text-left font-semibold text-[var(--color-ink)]">Requests / Min</th>
                <th className="py-2 pr-4 text-left font-semibold text-[var(--color-ink)]">Max Keys</th>
                <th className="py-2 text-left font-semibold text-[var(--color-ink)]">Price</th>
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
        <p className="mt-4 text-sm text-[var(--color-mute)]">
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
        <EndpointCard method="GET" path="/api/v1/filler/:id" desc="Get filler/episode guide for a specific anime by AniList ID." />
        <div className="mt-5">
          <SubHeading>Path Parameters</SubHeading>
          <ParamTable rows={[["id", "number", "AniList media ID"]]} />
        </div>
        <div className="mt-5">
          <SubHeading>Query Parameters</SubHeading>
          <ParamTable rows={[["title", "string", "Optional. Helps disambiguate when AniList ID maps to multiple entries."]]} />
        </div>
        <div className="mt-5">
          <SubHeading>Example Request</SubHeading>
          <CodeBlock copyValue={'curl -H "Authorization: Bearer zvn_your_key_here" \\\n  https://zyverse.in/api/v1/filler/21'}>
            <span className="text-[var(--color-ink)]">curl</span> -H <span className="text-[var(--color-magenta)]">&quot;Authorization: Bearer zvn_your_key_here&quot;</span> \<br />
            &nbsp;&nbsp;https://zyverse.in/api/v1/filler/21
          </CodeBlock>
        </div>
        <div className="mt-5">
          <SubHeading>Example Response</SubHeading>
          <JsonBlock json={{
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
          }} />
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
        <EndpointCard method="GET" path="/api/v1/schedule" desc="Get airing schedule for currently airing anime within a configurable time window." />
        <div className="mt-5">
          <SubHeading>Query Parameters</SubHeading>
          <ParamTable rows={[
            ["hours_back", "number", "How far back to look (default: 6)"],
            ["hours_ahead", "number", "How far ahead to look (default: 72)"],
          ]} />
        </div>
        <div className="mt-5">
          <SubHeading>Example Request</SubHeading>
          <CodeBlock copyValue={'curl -H "Authorization: Bearer zvn_your_key_here" \\\n  "https://zyverse.in/api/v1/schedule?hours_back=12&hours_ahead=48"'} label="bash">
            <span className="text-[var(--color-ink)]">curl</span> -H <span className="text-[var(--color-magenta)]">&quot;Authorization: Bearer zvn_your_key_here&quot;</span> \<br />
            &nbsp;&nbsp;<span className="text-[var(--color-ink)]">&quot;https://zyverse.in/api/v1/schedule?hours_back=12&amp;hours_ahead=48&quot;</span>
          </CodeBlock>
        </div>
        <div className="mt-5">
          <SubHeading>Example Response</SubHeading>
          <JsonBlock json={{
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
          }} />
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
        <EndpointCard method="GET" path="/api/v1/dub-status/:malId" desc="Get available dub languages for an anime by MyAnimeList ID." />
        <div className="mt-5">
          <SubHeading>Path Parameters</SubHeading>
          <ParamTable rows={[["malId", "number", "MyAnimeList media ID"]]} />
        </div>
        <div className="mt-5">
          <SubHeading>Example Request</SubHeading>
          <CodeBlock copyValue={'curl -H "Authorization: Bearer zvn_your_key_here" \\\n  https://zyverse.in/api/v1/dub-status/21'}>
            <span className="text-[var(--color-ink)]">curl</span> -H <span className="text-[var(--color-magenta)]">&quot;Authorization: Bearer zvn_your_key_here&quot;</span> \<br />
            &nbsp;&nbsp;https://zyverse.in/api/v1/dub-status/21
          </CodeBlock>
        </div>
        <div className="mt-5">
          <SubHeading>Example Response</SubHeading>
          <JsonBlock json={{
            malId: 21,
            available: ["Hindi", "Tamil", "Telugu", "English"],
            total_dub_requests: 42,
            last_updated: "2026-07-06T12:00:00.000Z",
          }} />
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
        <EndpointCard method="GET" path="/api/v1/anime/:id" desc="Get full anime details including metadata, characters, and a summary of filler data." />
        <div className="mt-5">
          <SubHeading>Path Parameters</SubHeading>
          <ParamTable rows={[["id", "number", "AniList media ID"]]} />
        </div>
        <div className="mt-5">
          <SubHeading>Example Request</SubHeading>
          <CodeBlock copyValue={'curl -H "Authorization: Bearer zvn_your_key_here" \\\n  https://zyverse.in/api/v1/anime/21'}>
            <span className="text-[var(--color-ink)]">curl</span> -H <span className="text-[var(--color-magenta)]">&quot;Authorization: Bearer zvn_your_key_here&quot;</span> \<br />
            &nbsp;&nbsp;https://zyverse.in/api/v1/anime/21
          </CodeBlock>
        </div>
        <div className="mt-5">
          <SubHeading>Example Response</SubHeading>
          <JsonBlock json={{
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
          }} />
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
        <p className="text-sm leading-relaxed text-[var(--color-mute)]">
          The API uses conventional HTTP response codes to indicate success or failure.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-line)] bg-black/20 p-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)]">
                <th className="py-2 pr-4 text-left font-semibold text-[var(--color-ink)]">Status</th>
                <th className="py-2 text-left font-semibold text-[var(--color-ink)]">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-mute)]">
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4 font-mono text-green-400">200</td>
                <td className="py-2">Success</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4 font-mono text-amber-400">400</td>
                <td className="py-2">Bad request (invalid parameters)</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4 font-mono text-[var(--color-magenta)]">401</td>
                <td className="py-2">Missing or invalid API key</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4 font-mono text-[var(--color-magenta)]">403</td>
                <td className="py-2">Key disabled or expired</td>
              </tr>
              <tr className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4 font-mono text-red-400">429</td>
                <td className="py-2">Rate limit exceeded</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-red-400">500</td>
                <td className="py-2">Internal server error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
];

const QUICKSTART = [
  {
    lang: "JavaScript / TypeScript",
    icon: "⎈",
    code: `const API_KEY = "zvn_your_key_here";
const BASE = "https://zyverse.in/api/v1";

async function getFiller(anilistId) {
  const url = BASE + "/filler/" + anilistId;
  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + API_KEY },
  });
  return res.json();
}

// Get One Piece filler guide
getFiller(21).then(console.log);`,
  },
  {
    lang: "Python",
    icon: "🐍",
    code: `import requests

API_KEY = "zvn_your_key_here"
BASE = "https://zyverse.in/api/v1"

headers = {"Authorization": "Bearer " + API_KEY}

# Get airing schedule
resp = requests.get(BASE + "/schedule?hours_ahead=24", headers=headers)
data = resp.json()
print(data)`,
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const typed = useTypewriter(["filler guides", "Indian dubs", "airing schedules", "clean JSON", "low latency"]);

  return (
    <PageTransition>
      <ErrorBoundary label="Docs">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          {/* Hero */}
          <section className="relative mb-14 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-panel)] p-8 sm:p-10 text-center">
            <div
              className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[130%] -translate-x-1/2 opacity-40 blur-3xl"
              style={{ background: "linear-gradient(90deg, #29f2e0, #8a5cff, #ff2d78)" }}
            />
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)] shadow-[0_0_16px_rgba(41,242,224,0.2)]"
            >
              ✦ API Documentation · v1
            </motion.p>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="font-display text-4xl font-black leading-tight sm:text-6xl"
            >
              <span className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text text-transparent">
                Developer Docs
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="show" className="mx-auto mt-4 max-w-xl text-base text-[var(--color-mute)]">
              Build anime apps, bots, and tools with{" "}
              <span className="font-mono text-[var(--color-cyan)]">{typed}</span>
              <span className="animate-pulse text-[var(--color-cyan)]">▌</span> — free tier available, every endpoint live.
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="neon-rgb-border rounded-full bg-[var(--color-void)]/70 px-6 py-2.5 text-sm font-bold text-[var(--color-ink)] transition-all hover:scale-[1.03] hover:border-[var(--color-cyan)]"
              >
                Get a Free Key →
              </Link>
              <Link
                href="/status"
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
              >
                API Status
              </Link>
              <Link
                href="/developer"
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
              >
                Live Playground
              </Link>
            </motion.div>
          </section>

          {/* Quick Nav */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-12 flex flex-wrap justify-center gap-2"
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeSection === s.id
                    ? "border border-[var(--color-magenta)] bg-[var(--color-magenta)]/10 text-[var(--color-magenta)] shadow-[0_0_14px_rgba(255,45,120,0.25)]"
                    : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)]"
                }`}
              >
                {s.title}
              </a>
            ))}
            <Link
              href="/docs/changelog"
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)]"
            >
              Changelog
            </Link>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {SECTIONS.map((section, idx) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="neon-premium scroll-mt-24 rounded-[20px]"
                onViewportEnter={() => setActiveSection(section.id)}
              >
                <div className="neon-premium-track" />
                <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
                <div className="neon-premium-content rounded-[20px] p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    {section.endpoint ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <MethodBadge method={section.endpoint.method} />
                        <code className="rounded-lg bg-black/40 px-2.5 py-1 font-mono text-xs text-[var(--color-cyan)]">{section.endpoint.path}</code>
                      </div>
                    ) : (
                      <span className="h-6 w-1 rounded-full bg-gradient-to-b from-[var(--color-magenta)] to-[var(--color-cyan)]" />
                    )}
                    <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">{section.title}</h2>
                  </div>
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Quickstart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mb-6 flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-[var(--color-cyan)] shadow-[0_0_12px_rgba(41,242,224,0.4)]" />
              <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">Quickstart Examples</h2>
            </motion.div>
            <div className="grid gap-6 sm:grid-cols-2">
              {QUICKSTART.map((ex, i) => (
                <motion.div
                  key={ex.lang}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="neon-premium rounded-[20px]"
                >
                  <div className="neon-premium-track" />
                  <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
                  <div className="neon-premium-content rounded-[20px] p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)]">
                        <span className="text-base">{ex.icon}</span> {ex.lang}
                      </p>
                      <CopyButton value={ex.code} />
                    </div>
                    <pre className="overflow-x-auto rounded-xl border border-[var(--color-line)] bg-black/40 p-4 font-mono text-xs leading-relaxed text-[var(--color-mute)]">
                      {ex.code}
                    </pre>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 relative overflow-hidden rounded-[24px] neon-premium"
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content relative rounded-[24px] p-8 text-center sm:p-10">
              <div
                className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[90%] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(255,45,120,0.25), transparent 60%)" }}
              />
              <div className="relative">
                <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
                  ✦ Ready to Build?
                </motion.p>
                <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
                  Get your free API key and start building
                </motion.h2>
                <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto mt-3 max-w-md text-sm text-[var(--color-mute)]">
                  Integrate anime filler guides, schedules, and dub data into your app in minutes.
                </motion.p>
                <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/register" className="rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[#ff6b9d] px-6 py-3 text-sm font-bold text-black transition-all hover:shadow-[0_0_30px_rgba(255,45,120,0.4)]">
                    Create Account
                  </Link>
                  <Link href="/profile" className="neon-rgb-border rounded-xl bg-[var(--color-void)]/70 px-6 py-3 text-sm font-bold text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]">
                    API Keys
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
