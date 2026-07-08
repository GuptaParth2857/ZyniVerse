import type { Metadata } from "next";
import { getAllWidgets } from "@/lib/widget-registry";
import WidgetGenerator from "@/components/WidgetGenerator";

export const metadata: Metadata = {
  title: "Embeddable Widgets — Add ZyniVerse to Your Site | ZyniVerse",
  description:
    "Add ZyniVerse filler guides, dub status badges, and anime widgets to your website or blog.",
};

export default function EmbedPage() {
  const widgets = getAllWidgets();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
          Widgets
        </p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl mt-2">
          Embeddable Widgets
        </h1>
        <p className="mt-3 text-[var(--color-mute)] max-w-xl mx-auto">
          Add ZyniVerse data directly to your website or blog. Choose from filler guides,
          dub status badges, watch progress widgets, and more.
        </p>
      </div>

      {/* Quick embed */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 mb-10">
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
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
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
