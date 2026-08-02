import type { Metadata } from "next";
import { getAllWidgets } from "@/lib/widget-registry";
import WidgetGenerator from "@/components/WidgetGenerator";

export const metadata: Metadata = {
  title: "Free Anime Embed Widgets — Add Filler Guides & Badges to Your Site",
  description:
    "Add ZyniVerse filler guides, dub status badges & anime widgets to your website for free. iframe & script embeds. Works with WordPress, Blogger, Ghost & more.",
  keywords: ["anime widget", "embed anime badge", "filler guide widget", "hindi dub badge", "anime embed code", "free anime widget"],
  openGraph: {
    title: "Free Anime Embed Widgets — Filler Guides & Badges",
    description: "Add ZyniVerse filler guides, dub status badges & anime widgets to your website for free.",
    url: "https://zyverse.in/embed",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Free Anime Embed Widgets — Filler Guides & Badges",
    description: "Add ZyniVerse filler guides, dub status badges & anime widgets to your website for free.",
  },
  alternates: { canonical: "https://zyverse.in/embed" },
  robots: { index: true, follow: true },
};

export default function EmbedPage() {
  const widgets = getAllWidgets();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
          Widgets
        </p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-2">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Embeddable Widgets
          </h1>
        </div>
        <p className="mt-3 text-[var(--color-mute)] max-w-xl mx-auto">
          Add ZyniVerse data directly to your website or blog. Choose from filler guides,
          dub status badges, watch progress widgets, and more.
        </p>
      </div>

      {/* Quick embed */}
      <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 mb-10">
        <h2 className="font-display text-xl font-bold mb-2">Quick Start</h2>
        <p className="text-sm text-[var(--color-mute)] mb-4">
          Pick a widget below, configure it, and paste the embed code into your site.
          All widgets work with any static site generator, CMS, or plain HTML.
        </p>
        <div className="flex flex-wrap gap-3">
          {widgets.map((w) => (
            <a
              key={w.id}
              href={`#widget-${w.id}`}
              className="rounded-full neon-rgb-border px-4 py-2 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
            >
              {w.name}
            </a>
          ))}
        </div>
      </div>

      {/* Widget generator */}
      <WidgetGenerator widgets={widgets} />

      {/* Documentation */}
      <div className="mt-16 border-t border-[var(--color-line)] pt-10">
        <h2 className="font-display text-2xl font-bold mb-4">Embedding Guide</h2>
        <div className="space-y-6 text-sm text-[var(--color-mute)] leading-relaxed">
          <div>
            <h3 className="font-semibold text-[var(--color-ink)] mb-1">iframe Embed</h3>
            <p>
              The simplest way. Copy the iframe snippet and paste it into your HTML.
              Works everywhere — WordPress, Blogger, Ghost, etc.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-ink)] mb-1">Script Embed</h3>
            <p>
              More flexible. The script auto-injects the widget at the script tag&apos;s
              position. Supports <code className="text-[var(--color-cyan)]">data-theme=&quot;dark&quot;</code>{" "}
              and <code className="text-[var(--color-cyan)]">data-theme=&quot;light&quot;</code>.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-ink)] mb-1">Customization</h3>
            <p>
              Widgets respect the <code className="text-[var(--color-cyan)]">data-theme</code> attribute.
              Dark theme is default. Light theme works best on white backgrounds.
              All widgets are responsive within their fixed dimensions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
