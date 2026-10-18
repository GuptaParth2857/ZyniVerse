import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with ZyniVerse - feedback, partnership, DMCA, or general enquiries. We'll get back to you as soon as possible.",
  openGraph: {
    title: "Contact Us - ZyniVerse",
    description: "Get in touch with ZyniVerse team for feedback, partnerships or support.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse - anime filler guides, watch orders and dub tracking" }],
  },
  alternates: { canonical: "https://zyverse.in/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-[var(--color-line)]/60 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812] p-8 sm:p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.12),transparent_60%)]" />
        <div className="absolute inset-x-0 -bottom-32 -z-10 h-64 bg-[radial-gradient(ellipse,rgba(14,165,233,0.08),transparent_70%)] blur-3xl" />
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)]/70 bg-[var(--color-panel)]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_0_4px_rgba(14,165,233,0.12)]" />
            Contact ZyniVerse
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Get in touch
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--color-mute)]">
            For feedback, partnerships, DMCA requests, bug reports, or general enquiries, reach out to us. We read every message.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-line)]/60 bg-[var(--color-panel)]/80 p-6 shadow-[0_10px_60px_-40px_rgba(217,70,239,0.9)]">
          <h2 className="font-display text-xl font-semibold text-white mb-3">Email</h2>
          <p className="text-sm text-[var(--color-mute)] mb-4">
            Prefer email? Write to us directly and we&apos;ll get back to you as soon as possible.
          </p>
          <a
            href="mailto:contact@zyverse.in"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/15 transition-all"
          >
            contact@zyverse.in
          </a>
        </div>

        <div className="rounded-2xl border border-[var(--color-line)]/60 bg-[var(--color-panel)]/80 p-6">
          <h2 className="font-display text-xl font-semibold text-white mb-3">Feedback Form</h2>
          <p className="text-sm text-[var(--color-mute)] mb-4">
            Use our feedback page to submit suggestions, bugs or feature requests with context.
          </p>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)]/70 bg-[var(--color-panel)]/90 px-4 py-2 text-xs font-semibold text-white hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)] transition-all"
          >
            Go to Feedback →
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--color-line)]/60 bg-[var(--color-panel)]/80 p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold text-white mb-3">Quick Links</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/about" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">About</Link>
            <Link href="/privacy" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">Terms of Service</Link>
            <Link href="/dmca" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">DMCA</Link>
            <Link href="/disclaimer" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
