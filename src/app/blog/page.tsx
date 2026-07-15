import Link from "next/link";
import type { Metadata } from "next";
import NativeBannerAd from "@/components/NativeBannerAd";

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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
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
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Blog</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Anime Blog</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Read and write anime blog posts. Share your thoughts, reviews, and stories with the community.
        </p>
      </div>

      <div className="mb-10">
        <Link href="/blog/create"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity"
        >✏️ Write a Post</Link>
      </div>

      {/* Featured */}
      {featured && (
        <div className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mb-3">Featured Post</p>
          <a
            href={featured.isExternal ? featured.url : `/blog/${featured.slug}`}
            {...(featured.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="neon-premium rounded-xl no-underline group"
          >
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content">
              <div className="flex flex-col sm:flex-row">
                {featured.coverImage ? (
                  <div className="relative h-48 sm:h-52 sm:w-96 shrink-0 rounded-l-xl overflow-hidden">
                    <div
                      className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      style={{ background: `url(${featured.coverImage}) center/cover` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent sm:bg-gradient-to-r" />
                  </div>
                ) : (
                  <div className="h-48 sm:h-52 sm:w-96 shrink-0 rounded-l-xl bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">Featured</span>
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center">
                  <h2 className="font-display text-xl font-bold group-hover:text-[var(--color-cyan)] transition-colors">{featured.title}</h2>
                  {featured.excerpt && <p className="mt-2 text-sm text-[var(--color-mute)] line-clamp-2">{featured.excerpt}</p>}
                  <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-[var(--color-mute)]">
                    <span>By {featured.user?.username}</span>
                    {featured.publishedAt && <span>{new Date(featured.publishedAt).toLocaleDateString()}</span>}
                    <span>👁 {featured.viewCount}</span>
                    {featured.isExternal && <span className="text-[var(--color-cyan)]/60 text-[8px]">via dev.to</span>}
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-10">
        {/* Posts Grid */}
        <div>
          {posts.length === 0 ? (
            <div className="neon-premium rounded-xl text-center">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content py-20 px-6">
                <p className="text-[var(--color-mute)]">No posts yet. Be the first to write!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post: any) => {
                const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];
                const isExternal = post.isExternal;
                return (
                  <a
                    key={post.id}
                    href={isExternal ? post.url : `/blog/${post.slug}`}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="neon-premium rounded-xl no-underline group"
                  >
                    <div className="neon-premium-track rounded-xl" />
                    <div className="neon-premium-overlay rounded-[10.5px]" />
                    <div className="neon-premium-content">
                      {post.coverImage ? (
                        <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                          <div
                            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                            style={{ background: `url(${post.coverImage}) center/cover` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="h-40 w-full rounded-t-xl bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">Blog</span>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[10px] sm:text-[8px] font-bold text-black">
                            {post.user?.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="text-xs text-[var(--color-mute)]">{post.user?.username}</span>
                          {isExternal && (
                            <svg className="w-3 h-3 text-[var(--color-cyan)]/40 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
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
                          {isExternal && (
                            <span className="text-[var(--color-cyan)]/60 text-[8px] ml-auto">via dev.to</span>
                          )}
                        </div>
                        {tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] sm:text-[9px] font-medium text-[var(--color-cyan)]">{tag.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
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
          <div className="neon-premium rounded-xl">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content p-5">
              <h3 className="font-display text-sm font-bold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tagCloud.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${tag}`}
                    className="rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-medium text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
                  >{tag}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="neon-premium rounded-xl">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content p-5 text-center">
              <h3 className="font-display text-sm font-bold mb-2">Write for ZyniVerse</h3>
              <p className="text-xs text-[var(--color-mute)] mb-4">Share your anime thoughts with the community.</p>
              <Link href="/blog/create"
                className="inline-block rounded-full bg-[var(--color-magenta)] px-5 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity"
              >Start Writing</Link>
            </div>
          </div>
        </aside>
      </div>
      <div className="mx-auto max-w-7xl pb-6 mt-8">
        <NativeBannerAd />
      </div>
    </div>
  );
}
