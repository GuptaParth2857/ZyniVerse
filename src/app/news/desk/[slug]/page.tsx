import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NEWS_DESK, getNewsDeskItem } from "@/lib/news-desk";
import NativeBannerAd from "@/components/NativeBannerAd";

export const revalidate = 172800;
export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

const CATEGORY_STYLES: Record<string, string> = {
  "Dub Release": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Announcement: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Schedule: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Industry: "bg-white/10 text-[var(--color-mute)] border-white/20",
};

type DeskParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return NEWS_DESK.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: DeskParams): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsDeskItem(slug);
  if (!item) return { title: "Anime News" };

  const url = `${BASE_URL}/news/desk/${item.slug}`;
  const title = `${item.title} | ZyniVerse`;
  return {
    title,
    description: item.summary,
    keywords: [...item.tags.slice(0, 4), "anime news", "hindi dub"],
    openGraph: {
      title: item.title,
      description: item.summary,
      url,
      type: "article",
      siteName: "ZyniVerse",
      publishedTime: item.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.summary,
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsDeskDetailPage({ params }: DeskParams) {
  const { slug } = await params;
  const item = getNewsDeskItem(slug);
  if (!item) notFound();

  const url = `${BASE_URL}/news/desk/${item.slug}`;
  const categoryCls = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Industry;
  const more = NEWS_DESK.filter((n) => n.slug !== item.slug).slice(0, 3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: item.title,
      description: item.summary,
      url,
      datePublished: item.publishedAt,
      dateModified: item.publishedAt,
      author: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
      publisher: {
        "@type": "Organization",
        name: "ZyniVerse",
        url: BASE_URL,
        logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
      },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Anime News", item: `${BASE_URL}/news` },
        { "@type": "ListItem", position: 3, name: item.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/news"
          className="mb-6 inline-flex items-center gap-1 text-xs text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>

        <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-cyan)]/10 via-[var(--color-panel)] to-[var(--color-magenta)]/10 sm:h-56">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
          <div className="z-10 text-center">
            <div className="mb-2 text-4xl">📰</div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">
              ZyniVerse News Desk • {item.category}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 mt-6 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryCls}`}>
              {item.category}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-mute)]">
              Verified by ZyniVerse
            </span>
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-[var(--color-cyan)]/10 bg-[var(--color-cyan)]/8 px-3 py-1 text-[10px] font-medium text-[var(--color-cyan)]/80">
                {tag}
              </span>
            ))}
          </div>

          <div className="neon-rgb-border rounded-xl px-4 py-2">
            <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              {item.title}
            </h1>
          </div>

          <p className="mb-4 mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-mute)]">
            {item.summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--color-mute)]/70">
            <span>{dateLabel(item.publishedAt)}</span>
            <span className="text-white/20">•</span>
            <span>{item.source}</span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-line)] to-transparent" />

        <div className="mt-8 space-y-5">
          {item.body.map((para, i) => (
            <p key={i} className="text-sm leading-relaxed text-[var(--color-mute)]">
              {para}
            </p>
          ))}
        </div>

        {item.facts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {item.facts.map((f) => (
              <div key={f.label} className="glass-card rounded-xl p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">{f.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {item.links.length > 0 && (
          <div className="mt-8 rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-cyan)]">
              Explore more on ZyniVerse
            </p>
            <div className="flex flex-wrap gap-2">
              {item.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-4 py-1.5 text-xs font-bold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/10 neon-rgb-border"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {more.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-lg font-bold text-white">More from the News Desk</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {more.map((n) => (
                <Link key={n.slug} href={`/news/desk/${n.slug}`} className="glass-card block rounded-xl p-4 transition-colors hover:bg-white/5">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[n.category] || CATEGORY_STYLES.Industry}`}>
                    {n.category}
                  </span>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold text-white">{n.title}</p>
                  <p className="mt-2 text-[10px] text-[var(--color-mute)]">{dateLabel(n.publishedAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <NativeBannerAd />
        </div>
      </div>
    </>
  );
}