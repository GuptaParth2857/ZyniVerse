import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INDIAN_DUB_GUIDES } from "@/lib/indian-dub-guides";
import { getMediaBatch, type MediaBasic } from "@/lib/anilist";
import NativeBannerAd from "@/components/NativeBannerAd";
import IndianDubCountdown from "@/components/indian-dubs/IndianDubCountdown";
import { nextAiringAt, formatIST } from "@/lib/indian-dub-schedule";
import "../indian-dubs.css";

export const revalidate = 172800;
export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

type GuideParams = { params: Promise<{ slug: string }> };

const LANG_COLORS: Record<string, string> = {
  Hindi: "bg-orange-500/20 text-orange-300",
  Tamil: "bg-blue-500/20 text-blue-300",
  Telugu: "bg-green-500/20 text-green-300",
};

const STATUS_STYLES: Record<string, { label: string; cls: string; dot: string }> = {
  Airing: { label: "Still Airing", cls: "bg-cyan-500/15 text-cyan-300", dot: "bg-[var(--color-cyan)]" },
  Completed: { label: "Complete", cls: "bg-white/5 text-[var(--color-mute)]", dot: "bg-[var(--color-mute)]" },
  Upcoming: { label: "Coming Soon", cls: "bg-amber-500/15 text-amber-300", dot: "bg-[var(--color-amber)]" },
  "On Hiatus": { label: "On Hiatus", cls: "bg-orange-500/15 text-orange-300", dot: "bg-orange-400" },
};

export function generateStaticParams() {
  return INDIAN_DUB_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: GuideParams): Promise<Metadata> {
  const { slug } = await params;
  const guide = INDIAN_DUB_GUIDES.find((g) => g.slug === slug);
  if (!guide) return { title: "Hindi, Tamil & Telugu Dubbed Anime | ZyniVerse" };

  const url = `${BASE_URL}/indian-dubs/${guide.slug}`;
  const langs = guide.languages.join(", ");
  const platforms = guide.platforms.join(" and ");
  const schedulePart = guide.status === "Airing" ? ` New episodes arrive ${guide.schedule.toLowerCase()}.` : "";
  const description = `${guide.name} Hindi dub guide. Watch ${guide.name} in ${langs} on ${platforms} — ${guide.episodeCount.toLowerCase()}, dubbed by ${guide.studio}.${schedulePart} Compiled from public sources.`.slice(0, 160);

  return {
    title: `${guide.name} Hindi Dub — Schedule, Episodes & Where to Watch`,
    description,
    keywords: [
      `${guide.name} hindi dub`,
      `${guide.name} hindi`,
      `${guide.name} in hindi`,
      `${guide.name} tamil dub`,
      `${guide.name} telugu dub`,
      `${guide.name} hindi episode`,
      `watch ${guide.name} in india`,
      `${guide.name} release date`,
      `${guide.platforms[0].toLowerCase()} ${guide.name}`,
      "hindi dubbed anime",
      "indian anime dubs",
    ],
    openGraph: {
      title: `${guide.name} Hindi Dub — Where to Watch in India | ZyniVerse`,
      description,
      type: "website",
      url,
      siteName: "ZyniVerse",
      images: [{ url: `${BASE_URL}/logo.png`, width: 512, height: 512, alt: "ZyniVerse Logo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.name} Hindi Dub — Schedule & Where to Watch`,
      description,
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default async function IndianDubGuidePage({ params }: GuideParams) {
  const { slug } = await params;
  const guide = INDIAN_DUB_GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  let poster: string | null = null;
  let mediaScore: number | null = null;
  if (guide.anilistId != null) {
    try {
      const batch = await getMediaBatch([guide.anilistId]);
      const media = batch.find((m) => m.id === guide.anilistId) as MediaBasic | undefined;
      poster = media?.coverImage?.large || media?.coverImage?.extraLarge || null;
      mediaScore = media?.averageScore ?? null;
    } catch {
      // Decorative art only — the guide still renders without it.
    }
  }

  const nextTarget = guide.status === "Airing" ? nextAiringAt(guide.schedule) : null;

  const url = `${BASE_URL}/indian-dubs/${guide.slug}`;
  const lastChecked = new Date().toISOString().slice(0, 10);
  const status = STATUS_STYLES[guide.status];
  const related = INDIAN_DUB_GUIDES.filter(
    (g) => g.slug !== guide.slug && g.platforms.some((p) => guide.platforms.includes(p))
  ).slice(0, 4);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${guide.name} Hindi Dub — Schedule, Episodes & Where to Watch`,
      description: guide.intro.slice(0, 200),
      url,
      image: `${BASE_URL}/logo.png`,
      inLanguage: "en",
      dateModified: lastChecked,
      publisher: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Indian Dubs", item: `${BASE_URL}/indian-dubs` },
        { "@type": "ListItem", position: 3, name: `${guide.name} Hindi Dub`, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)]">Home</Link>
        <span className="text-white/20">/</span>
        <Link href="/indian-dubs" className="hover:text-[var(--color-cyan)]">Indian Dubs</Link>
        <span className="text-white/20">/</span>
        <span className="text-[var(--color-mute)]">{guide.name}</span>
      </nav>

      {/* Hero */}
      <header className="neon-rgb-border rounded-2xl p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-cyan)]">
              <span>Regional Dub Guide</span>
              <span className="text-white/20">•</span>
              <span>{guide.platforms.join(" / ")}</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              {guide.name} <span className="text-[var(--color-cyan)]">Hindi Dub</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-mute)]">{guide.tagline}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {guide.languages.map((l) => (
                <span key={l} className={`rounded-full px-3 py-1 text-xs font-bold ${LANG_COLORS[l] || "bg-white/10 text-white"}`}>
                  {l} Dub
                </span>
              ))}
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.cls}`}>
                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {mediaScore != null && (
                <span className="glass-score rounded-full px-3 py-1 font-mono text-xs font-bold">★ {mediaScore}</span>
              )}
            </div>

            {guide.status === "Airing" && nextTarget != null && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-magenta)]">
                  Next episode drops in
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <IndianDubCountdown target={nextTarget} />
                  <span className="font-mono text-xs text-[var(--color-cyan)]">{formatIST(nextTarget)}</span>
                </div>
              </div>
            )}
          </div>

          {poster && (
            <div className="mx-auto w-40 shrink-0 md:mx-0 md:w-44">
              <div className="dub-poster-card overflow-hidden rounded-xl border border-white/10 shadow-[0_18px_60px_-18px_rgba(0,0,0,0.85)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={poster} alt={`${guide.name} poster`} className="block aspect-[2/3] w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Quick facts */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Status</p>
          <p className="mt-1 text-sm font-semibold text-white">{status.label}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Episodes</p>
          <p className="mt-1 text-sm font-semibold text-white">{guide.episodeCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Available On</p>
          <p className="mt-1 text-sm font-semibold text-white">{guide.platforms.join(" / ")}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Dubbed Since</p>
          <p className="mt-1 text-sm font-semibold text-white">{guide.dubSince}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Dubbing Studio</p>
          <p className="mt-1 text-sm font-semibold text-white">{guide.studio}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Languages</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {guide.languages.map((l) => (
              <span key={l} className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${LANG_COLORS[l] || "bg-white/10 text-white"}`}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule highlight */}
      <section className="mt-6 rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 p-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-cyan)]">Release Schedule</p>
        <p className="mt-2 font-display text-lg font-bold text-white">{guide.schedule}</p>
        <p className="mt-1 text-xs text-[var(--color-mute)]">Times are in Indian Standard Time (IST). Indian dub availability changes often — always confirm the current schedule on the platform itself before watching.</p>
      </section>

      {/* Editorial */}
      <section className="mt-8 space-y-8">
        <div>
          <h2 className="font-display text-xl font-bold text-white">About the {guide.name} Hindi Dub</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-mute)]">{guide.intro}</p>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">How the Dub Came to India</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-mute)]">{guide.history}</p>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Where to Watch {guide.name} in India</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-mute)]">{guide.watch}</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-mute)]">
            Want the complete picture? Browse the <Link className="text-[var(--color-cyan)] hover:underline" href="/dubbed">live interactive dub hub</Link>, see the full weekly{" "}
            <Link className="text-[var(--color-cyan)] hover:underline" href="/dubbed">dub schedule</Link>, or check{" "}
            <Link className="text-[var(--color-cyan)] hover:underline" href="/voice-actors/indian">Indian voice actors</Link> behind these dubs.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-3">
          {guide.faq.map((f, i) => (
            <details key={i} className="glass-card group rounded-xl p-4" open={i === 0}>
              <summary className="cursor-pointer list-none font-semibold text-white">
                <span className="mr-2 inline-block text-[var(--color-cyan)] transition-transform group-open:rotate-90">›</span>
                {f.q}
              </summary>
              <p className="mt-3 pl-5 text-sm leading-relaxed text-[var(--color-mute)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-white">More {guide.platforms[0]} Dubs</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((g) => (
              <Link key={g.slug} href={`/indian-dubs/${g.slug}`} className="glass-card block rounded-xl p-4 transition-colors hover:bg-white/5">
                <p className="font-semibold text-white">{g.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--color-mute)]">{g.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <div className="mt-10">
        <NativeBannerAd />
      </div>
    </div>
  );
}