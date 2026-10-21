"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import BlogPostDetail from "@/components/BlogPostDetail";
import Loader from "@/components/Loader";
import { fetchViewerState } from "@/lib/client/viewer-state";

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  tags: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isDraft: boolean;
  publishedAt?: string | null;
  createdAt: string;
  user: { id: string; username: string; avatar?: string | null };
}

interface Props {
  slug: string;
}

export default function BlogPostDetailView({ slug }: Props) {
  const { status } = useSession();
  const [data, setData] = useState<{ post: BlogPostData; author: BlogPostData["user"]; isLiked: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    fetch(`/api/blog/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.post) { setError("Not found"); return null; }
        let isLiked = false;
        if (status === "authenticated") {
          // The visitor's own like is fetched separately, so the post itself
          // stays identical for everyone and can come from the CDN.
          const states = await fetchViewerState("blogStates", [d.post.id]);
          const state = states[d.post.id] as { isLiked?: boolean } | undefined;
          isLiked = !!state?.isLiked;
        }
        return { post: d.post as BlogPostData, author: d.author, isLiked };
      })
      .then((next) => { if (next) setData(next); })
      .catch(() => setError("Failed to load"));
  }, [slug, status]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[var(--color-mute)]">{error}</div>;

  if (!data) return <Loader label="Loading post..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <BlogPostDetail post={data.post} author={data.author} isLiked={data.isLiked} />
    </div>
  );
}
