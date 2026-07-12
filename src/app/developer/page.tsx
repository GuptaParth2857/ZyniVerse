import type { Metadata } from "next";
import Link from "next/link";
import { API_TIERS } from "@/lib/api-key";

export const metadata: Metadata = {
  title: "ZyniVerse API — Anime Data for Developers | Free & Paid Tiers",
  description: "Build with the ZyniVerse API. Access anime filler guides, Indian dub data, airing schedules, and more. Free tier available with 100 requests/day.",
  openGraph: {
    title: "ZyniVerse API — Anime Data for Developers",
    description: "Build with the ZyniVerse API. Filler guides, Indian dubs, schedules & more.",
  },
};

const QUERIES = [
  { name: "Get Trending Anime", endpoint: "GET /api/v1/schedule", desc: "Fetch airing schedule with filler & dub data" },
  { name: "Anime Details + Filler", endpoint: "GET /api/v1/anime/:id", desc: "Full anime details with filler breakdown per episode" },
  { name: "Filler Guide", endpoint: "GET /api/v1/filler/:id", desc: "Episode-by-episode filler classification" },
  { name: "Dub Status", endpoint: "GET /api/v1/dub-status/:malId", desc: "Check available Indian dub languages" },
  { name: "Usage Stats", endpoint: "GET /api/v1/usage", desc: "View your current API usage and limits" },
  { name: "GraphQL v2", endpoint: "POST /api/v2/graphql", desc: "Flexible GraphQL queries for advanced use cases" },
];

export default function DeveloperPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">// Developers</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">ZyniVerse API</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-3xl">
          Build anime-powered apps with India&apos;s most unique anime API. Access filler guides, Indian dub schedules,
          airing data, and character info. Every endpoint returns clean JSON with minimal latency.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 mb-16">
        {Object.entries(API_TIERS).map(([key, tier]) => (
          <div key={key} className={`rounded-xl border ${key === "pro" ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/5" : "border-[var(--color-line)] bg-[var(--color-panel)]"} p-6`}>
            {key === "pro" && <span className="text-xs font-bold text-[var(--color-magenta)] mb-2 block">POPULAR</span>}
            <h3 className="font-display text-xl font-bold">{tier.name}</h3>
            <p className={`text-3xl font-bold mt-2 ${key === "pro" ? "text-[var(--color-magenta)]" : ""}`}>
              {tier.price === 0 ? "Free" : `₹${tier.price}`}
              {tier.price > 0 && <span className="text-sm font-normal text-[var(--color-mute)]">/mo</span>}
            </p>
            <ul className="mt-4 space-y-2">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
                  <span className="text-[var(--color-cyan)]">✓</span> {f}
                </li>
              ))}
              <li className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
                <span className="text-[var(--color-cyan)]">✓</span> {tier.requestsPerDay.toLocaleString()} req/day
              </li>
            </ul>
            <Link
              href={key === "free" ? "/login" : "/premium"}
              className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-bold transition-all ${
                key === "pro"
                  ? "bg-[var(--color-magenta)] text-black hover:opacity-90"
                  : "border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-cyan)]"
              }`}
            >
              {tier.price === 0 ? "Get Free Key" : "Upgrade"}
            </Link>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-bold mb-6">API Endpoints</h2>
      <div className="overflow-x-auto rounded-xl border border-[var(--color-line)] mb-16">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-panel)]">
              <th className="px-4 py-3 text-left font-semibold">Endpoint</th>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {QUERIES.map((q) => (
              <tr key={q.endpoint} className="border-b border-[var(--color-line)] hover:bg-[var(--color-panel)]/50">
                <td className="px-4 py-3">
                  <code className="rounded bg-black/30 px-2 py-1 text-xs font-mono text-[var(--color-cyan)]">{q.endpoint}</code>
                </td>
                <td className="px-4 py-3 text-[var(--color-mute)]">{q.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-display text-2xl font-bold mb-6">Quick Start</h2>
      <div className="space-y-6 mb-16">
        <div>
          <h3 className="font-semibold mb-2">1. Get your API key</h3>
          <p className="text-sm text-[var(--color-mute)] mb-2">
            <Link href="/login" className="text-[var(--color-cyan)] hover:underline">Sign up</Link> and generate a free API key from your dashboard.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">2. Make your first request</h3>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <pre className="text-xs font-mono text-[var(--color-mute)] overflow-x-auto">
              <span className="text-[var(--color-cyan)]">curl</span> https://zyverse.in/api/v1/schedule?hours_ahead=24 \<br />
              &nbsp;&nbsp;-H <span className="text-[var(--color-magenta)]">&quot;Authorization: Bearer zvn_your_api_key_here&quot;</span>
            </pre>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">3. Try GraphQL</h3>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <pre className="text-xs font-mono text-[var(--color-mute)] overflow-x-auto">
              <span className="text-[var(--color-cyan)]">curl</span> -X POST https://zyverse.in/api/v2/graphql \<br />
              &nbsp;&nbsp;-H <span className="text-[var(--color-magenta)]">&quot;Authorization: Bearer zvn_your_api_key_here&quot;</span> \<br />
              &nbsp;&nbsp;-H <span className="text-[var(--color-magenta)]">&quot;Content-Type: application/json&quot;</span> \<br />
              &nbsp;&nbsp;-d <span className="text-[var(--color-magenta)]">{'{"query":"{ animeTrending { media { id title { romaji english } averageScore } } }"}'}</span>
            </pre>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">4. Rate Limits</h3>
          <p className="text-sm text-[var(--color-mute)]">
            Free: 100 requests/day · Pro: 10,000/day · Enterprise: 100,000/day.<br />
            Rate limit headers are returned with every response. Exceed your limit and you&apos;ll receive a <code className="text-[var(--color-magenta)]">429</code>.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <h2 className="font-display text-xl font-bold mb-3">Need Help?</h2>
        <p className="text-sm text-[var(--color-mute)] mb-4">
          Check our <Link href="/docs" className="text-[var(--color-cyan)] hover:underline">documentation</Link> for detailed API reference,
          or join the <Link href="/community" className="text-[var(--color-cyan)] hover:underline">community</Link> for support.
        </p>
        <p className="text-xs text-[var(--color-mute)]">
          Pro and Enterprise subscribers get priority support with 24-hour response time.
        </p>
      </div>
    </div>
  );
}
