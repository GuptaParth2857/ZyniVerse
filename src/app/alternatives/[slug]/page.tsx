import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  SHUT_DOWN_SITES,
  ALTERNATIVE_SITES,
  getShutDownSite,
} from "@/lib/data/dead-site-alternatives";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SHUT_DOWN_SITES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = getShutDownSite(slug);
  if (!site) {
    return {
      title: "Alternatives — ZyniVerse",
      description: "Best free alternatives to shut down anime sites. Filler guides, Indian dub tracking, watch trackers and more on ZyniVerse.",
      robots: { index: true, follow: true },
    };
  }

  const title = `${site.siteName} is Shut Down — Best ${site.siteName} Alternatives (2026)`;
  const description = `${site.siteName} (${site.domain}) is no longer working. Here are the best free ${site.siteName} alternatives — ZyniVerse offers filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations and a watch tracker.`;

  return {
    title,
    description,
    keywords: [...site.searchTerms, "anime alternative", "anime tracker alternative", "anime filler list alternative", "best anime sites 2026"],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/alternatives/${site.slug}`,
      type: "website",
      siteName: "ZyniVerse",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: `${BASE_URL}/alternatives/${site.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function ShutDownAlternativePage({ params }: Props) {
  const { slug } = await params;
  const site = getShutDownSite(slug);
  if (!site) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/alternatives" className="hover:text-[var(--color-cyan)] transition-colors">Alternatives</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{site.siteName}</span>
      </nav>

      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
          {site.domain} · Site Status: Down
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            {site.siteName} is Shut Down — Best Alternatives (2026)
          </div>
        </h1>
        <p className="mt-4 max-w-3xl text-[var(--color-mute)] leading-relaxed">
          {site.siteName} ({site.domain}) was {site.tagline}. Unfortunately, the site is no longer
          working — and thousands of fans are now looking for a replacement. If you were an
          {site.siteName} user, here are the best free alternatives to switch to today.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
        <h2 className="font-display text-sm font-bold text-amber-300">⚠️ {site.siteName} Status Update</h2>
        <p className="mt-2 text-sm text-[var(--color-mute)] leading-relaxed">{site.currentStatus}</p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          What was {site.siteName}?
        </h2>
        <p className="mt-3 text-sm text-[var(--color-mute)] leading-relaxed">{site.whatWasIt}</p>
        <p className="mt-3 text-sm text-[var(--color-mute)] leading-relaxed">
          <span className="text-white/80 font-semibold">Why fans loved it:</span> {site.whyPeopleLovedIt}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Best {site.siteName} Alternatives in 2026
        </h2>
        <div className="mt-6 space-y-8">
          {ALTERNATIVE_SITES.map((alt, i) => (
            <div key={alt.name} className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-black" style={{ background: alt.color }}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold">{alt.name}</h3>
                    <span className="text-xs text-[var(--color-mute)]">Rating: {alt.rating}/5 · {alt.bestFor}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-mute)] leading-relaxed">{alt.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {alt.features.map((f) => (
                      <span key={f} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/60">
                        {f}
                      </span>
                    ))}
                  </div>
                  {alt.name === "ZyniVerse" ? (
                    <Link href="/search"
                      className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-80"
                      style={{ background: alt.color, color: "black" }}
                    >
                      Start Using ZyniVerse Free →
                    </Link>
                  ) : (
                    <a href={alt.url} target="_blank" rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-80"
                      style={{ background: alt.color, color: alt.color === "#d946ef" ? "black" : "white" }}
                    >
                      Visit {alt.name} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-[var(--color-magenta)]/30 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8 sm:p-12">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Why ZyniVerse is the Best {site.siteName} Replacement
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { emoji: "🎯", title: "200+ Filler Guides", desc: "Skip filler in Naruto, One Piece, Bleach & more with detailed episode-by-episode guides — updated weekly." },
            { emoji: "🇮🇳", title: "Hindi/Tamil/Telugu Dubs", desc: "Track Indian dubbed anime across all major languages. Get alerts when new dubbed episodes air." },
            { emoji: "🤖", title: "AI Recommendations", desc: "Personalized anime suggestions based on your taste and watch history — no more endless scrolling." },
            { emoji: "📋", title: "Free Watch Tracker", desc: "Track your progress across devices. Import your list from MyAnimeList or AniList and never lose your place." },
            { emoji: "📖", title: "Manga Reader", desc: "Read manga directly on ZyniVerse with a growing library and regular updates." },
            { emoji: "💬", title: "Community", desc: "Forums, clubs, challenges, watch parties and discussions with Indian anime fans." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl neon-rgb-border bg-black/30 p-5">
              <span className="text-2xl block mb-2">{f.emoji}</span>
              <h3 className="font-display text-sm font-bold">{f.title}</h3>
              <p className="mt-1 text-xs text-[var(--color-mute)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/search" className="inline-flex rounded-full bg-[var(--color-magenta)] px-8 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity">
            Switch to ZyniVerse Free →
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">
          {site.siteName} Alternatives — FAQ
        </h2>
        <div className="mt-6 space-y-4">
          {site.faqs.map((faq) => (
            <details key={faq.q} className="group rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
              <summary className="flex cursor-pointer items-center justify-between font-display text-sm font-bold">
                {faq.q}
                <span className="ml-2 text-[var(--color-mute)] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--color-mute)] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 text-center">
        <Link href="/alternatives" className="text-sm font-semibold text-[var(--color-cyan)] hover:underline">
          ← See all shut-down anime sites & alternatives
        </Link>
      </div>
    </div>
  );
}
