import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Link to ZyniVerse — Badges, Buttons & Resources for Partners",
  description:
    "Partner with ZyniVerse. Get free badges, buttons, and embed codes to link to India's #1 anime platform. Help your visitors discover filler guides, Hindi dubs & more.",
  keywords: ["link to zyniverse", "partner with zyniverse", "anime badges", "anime link buttons", "zyniverse partner"],
  openGraph: {
    title: "Link to ZyniVerse — Badges, Buttons & Resources",
    description: "Get free badges, buttons & embed codes to link to India's #1 anime platform.",
    url: "https://zyverse.in/link-to-us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Link to ZyniVerse — Badges, Buttons & Resources",
    description: "Get free badges, buttons & embed codes to link to India's #1 anime platform.",
  },
  alternates: { canonical: "https://zyverse.in/link-to-us" },
  robots: { index: true, follow: true },
};

const BADGES = [
  {
    name: "Dark Badge (Horizontal)",
    width: 200,
    height: 44,
    html: `<a href="https://zyverse.in" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;background:#12111e;border:1px solid #1f1d33;font-family:'Rajdhani','Inter',system-ui,sans-serif;font-size:12px;font-weight:600;color:#f0eef8;text-decoration:none;letter-spacing:0.04em;white-space:nowrap;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff2d78" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  Powered by ZyniVerse
</a>`,
  },
  {
    name: "Light Badge (Horizontal)",
    width: 200,
    height: 44,
    html: `<a href="https://zyverse.in" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;background:#ffffff;border:1px solid #e5e7eb;font-family:'Rajdhani','Inter',system-ui,sans-serif;font-size:12px;font-weight:600;color:#1a1625;text-decoration:none;letter-spacing:0.04em;white-space:nowrap;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d946ef" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  Powered by ZyniVerse
</a>`,
  },
  {
    name: "Filler Guide Button",
    width: 220,
    height: 44,
    html: `<a href="https://zyverse.in/filler" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;background:#ff2d78;font-family:'Rajdhani','Inter',system-ui,sans-serif;font-size:12px;font-weight:700;color:#000;text-decoration:none;letter-spacing:0.04em;white-space:nowrap;">
  🎯 Anime Filler Guides — Free
</a>`,
  },
  {
    name: "Hindi Dub Tracker Button",
    width: 220,
    height: 44,
    html: `<a href="https://zyverse.in/dubbed?language=hindi" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;background:#ff9933;font-family:'Rajdhani','Inter',system-ui,sans-serif;font-size:12px;font-weight:700;color:#000;text-decoration:none;letter-spacing:0.04em;white-space:nowrap;">
  🇮🇳 Hindi Dub Tracker — Free
</a>`,
  },
];

const SUGGESTED_LINKS = [
  { text: "ZyniVerse Anime Filler List", url: "https://zyverse.in/filler", desc: "Skip filler in 200+ anime — every episode marked as canon, filler, or mixed." },
  { text: "Hindi Dubbed Anime List", url: "https://zyverse.in/dubbed?language=hindi", desc: "Track every Hindi dubbed anime with episode schedules & release dates." },
  { text: "Anime Watch Order Guides", url: "https://zyverse.in/watch-order", desc: "Correct watch order for Naruto, Fate, SAO, Monogatari & 35+ franchises." },
  { text: "Anime Characters Database", url: "https://zyverse.in/characters", desc: "10,000+ characters with voice actor details, rankings & stats." },
  { text: "Anime Recommendations", url: "https://zyverse.in/recommendations", desc: "AI-powered anime recommendations based on your taste." },
  { text: "Anime Airing Schedule", url: "https://zyverse.in/schedule", desc: "Weekly anime airing schedule with Indian TV dub times." },
];

export default function LinkToUsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">For Partners</p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl mt-2">Link to ZyniVerse</h1>
        <p className="mt-3 text-[var(--color-mute)] max-w-xl mx-auto">
          Help your visitors discover the best anime tools on the web.
          Grab a badge, button, or text link — all free to use.
        </p>
      </div>

      {/* Badges Section */}
      <section className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-2">Badges & Buttons</h2>
        <p className="text-sm text-[var(--color-mute)] mb-6">Copy the HTML below and paste it into your site.</p>

        <div className="grid gap-6 sm:grid-cols-2">
          {BADGES.map((badge) => (
            <div key={badge.name} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <p className="text-sm font-semibold mb-3">{badge.name}</p>
              <div className="flex items-center justify-center p-4 rounded-lg bg-[var(--color-void)] mb-4 min-h-[60px]">
                <div dangerouslySetInnerHTML={{ __html: badge.html }} />
              </div>
              <div className="relative">
                <pre className="text-[10px] text-[var(--color-mute)] bg-[var(--color-void)] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all border border-[var(--color-line)]">
                  {badge.html}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(badge.html)}
                  className="absolute top-2 right-2 rounded-md bg-[var(--color-panel)] border border-[var(--color-line)] px-2 py-1 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Text Links Section */}
      <section className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-2">Suggested Text Links</h2>
        <p className="text-sm text-[var(--color-mute)] mb-6">
          Use these ready-made link descriptions in your blog posts, resource pages, or sidebars.
        </p>

        <div className="space-y-4">
          {SUGGESTED_LINKS.map((link) => (
            <div key={link.url} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--color-cyan)] hover:underline">
                    {link.text}
                  </a>
                  <p className="text-xs text-[var(--color-mute)] mt-1">{link.desc}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(`<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a> — ${link.desc}`)}
                  className="shrink-0 rounded-md bg-[var(--color-void)] border border-[var(--color-line)] px-2 py-1 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors"
                >
                  Copy link
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Embed Widgets CTA */}
      <section className="mb-16">
        <div className="rounded-2xl border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8 text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Want Interactive Widgets?</h2>
          <p className="text-sm text-[var(--color-mute)] mb-6 max-w-lg mx-auto">
            Embed live filler guides, dub status badges, and watch progress trackers directly on your site.
          </p>
          <Link
            href="/embed"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity"
          >
            Browse Embed Widgets →
          </Link>
        </div>
      </section>

      {/* Why Link Section */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-4">Why Link to ZyniVerse?</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🎯", title: "Helpful Content", desc: "Your visitors get access to filler guides, dub trackers & watch orders." },
            { icon: "🇮🇳", title: "India-First", desc: "The only platform tracking Hindi, Tamil & Telugu anime dubs." },
            { icon: "🆓", title: "100% Free", desc: "No paywalls. Your visitors can use everything for free." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <span className="text-2xl block mb-2">{item.icon}</span>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-[var(--color-mute)] mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
