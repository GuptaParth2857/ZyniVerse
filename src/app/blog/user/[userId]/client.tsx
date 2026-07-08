"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/Loader";

interface Props {
  userId: string;
}

export default function UserBlogClient({ userId }: Props) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog?userId=${encodeURIComponent(userId)}&limit=50`)
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <Loader label="Loading posts..." />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Blog</p>
      <h1 className="font-display text-2xl font-bold mt-1 mb-8">Posts by User</h1>

      {posts.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-mute)]">No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-cyan)]/40 transition-all"
            >
              {post.coverImage && (
                <div className="relative h-36 w-full overflow-hidden">
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-display text-sm font-bold line-clamp-2 group-hover:text-[var(--color-cyan)] transition-colors">{post.title}</h3>
                {post.excerpt && <p className="mt-1 text-xs text-[var(--color-mute)] line-clamp-2">{post.excerpt}</p>}
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[var(--color-mute)]">
                  <span>👁 {post.viewCount}</span>
                  <span>♥ {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
