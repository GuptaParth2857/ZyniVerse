import type { Metadata } from "next";
import WebhookManager from "@/components/WebhookManager";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Webhook Management — Developer API | ZyniVerse",
  description: "Manage webhooks for ZyniVerse events. Receive real-time notifications when anime is completed, episodes watched, reviews created, and more.",
  openGraph: {
    title: "Webhook Management — Developer API | ZyniVerse",
    description: "Configure and manage webhooks for real-time ZyniVerse event notifications.",
    url: `${BASE_URL}/developer/webhooks`,
    type: "website",
  },
};

export default function WebhooksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center mb-8">
        <div className="neon-rgb-border inline-block rounded-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-magenta)]">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <h1 className="font-display text-3xl font-bold sm:text-4xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] bg-clip-text text-transparent">
              Webhook Manager
            </h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--color-mute)] max-w-lg mx-auto">
          Receive real-time notifications when events happen on ZyniVerse.
        </p>
      </div>

      <WebhookManager />

      {/* Documentation */}
      <div className="mt-12 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">Webhook Format &amp; Headers</h2>
        <div className="space-y-4 text-sm text-[var(--color-mute)]">
          <div>
            <h3 className="text-xs font-bold text-[var(--color-ink)] mb-1">Request Method</h3>
            <code className="text-[var(--color-cyan)] bg-[var(--color-void)] rounded px-2 py-0.5">POST</code>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-ink)] mb-1">Headers</h3>
            <div className="rounded-lg bg-[var(--color-void)] p-3 font-mono text-xs space-y-1">
              <p><span className="text-[var(--color-cyan)]">Content-Type:</span> application/json</p>
              <p><span className="text-[var(--color-cyan)]">X-Webhook-Event:</span> event type (e.g. anime.completed)</p>
              <p><span className="text-[var(--color-cyan)]">X-Webhook-Signature:</span> HMAC-SHA256 hex digest of the body</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-ink)] mb-1">Payload Structure</h3>
            <pre className="rounded-lg bg-[var(--color-void)] p-3 font-mono text-xs overflow-x-auto">
{`{
  "event": "anime.completed",
  "payload": { ... },
  "timestamp": "2026-01-15T10:30:00.000Z"
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-ink)] mb-1">Verifying Signatures</h3>
            <p className="text-xs">Compute HMAC-SHA256 of the raw request body using your webhook secret. Compare with the <code className="text-[var(--color-cyan)]">X-Webhook-Signature</code> header.</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-ink)] mb-1">Event Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {["anime.completed", "anime.started", "episode.watched", "review.created", "list.updated", "* (all)"].map((evt) => (
                <code key={evt} className="text-[var(--color-cyan)] bg-[var(--color-void)] rounded px-2 py-0.5 text-[11px]">{evt}</code>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-ink)] mb-1">Retry Policy</h3>
            <p className="text-xs">Failed deliveries are retried up to 3 times with exponential backoff (2s, 4s, 8s).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
