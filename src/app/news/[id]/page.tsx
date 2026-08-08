import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRSSNewsById } from "@/lib/news";

interface Props {
  params: Promise<{ id: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

const FALLBACK_METADATA: Metadata = {
  title: "Anime News Article | ZyniVerse",
  description: "Read the latest anime news on ZyniVerse — curated from Anime News Network and MyAnimeList for Indian anime fans.",
  robots: { index: true, follow: true },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const item = await getRSSNewsById(decodeURIComponent(id));
    if (!item) return FALLBACK_METADATA;

    const title = `${item.title} | ZyniVerse`;
    return {
      title,
      description: item.summary?.slice(0, 200) || title,
      keywords: [...(item.tags || []).slice(0, 4), "anime news", "manga news"],
      openGraph: {
        title: item.title,
        description: item.summary?.slice(0, 200) || "",
        url: `${BASE_URL}/news/${encodeURIComponent(item.id)}`,
        type: "article",
        siteName: "ZyniVerse",
        ...(item.image ? { images: [{ url: item.image }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: item.title,
        description: item.summary?.slice(0, 200) || "",
      },
      alternates: {
        canonical: item.url && item.url.startsWith("http") ? item.url : `${BASE_URL}/news/${encodeURIComponent(item.id)}`,
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return FALLBACK_METADATA;
  }
}

function TimeAgo({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  let item = null;
  try {
    item = await getRSSNewsById(decodeURIComponent(id));
  } catch {
    item = null;
  }
  if (!item) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.summary?.slice(0, 200) || "",
    url: item.url && item.url.startsWith("http") ? item.url : `${BASE_URL}/news/${encodeURIComponent(item.id)}`,
    datePublished: item.publishedAt,
    dateModified: item.publishedAt,
    author: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "ZyniVerse",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: `${BASE_URL}/news/${encodeURIComponent(item.id)}`,
    ...(item.image ? { image: [item.image] } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/news" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors mb-6">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to News
        </Link>

        {item.image ? (
          <div className="relative rounded-2xl overflow-hidden mb-8 h-64 sm:h-80">
            <div className="h-full w-full" style={{ background: `url(${item.image}) center/cover` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.8)] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden mb-8 h-48 sm:h-56 bg-gradient-to-br from-[var(--color-cyan)]/10 via-[var(--color-panel)] to-[var(--color-magenta)]/10 flex items-center justify-center">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
            <div className="text-center z-10">
              <div className="text-4xl mb-2">📰</div>
              <p className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">{item.source}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-orange-500/15 text-orange-400 border-orange-500/30">
              {item.source}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-orange-500/15 text-orange-400 border-orange-500/30">
              {item.type}
            </span>
            {item.tags.filter((t) => t !== "ANN" && t !== "MAL").map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--color-cyan)]/8 border border-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-medium text-[var(--color-cyan)]/80">
                {tag}
              </span>
            ))}
          </div>

          <div className="neon-rgb-border rounded-xl px-4 py-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-white">
              {item.title}
            </h1>
          </div>

          <p className="text-sm text-[var(--color-mute)] leading-relaxed max-w-3xl mb-4">
            {item.summary}
          </p>

          <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-mute)]/70">
            <TimeAgo date={item.publishedAt} />
            <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-line)] to-transparent mb-8" />

        {item.content ? (
          <div
            className="prose-custom text-[var(--color-mute)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-[var(--color-mute)] mb-4">Full article content available on the original source.</p>
          </div>
        )}

        {item.url && item.url.startsWith("http") && (
          <div className="mt-12 rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 text-center">
            <p className="text-xs text-[var(--color-mute)] mb-3">
              Originally published on {item.source === "News" ? "Anime News Network" : "MyAnimeList"}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full neon-rgb-border px-5 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/5 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              View Original Article
            </a>
          </div>
        )}
      </div>
    </>
  );
}
