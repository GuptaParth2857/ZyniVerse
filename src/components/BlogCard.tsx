import Link from "next/link";
import Image from "next/image";

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
    user: { id: string; username: string; avatar?: string | null };
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-cyan)]/40 transition-all"
    >
      {post.coverImage && (
        <div className="relative h-44 w-full overflow-hidden">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[8px] font-bold text-black shrink-0">
            {post.user.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-[var(--color-mute)]">{post.user.username}</span>
          {post.publishedAt && (
            <span className="text-[10px] text-[var(--color-mute)] ml-auto">
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <h3 className="font-display text-base font-bold leading-snug group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 text-sm text-[var(--color-mute)] line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-[var(--color-mute)]">
          <span>👁 {post.viewCount}</span>
          <span>♥ {post.likeCount}</span>
          <span>💬 {post.commentCount}</span>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--color-cyan)]">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
