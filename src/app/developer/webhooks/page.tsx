import type { Metadata } from "next";
import WebhookManager from "@/components/WebhookManager";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Webhooks — Real-time notifications from ZyniVerse",
  description: "Connect ZyniVerse to your own server or bot. Get instant updates whenever anime are completed, episodes watched, reviews published, and more.",
  openGraph: {
    title: "Webhooks — Real-time notifications from ZyniVerse",
    description: "Send ZyniVerse events straight to your server or bot in real time.",
    url: `${BASE_URL}/developer/webhooks`,
    type: "website",
  },
};

const STEPS = [
  {
    emoji: "🔗",
    title: "1. Paste your server URL",
    desc: "Any https:// endpoint works. If you do not have a server yet, you can build a free one with tools like Glitch or Replit.",
  },
  {
    emoji: "✅",
    title: "2. Pick what to hear about",
    desc: "Choose the moments that matter — when you finish an anime, mark an episode watched, or publish a review.",
  },
  {
    emoji: "⚡",
    title: "3. We ping you instantly",
    desc: "The moment it happens, ZyniVerse sends a message to your URL. No polling, no refresh — real time.",
  },
];

const USE_CASES = [
  {
    emoji: "🤖",
    title: "Discord / Telegram bots",
    desc: "Your chat bot announces instantly when a friend completes an anime or drops a review.",
  },
  {
    emoji: "📊",
    title: "Personal trackers",
    desc: "Keep an external tracker, spreadsheet, or dashboard in sync the second your list changes.",
  },
  {
    emoji: "🎮",
    title: "Community & streaming",
    desc: "Whip up your own alerts — \"X completed Y\", new episode watched — however you like.",
  },
];

const EVENT_DOCS = [
  { value: "anime.completed", desc: "A user finished watching an anime" },
  { value: "anime.started", desc: "A user started an anime" },
  { value: "episode.watched", desc: "A new episode was marked watched" },
  { value: "review.created", desc: "A long review was published" },
  { value: "list.updated", desc: "Anime list status changed" },
  { value: "test.ping", desc: "Fired by the Test button" },
];

export default function WebhooksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* ── Hero ─────────────────────────────── */}
      <div className="neon-rgb-ring animate-page-slide relative mb-10 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
        <div
          className="absolute inset-0 opacity-[0.2] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--color-magenta)]/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--color-cyan)]/20 blur-[100px]" />

        <div className="relative z-10 px-8 py-12 sm:px-12">
          <p className="animate-page-in mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]" style={{ animationDelay: "0.08s" }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_12px_var(--color-cyan)]" />
            Real-time notifications
          </p>

          <h1 className="animate-page-in font-display text-4xl font-bold sm:text-5xl" style={{ animationDelay: "0.14s" }}>
            <span className="neon-text-gradient">Webhooks, explained simply</span>
          </h1>

          <p className="animate-page-in mt-4 max-w-2xl text-sm leading-relaxed" style={{ animationDelay: "0.2s", color: "rgba(255,255,255,0.5)" }}>
            Think of a webhook like this: the moment something happens on ZyniVerse — you finish an anime, mark an
            episode watched, publish a review — your own server or bot gets a message within seconds. It is how apps
            talk to each other without anyone asking.
          </p>

          <div className="animate-page-in mt-7 flex flex-wrap gap-2" style={{ animationDelay: "0.26s" }}>
            {["Works with your own URL", "Instant delivery", "Safe & signed", "Free forever"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/60 backdrop-blur"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ──────────────────────── */}
      <div className="animate-page-in mb-12" style={{ animationDelay: "0.28s" }}>
        <div className="mb-5 flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">How it works</span>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-cyan)]/30 to-transparent" />
        </div>
        <div className="animate-stagger grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-6">
              <div className="mb-3 text-3xl">{step.emoji}</div>
              <h3 className="mb-1.5 text-sm font-bold">{step.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--color-mute)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Manager ───────────────────────────── */}
      <WebhookManager />

      {/* ── What you can build ────────────────── */}
      <div className="animate-page-in mt-12" style={{ animationDelay: "0.34s" }}>
        <div className="mb-5 flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-magenta)]">Ideas</span>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-magenta)]/30 to-transparent" />
        </div>
        <div className="animate-stagger grid gap-4 sm:grid-cols-3">
          {USE_CASES.map((useCase) => (
            <div
              key={useCase.title}
              className="group rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/40 p-6 transition-all hover:-translate-y-1 hover:border-[var(--color-cyan)]/40"
            >
              <div className="mb-3 text-3xl">{useCase.emoji}</div>
              <h3 className="mb-1.5 text-sm font-bold group-hover:text-[var(--color-cyan)]">{useCase.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--color-mute)]">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Details (for the curious / developers) ── */}
      <div className="animate-page-in mt-12" style={{ animationDelay: "0.4s" }}>
        <div className="mb-5 flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-violet)]">Under the hood</span>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-violet)]/30 to-transparent" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-6">
            <h3 className="mb-3 text-sm font-bold">What your server receives</h3>
            <pre className="overflow-x-auto rounded-xl bg-[var(--color-void)] p-4 font-mono text-xs leading-relaxed">
              <span className="text-[var(--color-cyan)]">POST</span> <span className="text-white/70">/your-endpoint</span>
              {"\n"}
              <span className="text-[var(--color-mute)]">X-Webhook-Event:</span> <span className="text-white/80">anime.completed</span>
              {"\n"}
              <span className="text-[var(--color-mute)]">X-Webhook-Signature:</span> <span className="text-white/80">… hex digest …</span>
            </pre>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--color-void)] p-4 font-mono text-xs leading-relaxed">
              {`{
  "event": "anime.completed",
  "payload": { "mediaId": 21 },
  "timestamp": "2026-01-15T10:30:00Z"
}`}
            </pre>
          </div>

          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-6">
            <h3 className="mb-3 text-sm font-bold">Quick reference</h3>
            <div className="space-y-4 text-xs text-[var(--color-mute)]">
              <div className="flex items-start gap-2">
                <span className="text-[var(--color-cyan)]">••</span>
                <p>Each message is <b className="text-[var(--color-ink)]">signed</b> with a secret only you can see, so you can be sure it really came from ZyniVerse.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--color-cyan)]">••</span>
                <p>If your server is briefly down, we <b className="text-[var(--color-ink)]">retry 3 times</b> (2s, 4s, 8s) so nothing is lost.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--color-cyan)]">••</span>
                <p>You can pause a webhook anytime with the toggle — no need to delete it.</p>
              </div>
              <div className="rounded-xl border border-[var(--color-line)]/60 bg-[var(--color-ink)]/3 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mute)]">Events you can subscribe to</p>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_DOCS.map((evt) => (
                    <span
                      key={evt.value}
                      className="group relative cursor-help rounded-full border border-[var(--color-line)] px-2.5 py-1 font-mono text-[10px] text-[var(--color-cyan)]"
                    >
                      {evt.value}
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden w-44 -translate-x-1/2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2 text-center text-[10px] font-sans text-[var(--color-mute)] shadow-xl group-hover:block">
                        {evt.desc}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}