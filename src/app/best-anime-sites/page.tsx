import Link from "next/link";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Best Anime Sites 2026 — Free Anime Tracker, Filler Lists & Hindi Dubs",
  description:
    "Looking for the best free anime site? ZyniVerse offers filler guides for 200+ anime, Hindi/Tamil/Telugu dubbed tracking, AI recommendations, watchlists & manga — all free. Better than AniTally, MyAnimeList & more.",
  keywords: [
    "best anime sites", "free anime site", "anime tracker", "anime website",
    "anime sites like anitally", "anitally alternative", "anitally down",
    "anime filler list site", "hindi dubbed anime site",
    "best anime tracker 2026", "anime community india",
    "myanimelist alternative", "anime watchlist site",
  ],
  openGraph: {
    title: "Best Anime Sites 2026 — Free Anime Tracker & Filler Lists",
    description: "ZyniVerse: free filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations & community.",
    url: `${BASE_URL}/best-anime-sites`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Anime Sites 2026 — Free Anime Tracker & Filler Lists",
    description: "Free filler guides, Hindi/Tamil/Telugu dubs, AI recommendations & anime community.",
  },
  alternates: { canonical: `${BASE_URL}/best-anime-sites` },
  robots: { index: true, follow: true },
};

export const revalidate = 86400;

const sites = [
  {
    name: "ZyniVerse",
    url: BASE_URL,
    description: "India's #1 free anime platform. Filler guides for 200+ anime, Hindi/Tamil/Telugu dub tracking, AI recommendations, watchlist, manga reader, cosplay gallery & community.",
    features: ["Filler Guides", "Hindi/Tamil/Telugu Dubs", "AI Recommendations", "Watch Tracker", "Manga Reader", "Community Forums", "Watch Parties"],
    rating: "4.9",
    color: "#d946ef",
  },
  {
    name: "MyAnimeList",
    url: "https://myanimelist.net",
    description: "The world's most popular anime & manga database. Track your viewing, rate anime, and discover new shows.",
    features: ["Anime Database", "Manga Database", "Community Reviews", "Seasonal Charts"],
    rating: "4.5",
    color: "#2e51a2",
  },
  {
    name: "AniList",
    url: "https://anilist.co",
    description: "A modern anime & manga tracker with a beautiful interface. Track, discover, and share your anime journey.",
    features: ["Social Features", "Custom Lists", "Discover Tool", "Activity Feed"],
    rating: "4.6",
    color: "#02a9ff",
  },
  {
    name: "Crunchyroll",
    url: "https://crunchyroll.com",
    description: "The world's largest anime library. Stream anime in HD with simulcasts, dubs, and subs. ₹79/month in India.",
    features: ["Legal Streaming", "Simulcast", "English Dub", "Mobile Apps"],
    rating: "4.3",
    color: "#f47521",
  },
];

export default function BestAnimeSitesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Best Anime Sites</span>
      </nav>

      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">2026 Guide</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">
          Best Anime Sites in 2026
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-mute)] leading-relaxed">
          Looking for the best free anime site? We&apos;ve compared the top anime trackers, streaming platforms, and community sites to help you find the perfect one. Whether you need filler guides, Hindi dubbed tracking, or a comprehensive anime database — here are the best options.
        </p>
      </div>

      <div className="space-y-8">
        {sites.map((site, i) => (
          <div key={site.name} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-black" style={{ background: site.color }}>
                  {i + 1}
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold">{site.name}</h2>
                  <span className="text-xs text-[var(--color-mute)]">Rating: {site.rating}/5</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--color-mute)] leading-relaxed">{site.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {site.features.map((f) => (
                    <span key={f} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/60">
                      {f}
                    </span>
                  ))}
                </div>
                <a href={site.url} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: site.color, color: site.color === "#d946ef" ? "black" : "white" }}
                >
                  Visit {site.name} →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-[var(--color-magenta)]/30 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-8 sm:p-12">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Why ZyniVerse is the Best Free Anime Site</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { emoji: "🎯", title: "200+ Filler Guides", desc: "Skip filler in Naruto, One Piece, Bleach & more with our detailed episode guides." },
            { emoji: "🇮🇳", title: "Hindi/Tamil/Telugu Dubs", desc: "Track Indian dubbed anime across all major languages. Get alerts for new episodes." },
            { emoji: "🤖", title: "AI Recommendations", desc: "Get personalized anime suggestions based on your taste and watch history." },
            { emoji: "📋", title: "Free Watch Tracker", desc: "Track your anime progress across devices. Never lose your place." },
            { emoji: "📖", title: "Manga Reader", desc: "Read manga directly on ZyniVerse. Large library with regular updates." },
            { emoji: "💬", title: "Community", desc: "Join forums, discussions, challenges & connect with Indian anime fans." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-[var(--color-line)] bg-black/30 p-5">
              <span className="text-2xl block mb-2">{f.emoji}</span>
              <h3 className="font-display text-sm font-bold">{f.title}</h3>
              <p className="mt-1 text-xs text-[var(--color-mute)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/search" className="inline-flex rounded-full bg-[var(--color-magenta)] px-8 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity">
            Start Using ZyniVerse Free →
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-6 space-y-4">
          {[
            { q: "Is ZyniVerse really free?", a: "Yes! ZyniVerse is 100% free. No premium subscription required. All features including filler guides, watch tracking, AI recommendations, and community access are completely free." },
            { q: "What makes ZyniVerse better than other anime sites?", a: "ZyniVerse is the only anime site that combines filler guides, Indian dub tracking (Hindi/Tamil/Telugu), AI recommendations, manga reading, and community features — all in one platform and completely free." },
            { q: "Does ZyniVerse work in India?", a: "Yes! ZyniVerse is built specifically for Indian anime fans. We track Hindi, Tamil, and Telugu dubs, Indian TV schedules, and local anime conventions." },
            { q: "How often is the filler list updated?", a: "Our filler guides are updated weekly. We track every episode of 200+ anime and mark them as canon, filler, or mixed." },
          ].map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <summary className="flex cursor-pointer items-center justify-between font-display text-sm font-bold">
                {faq.q}
                <span className="ml-2 text-[var(--color-mute)] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--color-mute)] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
