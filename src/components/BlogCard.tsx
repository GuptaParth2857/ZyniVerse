import Link from "next/link";

interface BlogCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    coverImage?: string | null;
    tags: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt?: string | null;
    isExternal?: boolean;
    url?: string;
    user: { id?: string; username: string; avatar?: string | null };
  };
}

const GRADIENT_PAIRS = [
  ["from-cyan-500/20", "to-violet-500/20"],
  ["from-fuchsia-500/20", "to-cyan-500/20"],
  ["from-violet-500/20", "to-amber-500/20"],
  ["from-emerald-500/20", "to-cyan-500/20"],
  ["from-rose-500/20", "to-violet-500/20"],
  ["from-amber-500/20", "to-fuchsia-500/20"],
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return GRADIENT_PAIRS[Math.abs(hash) % GRADIENT_PAIRS.length];
}

export default function BlogCard({ post }: BlogCardProps) {
  const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];
  const isExternal = post.isExternal;
  const isWikipedia = isExternal && post.id.startsWith("wiki-");
  const href = isWikipedia ? (post.url || "#") : isExternal ? `/blog/external/${post.id}` : `/blog/${post.slug}`;
  const [gradFrom, gradTo] = getGradient(post.id);

  return (
    <Link
      href={href}
      className="group relative rounded-[16px] no-underline"
      {...(isWikipedia ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {/* Animated conic-gradient border */}
      <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
            animation: "spin 6s linear infinite",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
      </div>

      {/* Card content */}
      <div className="relative z-10 rounded-[16px] overflow-hidden">
        {post.coverImage ? (
          <div className="relative h-44 w-full overflow-hidden">
            <div
              className="h-full w-full transition-transform duration-500 group-hover:scale-110"
              style={{ background: `url(${post.coverImage}) center/cover` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.8)] via-transparent to-transparent" />
            {isExternal && (
              <div className={`absolute top-3 right-3 rounded-full bg-[rgba(10,10,15,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] px-2 py-0.5 text-[8px] font-bold ${isWikipedia ? "text-amber-400" : "text-[var(--color-cyan)]"}`}>
                {isWikipedia ? "Wikipedia" : "ZyniBot"}
              </div>
            )}
          </div>
        ) : (
          <div className={`relative h-44 w-full bg-gradient-to-br ${gradFrom} via-[var(--color-panel)] ${gradTo} flex items-center justify-center overflow-hidden`}>
            {/* Dot grid pattern */}
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />

            {/* Glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, rgba(0,255,224,0.15) 0%, transparent 70%)", filter: "blur(20px)" }}
            />

            <div className="text-center z-10 px-4">
              {isExternal ? (
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${isWikipedia ? "from-amber-500 to-orange-500" : "from-[var(--color-cyan)] to-[var(--color-violet)]"} text-[11px] font-black text-black mx-auto mb-2 shadow-[0_0_20px_-4px_rgba(0,255,224,0.3)]`}>
                  {isWikipedia ? "W" : "ZB"}
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[11px] font-bold text-black mx-auto mb-2 shadow-[0_0_20px_-4px_rgba(255,0,230,0.3)]">
                  {post.user.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <p className="text-[9px] font-semibold text-[var(--color-mute)] uppercase tracking-wider line-clamp-1 max-w-[180px] mx-auto">
                {post.title.length > 40 ? post.title.slice(0, 40) + "..." : post.title}
              </p>
            </div>

            {isExternal && (
              <div className={`absolute top-3 right-3 rounded-full bg-[rgba(10,10,15,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] px-2 py-0.5 text-[8px] font-bold ${isWikipedia ? "text-amber-400" : "text-[var(--color-cyan)]"}`}>
                {isWikipedia ? "Wikipedia" : "ZyniBot"}
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2.5">
            {isExternal ? (
              <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${isWikipedia ? "from-amber-500 to-orange-500" : "from-[var(--color-cyan)] to-[var(--color-violet)]"} text-[9px] font-black text-black shrink-0 ring-2 ring-[rgba(10,10,15,0.8)]`}>
                {isWikipedia ? "W" : "ZB"}
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[9px] font-bold text-black shrink-0 ring-2 ring-[rgba(10,10,15,0.8)]">
                {post.user.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <span className="text-xs text-[var(--color-mute)] font-medium">
              {isWikipedia ? "Wikipedia" : isExternal ? "ZyniBot" : post.user.username}
            </span>
            {post.publishedAt && (
              <span className="text-[10px] text-[var(--color-mute)]/60 ml-auto font-mono">
                {new Date(post.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <h3 className="font-display text-[15px] font-bold leading-snug group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-1.5 text-xs text-[var(--color-mute)] line-clamp-2 leading-relaxed">{post.excerpt}</p>
          )}

          <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-[var(--color-mute)]/70">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {post.commentCount}
            </span>
          </div>

          {tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--color-cyan)]/8 border border-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--color-cyan)]/80">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
