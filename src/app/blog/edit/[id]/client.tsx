"use client";

import { useEffect, useState } from "react";
import BlogEditor from "@/components/BlogEditor";
import Loader from "@/components/Loader";

interface Props {
  id: string;
}

export default function EditBlogClient({ id }: Props) {
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) setPost(d.post);
        else setError("Not found");
      })
      .catch(() => setError("Failed to load"));
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[var(--color-mute)]">{error}</div>;

  if (!post) return <Loader label="Loading post..." />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BlogEditor
        post={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          tags: post.tags,
          isDraft: post.isDraft,
        }}
      />
    </div>
  );
}
