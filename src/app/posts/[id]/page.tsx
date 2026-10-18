import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { posterCategoryOf } from "@/lib/post-types";
import { PostShareRow } from "./share-row";

export const revalidate = 3600;

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export function generateStaticParams() {
  return [];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface PageProps {
  params: Promise<{ id: string }>;
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return "today";
  if (d === 1) return "yesterday";
  return `${d}d ago`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let title = "Post";
  let description = "A post on ZyniVerse.";
  let image: string | null = null;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { title: true, content: true, image: true, type: true },
    });
    if (post) {
      const cat = posterCategoryOf(post.type);
      title = `${post.title} | ${cat.label} Post`;
      description = (post.content || "").slice(0, 160) || description;
      image = post.image;
    }
  } catch (e) {
    logError(e);
  }
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/posts/${id}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/posts/${id}`,
      type: "article",
      ...(image ? { images: [{ url: image, width: 1200, height: 1500, alt: title }] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      _count: { select: { comments: true } },
    },
  });
  if (!post) notFound();

  const cat = posterCategoryOf(post.type);
  const isCritique = post.type === "CRITIQUE";
  const cleanContent = (post.content || "").replace(/\r\n/g, "\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.content.slice(0, 200),
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.createdAt.toISOString(),
    ...(post.image ? { image: [post.image] } : {}),
    author: {
      "@type": "Person",
      name: `@${post.author.username}`,
      url: `${BASE_URL}/u/${post.author.username}`,
    },
    publisher: {
      "@type": "Organization",
      name: "ZyniVerse",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/posts/${post.id}`,
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-4 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)]">Home</Link>
        <span>›</span>
        <Link href="/posts" className="hover:text-[var(--color-cyan)]">Posts</Link>
        <span>›</span>
        <span className="text-[var(--color-fg)]">{cat.label}</span>
      </nav>

      <article className="overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/70">
        <div className="flex flex-wrap items-center gap-2 p-5 pb-3 sm:p-6 sm:pb-3">
          <span className="rounded-full border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-magenta)]">
            {cat.emoji} {cat.label}
          </span>
          {isCritique && post.rating != null && (
            <span
              className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: post.rating >= 7 ? "var(--color-cyan)" : post.rating >= 5 ? "var(--color-amber)" : "var(--color-magenta)",
                borderColor: "currentColor",
                backgroundColor: "transparent",
              }}
            >
              {post.rating}/10
            </span>
          )}
          <span className="text-[11px] text-[var(--color-mute)]">{timeAgo(post.createdAt)}</span>
        </div>

        <h1 className="px-5 font-display text-2xl font-bold leading-tight text-[var(--color-ink)] sm:px-6 sm:text-3xl">
          {post.title}
        </h1>

        <div className="mt-3 flex items-center gap-2.5 px-5 pb-4 sm:px-6">
          <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-pink-500/70">
            {post.author.avatar ? (
              <Image src={post.author.avatar} alt={post.author.username} width={32} height={32} className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-pink-600 text-xs font-bold text-white">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <Link href={`/u/${post.author.username}`} className="text-sm font-semibold text-[var(--color-fg)] hover:text-[var(--color-cyan)]">
            @{post.author.username}
          </Link>
          <span className="text-xs text-[var(--color-mute)]">· {post._count.comments} 💬</span>
        </div>

        {post.image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[4/3]">
            <Image
              src={post.image}
              alt={post.title}
              width={1024}
              height={768}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-5 sm:p-6">
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-fg)]/90">{cleanContent}</p>
        </div>
      </article>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/posts" className="text-[var(--color-magenta)] hover:underline">← All posts</Link>
        <Link href="/posts?cat=all" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
          Explore more posters ↑
        </Link>
      </div>

      <PostShareRow title={post.title} postId={post.id} />
    </div>
  );
}