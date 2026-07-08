import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Blog — Reviews, Thoughts & Stories | ZyniVerse",
  description: "Read and write anime blog posts. Share your thoughts, reviews, and stories with the community.",
  openGraph: {
    title: "Anime Blog — Reviews, Thoughts & Stories | ZyniVerse",
    description: "Read and write anime blog posts. Share your thoughts, reviews, and stories with the community.",
  },
};

export default async function BlogPage() {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", "12");
  searchParams.set("sort", "recent");

  let posts: any[] = [];
  let total = 0;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blog?${searchParams.toString()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      posts = data.posts || [];
      total = data.total || 0;
    }
  } catch {}

  const tagCloud = [
    "anime", "review", "recommendation", "top-10", "opinion",
    "seasonal", "classic", "movie", "manga", "news",
  ];

  const featured = posts.length > 0 ? posts.sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Blog</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Anime Blog</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Read and write anime blog posts. Share your thoughts, reviews, and stories with the community.
        </p>
      </div>

      {/* Write a Post CTA */}
      <div className="mb-10">
        <Link href="/blog/create"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity"
        >✏️ Write a Post</Link>
      </div>

      {/* Featured */}
      {featured && (
        <div className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mb-3">Featured Post</p>
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative flex flex-col sm:flex-row rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-cyan)]/40 transition-all"
          >
            {featured.coverImage && (
              <div className="relative h-48 sm:h-52 sm:w-96 shrink-0">
                <Image src={featured.coverImage} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 384px" />
              </div>
            )}
            <div className="p-6 flex flex-col justify-center">
              <h2 className="font-display text-xl font-bold group-hover:text-[var(--color-cyan)] transition-colors">{featured.title}</h2>
              {featured.excerpt && <p className="mt-2 text-sm text-[var(--color-mute)] line-clamp-2">{featured.excerpt}</p>}
              <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-[var(--color-mute)]">
                <span>By {featured.user?.username}</span>
                {featured.publishedAt && <span>{new Date(featured.publishedAt).toLocaleDateString()}</span>}
                <span>👁 {featured.viewCount}</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-10">
        {/* Posts Grid */}
        <div>
          {posts.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--color-mute)]">No posts yet. Be the first to write!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post: any) => {
                const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-cyan)]/40 transition-all"
                  >
                    {post.coverImage && (
                      <div className="relative h-40 w-full overflow-hidden">
                        <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 50vw" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[8px] font-bold text-black">
                          {post.user?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-xs text-[var(--color-mute)]">{post.user?.username}</span>
                      </div>
                      <h3 className="font-display text-base font-bold leading-snug line-clamp-2 group-hover:text-[var(--color-cyan)] transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-1 text-sm text-[var(--color-mute)] line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-[var(--color-mute)]">
                        <span>👁 {post.viewCount}</span>
                        <span>♥ {post.likeCount}</span>
                        <span>💬 {post.commentCount}</span>
                      </div>
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--color-cyan)]">{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {total > 12 && (
            <div className="mt-8 text-center">
              <Link href="/blog?page=2" className="text-sm text-[var(--color-cyan)] hover:underline">Load more posts →</Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h3 className="font-display text-sm font-bold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tagCloud.map((tag) => (
                <Link key={tag} href={`/blog?tag=${tag}`}
                  className="rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-medium text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
                >{tag}</Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-center">
            <h3 className="font-display text-sm font-bold mb-2">Write for ZyniVerse</h3>
            <p className="text-xs text-[var(--color-mute)] mb-4">Share your anime thoughts with the community.</p>
            <Link href="/blog/create"
              className="inline-block rounded-full bg-[var(--color-magenta)] px-5 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity"
            >Start Writing</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
