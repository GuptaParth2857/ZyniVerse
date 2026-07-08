"use client";

import { useEffect, useState } from "react";
import BlogPostDetail from "@/components/BlogPostDetail";
import Loader from "@/components/Loader";

interface Props {
  slug: string;
}

export default function BlogPostDetailView({ slug }: Props) {
  const [data, setData] = useState<{ post: any; author: any; isLiked: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}&limit=1`)
      .then((r) => r.json())
      .then(async (d) => {
        const posts = d.posts || [];
        if (posts.length === 0) { setError("Not found"); return; }
        const found = posts[0];
        const res = await fetch(`/api/blog/${found.id}`);
        if (!res.ok) { setError("Not found"); return; }
        setData(await res.json());
      })
      .catch(() => setError("Failed to load"));
  }, [slug]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[var(--color-mute)]">{error}</div>;

  if (!data) return <Loader label="Loading post..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <BlogPostDetail post={data.post} author={data.author} isLiked={data.isLiked} />
    </div>
  );
}
