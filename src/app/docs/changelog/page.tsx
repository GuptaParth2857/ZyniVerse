import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Changelog — ZyniVerse API Updates | ZyniVerse",
  description: "View the complete changelog for the ZyniVerse Public API. Track versions, features, fixes, and breaking changes.",
};

const CHANGELOG = [
  {
    version: "v1.0.0",
    date: "July 2026",
    changes: [
      { type: "feature", text: "Initial release of the ZyniVerse Public API" },
      { type: "feature", text: "Filler endpoint: `GET /api/v1/filler/:id` — Get filler/episode guides for any anime" },
      { type: "feature", text: "Schedule endpoint: `GET /api/v1/schedule` — Get airing schedule for currently airing anime" },
      { type: "feature", text: "Anime endpoint: `GET /api/v1/anime/:id` — Get full anime details including metadata and characters" },
      { type: "feature", text: "Dub Status endpoint: `GET /api/v1/dub-status/:malId` — Get available dub languages by MAL ID" },
      { type: "feature", text: "Usage endpoint: `GET /api/v1/usage` — View your API key usage statistics" },
      { type: "feature", text: "API key management with Free, Pro, and Enterprise tiers" },
      { type: "feature", text: "Rate limiting (100 req/day free, 10K pro, 100K enterprise)" },
      { type: "feature", text: "Bearer token authentication via Authorization header" },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-mute)] mb-4">
        <Link href="/docs" className="hover:text-[var(--color-cyan)]">Docs</Link>
        <span>/</span>
        <span className="text-[var(--color-cyan)]">Changelog</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Updates</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-2">API Changelog</h1>
        <p className="mt-3 text-[var(--color-mute)] max-w-lg">
          Track every version, feature, fix, and breaking change to the ZyniVerse Public API.
        </p>
      </div>

      {/* Changelog entries */}
      <div className="space-y-10">
        {CHANGELOG.map((entry) => (
          <div key={entry.version} className="relative pl-8 border-l-2 border-[var(--color-line)]">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-[var(--color-magenta)] bg-[var(--color-void)]" />
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-xl font-bold">{entry.version}</h2>
              <span className="text-xs text-[var(--color-mute)]">{entry.date}</span>
            </div>
            <ul className="space-y-2">
              {entry.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-mute)]">
                  <span className={`mt-0.5 shrink-0 text-xs font-bold ${
                    change.type === "feature" ? "text-green-400" :
                    change.type === "fix" ? "text-yellow-400" :
                    change.type === "breaking" ? "text-red-400" : "text-[var(--color-cyan)]"
                  }`}>
                    {change.type === "feature" ? "NEW" : change.type === "fix" ? "FIX" : "CHG"}
                  </span>
                  <span>{change.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Back link */}
      <div className="mt-12 text-center">
        <Link href="/docs" className="text-sm text-[var(--color-cyan)] hover:underline">
          ← Back to API Docs
        </Link>
      </div>

      {/* Sidebar link hint */}
      <div className="mt-8 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-center">
        <p className="text-sm text-[var(--color-mute)] mb-3">View the full API documentation</p>
        <Link href="/docs" className="rounded-xl bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
          API Docs
        </Link>
      </div>
    </div>
  );
}
